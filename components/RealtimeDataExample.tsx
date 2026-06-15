"use client";

import React, { useState, useEffect } from "react";
import { useSensorData } from "../hooks/useSensorData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAQIColor, getAQILabel } from "@/lib/utils";
import { 
  Activity, 
  Thermometer, 
  Droplets, 
  Wind, 
  Wifi, 
  WifiOff,
  RefreshCw,
  Clock,
  MapPin
} from "lucide-react";

interface RealtimeDataProps {
  deviceId?: string;
  refreshInterval?: number;
}

export default function RealtimeDataExample({ 
  deviceId = "Esp_353", 
  refreshInterval = 120000 
}: RealtimeDataProps) {
  const { data: sensorData, loading, error, isConnected, lastUpdated, refresh } = useSensorData({
    deviceId,
    refreshInterval,
    autoRefresh: true
  });

  const [timeAgo, setTimeAgo] = useState<string>("");

  // Update time ago display
  useEffect(() => {
    if (!lastUpdated) return;

    const updateTimeAgo = () => {
      const now = new Date();
      const diff = now.getTime() - lastUpdated.getTime();
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);

      if (minutes > 0) {
        setTimeAgo(`${minutes}m ago`);
      } else {
        setTimeAgo(`${seconds}s ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  if (!isConnected || !sensorData) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/10 rounded-lg border border-dashed min-h-[300px]">
        <div className="flex items-center space-x-2 text-gray-500 mb-2">
          <span className="text-xl">⚪</span>
          <span className="font-semibold text-lg">No ESP device connected</span>
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">
          Waiting for sensor data...
        </p>
      </div>
    );
  }

  // Handle both single reading and array of readings
  const currentReading = Array.isArray(sensorData) ? sensorData[0] : sensorData;
  const aqiData = getAQILabel(currentReading.aqi);

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
        <div className="flex items-center space-x-3">
          {isConnected ? (
            <div className="flex items-center space-x-2">
              <Wifi className="w-5 h-5 text-green-500" />
              <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                Connected
              </Badge>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <WifiOff className="w-5 h-5 text-red-500" />
              <Badge variant="destructive">
                Disconnected
              </Badge>
            </div>
          )}
          <span className="font-medium text-sm text-muted-foreground">
            Device: {deviceId === 'kitchen_sensor_demo' ? 'Smart Kitchen Monitor' : deviceId}
          </span>
        </div>

        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Updated {timeAgo}</span>
        </div>
      </div>

      {/* Main AQI Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className={`p-6 text-center ${
          getAQIColor(currentReading.aqi) === 'green' 
            ? 'bg-green-500 border-green-600' 
            : getAQIColor(currentReading.aqi) === 'yellow' 
            ? 'bg-yellow-500 border-yellow-600' 
            : 'bg-red-500 border-red-600'
        } text-white`}>
            <div className="space-y-2">
              <Activity className="w-8 h-8 mx-auto" />
              <div className="text-4xl font-bold">{currentReading.aqi}</div>
              <div className="text-lg font-medium">Air Quality Index</div>
              <div className="text-sm opacity-90">{aqiData.label}</div>
            </div>
          </Card>
        </div>

        {/* Environmental Metrics */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-orange-100">
                <Thermometer className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{currentReading.temperature}°C</div>
                <div className="text-sm text-muted-foreground">Temperature</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-blue-100">
                <Droplets className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{currentReading.humidity}%</div>
                <div className="text-sm text-muted-foreground">Humidity</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-purple-100">
                <Wind className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{currentReading.co2}</div>
                <div className="text-sm text-muted-foreground">CO2 (ppm)</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-red-100">
                <Activity className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{currentReading.pm25}</div>
                <div className="text-sm text-muted-foreground">PM2.5 (μg/m³)</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Detailed Pollutant Readings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Wind className="w-5 h-5" />
          Pollutant Levels
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center space-y-1">
            <div className="text-xl font-bold text-foreground">{currentReading.voc}</div>
            <div className="text-sm text-muted-foreground">VOC (mg/m³)</div>
            <div className="w-full bg-muted h-2 rounded-full">
              <div 
                className="bg-purple-500 h-2 rounded-full" 
                style={{ width: `${Math.min((currentReading.voc / 1.0) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center space-y-1">
            <div className="text-xl font-bold text-foreground">{currentReading.co}</div>
            <div className="text-sm text-muted-foreground">CO (ppm)</div>
            <div className="w-full bg-muted h-2 rounded-full">
              <div 
                className="bg-orange-500 h-2 rounded-full" 
                style={{ width: `${Math.min((currentReading.co / 15) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center space-y-1">
            <div className="text-xl font-bold text-foreground">{currentReading.no2}</div>
            <div className="text-sm text-muted-foreground">NO2 (ppb)</div>
            <div className="w-full bg-muted h-2 rounded-full">
              <div 
                className="bg-red-500 h-2 rounded-full" 
                style={{ width: `${Math.min((currentReading.no2 / 200) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center space-y-1">
            <div className="text-xl font-bold text-foreground">{currentReading.aqi}</div>
            <div className="text-sm text-muted-foreground">AQI Score</div>
            <div className="w-full bg-muted h-2 rounded-full">
              <div 
                className={`h-2 rounded-full ${
                  getAQIColor(currentReading.aqi) === 'green' 
                    ? 'bg-green-500' 
                    : getAQIColor(currentReading.aqi) === 'yellow' 
                    ? 'bg-yellow-500' 
                    : 'bg-red-500'
                }`}
                style={{ width: `${Math.min((currentReading.aqi / 300) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </Card>

      {/* Location and Timestamp */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{currentReading.location}</div>
              <div className="text-sm text-muted-foreground">Sensor Location</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium">Last Reading</div>
            <div className="text-sm text-muted-foreground">
              {new Date(currentReading.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}