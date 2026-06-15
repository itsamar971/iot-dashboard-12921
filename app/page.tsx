"use client"

import Link from "next/link"
import { BarChart2, ChevronRight, Sun, Droplets } from "lucide-react"
import { Card } from "@/components/ui/card"
import GasCard from "@/components/gas-card"
import AQIVisualization from "@/components/aqi-visualization"
import PollutantTrendsCard from "@/components/pollutant-trends-card"
import { useState, useEffect } from "react"
import { getAQIColor } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useDevices, useSensorData } from "@/hooks/useSensorData"

export default function HomePage() {
  const [selectedDevice, setSelectedDevice] = useState<string>("Esp_353")
  
  // Fetch available devices
  const { devices, loading: devicesLoading } = useDevices()

  // Set default device once devices are loaded
  useEffect(() => {
    if (devices.length > 0 && selectedDevice === "Esp_353" && !devices.find(d => d.id === "Esp_353")) {
      setSelectedDevice(devices[0].id)
    }
  }, [devices, selectedDevice])

  // Fetch current sensor data
  const { data, isConnected } = useSensorData({
    deviceId: selectedDevice,
    refreshInterval: 10000,
    autoRefresh: true
  })

  // Fetch historical data for trends
  const { data: historicalRaw } = useSensorData({
    deviceId: selectedDevice,
    refreshInterval: 10000,
    autoRefresh: true,
    historical: true,
    enabled: isConnected
  })

  const currentReading = data && !Array.isArray(data) ? data : (Array.isArray(data) && data.length > 0 ? data[0] : null)

  const aqiCardColor = currentReading ? getAQIColor(currentReading.aqi) : "green"
  const aqiCardBorderClass =
    aqiCardColor === "green"
      ? "border-safety-green hover:border-safety-green"
      : aqiCardColor === "yellow"
      ? "border-yellow-400 hover:border-yellow-400"
      : "border-danger-coral hover:border-danger-coral"

  const topAnalyticsHoverClass =
    aqiCardColor === "green"
      ? "hover:text-safety-green"
      : aqiCardColor === "yellow"
      ? "hover:text-yellow-600"
      : "hover:text-danger-coral"

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-manrope">AQI Dashboard</h1>
          <p className="text-sm text-muted-foreground font-space-grotesk mt-1">
            100% Real-time Air Quality Monitoring
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select 
            value={selectedDevice} 
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-background font-manrope outline-none min-w-[200px]"
          >
            {devicesLoading ? (
              <option>Loading devices...</option>
            ) : devices.length > 0 ? (
              devices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.name || device.id} ({device.id})
                </option>
              ))
            ) : (
              <option value="Esp_353">No devices detected</option>
            )}
          </select>
          
          <Badge 
            variant="outline" 
            className={`${
              isConnected 
                ? 'border-green-500 text-green-700 bg-green-50' 
                : 'border-red-500 text-red-700 bg-red-50'
            }`}
          >
            {isConnected ? 'Online' : 'Offline'}
          </Badge>

          <Link
            href="/analytics"
            className={`flex items-center text-sm font-medium transition-colors ${topAnalyticsHoverClass}`}
          >
            <BarChart2 className="h-4 w-4 mr-1" />
            Analytics
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      {!isConnected || !currentReading ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/10 rounded-lg border border-dashed min-h-[400px]">
          <div className="flex items-center space-x-2 text-gray-500 mb-2">
            <span className="text-2xl">⚪</span>
            <span className="font-semibold text-xl">No ESP device connected</span>
          </div>
          <p className="text-sm text-muted-foreground animate-pulse font-space-grotesk">
            Waiting for sensor data...
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Weather Info Badge */}
          <div className="flex justify-center">
            <div className="flex items-center gap-4 px-4 py-2 rounded-lg bg-muted/40 border border-muted-foreground/10 text-sm text-muted-foreground shadow-sm">
              <Sun className="h-5 w-5 text-yellow-400" />
              <span>{currentReading.temperature}°C</span>
              <Droplets className="h-5 w-5 text-blue-400 ml-2" />
              <span>{currentReading.humidity}%</span>
            </div>
          </div>

          {/* Main Visuals & Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className={`p-6 hover:shadow-lg transition-all duration-300 ${aqiCardBorderClass}`}>
              <h2 className="text-xl font-semibold font-manrope mb-4">Air Quality Index</h2>
              <AQIVisualization value={currentReading.aqi} previousValue={currentReading.aqi} />
              <div className="mt-4 text-sm font-space-grotesk text-muted-foreground text-center">
                Last reading: {new Date(currentReading.timestamp).toLocaleTimeString()}
              </div>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <GasCard
                title="CO₂ Levels"
                value={currentReading.co2}
                unit="ppm"
                status="CO₂ concentration"
                data={[]}
                threshold={1000}
              />
              <GasCard
                title="PM2.5 Levels"
                value={currentReading.pm25}
                unit="μg/m³"
                status="PM2.5 concentration"
                data={[]}
                threshold={35}
              />
              <GasCard
                title="VOC Levels"
                value={currentReading.voc}
                unit="mg/m³"
                status="VOC concentration"
                data={[]}
                threshold={0.5}
              />
              <GasCard
                title="CO Levels"
                value={currentReading.co}
                unit="ppm"
                status="CO concentration"
                data={[]}
                threshold={9}
              />
            </div>
          </div>

          {/* Historical Trends */}
          <PollutantTrendsCard
            historicalData={Array.isArray(historicalRaw) ? historicalRaw : []}
          />

          {/* Device Location Overview */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold font-manrope">Device Information</h2>
                <p className="text-sm text-muted-foreground font-space-grotesk mt-1">
                  Active device ID: <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">{selectedDevice}</code>
                </p>
              </div>
              <div className="text-sm font-space-grotesk text-muted-foreground">
                <span className="font-medium text-foreground block">Sensor Location</span>
                {currentReading.location || 'Unknown'}
              </div>
              <div className="text-sm font-space-grotesk text-muted-foreground">
                <span className="font-medium text-foreground block">Last Synced</span>
                {new Date(currentReading.timestamp).toLocaleString()}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}