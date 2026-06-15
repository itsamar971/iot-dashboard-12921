"use client";

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { useSensorData, useDevices } from "@/hooks/useSensorData";
import { getAQIColor, getAQILabel } from "@/lib/utils";
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Activity, 
  Thermometer, 
  Droplets,
  Wind,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function LiveDashboard() {
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // Fetch devices
  const { devices, loading: devicesLoading, error: devicesError } = useDevices();

  // Fetch real-time sensor data
  const { 
    data: sensorData, 
    loading: sensorLoading, 
    error: sensorError, 
    lastUpdated, 
    refresh, 
    isConnected 
  } = useSensorData({
    deviceId: selectedDevice,
    refreshInterval,
    autoRefresh: true
  });

  // Fetch historical data for charts
  const { 
    data: historicalData, 
    loading: historicalLoading 
  } = useSensorData({
    deviceId: selectedDevice,
    historical: true,
    autoRefresh: false
  });

  // Set default device when devices are loaded
  useEffect(() => {
    if (devices.length > 0 && !selectedDevice) {
      setSelectedDevice(devices[0].id);
    }
  }, [devices, selectedDevice]);

  // Fallback to a known device if devices fail to load
  useEffect(() => {
    if (devicesError && !selectedDevice) {
      // Use a known device ID from the webview logs
      setSelectedDevice('esp32_001');
    }
  }, [devicesError, selectedDevice]);

  const currentReading = Array.isArray(sensorData) ? sensorData[0] : sensorData;
  const chartData = Array.isArray(historicalData) ? historicalData : [];

  const formatChartData = (data: any[]) => {
    return data.map(reading => ({
      time: new Date(reading.timestamp).toLocaleTimeString(),
      aqi: reading.aqi,
      temperature: reading.temperature,
      humidity: reading.humidity,
      co2: reading.co2,
      pm25: reading.pm25
    }));
  };

  const getDeviceStatus = (device: any) => {
    const lastSeenTime = new Date(device.lastSeen);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSeenTime.getTime()) / (1000 * 60);

    if (diffMinutes < 5) return 'online';
    if (diffMinutes < 30) return 'warning';
    return 'offline';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Live Dashboard</h1>
          <p className="text-muted-foreground">Real-time IoT sensor monitoring</p>
        </div>

        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>

          <button 
            onClick={refresh} 
            disabled={sensorLoading}
            className="flex items-center gap-2 px-3 py-1 border rounded text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${sensorLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Device Selection */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Device Selection
        </h2>
        {devicesLoading ? (
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Loading devices...
          </div>
        ) : devicesError ? (
          <div className="text-red-500">Error loading devices: {devicesError}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((device) => {
              const status = getDeviceStatus(device);
              return (
                <Card 
                  key={device.id} 
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedDevice === device.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedDevice(device.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{device.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      status === 'online' ? 'bg-green-100 text-green-800' : 
                      status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{device.location}</p>
                  <p className="text-xs text-gray-500">
                    Last seen: {new Date(device.lastSeen).toLocaleString()}
                  </p>
                  {device.batteryLevel && (
                    <div className="mt-2 text-xs">
                      Battery: {device.batteryLevel}%
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </Card>

      {/* Current Readings */}
      {currentReading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-2">Air Quality Index</h3>
            <div className="text-2xl font-bold" style={{ color: getAQIColor(currentReading.aqi) }}>
              {currentReading.aqi}
            </div>
            <p className="text-xs text-gray-500">
              {getAQILabel(currentReading.aqi)}
            </p>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
              <Thermometer className="w-4 h-4" />
              Temperature
            </h3>
            <div className="text-2xl font-bold">{currentReading.temperature}°C</div>
            <p className="text-xs text-gray-500">Current temperature</p>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
              <Droplets className="w-4 h-4" />
              Humidity
            </h3>
            <div className="text-2xl font-bold">{currentReading.humidity}%</div>
            <p className="text-xs text-gray-500">Relative humidity</p>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
              <Wind className="w-4 h-4" />
              CO₂ Level
            </h3>
            <div className="text-2xl font-bold">{currentReading.co2}</div>
            <p className="text-xs text-gray-500">ppm</p>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">AQI Trend (Last 24 Hours)</h2>
          <p className="text-sm text-gray-600 mb-4">Real-time air quality index monitoring</p>
          {historicalLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={formatChartData(chartData)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="aqi" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Temperature & Humidity</h2>
          <p className="text-sm text-gray-600 mb-4">Environmental conditions over time</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={formatChartData(chartData)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="temperature" stroke="#ff7300" name="Temperature (°C)" />
              <Line type="monotone" dataKey="humidity" stroke="#00bcd4" name="Humidity (%)" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Last Updated
            </h2>
            <p className="text-lg">
              {lastUpdated ? lastUpdated.toLocaleString() : 'Never'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Auto-refresh every {refreshInterval / 1000} seconds
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              System Status
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Connection:</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isConnected ? 'Active' : 'Disconnected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Data Quality:</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  sensorError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {sensorError ? 'Error' : 'Good'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Devices Online:</span>
                <span>{devices.filter(d => getDeviceStatus(d) === 'online').length}/{devices.length}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Error Display */}
      {(sensorError || devicesError) && (
        <Card className="p-6 border-red-200 bg-red-50">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            Error
          </h2>
          <p className="text-red-600">
            {sensorError || devicesError}
          </p>
        </Card>
      )}
    </div>
  );
}