import time
import random
from machine import Pin, I2C
from lcd_api import LcdApi
from i2c_lcd import I2cLcd

# Define I2C and LCD address
I2C_ADDR_QUESTION = 0x27  # Adjust based on your LCD
I2C_ADDR_SCORE = 0x26     # Adjust based on your LCD
I2C_ADDR_TIME = 0x25      # Adjust based on your LCD

# I2C Initialization (Pins: SDA=Pin 0, SCL=Pin 1)
i2c = I2C(0, scl=Pin(1), sda=Pin(0), freq=400000)

# LCD Initialization
lcd_question = I2cLcd(i2c, I2C_ADDR_QUESTION, 2, 16)  # 16x2 LCD for questions
lcd_score = I2cLcd(i2c, I2C_ADDR_SCORE, 2, 16)        # 16x2 LCD for score
lcd_time = I2cLcd(i2c, I2C_ADDR_TIME, 2, 16)          # 16x2 LCD for timer

# Define Buttons
btn_A = Pin(10, Pin.IN, Pin.PULL_UP)
btn_B = Pin(11, Pin.IN, Pin.PULL_UP)
btn_C = Pin(12, Pin.IN, Pin.PULL_UP)
btn_D = Pin(13, Pin.IN, Pin.PULL_UP)

# Define Questions and Answers
QUESTIONS = [
    ("1+1=?", {"A": "1", "B": "2", "C": "3", "D": "4"}, "B"),
    ("Color of broccoli?", {"A": "red", "B": "blue", "C": "green", "D": "black"}, "C"),
]

def clear_lcds():
    """Clears all LCD screens"""
    lcd_question.clear()
    lcd_score.clear()
    lcd_time.clear()

def update_score(score):
    """Updates the score LCD"""
    lcd_score.clear()
    lcd_score.putstr(f"Score: {score}")

def update_timer(time_left):
    """Updates the timer LCD"""
    lcd_time.clear()
    lcd_time.putstr(f"Time: {time_left}s")

def ask_question():
    """Displays a random question and options on the LCD"""
    lcd_question.clear()
    question, options, correct_answer = random.choice(QUESTIONS)

    lcd_question.putstr(question)  # Display question
    time.sleep(1)  # Small delay before showing options
    lcd_question.clear()

    lcd_question.putstr(f"A.{options['A']} B.{options['B']}\nC.{options['C']} D.{options['D']}")
    
    return correct_answer

def read_button():
    """Waits for button press and returns A, B, C, or D"""
    while True:
        if btn_A.value() == 0:
            return "A"
        elif btn_B.value() == 0:
            return "B"
        elif btn_C.value() == 0:
            return "C"
        elif btn_D.value() == 0:
            return "D"
        time.sleep(0.1)  # Prevent rapid polling

def game_loop():
    """Main game logic"""
    clear_lcds()
    lcd_question.putstr("Press any btn\nto start!")
    
    while btn_A.value() and btn_B.value() and btn_C.value() and btn_D.value():
        time.sleep(0.1)  # Wait until a button is pressed

    score = 0
    start_time = time.time()

    while True:
        elapsed_time = time.time() - start_time
        time_left = max(10 - int(elapsed_time), 0)
        
        update_score(score)
        update_timer(time_left)

        if time_left == 0:
            break  # End game when time is up

        correct_answer = ask_question()
        user_input = read_button()

        lcd_question.clear()
        if user_input == correct_answer:
            lcd_question.putstr("Correct!")
            score += 10
        else:
            lcd_question.putstr("Incorrect!")

        update_score(score)  # Update score after every question
        time.sleep(1.5)

    # Game Over Display
    lcd_question.clear()
    lcd_question.putstr(f"Game Over!\nScore: {score}")
    time.sleep(3)
    
    game_loop()  # Restart game automatically

# Start the game
game_loop()
