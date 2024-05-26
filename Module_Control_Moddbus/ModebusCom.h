#ifndef ModebusCom_h
#define ModebusCom_h

#include <Arduino.h>
#include <KMP_RS485.h>  //rs485 lib

// MODBUS VAL ----------------------------------------------------------------------------------

class ModebusCom{

    private:
      #define STS_ERROR         0x0E  // Sending Errr message
      #define STS_HOME          0x1F  // Individual servo 
      #define STS_TEST_LIN      0x2F  // all Linear gear servo
      #define STS_TEST_ROT      0x3F  // all plannetary gear servo
      #define STS_SERVO_All_IND 0x4F  // all with individual speed
      #define STS_ALL           0xFF  // all the system   
      #define LOCALADDR         0x01
 
      
      unsigned char RECVBUFF[40]={0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0}; // recieved message 
      unsigned char RECVNUM=0;    // Number of bytes recieved 
      unsigned char RECVLEN=0;    // Recieved msg len 
      unsigned char FUNCCODE=0;   // Functional code  
      unsigned char SENDNUM=0;    // Sending msg size
      unsigned char STS=0;        // Counting the bytes in the recieved buff 
//      unsigned char LOCALADDR = 0x02;// MCU Identity IMPORATANT TO CHANGE FOR EACH NANO
      unsigned char RECVOK=0;     // recived OK 
      unsigned int CRCTMP=0;      // Temp value to hold the CRC ?
      unsigned char CRC[2]={0,0}; // 2 value CRC (8bit each)
      int count = 0;

    public:
      unsigned char SENDBUFF[40]={0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0}; // sending message 

      void Setup();
      void Update();
      void Reset();
      unsigned int CRC16(uint8_t *arr_buff, uint8_t len);
      int linarSpeed[3] = {90, 90, 90};
      int rotSpeed[3] = {90, 90, 90};
      bool goingHome    = false;
      bool testLinear   = false;
      bool testRotate   = false;
      bool controle     = false;
      
      int index; 
      int servoSpeed; 
 };

 #endif
