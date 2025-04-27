"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import WeatherForecast from "@/components/weather-forecast"
import LaundryRecommendation from "@/components/laundry-recommendation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, MapPin, Search, Loader2, CloudRain, Shirt } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { ModeToggle } from "@/components/mode-toggle"

export default function Home() {
  const [location, setLocation] = useState("")
  const [searchedLocation, setSearchedLocation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [weatherData, setWeatherData] = useState(null)
  const [error, setError] = useState("")
  const [geolocating, setGeolocating] = useState(false)
  const [geoWatchId, setGeoWatchId] = useState(null)
  const [locationAccuracy, setLocationAccuracy] = useState(null)
  const [locationCoords, setLocationCoords] = useState(null)
  const [geoProgress, setGeoProgress] = useState(0)
  const [geoAttempts, setGeoAttempts] = useState(0)
  const [mounted, setMounted] = useState(false)

  // Evitar problemas de hidratación
  useEffect(() => {
    setMounted(true)
  }, [])

  // Limpiar el watcher de geolocalización al desmontar el componente
  useEffect(() => {
    return () => {
      if (geoWatchId !== null) {
        navigator.geolocation.clearWatch(geoWatchId)
      }
    }
  }, [geoWatchId])

  // Efecto para simular progreso durante la geolocalización
  useEffect(() => {
    if (geolocating) {
      const interval = setInterval(() => {
        setGeoProgress((prev) => {
          const increment = Math.random() * 15
          return Math.min(prev + increment, 95) // Nunca llega a 100 hasta que termine
        })
      }, 500)

      return () => clearInterval(interval)
    } else {
      setGeoProgress(0)
    }
  }, [geolocating])

  const handleSearch = async (e) => {
    e?.preventDefault()
    if (!location.trim()) return

    setIsLoading(true)
    setSearchedLocation(location)
    setError("")

    try {
      const response = await fetch(`/api/weather?location=${encodeURIComponent(location)}`)

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setWeatherData(data)
    } catch (error) {
      console.error("Error fetching weather data:", error)
      setError("No se pudo obtener el pronóstico. Verifica la ubicación e intenta de nuevo.")
      setWeatherData(null)
    } finally {
      setIsLoading(false)
    }
  }

  const getAccuracyDescription = (accuracy) => {
    if (accuracy < 10) return { text: "Extremadamente precisa", color: "excellent" }
    if (accuracy < 50) return { text: "Muy precisa", color: "good" }
    if (accuracy < 100) return { text: "Precisa", color: "good" }
    if (accuracy < 500) return { text: "Moderada", color: "moderate" }
    if (accuracy < 1000) return { text: "Baja", color: "low" }
    return { text: "Muy baja", color: "poor" }
  }

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setError("La geolocalización no está disponible en tu navegador.")
      return
    }

    setGeolocating(true)
    setError("")
    setGeoAttempts(0)
    setLocationAccuracy(null)
    setLocationCoords(null)

    // Limpiar cualquier watch previo
    if (geoWatchId !== null) {
      navigator.geolocation.clearWatch(geoWatchId)
    }

    // Primero intentamos obtener una posición de alta precisión
    navigator.geolocation.getCurrentPosition(
      handlePositionSuccess,
      (error) => {
        // Si falla, intentamos con el watcher para mejorar la precisión con el tiempo
        startPositionWatcher()
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }

  const startPositionWatcher = () => {
    setGeoAttempts((prev) => prev + 1)

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { accuracy } = position.coords

        // Si ya tenemos una posición y la nueva no es más precisa, la ignoramos
        if (locationAccuracy !== null && accuracy >= locationAccuracy) {
          return
        }

        handlePositionSuccess(position)

        // Si la precisión es muy buena (<20m), detenemos el watcher
        if (accuracy < 20) {
          navigator.geolocation.clearWatch(watchId)
          setGeoWatchId(null)
        }
      },
      handlePositionError,
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0,
      },
    )

    setGeoWatchId(watchId)

    // Establecer un tiempo límite para el watcher
    setTimeout(() => {
      if (geoWatchId !== null) {
        navigator.geolocation.clearWatch(watchId)
        setGeoWatchId(null)

        // Si tenemos alguna posición, la usamos aunque no sea óptima
        if (locationCoords) {
          fetchWeatherWithCoords(locationCoords)
        } else if (geoAttempts < 2) {
          // Intentar una vez más con menor precisión
          startPositionWatcher()
        } else {
          handlePositionError({ code: 3, message: "Tiempo de espera agotado" })
        }
      }
    }, 15000)
  }

  const handlePositionSuccess = (position) => {
    const { latitude, longitude, accuracy } = position.coords
    const coords = { latitude, longitude }

    setLocationAccuracy(accuracy)
    setLocationCoords(coords)
    setGeoProgress(100)

    // Si la precisión es aceptable o hemos intentado varias veces, usamos esta posición
    if (accuracy < 100 || geoAttempts > 0) {
      fetchWeatherWithCoords(coords)
    }
  }

  const fetchWeatherWithCoords = async (coords) => {
    const { latitude, longitude } = coords
    const locationString = `${latitude},${longitude}`

    try {
      setSearchedLocation("Tu ubicación actual")

      const response = await fetch(`/api/weather?location=${encodeURIComponent(locationString)}`)

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Actualizar el nombre de la ubicación con el que devuelve la API
      setSearchedLocation(data.location || "Tu ubicación actual")
      setWeatherData(data)
    } catch (error) {
      console.error("Error fetching weather data:", error)
      setError("No se pudo obtener el pronóstico para tu ubicación actual.")
      setWeatherData(null)
    } finally {
      setGeolocating(false)
      // Limpiar el watcher si aún está activo
      if (geoWatchId !== null) {
        navigator.geolocation.clearWatch(geoWatchId)
        setGeoWatchId(null)
      }
    }
  }

  const handlePositionError = (error) => {
    console.error("Geolocation error:", error)
    let errorMessage = "No se pudo obtener tu ubicación actual."

    if (error.code === 1) {
      errorMessage =
        "Permiso de ubicación denegado. Por favor, permite el acceso a tu ubicación o usa la búsqueda manual."
    } else if (error.code === 2) {
      errorMessage = "No se pudo determinar tu ubicación actual. Por favor, usa la búsqueda manual."
    } else if (error.code === 3) {
      errorMessage =
        "Se agotó el tiempo para obtener tu ubicación. Por favor, intenta de nuevo o usa la búsqueda manual."
    }

    setError(errorMessage)
    setGeolocating(false)

    // Limpiar el watcher si aún está activo
    if (geoWatchId !== null) {
      navigator.geolocation.clearWatch(geoWatchId)
      setGeoWatchId(null)
    }
  }

  if (!mounted) {
    return null // Evitar renderizado durante la hidratación
  }

  return (
    <main className="container mx-auto px-4 py-4 sm:py-8 relative">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <div className="flex items-center justify-center mb-6 sm:mb-8">
        <div className="mr-3">
          <Shirt className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold app-title">¿Puedo Lavar Mi Ropa Hoy?</h1>
      </div>

      <div className="max-w-xl mx-auto mb-6 sm:mb-10 search-container animate-weather">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Ingresa tu ubicación"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1 bg-white/50 dark:bg-slate-800/50 border-slate-200/70 dark:border-slate-700/70 focus:ring-2 focus:ring-blue-500/50"
            disabled={isLoading || geolocating}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGeolocation}
                  disabled={isLoading || geolocating}
                  className="geo-button bg-white/50 dark:bg-slate-800/50 border-slate-200/70 dark:border-slate-700/70 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  {geolocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Usar mi ubicación actual (alta precisión)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            type="submit"
            disabled={isLoading || geolocating || !location.trim()}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
          >
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
            <span className="hidden sm:inline">Buscar</span>
            <span className="sm:hidden">Ir</span>
          </Button>
        </form>

        {geolocating && (
          <div className="mt-4 animate-weather">
            <div className="flex justify-between text-sm mb-1">
              <span>Obteniendo ubicación precisa...</span>
              <span>{Math.round(geoProgress)}%</span>
            </div>
            <Progress value={geoProgress} className="h-2 progress-bar" />
          </div>
        )}

        {locationAccuracy && !geolocating && (
          <div className="mt-3 flex items-center gap-2 animate-weather">
            <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Precisión:</span>
            <span className={`accuracy-badge ${getAccuracyDescription(locationAccuracy).color}`}>
              {getAccuracyDescription(locationAccuracy).text} ({Math.round(locationAccuracy)}m)
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="max-w-xl mx-auto mb-6 sm:mb-8 animate-weather">
          <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {weatherData && (
        <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto">
          <Card className="weather-card animate-weather">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-xl sm:text-2xl">Pronóstico para</CardTitle>
                  <div className="mt-1 location-badge">
                    <MapPin className="h-3 w-3" />
                    <span className="text-xs">{searchedLocation}</span>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <CardDescription className="text-xs sm:text-sm">
                    {new Date().toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <WeatherForecast forecast={weatherData.hourly} />
            </CardContent>
            {locationCoords && (
              <CardFooter className="text-xs text-muted-foreground border-t border-slate-100 dark:border-slate-800 pt-4 px-4 sm:px-6">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="text-xs">
                    Coordenadas exactas: {locationCoords.latitude.toFixed(6)}, {locationCoords.longitude.toFixed(6)}
                  </span>
                </div>
              </CardFooter>
            )}
          </Card>

          <Card className="recommendation-card animate-weather">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                <CloudRain className="h-5 w-5 text-blue-500" />
                Recomendación para lavar ropa
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <LaundryRecommendation forecast={weatherData.hourly} />
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  )
}
