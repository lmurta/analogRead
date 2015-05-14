// Example testing sketch for various DHT humidity/temperature sensors
// Written by ladyada, public domain

#include "DHT.h"

#define DHTPIN 7     // what pin we're connected to

// Uncomment whatever type you're using!
#define DHTTYPE DHT11   // DHT 11 
//#define DHTTYPE DHT22   // DHT 22  (AM2302)
//#define DHTTYPE DHT21   // DHT 21 (AM2301)

// Connect pin 1 (on the left) of the sensor to +5V
// NOTE: If using a board with 3.3V logic like an Arduino Due connect pin 1
// to 3.3V instead of 5V!
// Connect pin 2 of the sensor to whatever your DHTPIN is
// Connect pin 4 (on the right) of the sensor to GROUND
// Connect a 10K resistor from pin 2 (data) to pin 1 (power) of the sensor

// Initialize DHT sensor for normal 16mhz Arduino
DHT dht(DHTPIN, DHTTYPE);
// NOTE: For working with a faster chip, like an Arduino Due or Teensy, you
// might need to increase the threshold for cycle counts considered a 1 or 0.
// You can do this by passing a 3rd parameter for this threshold.  It's a bit
// of fiddling to find the right value, but in general the faster the CPU the
// higher the value.  The default for a 16mhz AVR is a value of 6.  For an
// Arduino Due that runs at 84mhz a value of 30 works.
// Example to initialize DHT sensor for Arduino Due:
//DHT dht(DHTPIN, DHTTYPE, 30);


//Smoothing http://www.arduino.cc/en/Tutorial/Smoothing
const int numReadings = 25;
int readings[6][numReadings];      // the readings from the analog input
int index = 0;                  // the index of the current reading
int total[] = {0,0,0,0,0,0};                  // the running total
int average[] = {0,0,0,0,0,0};                // the average

void setup() {
  Serial.begin(57600); 
  Serial.println("{\"Name\":\"DHTxx test!\"}");
  for(int i=0; i<6; i++){
     pinMode(i, INPUT);
  } 
  dht.begin();
}

void loop() {
  // Wait a few seconds between measurements.
  
  for(int i=0; i<6; i++){
    total[i]= total[i] - readings[i][index];  // subtract the last reading:
    readings[i][index] = analogRead(i);       // read from the sensor:
    total[i]= total[i] + readings[i][index];  // add the reading to the total:
  }
  index = index + 1;// advance to the next position in the array: 
  // if we're at the end of the array...
  if (index >= numReadings)              
    // ...wrap around to the beginning: 
    index = 0;   
    
  // calculate the average:
  for(int i=0; i<6; i++){
    average[i] = total[i] / numReadings;
  }
  
  
  // Reading temperature or humidity takes about 250 milliseconds!
  // Sensor readings may also be up to 2 seconds 'old' (its a very slow sensor)
  float h = dht.readHumidity();
  // Read temperature as Celsius
  float t = dht.readTemperature();
  // Read temperature as Fahrenheit
  //float f = dht.readTemperature(true);
  
  // Check if any reads failed and exit early (to try again).
  if (isnan(h) || isnan(t) ) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }

  // Compute heat index
  // Must send in temp in Fahrenheit!
  //float hi = dht.computeHeatIndex(f, h);

  Serial.print("{");
  Serial.print("\"H\":"); 
  Serial.print(h);
  Serial.print(",");
  Serial.print("\"T\":"); 
  Serial.print(t);
  
  for(int i=0; i<6; i++){
    Serial.print(",");
    Serial.print("\"A");
    Serial.print(i);
    Serial.print("\":");
    Serial.print(average[i]);
  }
  
  
  Serial.println("}");
  delay(200);

}
