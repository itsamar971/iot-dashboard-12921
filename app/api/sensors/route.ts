import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const historical = searchParams.get('historical') === 'true';

    console.log('Fetching sensor data for device:', deviceId);

    // Dynamically import to avoid build issues
    const { getDatabase } = await import('../../../lib/database');

    // Get database instance
    const db = await getDatabase();

    if (deviceId) {
      if (historical) {
        try {
          const latestReading = await db.getLatestReading(deviceId);
          if (!latestReading) {
            return NextResponse.json({
              success: false,
              message: "No ESP device connected"
            }, { status: 404 });
          }

          const historicalData = await db.getHistoricalData(deviceId, 24); // Fetch last 24 hours
          return NextResponse.json({
            success: true,
            data: historicalData || [],
            type: 'historical',
            deviceId
          });
        } catch (dbError) {
          console.error('Database query error:', dbError);
          return NextResponse.json({
            success: false,
            error: 'Database query failed',
            message: 'Unable to fetch data from Firebase. Please check Firebase configuration and rules.',
            deviceId
          }, { status: 500 });
        }
      } else {
        try {
          const latestReading = await db.getLatestReading(deviceId);

          if (latestReading) {
            return NextResponse.json({
              success: true,
              data: latestReading,
              type: 'current',
              deviceId
            });
          } else {
            console.log(`No data found for device: ${deviceId}`);
            return NextResponse.json({
              success: false,
              message: "No ESP device connected"
            }, { status: 404 });
          }
        } catch (dbError) {
          console.error('Database query error:', dbError);
          return NextResponse.json({
            success: false,
            error: 'Database query failed',
            message: 'Unable to fetch data from Firebase. Please check Firebase configuration and rules.',
            deviceId
          }, { status: 500 });
        }
      }
    } else {
      // Get data for all devices
      try {
        const allData = await db.getSensorData(undefined, 50);

        if (allData.length > 0) {
          return NextResponse.json({
            success: true,
            data: allData,
            type: 'historical'
          });
        } else {
          console.log('No sensor data found in database');
          return NextResponse.json({
            success: false,
            message: "No ESP device connected"
          }, { status: 404 });
        }
      } catch (dbError) {
        console.error('Database query error:', dbError);
        return NextResponse.json({
          success: false,
          error: 'Database query failed',
          message: 'Unable to fetch data from Firebase. Please check Firebase configuration and rules.',
          data: []
        }, { status: 500 });
      }
    }

  } catch (error) {
    console.error('Error in sensors API:', error);

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred. Please check server logs.'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sensorData = await request.json();

    // Validate required fields
    if (!sensorData.deviceId || sensorData.aqi === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: deviceId, aqi'
      }, { status: 400 });
    }

    // Dynamically import to avoid build issues
    const { getDatabase } = await import('../../../lib/database');

    // Get database instance
    const db = await getDatabase();

    // Save sensor data
    const savedData = {
      id: `${sensorData.deviceId}_${Date.now()}`,
      deviceId: sensorData.deviceId,
      timestamp: new Date(),
      aqi: Number(sensorData.aqi) || 0,
      co2: Number(sensorData.co2) || 0,
      pm25: Number(sensorData.pm25) || 0,
      voc: Number(sensorData.voc) || 0,
      co: Number(sensorData.co) || 0,
      no2: Number(sensorData.no2) || 0,
      temperature: Number(sensorData.temperature) || 0,
      humidity: Number(sensorData.humidity) || 0,
      location: sensorData.location || `${sensorData.deviceId.replace('Esp_', 'ESP32_')} Location`
    };

    await db.saveSensorData(savedData);

    console.log('Sensor data saved successfully:', savedData.id);

    return NextResponse.json({
      success: true,
      message: 'Sensor data saved successfully',
      id: savedData.id
    });

  } catch (error) {
    console.error('Error saving sensor data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to save sensor data',
      message: 'Database write error. Please check Firebase configuration.'
    }, { status: 500 });
  }
}