# import csv
# import json

# # Input and output file names
# csv_filename = "questions_and_choices.csv"  # Make sure this is the correct filename
# json_filename = "questions_and_choices.json"

# # Read CSV and convert to JSON format
# questions = []
# with open(csv_filename, mode="r", encoding="utf-8") as file:
#     csv_reader = csv.DictReader(file)

#     for row in csv_reader:
#         question_data = {
#             "question": row["Question"],  # Adjust column names if necessary
#             "options": {
#                 "A": row["Answer Option 1"],
#                 "B": row["Answer Option 2"],
#                 "C": row["Answer Option 3"],
#                 "D": row["Answer Option 4"]
#             }
#         }
#         questions.append(question_data)

# # Save the formatted JSON file
# with open(json_filename, "w", encoding="utf-8") as json_file:
#     json.dump(questions, json_file, indent=4, ensure_ascii=False)

# print(f"Successfully converted {csv_filename} to {json_filename}!")


import csv
import json
import os

def convert_and_append(csv_file, json_file):
    # Step 1: Load existing JSON if it exists
    if os.path.exists(json_file):
        with open(json_file, 'r', encoding='utf-8') as jf:
            existing_data = json.load(jf)
    else:
        existing_data = []

    # Step 2: Load new data from CSV
    with open(csv_file, mode="r", encoding="utf-8") as file:
        csv_reader = csv.DictReader(file)
        csv_reader.fieldnames = [field.strip() for field in csv_reader.fieldnames]
        new_data = []
        for row in csv_reader:
            question_data = {
                "question": row["Question"],
                "options": {
                    "A": row["Option A"],
                    "B": row["Option B"],
                    "C": row["Option C"],
                    "D": row["Option D"]
                }
            }
            new_data.append(question_data)

    # Step 3: Combine and remove duplicates (optional)
    all_questions = existing_data + new_data
    # Optional: remove duplicates based on the "question" text
    seen = set()
    unique_questions = []
    for q in all_questions:
        q_text = q["question"]
        if q_text not in seen:
            seen.add(q_text)
            unique_questions.append(q)

    # Step 4: Save updated JSON
    with open(json_file, "w", encoding="utf-8") as json_file:
        json.dump(unique_questions, json_file, indent=4, ensure_ascii=False)

    print(f"✅ Appended {len(new_data)} new question(s) → {json_file.name}")
