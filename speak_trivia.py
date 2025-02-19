import os
import random

# Read trivia questions from file
with open("trivia.txt", "r") as file:
    trivia_questions = file.readlines()

# Pick a random question
question = random.choice(trivia_questions).strip()

# Speak the question
os.system(f'espeak-ng -v en+m3 -s 60 "{question}"')

