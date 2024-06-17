from flask import Flask, request, jsonify
import minimalmodbus
import serial
from serial import SerialException
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Configuration for the RS485 connection
# SERIAL_PORT = '/dev/tty.usbserial-A10MLR0L'
SERIAL_PORT = '/sys/class/tty/ttyAMA10/device'
BAUD_RATE = 115200
MASTER_ADDRESS_1 = 0x55
MASTER_ADDRESS_2 = 0xAA
SLAVE_ADDRESSES = [0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]
ALL_SLAVE_ADDRESS = 0xFF

# Function codes
STS_ERROR = 0x0E
STS_HOME = 0x1F
STS_TEST_LIN = 0x2F
STS_TEST_ROT = 0x3F
STS_SERVO_INDEX = 0x4F
STS_SERVO_LIN_ROT = 0x5F
STS_STOCK_DATA = 0x6F

# Servo speed constants
MIN_SERVO = 0
STOP_SERVO = 90
MAX_SERVO = 180

# Setup the instrument
instrument = None

def setup_instrument():
    global instrument
    try:
        instrument = minimalmodbus.Instrument(SERIAL_PORT, ALL_SLAVE_ADDRESS)  # port name, slave address
        instrument.serial.baudrate = BAUD_RATE
        instrument.serial.bytesize = 8
        instrument.serial.parity = serial.PARITY_NONE
        instrument.serial.stopbits = 1
        instrument.serial.timeout = 1  # seconds
        print("Instrument connected")
        return True
    except SerialException as e:
        print(f"Error setting up instrument: {e}")
        return False

# Try to set up the instrument initially
setup_instrument()

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

def map_value_to_servo_speed(value):
    if value < -100:
        value = -100
    elif value > 100:
        value = 100

    if value < 0:
        mapped_value = int((value + 100) / 100 * 90)  # Map to 0-90
    else:
        mapped_value = int(value / 100 * 90 + 90)  # Map to 90-180
    
    return max(MIN_SERVO, min(MAX_SERVO, mapped_value))

def send_frame(slave_address, frame):
    if not instrument:
        print("Instrument not connected")
        return False, "USB device not connected"
    try:
        instrument.address = slave_address
        print(f"Frame to be sent to {slave_address}: ", " ".join(f"{byte:02X}" for byte in frame))
        instrument.serial.write(bytearray(frame))
        return True, "Frame sent successfully"
    except SerialException as e:
        print(f"Error sending frame: {e}")
        if setup_instrument():
            print("Reconnected to USB device")
            return False, "Reconnected to USB device"
        else:
            return False, "USB device not connected"

@app.route('/go_home', methods=['POST'])
def go_home():
    data_length = 0x00
    frame = [MASTER_ADDRESS_1, MASTER_ADDRESS_2, ALL_SLAVE_ADDRESS, STS_HOME, data_length]
    crc = calculate_crc(frame[2:])
    crc_bytes = [crc & 0xFF, (crc >> 8) & 0xFF]
    frame += crc_bytes
    success, message = send_frame(ALL_SLAVE_ADDRESS, frame)
    if success:
        return jsonify({"status": "success", "message": "Sent go home command"})
    else:
        return jsonify({"status": "error", "message": message}), 500

@app.route('/test_actuator', methods=['POST'])
def test_actuator():
    data_length = 0x00
    frame = [MASTER_ADDRESS_1, MASTER_ADDRESS_2, ALL_SLAVE_ADDRESS, STS_TEST_LIN, data_length]
    crc = calculate_crc(frame[2:])
    crc_bytes = [crc & 0xFF, (crc >> 8) & 0xFF]
    frame += crc_bytes
    success, message = send_frame(ALL_SLAVE_ADDRESS, frame)
    if success:
        return jsonify({"status": "success", "message": "Started Linear Test"})
    else:
        return jsonify({"status": "error", "message": message}), 500

@app.route('/test_rotation', methods=['POST'])
def test_rotation():
    data_length = 0x00
    frame = [MASTER_ADDRESS_1, MASTER_ADDRESS_2, ALL_SLAVE_ADDRESS, STS_TEST_ROT, data_length]
    crc = calculate_crc(frame[2:])
    crc_bytes = [crc & 0xFF, (crc >> 8) & 0xFF]
    frame += crc_bytes
    success, message = send_frame(ALL_SLAVE_ADDRESS, frame)
    if success:
        return jsonify({"status": "success", "message": "Started Rotation Test"})
    else:
        return jsonify({"status": "error", "message": message}), 500

@app.route('/control_all_servos_diff_angles', methods=['POST'])
def control_all_servos_diff_angles():
    data = request.json
    angles = data.get('angles')
    if len(angles) != 3:
        return jsonify({"status": "error", "message": "Angles array must contain exactly 3 elements"}), 400
    data_length = 3
    message = [eval(i) for i in angles]
    frame = [MASTER_ADDRESS_1, MASTER_ADDRESS_2, SLAVE_ADDRESSES, STS_SERVO_LIN_ROT, data_length] + message
    crc = calculate_crc(frame[2:])
    crc_bytes = [crc & 0xFF, (crc >> 8) & 0xFF]
    frame += crc_bytes
    for slave_address in SLAVE_ADDRESSES:
        success, message = send_frame(slave_address, frame)
        if not success:
            return jsonify({"status": "error", "message": message}), 500
    return jsonify({"status": "success", "message": "Sent control all servos to different angles"})

@app.route('/update_stock_data', methods=['POST'])
def update_stock_data():
    data = request.json
    print("Received stock data update:", data)
    
    # Convert stock data to servo speeds
    servo_speeds = [map_value_to_servo_speed(value) for value in data]
    
    # Divide the data into chunks for each motor on each Arduino
    motors_per_nano = 6
    nanos = 8
    data_chunks = [servo_speeds[i:i + motors_per_nano] for i in range(0, len(servo_speeds), motors_per_nano)]
    
    for i, chunk in enumerate(data_chunks):
        slave_address = SLAVE_ADDRESSES[i % nanos]
        data_length = len(chunk)
        frame = [MASTER_ADDRESS_1, MASTER_ADDRESS_2, slave_address, STS_STOCK_DATA, data_length] + chunk
        crc = calculate_crc(frame[2:])
        crc_bytes = [crc & 0xFF, (crc >> 8) & 0xFF]
        frame += crc_bytes
        success, message = send_frame(slave_address, frame)
        if not success:
            return jsonify({"status": "error", "message": message}), 500
    
    return jsonify({"status": "success", "message": "Stock data update received and sent to Arduinos"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)
