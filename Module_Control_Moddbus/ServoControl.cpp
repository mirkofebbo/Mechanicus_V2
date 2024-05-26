#include "ServoControl.h"

ServoControl::ServoControl(){

      myRightSpeed = 100;
      myLeftSpeed = 80;
      myStop = 90;
  
      mySpeed = 90; 
      myDir = true;

      updateCount = true;

}

//------------------------------------------------------------------------
//SETUP ------------------------------------------------------------------
//------------------------------------------------------------------------
void ServoControl::Setup(byte servoPin, int treshold){
  myTreshold = treshold;
  myServo.attach(servoPin);  

}
//------------------------------------------------------------------------
// CONTROLE---------------------------------------------------------------
//------------------------------------------------------------------------
void ServoControl::Controle(ezButton mySwitch,  int motorSpeed){

  int mySpeed = myStop; 

  int tempTreshold;
//  if(isRuning){
    if(motorSpeed<90)                   myDir = false;
    else if (motorSpeed>90)             myDir = true;
    if(myTreshold==1)                   tempTreshold = 2;
    else                                tempTreshold = myTreshold;
    if(stepCounter != tempTreshold)     mySpeed = motorSpeed;
    if ( (stepCounter == tempTreshold) and (myDir) ) mySpeed = myStop;
    if(stepCounter != (-tempTreshold) )  mySpeed = motorSpeed;
    if( (stepCounter == -tempTreshold ) and (!myDir) ) mySpeed = myStop;
    if((tempTreshold !=2) or (tempTreshold != -2) ){ 

    if (mySwitch.isPressed()){
           // Check if the switch is being pressed to update the counter 
        if(myDir)                       stepCounter++;
        else                            stepCounter--;
        
        if(stepCounter>=tempTreshold)   mySpeed = myStop;
        if(stepCounter<=-tempTreshold)  mySpeed = myStop;
 
      } 
      
    if (mySwitch.isReleased()){
        if(myDir) stepCounter++;
        else stepCounter--;
    }
    
      myServo.write(mySpeed);
//    } else myServo.write(myStop);
//  int mySpeed = myStop; 
//
//
//    if(motorSpeed<90) myDir = false;
//    else if (motorSpeed>90) myDir = true;
//    
//    if(stepCounter != myTreshold)     mySpeed = motorSpeed;
//    if(stepCounter != (-myTreshold))  mySpeed = motorSpeed;
//    
//    if (mySwitch.isPressed()){
//           // Check if the switch is being pressed to update the counter 
//        if(updateCount) {
//          if(myDir) stepCounter++;
//          else stepCounter--;
//          updateCount = false;
//        }
//         if(stepCounter >= myTreshold) {
//         mySpeed = myStop;
//         if(stepCounter <=-myTreshold) mySpeed = myStop;
//
//    } 
//    if (mySwitch.isReleased()) updateCount = true;
//    
//    myServo.write(mySpeed);
    }
}
//------------------------------------------------------------------------
// TESTFUN----------------------------------------------------------------
//------------------------------------------------------------------------
void ServoControl::WaveMode(ezButton mySwitch){

//    myRightSpeed = myStop + motorSpeed;
//    myLeftSpeed =  myStop - motorSpeed;
//   Serial.println(mySwitch.getState());

  if (mySwitch.isPressed()){
    // Check if the switch is being pressed to update the counter 
   if(updateCount) {
    
    UpdateCounter();
    updateCount = false;
   }
  } else if (mySwitch.isReleased()) updateCount = true;
  
  if(myDir)     myServo.write(myRightSpeed);
  else          myServo.write(myLeftSpeed);
  
}

//------------------------------------------------------------------------
// HOME-------------------------------------------------------------------
//------------------------------------------------------------------------
void ServoControl::goHome(ezButton mySwitch){
  // Set the motor to go back to their origin

  if(myTreshold == 1){
    if(stepCounter != 0){
      if(stepCounter > 0) myDir=false;
      if(stepCounter < 0) myDir=true;
      if(myDir) {
        myServo.write(myRightSpeed);
        if(mySwitch.isPressed()) stepCounter ++;
      } else {
        myServo.write(myLeftSpeed);
        if(mySwitch.isPressed()) stepCounter --;
      }
  
    } else if(mySwitch.getState() != 0){
      if(myDir) {
        myServo.write(myLeftSpeed);
      } else {
        myServo.write(myRightSpeed);
  //      stepCounter++;
      }
    } else if(mySwitch.isPressed()) {
        mySpeed = myStop;
        myServo.write(mySpeed);
    }
  } else {
     if(stepCounter != 0){
      if(stepCounter > 0) myDir=false;
      if(stepCounter < 0) myDir=true;
      if(myDir) {
        myServo.write(myRightSpeed);
        if(mySwitch.isReleased()) stepCounter ++;
      } else {
        myServo.write(myLeftSpeed);
        if(mySwitch.isReleased()) stepCounter --;
      }
  
    } else {
        myServo.write(90);
    }
  }
 } 

//------------------------------------------------------------------------
// COUNTER----------------------------------------------------------------
//------------------------------------------------------------------------
void ServoControl::UpdateCounter(){
  
  if(myDir) stepCounter++;
  else stepCounter--;
  if(stepCounter >= myTreshold) myDir = false;
  else if(stepCounter <= (-myTreshold)) myDir = true;
//  Serial.println(stepCounter);
}
