"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

interface AQIGaugeProps {
  value: number
  maxValue?: number
  size?: number
  animated?: boolean
}

export default function AQIGauge({ value, maxValue = 500, size = 200, animated = true }: AQIGaugeProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [currentValue, setCurrentValue] = useState(0)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Animation effect
  useEffect(() => {
    if (animated && mounted) {
      const timer = setTimeout(() => {
        setCurrentValue(value)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setCurrentValue(value)
    }
  }, [value, animated, mounted])

  if (!mounted) {
    return <div style={{ height: `${size}px`, width: `${size}px` }} className="mx-auto" />
  }

  // Calculate the percentage of the value relative to the max
  const percentage = Math.min(currentValue / maxValue, 1)
  const angle = percentage * 180

  // Determine color based on AQI value
  const getColor = () => {
    if (currentValue <= 50) return theme === "dark" ? "#14532D" : "#90EE90" // Good - Green
    if (currentValue <= 100) return "#FFDE33" // Moderate - Yellow
    if (currentValue <= 150) return "#FF9933" // Unhealthy for Sensitive Groups - Orange
    if (currentValue <= 200) return "#FF3333" // Unhealthy - Red
    if (currentValue <= 300) return "#990099" // Very Unhealthy - Purple
    return "#660000" // Hazardous - Maroon
  }

  // Determine AQI category
  const getCategory = () => {
    if (currentValue <= 50) return "Good"
    if (currentValue <= 100) return "Moderate"
    if (currentValue <= 150) return "Unhealthy for Sensitive Groups"
    if (currentValue <= 200) return "Unhealthy"
    if (currentValue <= 300) return "Very Unhealthy"
    return "Hazardous"
  }

  // Calculate the coordinates for the needle
  const needleX = Math.sin((angle * Math.PI) / 180) * (size * 0.4) + size / 2
  const needleY = size / 2 - Math.cos((angle * Math.PI) / 180) * (size * 0.4)

  return (
    <div className="relative" style={{ width: `${size}px`, height: `${size * 0.6}px`, margin: "0 auto" }}>
      {/* Gauge background */}
      <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.6}`}>
        {/* Gauge arc background */}
        <path
          d={`M ${size * 0.1} ${size * 0.5} A ${size * 0.4} ${size * 0.4} 0 0 1 ${size * 0.9} ${size * 0.5}`}
          fill="none"
          stroke={theme === "dark" ? "#334155" : "#e5e7eb"}
          strokeWidth={size * 0.08}
          strokeLinecap="round"
        />

        {/* Colored gauge arc based on value */}
        <path
          d={`M ${size * 0.1} ${size * 0.5} A ${size * 0.4} ${size * 0.4} 0 0 1 ${needleX} ${needleY}`}
          fill="none"
          stroke={getColor()}
          strokeWidth={size * 0.08}
          strokeLinecap="round"
          style={{
            transition: animated ? "all 1s ease-out" : "none",
          }}
        />

        {/* Gauge needle */}
        <line
          x1={size / 2}
          y1={size / 2}
          x2={needleX}
          y2={needleY}
          stroke={theme === "dark" ? "#e2e8f0" : "#1f2937"}
          strokeWidth={size * 0.02}
          strokeLinecap="round"
          style={{
            transition: animated ? "all 1s ease-out" : "none",
          }}
        />

        {/* Needle center point */}
        <circle cx={size / 2} cy={size / 2} r={size * 0.04} fill={theme === "dark" ? "#e2e8f0" : "#1f2937"} />

        {/* Threshold markers */}
        {[0, 50, 100, 150, 200, 300].map((threshold, index) => {
          const thresholdPercentage = threshold / maxValue
          if (thresholdPercentage > 1) return null

          const thresholdAngle = thresholdPercentage * 180
          const markerX = Math.sin((thresholdAngle * Math.PI) / 180) * (size * 0.45) + size / 2
          const markerY = size / 2 - Math.cos((thresholdAngle * Math.PI) / 180) * (size * 0.45)

          return (
            <g key={index}>
              <circle cx={markerX} cy={markerY} r={size * 0.01} fill={theme === "dark" ? "#e2e8f0" : "#1f2937"} />
              <text
                x={markerX}
                y={markerY + (index === 0 ? -10 : 15)}
                textAnchor="middle"
                fill={theme === "dark" ? "#e2e8f0" : "#1f2937"}
                fontSize={size * 0.035}
                fontFamily="Manrope"
              >
                {threshold}
              </text>
            </g>
          )
        })}
      </svg>

      {/* AQI value and category */}
      <div className="absolute bottom-0 left-0 right-0 text-center">
        <div className="text-4xl font-bold font-manrope">{currentValue}</div>
        <div className="text-sm font-space-grotesk text-muted-foreground">{getCategory()}</div>
      </div>
    </div>
  )
}

