import { Clock, Droplets, Sun, CloudRain } from "lucide-react"

interface HourlyForecast {
  hour: number
  temperature: number
  condition: string
  precipitation: number
}

interface LaundryRecommendationProps {
  forecast: HourlyForecast[]
}

export default function LaundryRecommendation({ forecast }: LaundryRecommendationProps) {
  // Dividir el día en mañana (6-12) y tarde (13-20)
  const morningForecast = forecast.filter((hour) => hour.hour >= 6 && hour.hour <= 12)
  const afternoonForecast = forecast.filter((hour) => hour.hour >= 13 && hour.hour <= 20)

  // Verificar si lloverá en la mañana o en la tarde
  const willRainInMorning = morningForecast.some(
    (hour) =>
      hour.condition.toLowerCase().includes("lluvia") ||
      hour.condition.toLowerCase().includes("llovizna") ||
      hour.precipitation > 30,
  )

  const willRainInAfternoon = afternoonForecast.some(
    (hour) =>
      hour.condition.toLowerCase().includes("lluvia") ||
      hour.condition.toLowerCase().includes("llovizna") ||
      hour.precipitation > 30,
  )

  // Encontrar la hora en que comenzará a llover en la tarde (si aplica)
  let rainStartHour = null
  if (willRainInAfternoon) {
    for (const hour of afternoonForecast) {
      if (
        hour.condition.toLowerCase().includes("lluvia") ||
        hour.condition.toLowerCase().includes("llovizna") ||
        hour.precipitation > 30
      ) {
        rainStartHour = hour.hour
        break
      }
    }
  }

  // Generar la recomendación
  let recommendation = ""
  let variant: "default" | "destructive" | null = null
  let icon = null
  let bgClass = ""
  let iconClass = ""

  if (willRainInMorning && willRainInAfternoon) {
    recommendation = "No es recomendable lavar ropa hoy, ya que lloverá durante todo el día."
    variant = "destructive"
    icon = <CloudRain className="h-10 w-10 text-red-500" />
    bgClass = "bg-red-50 dark:bg-red-900/20"
    iconClass = "bg-red-100 dark:bg-red-800/30"
  } else if (willRainInMorning && !willRainInAfternoon) {
    recommendation = "Es mejor lavar la ropa después del mediodía, ya que lloverá durante la mañana."
    variant = "default"
    icon = <Clock className="h-10 w-10 text-amber-500" />
    bgClass = "bg-amber-50 dark:bg-amber-900/20"
    iconClass = "bg-amber-100 dark:bg-amber-800/30"
  } else if (!willRainInMorning && willRainInAfternoon) {
    recommendation = `Es recomendable lavar la ropa temprano en la mañana, ya que comenzará a llover a partir de las ${rainStartHour}:00.`
    variant = "default"
    icon = <Clock className="h-10 w-10 text-blue-500" />
    bgClass = "bg-blue-50 dark:bg-blue-900/20"
    iconClass = "bg-blue-100 dark:bg-blue-800/30"
  } else {
    recommendation = "¡Excelente día para lavar ropa! No se espera lluvia durante todo el día."
    variant = null
    icon = <Sun className="h-10 w-10 text-yellow-500" />
    bgClass = "bg-green-50 dark:bg-green-900/20"
    iconClass = "bg-green-100 dark:bg-green-800/30"
  }

  return (
    <div className={`p-4 rounded-xl ${bgClass} animate-weather`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full ${iconClass}`}>{icon}</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">Recomendación</h3>
          <p className="text-slate-700 dark:text-slate-300">{recommendation}</p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Droplets className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Mañana</p>
                <p className="text-sm font-medium">{willRainInMorning ? "Lluvia" : "Sin lluvia"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Droplets className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Tarde</p>
                <p className="text-sm font-medium">{willRainInAfternoon ? "Lluvia" : "Sin lluvia"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
