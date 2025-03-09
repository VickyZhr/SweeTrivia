import pyttsx3
import json
import random

# Initialize pyttsx3 engine
engine = pyttsx3.init()
engine.setProperty('rate', 150)
engine.setProperty('volume', 1.0) # Max volume

# Set voice (change index if needed)
voices = engine.getProperty('voices')
engine.setProperty('voice', voices[108].id) # Used com.apple.voice.compact.en-US.Samantha for now

# Load questions from JSON file
with open('questions_and_choices.json', 'r') as file:
    trivia_questions = json.load(file)

def narrate_question(question_data):
    """Speak the question and its multiple-choice options."""
    question = question_data["question"]
    options = question_data["options"]

    print("\nQuestion:", question)
    engine.say(question)
    engine.runAndWait()

    # Pause for clarity
    engine.say("Here are your choices.")
    engine.runAndWait()

    # Narrate each answer option
    for key, value in options.items():
        option_text = f"{key}. {value}"
        print(option_text)
        engine.say(option_text)
        engine.runAndWait()

# Pick a random question
question_data = random.choice(trivia_questions)

# Speak the question and options
narrate_question(question_data)