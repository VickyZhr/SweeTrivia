import os
import json
import random

# Load questions from the JSON file
with open('questions.json', 'r') as file:
    trivia_questions = json.load(file)

def narrate_question(question):
    os.system(f'espeak-ng -v en+m3 -s 60 "{question}"')

# Pick a random question
question = random.choice(trivia_questions)["question"].strip()

# Speak the question
narrate_question(question)