#include <Wire.h>
#include <Servo.h>

Servo servo1, servo2, servo3, servo4;
const int servoPins[4] = {3, 5, 6, 9}; // Connect your servos here
volatile byte receivedCommand = 0;
bool shouldDispense = false;

void setup() {
  Wire.begin(0x08); // I2C address of Arduino
  Wire.onReceive(receiveData);
  Wire.onRequest(sendAck);

  for (int i = 0; i < 4; i++) {
    pinMode(servoPins[i], OUTPUT);
  }

  servo1.attach(servoPins[0]);
  servo2.attach(servoPins[1]);
  servo3.attach(servoPins[2]);
  servo4.attach(servoPins[3]);
}

void loop() {
  if (shouldDispense) {
    dispenseCandy(receivedCommand);
    shouldDispense = false;
  }
}

void receiveData(int byteCount) {
  if (byteCount > 0) {
    receivedCommand = Wire.read();
    shouldDispense = true;
  }
}

void sendAck() {
  // Send 0xAA (170) to Pi to confirm dispensing complete
  Wire.write(0xAA);
}

void dispenseCandy(byte candyType) {
  Servo* targetServo = nullptr;
  switch (candyType) {
    case 1: targetServo = &servo1; break;
    case 2: targetServo = &servo2; break;
    case 3: targetServo = &servo3; break;
    case 4: targetServo = &servo4; break;
    default: return;
  }

  if (targetServo) {
    targetServo->write(90);  // Rotate to dispense
    delay(1000);             // Wait for rotation
    targetServo->write(0);   // Return to rest
  }
}
