from flask import Flask, request, jsonify
import minimalmodbus
import serial
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Configuration for the RS485 connection
SERIAL_PORT =       '/dev/tty.usbserial-A10MLR0L'
BAUD_RATE =         115200
MASTER_ADDRESS_1 =  0x55
MASTER_ADDRESS_2 =  0xAA
SLAVE_ADDRESS =     0x01
ALL_SLAVE_ADDRESS = 0xFF

# Function codes
STS_ERROR =         0x0E  
STS_HOME=           0x1F 
STS_TEST_LIN =      0x2F  
STS_TEST_ROT =      0x3F  
STS_SERVO_INDEX =   0x4F 
STS_SERVO_LIN_ROT = 0x5F 

# Setup the instrument
instrument = minimalmodbus.Instrument(SERIAL_PORT, SLAVE_ADDRESS)  # port name, slave address
instrument.serial.baudrate = BAUD_RATE
instrument.serial.bytesize = 8
instrument.serial.parity = serial.PARITY_NONE
instrument.serial.stopbits = 1
instrument.serial.timeout = 1  # seconds

def calculate_crc(data):
    crc = 0xFFFF
    for pos in data:
        crc ^= pos
        for _ in range(8):
            if (crc & 1) != 0:
                crc >>= 1
                crc ^= 0xA001
            else:
                crc >>= 1
    return crc

def send_frame(frame):
    print("Frame to be sent: ", " ".join(f"{byte:02X}" for byte in frame))
    instrument.serial.write(bytearray(frame))

@app.route('/go_home', methods=['POST'])
def go_home():
    data_length = 0x00 
    frame = [MASTER_ADDRESS_1, MASTER_ADDRESS_2, SLAVE_ADDRESS, STS_HOME, data_length]
    crc = calculate_crc(frame[2:]) 
    crc_bytes = [crc & 0xFF, (crc >> 8) & 0xFF]
    frame += crc_bytes
    send_frame(frame)    

    return jsonify({"status": "success", "message": "Sent go home command"})

@app.route('/test_actuator', methods=['POST'])
def test_actuator():
    data_length = 0x00
    frame = [MASTER_ADDRESS_1, MASTER_ADDRESS_2, ALL_SLAVE_ADDRESS, STS_TEST_LIN, data_length] 
    crc = calculate_crc(frame[2:])
    crc_bytes = [crc & 0xFF, (crc >> 8) & 0xFF]
    frame += crc_bytes
    send_frame(frame)

    return jsonify({"status": "success", "message": f"Started Linear Test"})

@app.route('/test_rotation', methods=['POST'])
def test_rotation():
    data_length = 0x00
    frame = [MASTER_ADDRESS_1, MASTER_ADDRESS_2, SLAVE_ADDRESS, STS_TEST_ROT, data_length] 
    crc = calculate_crc(frame[2:])
    crc_bytes = [crc & 0xFF, (crc >> 8) & 0xFF]
    frame += crc_bytes
    send_frame(frame)

    return jsonify({"status": "success", "message": f"Searted Rotation Test"})

@app.route('/control_all_servos_diff_angles', methods=['POST'])
def control_all_servos_diff_angles():
    data = request.json
    angles = data.get('angles')
    if len(angles) != 3:
        return jsonify({"status": "error", "message": "Angles array must contain exactly 10 elements"}), 400
    data_length = 3 
    message =  [eval(i) for i in angles]
    frame = [MASTER_ADDRESS_1, MASTER_ADDRESS_2, SLAVE_ADDRESS, STS_SERVO_LIN_ROT, data_length] + message
    crc = calculate_crc(frame[2:])
    crc_bytes = [crc & 0xFF, (crc >> 8) & 0xFF]
    frame += crc_bytes
    send_frame(frame)

    return jsonify({"status": "success", "message": "Sent control all servos to different angles"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)
