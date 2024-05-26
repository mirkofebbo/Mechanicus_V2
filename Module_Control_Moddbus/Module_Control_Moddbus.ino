
#include <ezButton.h>

#include "ServoControl.h" 
#include "ModebusCom.h"

// MODULE VAL ------------------------------------------------------------
  
  bool isHome = false ;
  const int num = 3;
  int servoHomeIndex;
  int linTreshold = 4;
  int rotTreshold = 1;
  
// BOOTING UP OBJECTS ----------------------------------------------------

  //Planetary gear switches 
  ezButton rotSwitch[]  = {A4, A2, A0};
  //Actuator Switches   
  ezButton linSwitch[]  = {A5, A3, A1};  
  
  //Servo Controlers   
  ServoControl myRotControl[num];
  ServoControl myLinControl[num];
  
  int mySpeed[3] = {90,90,90};
// MODBUS --------------------------------------------------------------
ModebusCom myModbus;
//------------------------------------------------------------------------
//SETUP ------------------------------------------------------------------
//------------------------------------------------------------------------
void setup(){

    Serial.begin(115200);

    // Manualy setting up the servo with PIN and stop threshold for the switches 
    myRotControl[0].Setup(6, rotTreshold);
    myRotControl[1].Setup(8, rotTreshold);
    myRotControl[2].Setup(10, rotTreshold);
    
    myLinControl[0].Setup(5, linTreshold);
    myLinControl[1].Setup(7, linTreshold);
    myLinControl[2].Setup(9, linTreshold);
    
    // Setting up the switches 
    for(int i=0; i<num ; i++){
       rotSwitch[i].setDebounceTime(50);
       linSwitch[i].setDebounceTime(50);
    }
    
    myModbus.Setup();
}


//------------------------------------------------------------------------
//MAIN LOOP --------------------------------------------------------------
//------------------------------------------------------------------------
void loop(){
  
   for(int i=0; i<num ; i++){
    rotSwitch[i].loop();
    linSwitch[i].loop();
   }
  
  myModbus.Update();

  if(myModbus.controle){

    int servoIndex          = myModbus.index;
    mySpeed[servoIndex]     = myModbus.servoSpeed;
  
    for(int i=0; i<num; i++){
      myLinControl[i].Controle(linSwitch[i], mySpeed[i]);
      myRotControl[i].Controle(rotSwitch[i], mySpeed[i]);
    }
//    for(int i=0; i<num; i++){
//      if(myLinControl[i].stepCounter == linTreshold) myLinControl[i].goHome(rotSwitch[i]);
//      if(myLinControl[i].stepCounter == -linTreshold) myLinControl[i].goHome(rotSwitch[i]);
//      if(myRotControl[i].stepCounter == rotTreshold) myRotControl[i].goHome(rotSwitch[i]);
//      if(myRotControl[i].stepCounter == -rotTreshold) myRotControl[i].goHome(rotSwitch[i]);
//    }

  }
  if(myModbus.testLinear){
    
    for(int i=0; i<num; i++){
      myLinControl[i].WaveMode(linSwitch[i]);
    }
    
  }
  
  if(myModbus.testRotate){

    for(int i=0; i<num; i++){
      myRotControl[i].WaveMode(rotSwitch[i]);
    }
    
  }
  
  if(myModbus.goingHome){

    for(int i=0; i<num; i++){
       myRotControl[i].goHome(rotSwitch[i]);
       myLinControl[i].goHome(linSwitch[i]);
    }
  }

}
