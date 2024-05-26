#include "ModebusCom.h"
KMP_RS485 _rs485(Serial, 2 /*tePin*/, 1 /*TX pin*/);  // This configuration is liked with PRODINo MKR Zero you can change it to fit with your needs

//------------------------------------------------------------------------
//SETUP ------------------------------------------------------------------
//------------------------------------------------------------------------
void ModebusCom::Setup() {
  Serial.begin(115200);
  _rs485.begin(115200);  // Start RS-485 communication
}
//------------------------------------------------------------------------
//RESET FUNCTION ---------------------------------------------------------
//------------------------------------------------------------------------
void ModebusCom::Reset() {
  // If there is a error in the hexa decimal code reset everything
  for (int i = 0; i < 40; i++) {
    RECVBUFF[i] = '0';
    SENDBUFF[i] = '0';
  }
  FUNCCODE = 0;
  STS = 0;
  CRCTMP = 0;
  CRC[0] = '0';
  CRC[1] = '0';
  CRCTMP = 0;
  SENDNUM = 0;
  RECVLEN = 0;
  RECVNUM = 0;
  RECVOK = 0;
}
//------------------------------------------------------------------------
//CRC CACULATION ---------------------------------------------------------
//------------------------------------------------------------------------
unsigned int ModebusCom::CRC16(uint8_t *arr_buff, uint8_t len) {
  uint16_t crc = 0xFFFF;
  uint8_t i, j;
  for (j = 0; j < len; j++) {
    crc = crc ^ *arr_buff++;
    for (i = 0; i < 8; i++) {
      if ((crc & 0x0001) > 0) {
        crc = crc >> 1;
        crc = crc ^ 0xa001;
      } else crc = crc >> 1;
    }
  }
  return crc;
}
//------------------------------------------------------------------------
// UPDATE-----------------------------------------------------------------
//------------------------------------------------------------------------
void ModebusCom::Update() {
  if (RECVOK == 0) {
    if (_rs485.available()) {
      RECVBUFF[RECVNUM] = _rs485.read();
      Serial.print("Received byte: ");
      Serial.println(RECVBUFF[RECVNUM], HEX);
      RECVNUM++;
      switch (STS) {
        case 0:
          if (RECVBUFF[0] != 0x55) {
            Serial.println("Master address part 1 check failed");
            Reset();
          } else {
            STS++;
          }
          break;
        case 1:
          if (RECVBUFF[1] != 0xAA) {
            Serial.println("Master address part 2 check failed");
            Reset();
          } else {
            STS++;
          }
          break;
        case 2:
          if ((RECVBUFF[2] != LOCALADDR && RECVBUFF[2] != STS_ALL)) {
            Serial.println("MCU ID check failed");
            Reset();
          } else {
            for (SENDNUM = 0; SENDNUM < RECVNUM; SENDNUM++) {
              SENDBUFF[SENDNUM] = RECVBUFF[SENDNUM];
            }
            STS++;
          }
          break;
        case 3:
          SENDBUFF[3] = RECVBUFF[3];
          FUNCCODE = SENDBUFF[3];
          STS++;
          break;
        case 4:
          SENDBUFF[4] = RECVBUFF[4];
          RECVLEN = SENDBUFF[4];
          STS++;
          break;
        case 5:
if (RECVNUM == RECVLEN + 7) {
            for (SENDNUM = 5; SENDNUM < RECVNUM; SENDNUM++) {
              SENDBUFF[SENDNUM] = RECVBUFF[SENDNUM];
            }
            Serial.print("Data for CRC calculation: ");
            for (int i = 2; i < RECVNUM - 2; i++) {
              Serial.print(SENDBUFF[i], HEX);
              Serial.print(" ");
            }
            Serial.println();
            CRCTMP = CRC16(&SENDBUFF[2], RECVNUM - 4);
            CRC[0] = CRCTMP & 0x00FF;
            CRC[1] = (CRCTMP >> 8) & 0x00FF;
            Serial.print("Calculated CRC: ");
            Serial.print(CRC[0], HEX);
            Serial.print(" ");
            Serial.println(CRC[1], HEX);
            Serial.print("Received CRC: ");
            Serial.print(RECVBUFF[RECVNUM - 2], HEX);
            Serial.print(" ");
            Serial.println(RECVBUFF[RECVNUM - 1], HEX);
            if (CRC[0] != RECVBUFF[RECVNUM - 2] || CRC[1] != RECVBUFF[RECVNUM - 1]) {
              Serial.println("CRC check failed");
              Reset();
            } else {
              RECVOK = 1;
              Serial.println("Message received correctly");
            }
            STS = 0;
          }
          break;
        default:
          break;
      }
    }
  } else {
    Serial.print("Processing function code: ");
    Serial.println(FUNCCODE, HEX);
    switch (FUNCCODE) {
      // unused fun ction code //
      case STS_ERROR:
        break;
      case STS_HOME:  //GO HOME
        Serial.println("GO HOME");
        testLinear = false;
        testRotate = false;
        goingHome = true;
        controle = false;

        break;
      case STS_TEST_LIN:  // RUN TEST FOR THE LINEAR ACTUATOR
        Serial.println("LINEAR ACTUATOR TEST");
        testLinear = true;
        goingHome = false;
        controle = false;
        break;

      case STS_TEST_ROT:
        Serial.println("ROT TEST");
        testRotate = true;
        goingHome = false;
        controle = false;

        break;

      case STS_SERVO_All_IND:  // all the 6 servo with diff speed
        Serial.println("DIFF SPEED");
        testRotate = false;
        testLinear = false;
        goingHome = false;
        controle = true;

        index = RECVBUFF[5];
        servoSpeed = RECVBUFF[6];

        break;
    }
    // _rs485.beginTransmission();
    // for (int i = 0; i < SENDNUM; i++) {
    //   _rs485.write(SENDBUFF[i]);
    // }
    _rs485.endTransmission();
    // Serial.println("Message sent back");
    // RECVOK = 0;
    Reset();
  }
}
