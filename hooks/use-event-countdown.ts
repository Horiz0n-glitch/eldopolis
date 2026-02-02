"use client"

import { useState, useEffect } from "react"

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function useEventCountdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const [isEventPassed, setIsEventPassed] = useState(false)

  useEffect(() => {
    // Fecha del evento: 9 de agosto de 2025 a las 21:00
    const eventDate = new Date("2025-08-09T21:00:00-03:00") // Hora de Argentina

    const calculateTimeLeft = () => {
      const now = new Date()
      const difference = eventDate.getTime() - now.getTime()

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeLeft({ days, hours, minutes, seconds })
        setIsEventPassed(false)
      } else {
        setTimeLeft(null)
        setIsEventPassed(true)
      }
    }

    // Calcular inmediatamente
    calculateTimeLeft()

    // Actualizar cada minuto
    const timer = setInterval(calculateTimeLeft, 60000)

    return () => clearInterval(timer)
  }, [])

  return { timeLeft, isEventPassed }
}
