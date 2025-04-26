import { Cloud, CloudRain, Sun, CloudDrizzle, Droplets } from "lucide-react"

interface HourlyForecast {
  hour: number
  temperature: number
  condition: string
  precipitation: number
}

interface WeatherForecastProps {
  forecast: HourlyForecast[]
}

export default function WeatherForecast({ forecast }: WeatherForecastProps) {
  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "lluvia":
        return (
          <div className="weather-icon">
            <CloudRain className="h-8 w-8 text-blue-500 drop-shadow-md" />
          </div>
        )
      case "nublado":
        return (
          <div className="weather-icon">
            <Cloud className="h-8 w-8 text-slate-500 drop-shadow-md" />
          </div>
        )
      case "llovizna":
        return (
          <div className="weather-icon">
            <CloudDrizzle className="h-8 w-8 text-blue-400 drop-shadow-md" />
          </div>
        )
      case "soleado":
      default:
        return (
          <div className="weather-icon">
            <Sun className="h-8 w-8 text-yellow-500 drop-shadow-md" />
          </div>
        )
    }
  }

  const getWeatherClass = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "lluvia":
        return "rain"
      case "llovizna":
        return "drizzle"
      case "nublado":
        return "cloudy"
      case "soleado":
      default:
        return "sunny"
    }
  }

  const formatHour = (hour: number) => {
    return `${hour}:00`
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex space-x-3 pb-2">
        {forecast.map((hourData, index) => (
          <div
            key={index}
            className={`flex flex-col items-center min-w-[85px] p-3 rounded-xl shadow-sm weather-hour ${getWeatherClass(
              hourData.condition,
            )}`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="text-sm font-medium mb-1">{formatHour(hourData.hour)}</span>
            <div className="my-2">{getWeatherIcon(hourData.condition)}</div>
            <span className="text-xl font-bold">{hourData.temperature}°</span>
            {hourData.precipitation > 0 && (
              <div className="flex items-center mt-2 text-xs text-blue-600 dark:text-blue-400">
                <Droplets className="h-3 w-3 mr-1" />
                <span>{hourData.precipitation}%</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
