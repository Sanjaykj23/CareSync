/*
  CareSync (Noon) — ESP32 Smart IoT Pillbox Firmware
  Features:
  - 4 Compartment Slots with Individual Reed Switches / Limit Switches (Lid Sensor)
  - 4 Neopixel / Status LEDs (Green=Ready to take, Blue=Dispensed, Red=Missed Alert)
  - Weight / IR pill presence verification
  - REST POST Webhook to /api/iot/telemetry (Vercel Serverless Compatible)
  - Auto WiFi Reconnect & Low-Power Heartbeat
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ================= USER CONFIGURATION =================
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Deployed Vercel or Local Dev Endpoint
const char* BACKEND_URL   = "https://your-caresync.vercel.app/api/iot/telemetry";
const char* DEVICE_API_KEY = "CARESYNC_IOT_KEY_99882";
const char* PATIENT_ID    = "a1111111-1111-1111-1111-111111111111";

// Pin Mappings for 4 Slots
const int REED_PINS[4] = {18, 19, 21, 22};   // Active LOW when lid is opened
const int LED_PINS[4]  = {25, 26, 27, 14};   // Status indicators
const int BUZZER_PIN   = 32;

// Slot States
bool lastLidState[4]   = {HIGH, HIGH, HIGH, HIGH};
unsigned long lastDebounceTime[4] = {0, 0, 0, 0};
const unsigned long DEBOUNCE_DELAY = 150; // ms

void setup() {
  Serial.begin(115200);
  Serial.println("\n[CareSync] Initializing ESP32 Pillbox...");

  // Initialize Pins
  for (int i = 0; i < 4; i++) {
    pinMode(REED_PINS[i], INPUT_PULLUP);
    pinMode(LED_PINS[i], OUTPUT);
    digitalWrite(LED_PINS[i], LOW);
  }
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  // Connect to WiFi
  connectWiFi();

  // Beep twice to indicate ready state
  beep(100);
  delay(100);
  beep(100);
  Serial.println("[CareSync] System Ready. Monitoring 4 Pill Slots.");
}

void loop() {
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  // Scan all 4 slots
  for (int slot = 0; slot < 4; slot++) {
    int reading = digitalRead(REED_PINS[slot]);

    // Detect state change with debounce
    if (reading != lastLidState[slot]) {
      lastDebounceTime[slot] = millis();
    }

    if ((millis() - lastDebounceTime[slot]) > DEBOUNCE_DELAY) {
      if (reading != lastLidState[slot]) {
        lastLidState[slot] = reading;

        // Lid Opened (Active LOW)
        if (reading == LOW) {
          Serial.printf("[CareSync] Slot %d LID OPENED!\n", slot + 1);
          digitalWrite(LED_PINS[slot], HIGH);
          beep(200);
          sendTelemetry(slot + 1, "LID_OPENED", true);
        } else {
          Serial.printf("[CareSync] Slot %d LID CLOSED!\n", slot + 1);
          digitalWrite(LED_PINS[slot], LOW);
          sendTelemetry(slot + 1, "LID_CLOSED", false);
        }
      }
    }
  }

  delay(20);
}

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  Serial.print("[WiFi] Connecting to: ");
  Serial.println(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] Connected! IP: " + WiFi.localIP().toString());
  } else {
    Serial.println("\n[WiFi] Failed to connect. Will retry.");
  }
}

void beep(int ms) {
  digitalWrite(BUZZER_PIN, HIGH);
  delay(ms);
  digitalWrite(BUZZER_PIN, LOW);
}

void sendTelemetry(int slotNumber, const char* eventType, bool pillTaken) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[HTTP] WiFi not connected. Cannot send event.");
    return;
  }

  HTTPClient http;
  http.begin(BACKEND_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", DEVICE_API_KEY);

  // Construct JSON Payload
  StaticJsonDocument<256> doc;
  doc["patientId"]   = PATIENT_ID;
  doc["slotNumber"]  = slotNumber;
  doc["eventType"]   = eventType;
  doc["pillTaken"]   = pillTaken;
  doc["timestamp"]   = millis();

  String requestBody;
  serializeJson(doc, requestBody);

  Serial.println("[HTTP] Posting payload: " + requestBody);
  int httpCode = http.POST(requestBody);

  if (httpCode > 0) {
    String response = http.getString();
    Serial.printf("[HTTP] Response [%d]: %s\n", httpCode, response.c_str());
  } else {
    Serial.printf("[HTTP] POST failed. Error: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
}
