// components/pollutant-trends-card.tsx
"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Line, LineChart, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts"
import { TrendingDown, TrendingUp, Info } from "lucide-react"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getPollutantColor } from "@/lib/utils"

const pollutants = [
  {
    id: "co2",
    name: "CO₂",
    unit: "ppm",
    threshold: 1000,
    description: "Carbon dioxide levels above 1000 ppm can cause drowsiness and impair cognitive function.",
    color: "#6366F1",
  },
  {
    id: "pm25",
    name: "PM2.5",
    unit: "μg/m³",
    threshold: 35,
    description: "Fine particulate matter can penetrate deep into the lungs and cause respiratory issues.",
    color: "#3B82F6",
  },
  {
    id: "voc",
    name: "VOCs",
    unit: "mg/m³",
    threshold: 0.5,
    description: "Volatile organic compounds can cause eye, nose, and throat irritation.",
    color: "#10B981",
  },
  {
    id: "co",
    name: "CO",
    unit: "ppm",
    threshold: 9,
    description: "Carbon monoxide is a toxic gas that can cause headaches and dizziness.",
    color: "#F59E0B",
  },
  {
    id: "no2",
    name: "NO₂",
    unit: "ppb",
    threshold: 100,
    description: "Nitrogen dioxide can worsen respiratory conditions like asthma.",
    color: "#EF4444",
  },
  {
    id: "o3",
    name: "Ozone",
    unit: "ppb",
    threshold: 70,
    description: "Ground-level ozone can trigger a variety of health problems including chest pain and coughing.",
    color: "#8B5CF6",
  },
]

interface PollutantTrendsCardProps {
  className?: string
  historicalData: any[]
}

