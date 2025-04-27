import { Clock, Sun, CloudRain, CloudSnow, Moon } from "lucide-react"

interface HourlyForecast {
  hour: number
  temperature: number
  condition: string
  precipitation: number
  isDay?: boolean
}

interface LaundryRecommendationProps {
  forecast: HourlyForecast[]
}

export default function LaundryRecommendation({ forecast }: LaundryRecommendationProps) {
  // Dividir el día en mañana (6-12), tarde (13-19) y noche (20-5)
  const morningForecast = forecast.filter((hour) => hour.hour >= 6 && hour.hour <= 12)
  const afternoonForecast = forecast.filter((hour) => hour.hour > 12 && hour.hour <= 19)
  const nightForecast = forecast.filter((hour) => hour.hour > 19 || hour.hour < 6)

  // Verificar si lloverá o nevará en cada período
  const willRainInMorning = morningForecast.some(
    (hour) =>
      hour.condition.toLowerCase() === "lluvia" ||
      hour.condition.toLowerCase() === "llovizna" ||
      hour.precipitation > 30,
  )

  const willSnowInMorning = morningForecast.some((hour) => hour.condition.toLowerCase() === "nieve")

  const willRainInAfternoon = afternoonForecast.some(
    (hour) =>
      hour.condition.toLowerCase() === "lluvia" ||
      hour.condition.toLowerCase() === "llovizna" ||
      hour.precipitation > 30,
  )

  const willSnowInAfternoon = afternoonForecast.some((hour) => hour.condition.toLowerCase() === "nieve")

  const willRainAtNight = nightForecast.some(
    (hour) =>
      hour.condition.toLowerCase() === "lluvia" ||
      hour.condition.toLowerCase() === "llovizna" ||
      hour.precipitation > 30,
  )

  const willSnowAtNight = nightForecast.some((hour) => hour.condition.toLowerCase() === "nieve")

  // Encontrar la hora en que comenzará a llover o nevar en cada período
  let badWeatherStartHourMorning = null
  if (willRainInMorning || willSnowInMorning) {
    for (const hour of morningForecast) {
      if (
        hour.condition.toLowerCase() === "lluvia" ||
        hour.condition.toLowerCase() === "llovizna" ||
        hour.condition.toLowerCase() === "nieve" ||
        hour.precipitation > 30
      ) {
        badWeatherStartHourMorning = hour.hour
        break
      }
    }
  }

  let badWeatherStartHourAfternoon = null
  if (willRainInAfternoon || willSnowInAfternoon) {
    for (const hour of afternoonForecast) {
      if (
        hour.condition.toLowerCase() === "lluvia" ||
        hour.condition.toLowerCase() === "llovizna" ||
        hour.condition.toLowerCase() === "nieve" ||
        hour.precipitation > 30
      ) {
        badWeatherStartHourAfternoon = hour.hour
        break
      }
    }
  }

  let badWeatherStartHourNight = null
  if (willRainAtNight || willSnowAtNight) {
    // Ordenar el pronóstico nocturno para que las horas vayan de 20 a 5
    const sortedNightForecast = [...nightForecast].sort((a, b) => {
      // Convertir las horas para que 0-5 vengan después de 20-23
      const hourA = a.hour < 6 ? a.hour + 24 : a.hour
      const hourB = b.hour < 6 ? b.hour + 24 : b.hour
      return hourA - hourB
    })

    for (const hour of sortedNightForecast) {
      if (
        hour.condition.toLowerCase() === "lluvia" ||
        hour.condition.toLowerCase() === "llovizna" ||
        hour.condition.toLowerCase() === "nieve" ||
        hour.precipitation > 30
      ) {
        badWeatherStartHourNight = hour.hour
        break
      }
    }
  }

  // Generar la recomendación
  let recommendation = ""
  let detailedRecommendation = ""
  let icon = null
  let bgClass = ""
  let iconClass = ""

  // Contar cuántos períodos tienen mal tiempo
  const badWeatherPeriods = [
    willRainInMorning || willSnowInMorning,
    willRainInAfternoon || willSnowInAfternoon,
    willRainAtNight || willSnowAtNight,
  ].filter(Boolean).length

  if (badWeatherPeriods === 3) {
    // Mal tiempo todo el día
    recommendation = "No es recomendable lavar ropa hoy"
    detailedRecommendation = "Se esperan condiciones desfavorables durante todo el día."
    icon = <CloudRain className="h-10 w-10 text-red-500" />
    bgClass = "bg-red-50 dark:bg-red-900/20"
    iconClass = "bg-red-100 dark:bg-red-800/30"
  } else if (badWeatherPeriods === 0) {
    // Buen tiempo todo el día
    recommendation = "¡Excelente día para lavar ropa!"
    detailedRecommendation = "No se esperan precipitaciones durante todo el día."
    icon = <Sun className="h-10 w-10 text-yellow-500" />
    bgClass = "bg-green-50 dark:bg-green-900/20"
    iconClass = "bg-green-100 dark:bg-green-800/30"
  } else {
    // Algunos períodos con mal tiempo
    recommendation = "Es posible lavar ropa en ciertos momentos del día"

    // Determinar los mejores momentos
    const goodPeriods = []
    if (!(willRainInMorning || willSnowInMorning)) goodPeriods.push("mañana")
    if (!(willRainInAfternoon || willSnowInAfternoon)) goodPeriods.push("tarde")
    if (!(willRainAtNight || willSnowAtNight)) goodPeriods.push("noche")

    if (goodPeriods.length === 1) {
      detailedRecommendation = `El mejor momento para lavar es durante la ${goodPeriods[0]}.`
    } else {
      detailedRecommendation = `Los mejores momentos para lavar son durante la ${goodPeriods.join(" y la ")}.`
    }

    icon = <Clock className="h-10 w-10 text-blue-500" />
    bgClass = "bg-blue-50 dark:bg-blue-900/20"
    iconClass = "bg-blue-100 dark:bg-blue-800/30"
  }

  // Si hay nieve en algún período, mencionarlo específicamente
  if (willSnowInMorning || willSnowInAfternoon || willSnowAtNight) {
    const snowPeriods = []
    if (willSnowInMorning) snowPeriods.push("mañana")
    if (willSnowInAfternoon) snowPeriods.push("tarde")
    if (willSnowAtNight) snowPeriods.push("noche")

    detailedRecommendation += ` Se espera nieve durante la ${snowPeriods.join(" y la ")}.`
    icon = <CloudSnow className="h-10 w-10 text-blue-400" />
  }

  return (
    <div className={`p-4 rounded-xl ${bgClass} animate-weather`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full ${iconClass}`}>{icon}</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">{recommendation}</h3>
          <p className="text-slate-700 dark:text-slate-300 mb-4">{detailedRecommendation}</p>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Sun className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Mañana</p>
                <p className="text-sm font-medium">
                  {willRainInMorning ? "Lluvia" : willSnowInMorning ? "Nieve" : "Despejado"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30">
                <Sun className="h-4 w-4 text-orange-500 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Tarde</p>
                <p className="text-sm font-medium">
                  {willRainInAfternoon ? "Lluvia" : willSnowInAfternoon ? "Nieve" : "Despejado"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                <Moon className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Noche</p>
                <p className="text-sm font-medium">
                  {willRainAtNight ? "Lluvia" : willSnowAtNight ? "Nieve" : "Despejado"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
