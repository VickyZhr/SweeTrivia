#include <Servo.h>

// Define servo control pins
const int servoPins[4] = {6, 7, 8, 9};

// Create servo objects
Servo servos[4];

// Define angles
const int startAngle = 0;      // Initial position
const int midAngle = 180;      // Halfway position
const int delayTime = 500;     // Time in milliseconds for servo movement

void setup() {
    Serial.begin(9600); // Initialize serial communication

    // Attach servos to their respective pins and set initial position
    for (int i = 0; i < 4; i++) {
        servos[i].attach(servoPins[i]);
        servos[i].write(startAngle); // Move to start position
        delay(500); // Ensure servo reaches position
    }

    Serial.println("Enter a number (1-4) to rotate the corresponding servo motor.");
}

void loop() {
    if (Serial.available() > 0) {
        char command = Serial.read(); // Read the command

        if (command >= '1' && command <= '4') {
            int servoIndex = command - '1'; // Convert '1'-'4' to index 0-3
            rotateServo360(servoIndex);
            Serial.print("Servo ");
            Serial.print(servoIndex + 1);
            Serial.println(" rotated 360 degrees.");
        } else {
            Serial.println("Invalid input! Enter a number between 1 and 4.");
        }
    }
}

void rotateServo360(int index) {
    // Move to 180°, then back to 0° twice for a full 360° rotation
    for (int i = 0; i < 2; i++) {
        servos[index].write(midAngle);
        delay(delayTime);
        servos[index].write(startAngle);
        delay(delayTime);
    }
}
