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
    const hourlyForecast = weatherData.forecast.forecastday[0].hour
      .filter((hourData) => {
        const hour = new Date(hourData.time).getHours()
        return hour >= 6 && hour <= 20 // Solo horas entre 6am y 8pm
      })
      .map((hourData) => {
        const hour = new Date(hourData.time).getHours()

        // Mapear las condiciones de WeatherAPI a nuestras condiciones simplificadas
        let condition = "soleado"
        if (
          hourData.condition.text.toLowerCase().includes("rain") ||
          hourData.condition.text.toLowerCase().includes("lluvia") ||
          hourData.condition.text.toLowerCase().includes("shower")
        ) {
          condition = "lluvia"
        } else if (
          hourData.condition.text.toLowerCase().includes("drizzle") ||
          hourData.condition.text.toLowerCase().includes("llovizna")
        ) {
          condition = "llovizna"
        } else if (
          hourData.condition.text.toLowerCase().includes("cloud") ||
          hourData.condition.text.toLowerCase().includes("overcast") ||
          hourData.condition.text.toLowerCase().includes("nublado")
        ) {
          condition = "nublado"
        }

        return {
          hour,
          temperature: Math.round(hourData.temp_c),
          condition,
          precipitation: hourData.chance_of_rain,
        }
      })

    return NextResponse.json({
      location: weatherData.location.name,
      current: {
        temperature: Math.round(weatherData.current.temp_c),
        condition: weatherData.current.condition.text,
      },
      hourly: hourlyForecast,
    })
  } catch (error) {
    console.error("Error fetching weather data:", error)
    return NextResponse.json({ error: "Error al obtener datos del clima" }, { status: 500 })
  }
}
