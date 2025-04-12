import json
import csv

# Paths (adjust if needed)
json_file = "questions_and_choices.json"
csv_file = "exported_questions.csv"

# Load JSON
with open(json_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Write CSV
with open(csv_file, 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(["Question", "Option A", "Option B", "Option C", "Option D", "Correct Answer", "Category"])

    for q in data:
        writer.writerow([
            q.get("question", ""),
            q.get("options", {}).get("A", ""),
            q.get("options", {}).get("B", ""),
            q.get("options", {}).get("C", ""),
            q.get("options", {}).get("D", ""),
            q.get("correctAnswer", ""),
            q.get("category", "General")
        ])

print(f"✅ Exported {len(data)} questions to {csv_file}")
