int mq3_1 = 0;
int mq3_2 = 3;
int mq3_3 = 5;
int an0,an1,an2;
void setup() {
  // put your setup code here, to run once:
  pinMode(mq3_1, INPUT); 
  pinMode(mq3_2, INPUT); 
  pinMode(mq3_3, INPUT); 
  
  Serial.begin(57600);
  delay(50);
}

void loop() {
  // put your main code here, to run repeatedly:

  an0 = analogRead(mq3_1);
  an1 = analogRead(mq3_2);
  an2 = analogRead(mq3_3);
  Serial.print("An0:");
  Serial.print(an0);

  Serial.print(" An1:");
  Serial.print(an1);

  Serial.print(" An2:");
  Serial.print(an2);
  Serial.println("");
  delay(200);

}
