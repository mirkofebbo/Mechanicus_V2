from flask import Flask, request, jsonify
import minimalmodbus
import serial
import time

app = Flask(__name__)

# Configuration for the RS485 connection
SERIAL_PORT = '/dev/tty.usbserial-A9P08C0A'
BAUD_RATE = 115200
SLAVE_ADDRESS = 0x01

# Setup the instrument
instrument = minimalmodbus.Instrument(SERIAL_PORT, SLAVE_ADDRESS)  # port name, slave address
instrument.serial.baudrate = BAUD_RATE
instrument.serial.bytesize = 8
instrument.serial.parity = serial.PARITY_NONE
instrument.serial.stopbits = 1
instrument.serial.timeout = 1    # seconds

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

def send_go_home():
    function_code = 0x1F  # STS_HOME
    data_length = 0x00  # No additional data needed for this command
    frame = [0x55, 0xAA, SLAVE_ADDRESS, function_code, data_length]
    crc = calculate_crc(frame[2:])  # Only pass the relevant data for CRC calculation
    crc_bytes = [crc & 0xFF, (crc >> 8) & 0xFF]
    frame += crc_bytes
    send_frame(frame)

def send_control_all_servos_same_angle(angle):
    function_code = 0x2F  # STS_SERVO_ALL
    data_length = 0x01
    message = [angle]
    frame = [0x55, 0xAA, SLAVE_ADDRESS, function_code, data_length] + message
    crc = calculate_crc(frame[2:])
    crc_bytes = [crc & 0xFF, (crc >> 8) & 0xFF]
    frame += crc_bytes
    send_frame(frame)

def send_control_individual_servo(servo_number, angle):
    function_code = 0x1F  # STS_SERVO
    data_length = 2  # 2 bytes: servo number and angle
    message = [servo_number, angle]
    frame = [0x55, 0xAA, SLAVE_ADDRESS, function_code, data_length] + message
    crc = calculate_crc(frame[2:])
    crc_bytes = [crc & 0xFF, (crc >> 8) & 0xFF]
    frame += crc_bytes
    send_frame(frame)

def send_control_all_servos_diff_angles(angles):
    function_code = 0x3F  # STS_SERVO_All_IND
    data_length = 10  # 10 bytes: one angle for each servo
    message = angles[:10]
    frame = [0x55, 0xAA, SLAVE_ADDRESS, function_code, data_length] + message
    crc = calculate_crc(frame[2:])
    crc_bytes = [crc & 0xFF, (crc >> 8) & 0xFF]
    frame += crc_bytes
    send_frame(frame)

@app.route('/go_home', methods=['POST'])
def go_home():
    send_go_home()
    return jsonify({'status': 'success', 'message': 'Go Home command sent'})

@app.route('/control_all_servos_same_angle', methods=['POST'])
def control_all_servos_same_angle():
    angle = request.json.get('angle')
    send_control_all_servos_same_angle(angle)
    return jsonify({'status': 'success', 'message': f'Set all servos to {angle} degrees'})

@app.route('/control_individual_servo', methods=['POST'])
def control_individual_servo():
    servo_number = request.json.get('servo_number')
    angle = request.json.get('angle')
    send_control_individual_servo(servo_number, angle)
    return jsonify({'status': 'success', 'message': f'Set servo {servo_number} to {angle} degrees'})

@app.route('/control_all_servos_diff_angles', methods=['POST'])
def control_all_servos_diff_angles():
    angles = request.json.get('angles')
    send_control_all_servos_diff_angles(angles)
    return jsonify({'status': 'success', 'message': 'Set all servos to different angles'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
