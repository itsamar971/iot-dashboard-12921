import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Fetching devices from Firebase...');

    // Dynamically import to avoid build issues
    const { getDatabase } = await import('../../../lib/database');

    // Get database instance
    const db = await getDatabase();

    // Get a smaller sample of recent data to find devices
    const recentSensorData = await db.getSensorData(undefined, 50);

    const deviceMap = new Map();
    const devices: any[] = [];

    if (recentSensorData.length > 0) {
      // Group by deviceId and get latest reading for each device
      recentSensorData.forEach(reading => {
        const deviceId = reading.deviceId;
        const readingTime = new Date(reading.timestamp).getTime();

        if (!deviceMap.has(deviceId) || readingTime > deviceMap.get(deviceId).timestamp.getTime()) {
          deviceMap.set(deviceId, reading);
        }
      });

      // Convert to device list with status
      deviceMap.forEach((latestReading, deviceId) => {
        if (latestReading) {
          const now = new Date();
          const lastSeenTime = new Date(latestReading.timestamp);
          const minutesAgo = (now.getTime() - lastSeenTime.getTime()) / (1000 * 60);

          devices.push({
            id: deviceId,
            name: latestReading.location || `${deviceId.replace('Esp_', 'ESP32_')} Sensor`,
            location: latestReading.location || `${deviceId.replace('Esp_', 'ESP32_')} Location`,
            status: minutesAgo <= 10 ? 'online' : 'offline',
            lastSeen: latestReading.timestamp,
            model: 'ESP32-DevKit',
            firmware: 'v1.2.0',
            lastAQI: latestReading.aqi,
            lastTemperature: latestReading.temperature,
            lastHumidity: latestReading.humidity
          });
        }
      });
    }

    console.log(`Returning ${devices.length} devices`);

    return NextResponse.json({
      success: true,
      data: devices.sort((a, b) => a.id.localeCompare(b.id))
    });

  } catch (error) {
    console.error('Error fetching devices:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch devices',
      message: 'Unable to query devices from Firebase database.',
      data: []
    }, { status: 500 });
  }
}