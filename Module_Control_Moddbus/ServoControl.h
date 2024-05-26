
#ifndef ServoControl_h
#define ServoControl_h

#include <Arduino.h>
#include <Servo.h> 
#include <ezButton.h>

 class ServoControl{
   
    private:    
      
      Servo myServo;

// SERVO VAL --------------------------

      int myTreshold;       // max amount of switch triger on each sides 
      int myRightSpeed;     // rotation of the right speed 
      int myLeftSpeed;      // rotation of the left speed 
      int myStop;           // Stop the servo 
      int mySpeed;          // CurentServo speed 
      int controleTimer; 
      bool myDir = true;    // Curent Servo direction
// SWITCH VAL --------------------------

      byte mySwitchPin; 
      bool updateCount;     // Update the counter once
      int switchState;      // check the state of the switch 
      
    public:
    
      ServoControl();
      void Setup(byte servoPin, int treshold);
      void Controle(ezButton mySwitch, int motorSpeed);
      void WaveMode(ezButton mySwitch);
      void UpdateCounter();
      void goHome(ezButton mySwitch);
      int stepCounter = 0;  // count the num of time the switch is triggerd 
      bool isRuning = false;

 };

 #endif
