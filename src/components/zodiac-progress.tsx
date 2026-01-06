'use client'

import { useEffect, useState, useRef } from 'react'

const zodiacAnimals = ['🐭', '🐮', '🐯', '🐰', '🐲', '🐍', '🐴', '🐑', '🐵', '🐔', '🐶', '🐷']
const MINIMUM_DISPLAY_TIME = 30000 // 30 seconds

interface ZodiacProgressProps {
  isLoading: boolean
  message?: string
}

export function ZodiacProgress({ isLoading, message = 'Analyzing...' }: ZodiacProgressProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [percentage, setPercentage] = useState(0)
  const startTimeRef = useRef<number | null>(null)

  // Handle showing the animation
  useEffect(() => {
    if (isLoading && !isVisible) {
      setIsVisible(true)
      startTimeRef.current = Date.now()
    }
  }, [isLoading, isVisible])

  // Handle hiding with minimum display time
  useEffect(() => {
    if (!isLoading && isVisible && startTimeRef.current) {
      const elapsed = Date.now() - startTimeRef.current
      const remaining = Math.max(0, MINIMUM_DISPLAY_TIME - elapsed)
      
      const timer = setTimeout(() => {
        setIsVisible(false)
        startTimeRef.current = null
      }, remaining)

      return () => clearTimeout(timer)
    }
  }, [isLoading, isVisible])

  // Animate zodiac rotation
  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % zodiacAnimals.length)
    }, 300)

    return () => clearInterval(interval)
  }, [isVisible])

  // Update percentage based on elapsed time
  useEffect(() => {
    if (!isVisible || !startTimeRef.current) return

    const updatePercentage = () => {
      const elapsed = Date.now() - startTimeRef.current!
      const progress = Math.min(100, Math.floor((elapsed / MINIMUM_DISPLAY_TIME) * 100))
      setPercentage(progress)
    }

    updatePercentage()
    const interval = setInterval(updatePercentage, 100)

    return () => clearInterval(interval)
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6">
        {/* Circular zodiac animation */}
        <div className="relative w-64 h-64">
          {/* Center circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
              <div
                key={currentIndex}
                className="text-6xl animate-in zoom-in-50 duration-300"
              >
                {zodiacAnimals[currentIndex]}
              </div>
            </div>
          </div>

          {/* Rotating zodiac circle */}
          {zodiacAnimals.map((animal, index) => {
            const angle = (index * 360) / zodiacAnimals.length
            const radius = 100
            const x = Math.cos((angle * Math.PI) / 180) * radius
            const y = Math.sin((angle * Math.PI) / 180) * radius

            return (
              <div
                key={index}
                className="absolute top-1/2 left-1/2 text-3xl transition-all duration-300"
                style={{
                  transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${currentIndex === index ? 1.2 : 1})`,
                  opacity: currentIndex === index ? 1 : 0.3,
                }}
              >
                {animal}
              </div>
            )
          })}

          {/* Rotating ring */}
          <div
            className="absolute inset-0 rounded-full border-4 border-primary/30 animate-spin"
            style={{
              borderTopColor: 'hsl(var(--primary))',
              borderRightColor: 'transparent',
              animationDuration: '3s',
            }}
          />
        </div>

        {/* Loading text */}
        <div className="text-center space-y-2">
          <p className="text-lg font-medium animate-pulse">
            {message}
          </p>
          <p className="text-sm text-muted-foreground">
            Please wait while we analyze your destiny...
          </p>
          <p className="text-2xl font-bold text-primary mt-4">
            {percentage}%
          </p>
        </div>
      </div>
    </div>
  )
}
