import { type NextRequest, NextResponse } from "next/server"

const API_KEY = "04b57e808e6d44a1b29151928252604"
const BASE_URL = "https://api.weatherapi.com/v1"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const location = searchParams.get("location") || "Madrid"

  try {
    // Obtener pronóstico para 1 día con datos por hora
    const response = await fetch(
      `${BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(location)}&days=1&aqi=no&alerts=no`,
    )

    if (!response.ok) {
      throw new Error(`Error en la API: ${response.status}`)
    }

    const weatherData = await response.json()

    // Transformar los datos al formato que espera nuestra aplicación
    // Ahora incluimos todas las horas del día (0-23)
    const hourlyForecast = weatherData.forecast.forecastday[0].hour.map((hourData) => {
      const hour = new Date(hourData.time).getHours()
      const conditionText = hourData.condition.text.toLowerCase()

      // Mapear las condiciones de WeatherAPI a nuestras condiciones simplificadas
      let condition = "soleado"
      if (conditionText.includes("rain") || conditionText.includes("lluvia") || conditionText.includes("shower")) {
        condition = "lluvia"
      } else if (conditionText.includes("drizzle") || conditionText.includes("llovizna")) {
        condition = "llovizna"
      } else if (
        conditionText.includes("snow") ||
        conditionText.includes("nieve") ||
        conditionText.includes("sleet") ||
        conditionText.includes("ice")
      ) {
        condition = "nieve"
      } else if (
        conditionText.includes("cloud") ||
        conditionText.includes("overcast") ||
        conditionText.includes("nublado") ||
        conditionText.includes("cubierto")
      ) {
        condition = "nublado"
      } else if (
        conditionText.includes("clear") ||
        conditionText.includes("despejado") ||
        conditionText.includes("sunny") ||
        conditionText.includes("soleado")
      ) {
        // Para la noche, "clear" significa cielo despejado (no soleado)
        condition = hour >= 20 || hour < 6 ? "despejado" : "soleado"
      }

      return {
        hour,
        temperature: Math.round(hourData.temp_c),
        condition,
        precipitation: hourData.chance_of_rain,
        isDay: hourData.is_day === 1,
      }
    })

    return NextResponse.json({
      location: weatherData.location.name,
      current: {
        temperature: Math.round(weatherData.current.temp_c),
        condition: weatherData.current.condition.text,
        isDay: weatherData.current.is_day === 1,
      },
      hourly: hourlyForecast,
    })
  } catch (error) {
    console.error("Error fetching weather data:", error)
    return NextResponse.json({ error: "Error al obtener datos del clima" }, { status: 500 })
  }
}
