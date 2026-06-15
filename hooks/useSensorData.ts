"use client";

import { useState, useEffect, useCallback } from 'react';

export interface SensorReading {
  deviceId: string;
  aqi: number;
  temperature: number;
  humidity: number;
  co2: number;
  pm25: number;
  voc: number;
  co: number;
  no2: number;
  location: string;
  timestamp: string;
}

interface UseSensorDataOptions {
  deviceId: string;
  refreshInterval?: number;
  autoRefresh?: boolean;
  historical?: boolean;
  enabled?: boolean;
}

export function useSensorData({ 
  deviceId, 
  refreshInterval = 10000, 
  autoRefresh = true,
  historical = false,
  enabled = true
}: UseSensorDataOptions) {
  const [data, setData] = useState<SensorReading | SensorReading[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    if (!deviceId || !enabled) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const url = `/api/sensors?deviceId=${deviceId}${historical ? '&historical=true' : ''}`;
      
      const response = await fetch(url);

      if (response.status === 404) {
        setData(null);
        setError(null);
        setIsConnected(false);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        setData(result.data);
        setIsConnected(true);
        setLastUpdated(new Date());
        setError(null);
      } else {
        throw new Error(result.error || 'No data received from API');
      }
    } catch (err) {
      console.error('Error fetching sensor data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setIsConnected(false);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [deviceId, historical, enabled]);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh || !enabled) return;

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval, autoRefresh, enabled]);

  return {
    data,
    loading,
    error,
    isConnected,
    lastUpdated,
    refresh
  };
}

// Hook for device management
export function useDevices() {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('/api/devices', {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setDevices(result.data || []);
      } else {
        throw new Error(result.error || 'Failed to fetch devices');
      }
    } catch (err) {
      let errorMessage = 'Unknown error occurred';
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = 'Request timeout - Please check your connection';
        } else if (err.message.includes('fetch')) {
          errorMessage = 'Network error - Please check your connection';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      console.error('Error fetching devices:', err);
      
      // Set empty devices array as fallback
      setDevices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const registerDevice = async (deviceData: any) => {
    try {
      const response = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deviceData)
      });

      const result = await response.json();

      if (result.success) {
        await fetchDevices(); // Refresh device list
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Error registering device:', err);
      throw err;
    }
  };

  const updateDevice = async (deviceId: string, updates: any) => {
    try {
      const response = await fetch('/api/devices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deviceId, ...updates })
      });

      const result = await response.json();

      if (result.success) {
        await fetchDevices(); // Refresh device list
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Error updating device:', err);
      throw err;
    }
  };

  return {
    devices,
    loading,
    error,
    refresh: fetchDevices,
    registerDevice,
    updateDevice
  };
}