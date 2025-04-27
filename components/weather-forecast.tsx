import { Cloud, CloudRain, Sun, CloudDrizzle, Droplets, CloudSnow, Moon } from "lucide-react"

interface HourlyForecast {
  hour: number
  temperature: number
  condition: string
  precipitation: number
  isDay?: boolean
}

interface WeatherForecastProps {
  forecast: HourlyForecast[]
}

export default function WeatherForecast({ forecast }: WeatherForecastProps) {
  const getWeatherIcon = (condition: string, isDay = true) => {
    switch (condition.toLowerCase()) {
      case "lluvia":
        return (
          <div className="weather-icon">
            <CloudRain className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 drop-shadow-md" />
          </div>
        )
      case "nublado":
        return (
          <div className="weather-icon">
            <Cloud className="h-6 w-6 sm:h-8 sm:w-8 text-slate-500 drop-shadow-md" />
          </div>
        )
      case "llovizna":
        return (
          <div className="weather-icon">
            <CloudDrizzle className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 drop-shadow-md" />
          </div>
        )
      case "nieve":
        return (
          <div className="weather-icon">
            <CloudSnow className="h-6 w-6 sm:h-8 sm:w-8 text-blue-200 drop-shadow-md" />
          </div>
        )
      case "despejado":
        return (
          <div className="weather-icon">
            <Moon className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-400 drop-shadow-md" />
          </div>
        )
      case "soleado":
      default:
        return (
          <div className="weather-icon">
            {isDay ? (
              <Sun className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 drop-shadow-md" />
            ) : (
              <Moon className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-400 drop-shadow-md" />
            )}
          </div>
        )
    }
  }

  const getWeatherClass = (condition: string, isDay = true) => {
    switch (condition.toLowerCase()) {
      case "lluvia":
        return "rain"
      case "llovizna":
        return "drizzle"
      case "nublado":
        return "cloudy"
      case "nieve":
        return "snow"
      case "despejado":
        return "clear-night"
      case "soleado":
      default:
        return isDay ? "sunny" : "clear-night"
    }
  }

  const formatHour = (hour: number) => {
    return `${hour}:00`
  }

  // Agrupar las horas por período del día
  const morningForecast = forecast.filter((hour) => hour.hour >= 6 && hour.hour <= 12)
  const afternoonForecast = forecast.filter((hour) => hour.hour > 12 && hour.hour <= 19)
  const nightForecast = forecast.filter((hour) => hour.hour > 19 || hour.hour < 6)

  // Ordenar el pronóstico nocturno para que las horas vayan de 20 a 5
  const sortedNightForecast = [...nightForecast].sort((a, b) => {
    // Convertir las horas para que 0-5 vengan después de 20-23
    const hourA = a.hour < 6 ? a.hour + 24 : a.hour
    const hourB = b.hour < 6 ? b.hour + 24 : b.hour
    return hourA - hourB
  })

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
          Mañana (6:00 - 12:00)
        </h3>
        <div className="overflow-x-auto pb-2 -mx-4 sm:mx-0 px-4 sm:px-0">
          <div className="flex space-x-2 sm:space-x-3 pb-2 min-w-max">
            {morningForecast.map((hourData, index) => (
              <div
                key={`morning-${index}`}
                className={`flex flex-col items-center min-w-[60px] sm:min-w-[85px] p-2 sm:p-3 rounded-xl shadow-sm weather-hour ${getWeatherClass(
                  hourData.condition,
                  hourData.isDay,
                )}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="text-xs sm:text-sm font-medium mb-1">{formatHour(hourData.hour)}</span>
                <div className="my-1 sm:my-2">{getWeatherIcon(hourData.condition, hourData.isDay)}</div>
                <span className="text-lg sm:text-xl font-bold">{hourData.temperature}°</span>
                {hourData.precipitation > 0 && (
                  <div className="flex items-center mt-1 sm:mt-2 text-xs text-blue-600 dark:text-blue-400">
                    <Droplets className="h-3 w-3 mr-1" />
                    <span>{hourData.precipitation}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
          Tarde (13:00 - 19:00)
        </h3>
        <div className="overflow-x-auto pb-2 -mx-4 sm:mx-0 px-4 sm:px-0">
          <div className="flex space-x-2 sm:space-x-3 pb-2 min-w-max">
            {afternoonForecast.map((hourData, index) => (
              <div
                key={`afternoon-${index}`}
                className={`flex flex-col items-center min-w-[60px] sm:min-w-[85px] p-2 sm:p-3 rounded-xl shadow-sm weather-hour ${getWeatherClass(
                  hourData.condition,
                  hourData.isDay,
                )}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="text-xs sm:text-sm font-medium mb-1">{formatHour(hourData.hour)}</span>
                <div className="my-1 sm:my-2">{getWeatherIcon(hourData.condition, hourData.isDay)}</div>
                <span className="text-lg sm:text-xl font-bold">{hourData.temperature}°</span>
                {hourData.precipitation > 0 && (
                  <div className="flex items-center mt-1 sm:mt-2 text-xs text-blue-600 dark:text-blue-400">
                    <Droplets className="h-3 w-3 mr-1" />
                    <span>{hourData.precipitation}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Noche (20:00 - 5:00)</h3>
        <div className="overflow-x-auto pb-2 -mx-4 sm:mx-0 px-4 sm:px-0">
          <div className="flex space-x-2 sm:space-x-3 pb-2 min-w-max">
            {sortedNightForecast.map((hourData, index) => (
              <div
                key={`night-${index}`}
                className={`flex flex-col items-center min-w-[60px] sm:min-w-[85px] p-2 sm:p-3 rounded-xl shadow-sm weather-hour ${getWeatherClass(
                  hourData.condition,
                  hourData.isDay,
                )}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="text-xs sm:text-sm font-medium mb-1">{formatHour(hourData.hour)}</span>
                <div className="my-1 sm:my-2">{getWeatherIcon(hourData.condition, hourData.isDay)}</div>
                <span className="text-lg sm:text-xl font-bold">{hourData.temperature}°</span>
                {hourData.precipitation > 0 && (
                  <div className="flex items-center mt-1 sm:mt-2 text-xs text-blue-600 dark:text-blue-400">
                    <Droplets className="h-3 w-3 mr-1" />
                    <span>{hourData.precipitation}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
