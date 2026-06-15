
import { NextRequest, NextResponse } from 'next/server';

// Configure for dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Mock data generator for real-time simulation
function generateRealtimeData() {
  const now = new Date().toISOString();
  const baseAQI = 50 + Math.random() * 100;
  const aqi = Math.round(baseAQI);

  return {
    id: `sensor_${Date.now()}`,
    timestamp: now,
    aqi,
    co2: Math.round(400 + Math.random() * 800),
    pm25: Math.round(5 + Math.random() * 50),
    voc: Math.round((0.1 + Math.random() * 0.8) * 100) / 100,
    co: Math.round(2 + Math.random() * 15),
    no2: Math.round(10 + Math.random() * 100),
    temperature: Math.round((20 + Math.random() * 15) * 10) / 10,
    humidity: Math.round(30 + Math.random() * 50),
    location: "ESP32_Device_001"
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get('deviceId');

  // For now, return mock real-time data as JSON
  // In production, this would connect to your Firebase Realtime Database
  try {
    const data = generateRealtimeData();
    
    return NextResponse.json({
      success: true,
      data,
      type: 'realtime',
      source: 'mock',
      deviceId: deviceId || 'esp32_001'
    });

  } catch (error) {
    console.error('WebSocket endpoint error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get real-time data' },
      { status: 500 }
    );
  }
}
