#include <Servo.h>

// Define servo control pins
const int servoPins[4] = {10,11,12,13};

// Create servo objects
Servo servos[4];

// Define angles
const int startAngle = 0;
const int midAngle = 180;
const int delayTime = 500;

void setup() {
    Serial.begin(9600);
    Serial.println("Enter a number (1-4) to rotate the corresponding servo motor.");
}

void loop() {
    if (Serial.available() > 0) {
        String input = Serial.readStringUntil('\n');
        input.trim();

        if (input.length() > 0 && input.charAt(0) >= '1' && input.charAt(0) <= '4') {
            int servoIndex = input.charAt(0) - '1';
            rotateServo360(servoIndex);
            Serial.print("Servo ");
            Serial.print(servoIndex + 1);
            Serial.println(" rotated 360 degrees.");
        } else {
            Serial.println("Invalid input! Your input was \"" + input + "\". Enter a number between 1 and 4.");
        }
    }
}

void rotateServo360(int index) {
    servos[index].attach(servoPins[index]); // Attach only the active servo

    for (int i = 0; i < 2; i++) {
        servos[index].write(90);
        delay(delayTime);
        servos[index].write(180);
        delay(delayTime);
        servos[index].write(0);  // Reset quickly without pause
        delay(50); // Very short delay to allow for reset, adjust as needed
    }

    servos[index].detach(); // Stop sending signals
}
