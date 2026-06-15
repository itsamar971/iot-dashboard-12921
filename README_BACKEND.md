# IoT Dashboard Backend Integration Guide

## 🚀 Quick Setup

Your IoT dashboard now includes a comprehensive backend system that supports multiple data sources and real-time monitoring.

### 1. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your specific configuration:

```env
# Choose your database type
DATABASE_TYPE=firebase  # or thingspeak, postgresql, mongodb

# Firebase Configuration (recommended for real-time features)
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

# ThingSpeak Configuration (for existing setups)
THINGSPEAK_API_KEY=your_thingspeak_write_api_key
NEXT_PUBLIC_API_URL=https://api.thingspeak.com/channels/YOUR_CHANNEL_ID/fields/1.json
```

### 2. Install Dependencies

The backend uses the existing dependencies. If you need additional database drivers:

```bash
# For PostgreSQL
npm install pg @types/pg

# For MongoDB
npm install mongodb

# Firebase is already included
```

### 3. Start the Development Server

```bash
npm run dev
```

## 📡 API Endpoints

### Sensor Data API

#### GET `/api/sensors`
Fetch current or historical sensor data.

**Query Parameters:**
- `deviceId` (optional): Filter by specific device
- `historical=true`: Get 24-hour historical data
- `count`: Number of readings to return

**Example:**
```bash
curl "http://localhost:3000/api/sensors?deviceId=esp32_001&historical=true"
```

#### POST `/api/sensors`
Submit new sensor data from IoT devices.

**Request Body:**
```json
{
  "aqi": 75,
  "co2": 650,
  "pm25": 15,
  "temperature": 24.5,
  "humidity": 45,
  "voc": 0.25,
  "co": 5,
  "no2": 30,
  "location": "Living Room"
}
```

### Device Management API

#### GET `/api/devices`
List all registered IoT devices.

#### POST `/api/devices`
Register a new IoT device.

**Request Body:**
```json
{
  "id": "esp32_001",
  "name": "Living Room Monitor",
  "type": "ESP32-WROOM-32",
  "location": "Living Room",
  "sensors": ["MQ-135", "MQ-3", "DHT-11"]
}
```

## 🔌 ESP32 Integration

### Arduino Code Example

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "your_wifi_ssid";
const char* password = "your_wifi_password";
const char* serverURL = "http://your-domain.com/api/sensors";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");
}

void sendSensorData(float aqi, float co2, float pm25, float temp, float humidity) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");
    
    StaticJsonDocument<200> doc;
    doc["aqi"] = aqi;
    doc["co2"] = co2;
    doc["pm25"] = pm25;
    doc["temperature"] = temp;
    doc["humidity"] = humidity;
    doc["location"] = "ESP32_Device_001";
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Data sent successfully: " + response);
    } else {
      Serial.println("Error sending data");
    }
    
    http.end();
  }
}

void loop() {
  // Read sensor values
  float aqi = readAQI();
  float co2 = readCO2();
  float pm25 = readPM25();
  float temp = readTemperature();
  float humidity = readHumidity();
  
  // Send data every 30 seconds
  sendSensorData(aqi, co2, pm25, temp, humidity);
  delay(30000);
}
```

## 🗄️ Database Backends

### Firebase Realtime Database (Recommended)

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Realtime Database
3. Set up authentication rules:

```json
{
  "rules": {
    "sensors": {
      ".read": true,
      ".write": true
    }
  }
}
```

### ThingSpeak Integration

1. Create a ThingSpeak channel
2. Configure field mappings:
   - Field 1: AQI
   - Field 2: CO2
   - Field 3: PM2.5
   - Field 4: Temperature
   - Field 5: Humidity
   - Field 6: VOC
   - Field 7: CO
   - Field 8: NO2

### PostgreSQL Setup

```sql
CREATE TABLE sensor_readings (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  aqi INTEGER,
  co2 INTEGER,
  pm25 FLOAT,
  voc FLOAT,
  co INTEGER,
  no2 INTEGER,
  temperature FLOAT,
  humidity INTEGER,
  location VARCHAR(100)
);

CREATE INDEX idx_device_timestamp ON sensor_readings(device_id, timestamp);
```

## 🔄 Real-time Features

### WebSocket Connection

The dashboard supports real-time updates via WebSocket:

```javascript
const ws = new WebSocket('ws://localhost:3000/api/sensors/websocket');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'sensor-data') {
    updateDashboard(data.data);
  }
};
```

### React Hooks

Use the provided hooks for easy data integration:

```tsx
import { useSensorData, useDevices } from '@/hooks/useSensorData';

function MyComponent() {
  const { data, loading, error, isConnected } = useSensorData({
    deviceId: 'esp32_001',
    refreshInterval: 30000,
    autoRefresh: true
  });
  
  const { devices } = useDevices();
  
  return (
    <div>
      {loading ? 'Loading...' : JSON.stringify(data)}
    </div>
  );
}
```

## 🚀 Deployment

### Netlify Deployment

Your existing Netlify configuration will work with the new backend. The API routes are automatically deployed as serverless functions.

### Vercel Deployment

```bash
npm install -g vercel
vercel --prod
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Data Flow

```
[ESP32 Sensors] → [WiFi/MQTT] → [API Endpoints] → [Database] → [React Dashboard]
                                      ↓
                              [WebSocket] → [Real-time Updates]
```

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your API endpoints include proper CORS headers
2. **WebSocket Connection Failed**: Check if your hosting platform supports WebSockets
3. **Database Connection Issues**: Verify your environment variables and network access

### Debug Mode

Enable debug logging:

```env
DEBUG=true
NODE_ENV=development
```

### Health Check

Visit `/api/sensors` to verify your backend is working:

```bash
curl http://localhost:3000/api/sensors
```

## 🔐 Security

### API Authentication

Add authentication to your API routes:

```typescript
// middleware/auth.ts
export function authenticateDevice(request: NextRequest) {
  const token = request.headers.get('Authorization');
  if (!token || token !== process.env.DEVICE_AUTH_TOKEN) {
    throw new Error('Unauthorized');
  }
}
```

### Rate Limiting

Implement rate limiting for API endpoints:

```typescript
// lib/rateLimit.ts
export function rateLimit(windowMs: number, max: number) {
  // Implementation
}
```

## 📈 Monitoring

### Alerts

Set up alerts for:
- Device offline status
- Poor air quality readings
- System errors

### Analytics

Track:
- Data ingestion rates
- Device uptime
- API response times

---

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API endpoint responses
3. Enable debug logging
4. Check device connectivity

Your IoT dashboard now has a robust backend that can scale with your needs!