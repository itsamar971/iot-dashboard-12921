# MQ3 Alcohol Sensor Integration Plan

This document outlines the current status of the MQ3 (Alcohol/Gas) sensor integration in the IoT AQI Monitoring System and details the steps required to fully map and display alcohol levels in the Next.js web application and dashboard.

---

## 1. Current Integration Status

| Component | Status | Details |
| :--- | :---: | :--- |
| **ESP32 Firmware** | 🟢 Partial | MQ3 is wired to **GPIO 39 (Analog Pin A3)**. Reads and maps values to `0-1000`. Uploads to Firebase Realtime Database direct payload, but **omits** it from the Dashboard API payload. |
| **Firebase Schema** | 🟡 Partial | Stores `alcoholLevel` when data is pushed directly from the ESP32 to Firebase, but lacks schema definitions/rules for dashboard updates. |
| **Next.js Backend API** | 🔴 Missing | `app/api/sensors/route.ts` does not parse or save `alcoholLevel` in database operations. |
| **Database Adaptor** | 🔴 Missing | `lib/database.ts` interfaces and adapters do not define or handle `alcoholLevel`. |
| **Frontend Hooks** | 🔴 Missing | `hooks/useSensorData.ts` types do not declare `alcoholLevel`. |
| **UI Dashboard** | 🔴 Missing | No components are configured to show or visualize alcohol sensor readings. |

---

## 2. Implementation Steps

To fully integrate the MQ3 sensor into the web app, follow these code updates across your workspace.

### Step 2.1: Update ESP32 Firmware (`sendToDashboard`)
Modify `sendToDashboard()` in [esp32_sensor_code.ino](file:///c:/Users/itsam/Downloads/IoT-AQI-Mon-Sys-main/IoT-AQI-Mon-Sys-main/arduino/esp32_sensor_code/esp32_sensor_code.ino) to send `alcoholLevel` along with the other sensor readings.

```diff
 void sendToDashboard(SensorData data) {
   if (WiFi.status() == WL_CONNECTED) {
     HTTPClient http;
     http.begin(dashboardAPI);
     http.addHeader("Content-Type", "application/json");
     
     // Create JSON payload for dashboard
     StaticJsonDocument<512> doc;
     doc["aqi"] = data.aqi;
     doc["co2"] = data.co2;
     doc["pm25"] = data.pm25;
     doc["voc"] = data.voc;
     doc["co"] = data.co;
     doc["no2"] = data.no2;
     doc["temperature"] = data.temperature;
     doc["humidity"] = data.humidity;
     doc["location"] = DEVICE_LOCATION;
     doc["deviceId"] = DEVICE_ID;
+    doc["alcoholLevel"] = data.alcoholLevel;
     
     String jsonString;
     serializeJson(doc, jsonString);
```

### Step 2.2: Add Field to Database Interface & Adapters
Modify [database.ts](file:///c:/Users/itsam/Downloads/IoT-AQI-Mon-Sys-main/IoT-AQI-Mon-Sys-main/lib/database.ts) to define and map the new field.

1. **Update `SensorData` Interface:**
   ```diff
    export interface SensorData {
      id: string;
      deviceId: string;
      timestamp: Date;
      aqi: number;
      co2: number;
      pm25: number;
      voc: number;
      co: number;
      no2: number;
      temperature: number;
      humidity: number;
      location: string;
+     alcoholLevel?: number;
    }
   ```

2. **Update ThingSpeakAdapter (Optional - if used):**
   Include `field9` or custom mapping if your ThingSpeak channel supports it.

### Step 2.3: Support Field in Next.js Server API
Modify the POST endpoint in [route.ts](file:///c:/Users/itsam/Downloads/IoT-AQI-Mon-Sys-main/IoT-AQI-Mon-Sys-main/app/api/sensors/route.ts) to parse and save `alcoholLevel` to the database.

```diff
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
+      alcoholLevel: Number(sensorData.alcoholLevel) || 0,
       location: sensorData.location || `${sensorData.deviceId.replace('Esp_', 'ESP32_')} Location`
     };
```

### Step 2.4: Update Frontend React Hooks
Modify [useSensorData.ts](file:///c:/Users/itsam/Downloads/IoT-AQI-Mon-Sys-main/IoT-AQI-Mon-Sys-main/hooks/useSensorData.ts) to ensure type checking passes for the new field.

```diff
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
+  alcoholLevel?: number;
   location: string;
   timestamp: string;
 }
```

### Step 2.5: Build/Update a UI Component
Create a UI card in the dashboard (e.g., in `components/gas-card.tsx` or a new component) to display the alcohol level.

* **Safe/Threshold levels reference for MQ3:**
  * `< 100`: Clean/Normal (No Alcohol detected)
  * `100 - 400`: Moderate/Alert (Low levels or ambient fumes)
  * `> 400`: High/Danger (High concentration detected)
