import ujson
import urandom
from machine import Pin

# Load questions from the JSON file
with open('questions.json', 'r') as file:
    trivia_questions = ujson.load(file)

def narrate_question(question):
    print(f"Narrating: {question}")
    # Here, instead of os.system/espeak-ng, you can trigger an external module via serial or sound output

# Pick a random question
question = urandom.choice(trivia_questions)["question"].strip()

# Speak the question
narrate_question(question)