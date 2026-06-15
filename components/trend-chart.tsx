"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface TrendChartProps {
  title: string
  description?: string
  data: Array<{ date: string; value: number }>
  yAxisLabel?: string
  threshold?: number
  unit?: string
}

export default function TrendChart({ title, description, data, yAxisLabel, threshold, unit = "" }: TrendChartProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="h-[300px]">
          <div className="animate-pulse h-full w-full bg-muted rounded-md"></div>
        </CardContent>
      </Card>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border border-border rounded-md shadow-md">
          <p className="font-manrope font-semibold">{label}</p>
          <p className="text-sm font-space-grotesk">{`${payload[0].name}: ${payload[0].value}${unit}`}</p>
          {threshold && (
            <p className="text-xs text-muted-foreground mt-1">
              Threshold: {threshold}
              {unit}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  // Calculate min and max for Y axis with some padding
  const values = data.map((item) => item.value)
  const minValue = Math.max(0, Math.floor(Math.min(...values) * 0.9))
  const maxValue = Math.ceil(Math.max(...values) * 1.1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
            <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis
              label={{
                value: yAxisLabel,
                angle: -90,
                position: "insideLeft",
                style: { textAnchor: "middle", fontSize: 12, fill: theme === "dark" ? "#94a3b8" : "#64748b" },
              }}
              domain={[minValue, maxValue]}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Threshold line if provided */}
            {threshold && (
              <Line
                type="monotone"
                dataKey="threshold"
                stroke={theme === "dark" ? "hsl(0, 70%, 40%)" : "hsl(0, 100%, 70%)"}
                strokeDasharray="5 5"
                strokeWidth={1}
                dot={false}
                activeDot={false}
                isAnimationActive={false}
                data={data.map((item) => ({ ...item, threshold }))}
              />
            )}

            <Line
              type="monotone"
              dataKey="value"
              stroke={theme === "dark" ? "hsl(120, 74%, 25%)" : "hsl(120, 74%, 75%)"}
              strokeWidth={2}
              dot={{ r: 3, fill: theme === "dark" ? "hsl(120, 74%, 25%)" : "hsl(120, 74%, 75%)" }}
              activeDot={{ r: 5, fill: theme === "dark" ? "hsl(120, 74%, 25%)" : "hsl(120, 74%, 75%)" }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