export default function PollutantTrendsCard({ className, historicalData }: PollutantTrendsCardProps) {
  const [activeTab, setActiveTab] = useState("co2")
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Card className={`p-6 hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px] border-safety-green/20 hover:border-safety-green ${className || ""}`}>
        <CardHeader>
          <CardTitle>Pollutant Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] animate-pulse bg-muted rounded-lg"></div>
        </CardContent>
      </Card>
    )
  }

  const activePollutant = pollutants.find((p) => p.id === activeTab) || pollutants[0]
  
  // Sort oldest→newest so chart flows left→right naturally
  // currentValue = last item = newest reading (matches dashboard card)
  const trendData = (historicalData && historicalData.length > 0)
    ? [...historicalData]
        .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map((reading: any) => ({
          day: new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          value: Number(reading[activeTab] !== undefined ? reading[activeTab] : 0),
          threshold: activePollutant.threshold,
        }))
    : [];

  const hasData = trendData.length > 0;
  // Last item = newest reading = matches the live card value
  const currentValue = hasData ? trendData[trendData.length - 1].value : 0;
  const previousValue = hasData && trendData.length > 1 ? trendData[trendData.length - 2].value : currentValue;
  const change = currentValue - previousValue;
  const changePercentage = previousValue ? Math.round((change / previousValue) * 100 * 10) / 10 : 0;
  const isSafe = currentValue <= activePollutant.threshold;
  const color = getPollutantColor(currentValue, activePollutant.threshold * 0.7, activePollutant.threshold);

  // Scrollable chart: each data point gets 55px; scroll kicks in beyond 20 visible points
  const PX_PER_POINT = 55;
  const MIN_CHART_WIDTH = 500;
  const chartWidth = Math.max(MIN_CHART_WIDTH, trendData.length * PX_PER_POINT);
  const isScrollable = trendData.length > 20;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload
      return (
        <div className="bg-background p-3 border border-border rounded-md shadow-md">
          <p className="font-manrope font-semibold">{label}</p>
          <p className={`text-sm font-space-grotesk ${color === "green" ? "text-safety-green" : color === "yellow" ? "text-yellow-600" : "text-danger-coral"}`}>
            {activePollutant.name}: {dataPoint.value} {activePollutant.unit}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Threshold: {dataPoint.threshold} {activePollutant.unit}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className={`p-6 hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px] ${color === "green" ? "border-safety-green hover:border-safety-green" : color === "yellow" ? "border-yellow-400 hover:border-yellow-400" : "border-danger-coral hover:border-danger-coral"} ${className || ""}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Pollutant Trends</span>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  This chart shows the trend of various pollutants over the past week. Click on a pollutant tab to view
                  its specific trend.
                </p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="co2" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-6 grid grid-cols-3 md:grid-cols-6">
            {pollutants.map((pollutant) => (
              <TabsTrigger key={pollutant.id} value={pollutant.id} className="text-sm">
                {pollutant.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {pollutants.map((pollutant) => (
            <TabsContent key={pollutant.id} value={pollutant.id} className="mt-0">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold font-manrope">{pollutant.name}</h3>
                      <div className={`text-sm font-space-grotesk ${color === "green" ? "text-safety-green" : color === "yellow" ? "text-yellow-600" : "text-danger-coral"}`}>
                        {color === "green" ? "✓ Safe" : color === "yellow" ? "● Moderate" : "⚠ Unsafe"}
                      </div>
                    </div>
                    <div className="flex items-baseline mt-2">
                      <div className={`text-4xl font-bold font-manrope ${color === "green" ? "text-safety-green" : color === "yellow" ? "text-yellow-600" : "text-danger-coral"}`}>
                        {currentValue}
                      </div>
                      <div className="text-sm font-space-grotesk text-muted-foreground ml-2">{pollutant.unit}</div>
                      {change !== 0 && (
                        <div className={`flex items-center text-sm ml-4 ${change > 0 ? "text-danger-coral" : "text-safety-green"}`}>
                          {change > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                          {Math.abs(changePercentage)}%
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mb-4">{pollutant.description}</div>
                  <div className="mb-2 relative h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${color === "green" ? "bg-safety-green" : color === "yellow" ? "bg-yellow-200" : "bg-danger-coral"}`}
                      style={{
                        width: `${Math.min((currentValue / activePollutant.threshold) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0 {pollutant.unit}</span>
                    <span>Threshold: {activePollutant.threshold} {pollutant.unit}</span>
                  </div>
                </div>
                <div className="md:w-2/3">
                  {hasData ? (
                    <div className="relative">
                      {/* Scroll hint badge */}
                      {isScrollable && (
                        <div className="absolute top-0 right-0 z-10 text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-space-grotesk flex items-center gap-1">
                          <span>↔ scroll</span>
                        </div>
                      )}
                      {/* Scrollable wrapper */}
                      <div
                        className="overflow-x-auto"
                        style={{ WebkitOverflowScrolling: 'touch' }}
                      >
                        <div style={{ width: `${chartWidth}px`, height: '300px' }}>
                          <LineChart width={chartWidth} height={300} data={trendData}>
                            <XAxis dataKey="day" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickMargin={10} />
                            <YAxis domain={[0, "auto"]} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickMargin={10} width={40} />
                            <Tooltip content={<CustomTooltip />} />
                            <ReferenceLine
                              y={activePollutant.threshold}
                              stroke={theme === "dark" ? "hsl(0, 70%, 40%)" : "hsl(0, 100%, 70%)"}
                              strokeDasharray="3 3"
                              label={{
                                value: "Threshold",
                                position: "insideTopRight",
                                fill: theme === "dark" ? "hsl(0, 70%, 40%)" : "hsl(0, 100%, 70%)",
                                fontSize: 12,
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke={pollutant.color}
                              strokeWidth={2}
                              dot={{ r: 4, fill: pollutant.color, strokeWidth: 0 }}
                              activeDot={{ r: 6, fill: pollutant.color, strokeWidth: 0 }}
                              animationDuration={1500}
                            />
                          </LineChart>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center border border-dashed rounded-lg bg-muted/20 text-muted-foreground text-sm font-space-grotesk">
                      No historical trend data available yet
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
