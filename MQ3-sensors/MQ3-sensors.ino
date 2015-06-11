/*******************Demo for MQ-3 Gas Sensor Module V1.1*****************************
* Author:  Camel: camelray0923@gmail.com
* Reference:  Demo for MQ-6 Gas Sensor Module V1.1 : Tiequan Shao: tiequan.shao@sandboxelectronics.com
* Note:  This piece of source code is ONLY supposed to be used as a demostration.
* More sophisticated calibration is required for industrial field application. 
***********************************************************************************/

/************************Hardware Related Macros************************************/

#define         MQ_PIN                       (3)     //define which analog input channel you are going to use
#define         RL_VALUE                     (200)    //define the load resistance on the board, in kilo ohms
#define         RO_CLEAN_AIR_FACTOR          (60)    //RO_CLEAR_AIR_FACTOR=(Sensor resistance in clean air)/RO, which is derived from the chart in datasheet

/***********************Software Related Macros************************************/

#define         CALIBARAION_SAMPLE_TIMES     (20)    //define how many samples you are going to take in the calibration phase
#define         CALIBRATION_SAMPLE_INTERVAL  (500)   //define the time interal(in milisecond) between each samples in the cablibration phase
#define         READ_SAMPLE_INTERVAL         (50)    //define how many samples you are going to take in normal operation
#define         READ_SAMPLE_TIMES            (5)     //define the time interal(in milisecond) between each samples in normal operation

/**********************Application Related Macros**********************************/

#define         GAS_ALCOHOL                       (0)

/*****************************Globals***********************************************/
float           AlcoholCurve[3]  =  {-1, 0.36,-0.66};    //two points are taken from the curve in datasheet. 
                                                     //with these two points, a line is formed which is "approximately equivalent" 
                                                     //to the original curve. 
                                                     //data format:{ x, y, slope}; point1: (lg10, lg0.12), point2: (lg1, lg0.55) 

//float           Ro           =  20;                  //Ro is initialized to 10 kilo ohms
float           Ro           =  16;                  //medindo e ajustando o potenciometro da placa

void setup()
{
  Serial.begin(57600);                                //UART setup, baudrate = 9600bps
  
  Serial.print("Calibrating...\n");                
  for (int i=0;i<15;i++){
    
  Ro = MQCalibration(MQ_PIN);                        //Calibrating the sensor. Please make sure the sensor is in clean air 
  Serial.print("Calibration is done...\n"); 
  Serial.print("Ro=");
  Serial.print(Ro);
  Serial.print("kohm");
  Serial.print("\n");
  delay(2000);
  }
  
                                                     //when you perform the calibration                    

}

void loop()
{
   Serial.print("Alcohol : "); 
   int ana = analogRead(MQ_PIN);
   float rs = MQRead(ana);
   float ratio = rs/Ro;
   Serial.print("Ana:");
   Serial.print(ana);
   Serial.print(" Rs:");
   Serial.print(rs);
   Serial.print(" Ratio:");
   Serial.print(ratio);
   Serial.print(" ");
   float gas = MQGetPercentage(ratio) ;
   Serial.print(" Gas:");
   Serial.print(gas);
   Serial.println( " mg/L" );
   delay(1000);
}

/****************** MQResistanceCalculation ****************************************
Input:   raw_adc - raw value read from adc, which represents the voltage
Output:  the calculated sensor resistance
Remarks: The sensor and the load resistor forms a voltage divider. Given the voltage
         across the load resistor and its resistance, the resistance of the sensor
         could be derived.
************************************************************************************/ 
float MQResistanceCalculation(int raw_adc)
{
  return ( ((float)RL_VALUE*(1023.0 - (float)raw_adc) / (float)raw_adc));
}

/***************************** MQCalibration ****************************************
Input:   mq_pin - analog channel
Output:  Ro of the sensor
Remarks: This function assumes that the sensor is in clean air. It use  
         MQResistanceCalculation to calculates the sensor resistance in clean air 
         and then divides it with RO_CLEAN_AIR_FACTOR. RO_CLEAN_AIR_FACTOR is about 
         10, which differs slightly between different sensors.
************************************************************************************/ 
float MQCalibration(int mq_pin)
{
  int i;
  float val=0;
  
  for (i=0;i<CALIBARAION_SAMPLE_TIMES;i++) {            //take multiple samples
    val += MQResistanceCalculation(analogRead(mq_pin));
    delay(CALIBRATION_SAMPLE_INTERVAL);
    Serial.print(".");
    Serial.print(i);
  }
  val = val/CALIBARAION_SAMPLE_TIMES;                   //calculate the average value
  
  val = val/RO_CLEAN_AIR_FACTOR;                        //divided by RO_CLEAN_AIR_FACTOR yields the Ro 
                                                        //according to the chart in the datasheet 

  return val; 
}
/*****************************  MQRead *********************************************
Input:   mq_pin - analog channel
Output:  Rs of the sensor
Remarks: This function use MQResistanceCalculation to caculate the sensor resistenc (Rs).
         The Rs changes as the sensor is in the different consentration of the target
         gas. The sample times and the time interval between samples could be configured
         by changing the definition of the macros.
************************************************************************************/ 
float MQRead(int ana)
{
  int i;
  float rs=0;

  for (i=0;i<READ_SAMPLE_TIMES;i++) {
    rs += MQResistanceCalculation(ana);
    delay(READ_SAMPLE_INTERVAL);
  }
  
  rs = rs/READ_SAMPLE_TIMES;

  return rs;  
}

/*****************************  MQGetGasPercentage **********************************
Input:   rs_ro_ratio - Rs divided by Ro
         gas_id      - target gas type
Output:  ppm of the target gas
Remarks: This function passes different curves to the MQGetPercentage function which 
         calculates the ppm (parts per million) of the target gas.
************************************************************************************/ 
float MQGetGasPercentage(float rs_ro_ratio, int gas_id)
{
  if ( gas_id == GAS_ALCOHOL) {
     return MQGetPercentage(rs_ro_ratio);
  }  
  return 0;
}

/*****************************  MQGetPercentage **********************************
Input:   rs_ro_ratio - Rs divided by Ro
         pcurve      - pointer to the curve of the target gas
Output:  ppm of the target gas
Remarks: By using the slope and a point of the line. The x(logarithmic value of ppm) 
         of the line could be derived if y(rs_ro_ratio) is provided. As it is a 
         logarithmic coordinate, power of 10 is used to convert the result to non-logarithmic 
         value.
************************************************************************************/ 
float  MQGetPercentage(float rs_ro_ratio)
{
    Serial.print("[");    
    //Serial.print(rs_ro_ratio);
    //Serial.print(AlcoholCurve[1]);
  float ppm= pow(10, ((log(rs_ro_ratio)-AlcoholCurve[1])/AlcoholCurve[2]) + AlcoholCurve[0]); 
  Serial.print(ppm *100);
  return ppm;
}
