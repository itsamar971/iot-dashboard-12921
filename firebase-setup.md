# Firebase Setup Guide for IoT Dashboard

## 🔥 Firebase Configuration

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project" or select your existing project
3. Enable **Realtime Database**:
   - Go to "Realtime Database" in the left sidebar
   - Click "Create Database"
   - Choose "Start in test mode" (we'll secure it later)
   - Select your preferred location

### 2. Get Firebase Configuration

In your Firebase project:

1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click "Web app" icon (`</>`)
4. Register your app with a name like "IoT Dashboard"
5. Copy the configuration object

### 3. Update Your Environment Variables

Create/update your `.env.local` file:

```env
# Firebase Configuration
FIREBASE_API_KEY=AIzaSyC...your_api_key
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com/

# Database Type
DATABASE_TYPE=firebase

# Your deployed dashboard URL (update after deployment)
NEXT_PUBLIC_DASHBOARD_URL=https://your-app.netlify.app
```

### 4. Firebase Database Rules

Set up your database rules for security:

```json
{
  "rules": {
    "sensors": {
      ".read": true,
      ".write": true,
      "$deviceId": {
        ".validate": "newData.hasChildren(['timestamp', 'aqi', 'temperature', 'humidity'])"
      }
    },
    "devices": {
      ".read": true,
      ".write": true
    }
  }
}
```

**For Production (More Secure):**
```json
{
  "rules": {
    "sensors": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$deviceId": {
        ".validate": "newData.hasChildren(['timestamp', 'aqi', 'temperature', 'humidity']) && newData.child('deviceId').val() == $deviceId"
      }
    },
    "devices": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

### 5. Firebase Database Structure

Your data will be organized like this:

```
your-project-id-default-rtdb/
├── sensors/
│   ├── Esp_353/
│   │   ├── 1641234567890/
│   │   │   ├── id: "sensor_1641234567890"
│   │   │   ├── deviceId: "Esp_353"
│   │   │   ├── timestamp: "2025-01-07T12:00:00Z"
│   │   │   ├── aqi: 75
│   │   │   ├── co2: 650
│   │   │   ├── pm25: 15.5
│   │   │   ├── temperature: 24.5
│   │   │   ├── humidity: 45
│   │   │   └── location: "Living Room"
│   │   └── 1641234597890/
│   │       └── ... (next reading)
│   └── esp32_002/
│       └── ... (other devices)
└── devices/
    ├── Esp_353/
    │   ├── name: "Living Room Monitor"
    │   ├── type: "ESP32-WROOM-32"
    │   ├── location: "Living Room"
    │   ├── status: "online"
    │   └── lastSeen: "2025-01-07T12:00:00Z"
    └── esp32_002/
        └── ... (other device info)
```

### 6. Test Firebase Connection

Test your Firebase setup:

1. Start your Next.js development server:
   ```bash
   npm run dev
   ```

2. Visit: `http://localhost:3000/api/sensors`

3. You should see a response like:
   ```json
   {
     "success": true,
     "data": {
       "id": "sensor_1641234567890",
       "timestamp": "2025-01-07T12:00:00Z",
       "aqi": 75,
       ...
     }
   }
   ```

### 7. ESP32 Configuration

Update your ESP32 code with your Firebase details:

```cpp
// In your Arduino code
const char* firebaseHost = "https://your-project-id-default-rtdb.firebaseio.com";
const char* firebaseAuth = ""; // Leave empty for public write, or add your database secret

// Your dashboard API endpoint (after deployment)
const char* dashboardAPI = "https://your-app.netlify.app/api/sensors";
```

### 8. Optional: Firebase Authentication

For enhanced security, set up Firebase Authentication:

1. Go to **Authentication** in Firebase Console
2. Click "Get started"
3. Enable "Anonymous" authentication for devices
4. Update your ESP32 code to authenticate before writing

### 9. Monitoring and Analytics

Enable Firebase Analytics:
1. Go to **Analytics** in Firebase Console
2. Enable Google Analytics
3. Monitor your data usage and performance

### 🔧 Troubleshooting

**Common Issues:**

1. **Permission Denied**: Check your database rules
2. **CORS Errors**: Ensure your domain is whitelisted
3. **Connection Failed**: Verify your Firebase URL and API key
4. **Data Not Appearing**: Check the browser console for errors

**Debug Steps:**

1. Check Firebase Console for incoming data
2. Verify environment variables are loaded
3. Test API endpoints manually
4. Check browser network tab for failed requests

### 📊 Data Retention

Firebase Realtime Database doesn't automatically delete old data. Consider:

1. **Manual Cleanup**: Periodically delete old sensor readings
2. **Cloud Functions**: Set up automatic cleanup
3. **Data Export**: Regular backups to Cloud Storage

Example cleanup function:
```javascript
// Firebase Cloud Function
exports.cleanupOldData = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days ago
  const oldDataQuery = admin.database().ref('sensors').orderByChild('timestamp').endAt(cutoff);
  const snapshot = await oldDataQuery.once('value');
  const updates = {};
  snapshot.forEach(child => {
    updates[child.key] = null;
  });
  return admin.database().ref('sensors').update(updates);
});
```

Your Firebase setup is now ready for real-time IoT data streaming! 🚀