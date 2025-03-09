import csv
import json

# Input and output file names
csv_filename = "questions_and_choices.csv"  # Make sure this is the correct filename
json_filename = "questions_and_choices.json"

# Read CSV and convert to JSON format
questions = []
with open(csv_filename, mode="r", encoding="utf-8") as file:
    csv_reader = csv.DictReader(file)

    for row in csv_reader:
        question_data = {
            "question": row["Question"],  # Adjust column names if necessary
            "options": {
                "A": row["Answer Option 1"],
                "B": row["Answer Option 2"],
                "C": row["Answer Option 3"],
                "D": row["Answer Option 4"]
            }
        }
        questions.append(question_data)

# Save the formatted JSON file
with open(json_filename, "w", encoding="utf-8") as json_file:
    json.dump(questions, json_file, indent=4, ensure_ascii=False)

print(f"Successfully converted {csv_filename} to {json_filename}!")
