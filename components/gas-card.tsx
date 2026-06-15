"use client"

import { Card } from "@/components/ui/card"
//import Sparkline from "@/components/sparkline"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { TrendingDown, TrendingUp } from "lucide-react"
import { getPollutantColor } from "@/lib/utils"

interface GasCardProps {
  title: string
  value: number
  unit: string
  status: string
  data: number[]
  threshold: number
  change?: number
}

export default function GasCard({ title, value, unit, status, data, threshold, change = 0 }: GasCardProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const isSafe = value <= threshold

  if (!mounted) {
    return (
      <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px] border-safety-green/20">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
          <div className="h-10 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-8 bg-muted rounded w-full"></div>
        </div>
      </Card>
    )
  }

  // Color logic: green (safe), yellow (moderate), red (high)
  const moderate = threshold * 0.7
  const color = getPollutantColor(value, moderate, threshold)
  const colorClass =
    color === "green"
      ? "text-safety-green border-safety-green hover:border-safety-green"
      : color === "yellow"
      ? "text-yellow-600 border-yellow-400 hover:border-yellow-400"
      : "text-danger-coral border-danger-coral hover:border-danger-coral"
  const gaugeColor =
    color === "green"
      ? "#22c55e"
      : color === "yellow"
      ? "#fde047"
      : "#ef4444"

  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
      <Card
        className={`p-6 hover:shadow-lg transition-all duration-300 ${colorClass}`}
      >
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold font-manrope">{title}</h2>
          <div className={`text-sm font-space-grotesk ${color === "green" ? "text-safety-green" : color === "yellow" ? "text-yellow-600" : "text-danger-coral"}`}>
            {color === "green" ? "✓ Safe" : color === "yellow" ? "● Moderate" : "⚠ Unsafe"}
          </div>
        </div>
        <div className="flex items-end gap-2 mb-1">
          <div className="text-4xl font-bold font-manrope">{value}</div>
          <div className="text-sm font-space-grotesk text-muted-foreground mb-1">{unit}</div>
          {change !== 0 && (
            <div className={`flex items-center text-sm ml-2 ${change > 0 ? "text-danger-coral" : "text-safety-green"}`}>
              {change > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div className="text-sm font-space-grotesk text-muted-foreground mb-3">{status}</div>
        {/* Threshold gauge */}
        <div className="mb-3 relative h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min((value / threshold) * 100, 100)}%`,
              backgroundColor: gaugeColor,
            }}
          />
          <div className="absolute top-0 h-full w-px bg-foreground/30" style={{ left: "100%" }} />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mb-3">
          <span>0 {unit}</span>
          <span>
            Threshold: {threshold} {unit}
          </span>
        </div>
        {/*<Sparkline data={data} safe={isSafe} />*/}
      </Card>
    </motion.div>
  )
}

