#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include "ThingSpeak.h"

// ================= OLED ==================
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET    -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// ================= MQ SENSOR PINS ==================
#define MQ5_PIN 32     // MQ-5 (LPG)
#define MQ3_PIN 33     // MQ-3 (Alcohol)
#define MQ2_PIN 35     // MQ-2 (Smoke)

// ================= DHT22 ==================
#define DHTPIN 25
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// ================= MQ Calibration ==================
float R0_MQ2 = 10.0;   // Change after calibration
float R0_MQ3 = 10.0;
float R0_MQ5 = 10.0;

float RL_VALUE = 10.0;  // Load resistor kΩ for MQ module

// MQ PPM FUNCTION
float MQ_GetPPM(int adc, float R0, float a, float b) {
  if (adc == 0) adc = 1;
  float RS = RL_VALUE * ( (4095.0 / adc) - 1.0 );
  float ratio = RS / R0;
  float ppm = a * pow(ratio, b);
  return ppm;
}

// ================= WiFi + ThingSpeak ==================
#define SECRET_SSID "YOUR_WIFI_SSID"          // redacted for public portfolio
#define SECRET_PASS "YOUR_WIFI_PASSWORD"      // redacted for public portfolio

WiFiClient client;
unsigned long myChannelNumber = 2773429;
const char *myWriteAPIKey = "YOUR_THINGSPEAK_WRITE_KEY";  // redacted for public portfolio


// ================= SETUP ==================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n===== ESP32 SENSOR SYSTEM BOOTING =====");

  // Init I2C (SDA=21, SCL=22)
  Serial.println("[I2C] Initializing I2C on SDA=21, SCL=22...");
  Wire.begin(27, 26);

  // Init OLED
  Serial.print("[OLED] Initializing OLED... ");
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("FAILED ❌");
    while (true);
  }
  Serial.println("OK ✔");

  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);

  // Init DHT22
  Serial.print("[DHT22] Initializing sensor... ");
  dht.begin();
  Serial.println("OK ✔");

  Serial.println("===== SYSTEM READY =====\n");
}


// ================= LOOP ==================
void loop() {

  // -------- READ MQ ANALOG --------
  Serial.println("------ Reading MQ Sensors ------");

  int mq5_adc = analogRead(MQ5_PIN);
  int mq3_adc = analogRead(MQ3_PIN);
  int mq2_adc = analogRead(MQ2_PIN);

  Serial.printf("[MQ5] ADC=%d\n", mq5_adc);
  Serial.printf("[MQ3] ADC=%d\n", mq3_adc);
  Serial.printf("[MQ2] ADC=%d\n", mq2_adc);

  // -------- CONVERT TO PPM --------

  // MQ2 – Smoke
  float mq2_ppm = MQ_GetPPM(mq2_adc, R0_MQ2, 114.75, -1.553);

  // MQ3 – Alcohol
  float mq3_ppm = MQ_GetPPM(mq3_adc, R0_MQ3, 4.8387, -3.318);

  // MQ5 – LPG
  float mq5_ppm = MQ_GetPPM(mq5_adc, R0_MQ5, 1000.5, -2.186);


  Serial.printf("[MQ2] Smoke = %.2f ppm\n", mq2_ppm);
  Serial.printf("[MQ3] Alcohol = %.2f ppm\n", mq3_ppm);
  Serial.printf("[MQ5] LPG = %.2f ppm\n", mq5_ppm);

  // -------- READ DHT22 --------
  Serial.println("------ Reading DHT22 ------");
  float humi = dht.readHumidity();
  float temp = dht.readTemperature();

  if (isnan(humi) || isnan(temp)) {
    Serial.println("[DHT22] ERROR ❌ Could not read data!");
  } else {
    Serial.printf("[DHT22] Temp: %.2f C | Humi: %.2f %%\n", temp, humi);
  }


  // -------- UPDATE OLED --------
  Serial.println("------ Updating OLED Display ------");

  display.clearDisplay();
  display.setCursor(0, 0);

  display.println(" ESP32 SENSOR DATA");
  display.println("----------------------");

  display.print("MQ2: ");
  display.print(mq2_ppm);
  display.println(" ppm");

  display.print("MQ3: ");
  display.print(mq3_ppm);
  display.println(" ppm");

  display.print("MQ5: ");
  display.print(mq5_ppm);
  display.println(" ppm");

  if (isnan(temp) || isnan(humi)) {
    display.println("DHT22 ERROR!");
  } else {
    display.print("T: ");
    display.print(temp);
    display.println(" C");

    display.print("H: ");
    display.print(humi);
    display.println(" %");
  }

  display.display();

  Serial.println("[OLED] Updated successfully ✔\n");

  delay(2000);
}
