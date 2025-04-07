#include <Wire.h>
#include <Servo.h>

Servo servos[4];
const int servoPins[4] = {10, 11, 12, 13};
const int delayTime = 500; // Adjust for your servo’s rotation speed

volatile byte receivedCommand = 0;
bool shouldDispense = false;

void setup() {
  Serial.begin(9600);
  Wire.begin(0x08); // I2C address of Arduino Mega
  Wire.onReceive(receiveData);
  Wire.onRequest(sendAck);

  for (int i = 0; i < 4; i++) {
    pinMode(servoPins[i], OUTPUT);
  }

  Serial.println("Arduino Mega ready. Waiting for I2C...");
}

void loop() {
  if (shouldDispense) {
    Serial.print("Dispensing for command: ");
    Serial.println(receivedCommand);

    rotateServo360(receivedCommand - 1); // Map 1–4 to index 0–3
    shouldDispense = false;
  }
}

void receiveData(int byteCount) {
  if (byteCount > 0) {
    receivedCommand = Wire.read();
    shouldDispense = true;

    Serial.print("Received via I2C: ");
    Serial.println(receivedCommand);
  }
}

void sendAck() {
  Wire.write(0xAA); // ACK byte
  Serial.println("Sent ACK to Raspberry Pi");
}

void rotateServo360(int index) {
  if (index < 0 || index >= 4) {
    Serial.println("Invalid servo index");
    return;
  }

  Serial.print("Rotating servo ");
  Serial.println(index);

  servos[index].attach(servoPins[index]);

  for (int i = 0; i < 2; i++) {
    servos[index].write(90);
    delay(delayTime);
    servos[index].write(0);
    delay(delayTime);
    servos[index].write(180);
//    servos[index].write(90);
//    delay(delayTime);
//    servos[index].write(0);
//    delay(delayTime);
//    servos[index].write(180);
    delay(50); // Short reset pause
  }

  servos[index].detach();
  Serial.println("Servo rotation complete and detached");
}
