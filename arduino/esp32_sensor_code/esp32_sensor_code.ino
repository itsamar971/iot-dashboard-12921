/*
 * ESP32 IoT Air Quality Monitor
 * Sensors: MQ135 (Air Quality), MQ3 (Alcohol/Gas), DHT11 (Temperature & Humidity)
 * Backend: Firebase Realtime Database
 * 
 * Pin Configuration:
 * MQ135 - Analog Pin A0 (GPIO 36)
 * MQ3   - Analog Pin A3 (GPIO 39)
 * DHT11 - Digital Pin D4 (GPIO 4)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <time.h>

// WiFi Configuration
const char* ssid = "353";
const char* password = "Dipenn353";

// Firebase Configuration
const char* firebaseHost = "https://air-quality-dashboard-32540-default-rtdb.asia-southeast1.firebasedatabase.app";
const char* firebaseAuth = ""; // Leave empty for public write

// Your Dashboard API Endpoint
const char* dashboardAPI = "https://iotaqi353.netlify.app/api/sensors";

// Sensor Pin Definitions
#define MQ135_PIN 34    // Analog pin for MQ135 (Air Quality) - D34
#define MQ3_PIN 39      // Analog pin for MQ3 (Alcohol/Gas)
#define DHT_PIN 4       // Digital pin for DHT11
#define DHT_TYPE DHT11

// Initialize DHT sensor
DHT dht(DHT_PIN, DHT_TYPE);

// Device Configuration
const String DEVICE_ID = "esp32_001";
const String DEVICE_LOCATION = "Living Room";

// Calibration values (adjust based on your environment)
const float MQ135_CLEAN_AIR_RATIO = 3.6;  // Clean air ratio for MQ135
const float MQ3_CLEAN_AIR_RATIO = 60.0;   // Clean air ratio for MQ3

// Timing
unsigned long lastReading = 0;
const unsigned long READING_INTERVAL = 30000; // 30 seconds

// Data structure
struct SensorData {
  float temperature;
  float humidity;
  int aqi;
  int co2;
  float pm25;
  float voc;
  int co;
  int no2;
  int alcoholLevel;
  String timestamp;
};

void setup() {
  Serial.begin(115200);
  
  // Initialize sensors
  dht.begin();
  
  // Initialize analog pins
  pinMode(MQ135_PIN, INPUT);
  pinMode(MQ3_PIN, INPUT);
  
  // Connect to WiFi
  connectToWiFi();
  
  // Initialize time
  configTime(0, 0, "pool.ntp.org");
  
  // Warm up sensors (important for MQ sensors)
  Serial.println("Warming up sensors for 2 minutes...");
  delay(120000); // 2 minutes warm-up
  
  Serial.println("ESP32 IoT Air Quality Monitor Ready!");
  Serial.println("Device ID: " + DEVICE_ID);
  Serial.println("Location: " + DEVICE_LOCATION);
}

void loop() {
  if (millis() - lastReading >= READING_INTERVAL) {
    if (WiFi.status() == WL_CONNECTED) {
      SensorData data = readSensors();
      
      // Print readings to Serial Monitor
      printSensorData(data);
      
      // Send to Firebase
      sendToFirebase(data);
      
      // Send to Dashboard API
      sendToDashboard(data);
      
      lastReading = millis();
    } else {
      Serial.println("WiFi disconnected. Reconnecting...");
      connectToWiFi();
    }
  }
  
  delay(1000); // Small delay to prevent watchdog issues
}

void connectToWiFi() {
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(1000);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("WiFi connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
    Serial.print("Signal strength: ");
    Serial.println(WiFi.RSSI());
  } else {
    Serial.println();
    Serial.println("Failed to connect to WiFi. Restarting...");
    ESP.restart();
  }
}

SensorData readSensors() {
  SensorData data;
  
  // Read DHT11 (Temperature & Humidity)
  data.temperature = dht.readTemperature();
  data.humidity = dht.readHumidity();
  
  // Check if DHT readings are valid
  if (isnan(data.temperature) || isnan(data.humidity)) {
    Serial.println("Failed to read from DHT sensor!");
    data.temperature = 0;
    data.humidity = 0;
  }
  
  // Read MQ135 (Air Quality)
  int mq135Raw = analogRead(MQ135_PIN);
  float mq135Voltage = (mq135Raw / 4095.0) * 3.3;
  float mq135Ratio = mq135Voltage / (3.3 - mq135Voltage);
  
  // Calculate AQI (simplified calculation)
  data.aqi = calculateAQI(mq135Ratio);
  
  // Calculate CO2 from MQ135 (approximate)
  data.co2 = calculateCO2(mq135Ratio);
  
  // Calculate other pollutants (estimated from MQ135)
  data.pm25 = calculatePM25(mq135Ratio);
  data.voc = calculateVOC(mq135Ratio);
  data.co = calculateCO(mq135Ratio);
  data.no2 = calculateNO2(mq135Ratio);
  
  // Read MQ3 (Alcohol/Gas level)
  int mq3Raw = analogRead(MQ3_PIN);
  data.alcoholLevel = map(mq3Raw, 0, 4095, 0, 1000);
  
  // Get timestamp
  data.timestamp = getTimestamp();
  
  return data;
}

int calculateAQI(float ratio) {
  // Simplified AQI calculation based on MQ135 ratio
  // This is an approximation - for accurate AQI, you need calibrated sensors
  
  if (ratio < 1.0) return random(0, 50);      // Good (0-50)
  else if (ratio < 2.0) return random(51, 100);   // Moderate (51-100)
  else if (ratio < 3.0) return random(101, 150);  // Unhealthy for Sensitive (101-150)
  else if (ratio < 4.0) return random(151, 200);  // Unhealthy (151-200)
  else if (ratio < 5.0) return random(201, 300);  // Very Unhealthy (201-300)
  else return random(301, 500);                    // Hazardous (301-500)
}

int calculateCO2(float ratio) {
  // Convert MQ135 ratio to approximate CO2 ppm
  // Formula based on MQ135 datasheet approximation
  float ppm = 116.6020682 * pow(ratio, -2.769034857);
  return constrain((int)(ppm * 10), 400, 5000); // Typical indoor range
}

float calculatePM25(float ratio) {
  // Estimate PM2.5 from air quality ratio
  float pm25 = ratio * 15.0; // Rough approximation
  return constrain(pm25, 0, 500);
}

float calculateVOC(float ratio) {
  // Estimate VOC from MQ135 reading
  float voc = ratio * 0.1;
  return constrain(voc, 0, 2.0);
}

int calculateCO(float ratio) {
  // Estimate CO from air quality reading
  int co = (int)(ratio * 5);
  return constrain(co, 0, 50);
}

int calculateNO2(float ratio) {
  // Estimate NO2 from air quality reading
  int no2 = (int)(ratio * 20);
  return constrain(no2, 0, 200);
}

String getTimestamp() {
  time_t now;
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    return "1970-01-01T00:00:00Z";
  }
  
  char timeString[30];
  strftime(timeString, sizeof(timeString), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
  return String(timeString);
}

void sendToFirebase(SensorData data) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    // Firebase path: /sensors/DEVICE_ID/timestamp
    String firebasePath = String(firebaseHost) + "/sensors/" + DEVICE_ID + "/" + 
                         String(millis()) + ".json";
    
    if (strlen(firebaseAuth) > 0) {
      firebasePath += "?auth=" + String(firebaseAuth);
    }
    
    http.begin(firebasePath);
    http.addHeader("Content-Type", "application/json");
    
    // Create JSON payload
    StaticJsonDocument<512> doc;
    doc["id"] = "sensor_" + String(millis());
    doc["deviceId"] = DEVICE_ID;
    doc["timestamp"] = data.timestamp;
    doc["aqi"] = data.aqi;
    doc["co2"] = data.co2;
    doc["pm25"] = data.pm25;
    doc["voc"] = data.voc;
    doc["co"] = data.co;
    doc["no2"] = data.no2;
    doc["temperature"] = data.temperature;
    doc["humidity"] = data.humidity;
    doc["location"] = DEVICE_LOCATION;
    doc["alcoholLevel"] = data.alcoholLevel;
    doc["signalStrength"] = WiFi.RSSI();
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    int httpResponseCode = http.PUT(jsonString);
    
    if (httpResponseCode > 0) {
      Serial.println("✓ Data sent to Firebase successfully");
    } else {
      Serial.println("✗ Error sending to Firebase: " + String(httpResponseCode));
    }
    
    http.end();
  }
}

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
    
    String jsonString;
    serializeJson(jsonString, jsonString);
    
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode > 0) {
      Serial.println("✓ Data sent to Dashboard API successfully");
    } else {
      Serial.println("✗ Error sending to Dashboard: " + String(httpResponseCode));
    }
    
    http.end();
  }
}

void printSensorData(SensorData data) {
  Serial.println("\n=== Sensor Readings ===");
  Serial.println("Timestamp: " + data.timestamp);
  Serial.println("Temperature: " + String(data.temperature) + "°C");
  Serial.println("Humidity: " + String(data.humidity) + "%");
  Serial.println("AQI: " + String(data.aqi));
  Serial.println("CO2: " + String(data.co2) + " ppm");
  Serial.println("PM2.5: " + String(data.pm25) + " μg/m³");
  Serial.println("VOC: " + String(data.voc) + " mg/m³");
  Serial.println("CO: " + String(data.co) + " ppm");
  Serial.println("NO2: " + String(data.no2) + " ppb");
  Serial.println("Alcohol Level: " + String(data.alcoholLevel));
  Serial.println("WiFi Signal: " + String(WiFi.RSSI()) + " dBm");
  Serial.println("========================\n");
}