import os
import sys
import json
import requests
from google.oauth2 import service_account
from googleapiclient.discovery import build

# Ensure access to sibling modules
sys.path.append(os.path.abspath(".."))
from standard_code.convert_csv_to_json import convert_and_append

# ========== CONFIG ==========
SERVICE_ACCOUNT_FILE = '../public/data/service_account_key.json'  # Place in same dir as script
UPLOAD_FOLDER_ID = '1OFwXpixZoprnl1eC9NIv-vQwzAiU4D3P'  # Your Uploads folder ID
CSV_DEST_PATH = '../public/data/questions.csv'
JSON_DB_PATH = '../public/data/questions_and_choices.json'
# ============================

# Authenticate with Google Drive API
SCOPES = ['https://www.googleapis.com/auth/drive.readonly'] 
credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES)
drive_service = build('drive', 'v3', credentials=credentials)

# Step 1: Get latest CSV in Uploads folder
results = drive_service.files().list(
    q=f"'{UPLOAD_FOLDER_ID}' in parents and mimeType='text/csv'",
    orderBy='modifiedTime desc',
    pageSize=1,
    fields='files(id, name, modifiedTime)'
).execute()

files = results.get('files', [])

if not files:
    print("❌ No CSV files found in Google Drive folder.")
    sys.exit(1)

latest_file = files[0]
file_id = latest_file['id']
print(f"📥 Downloading latest file: {latest_file['name']}")

# Step 2: Download CSV using the file ID
def download_csv_from_drive(file_id, dest_path):
    url = f"https://drive.google.com/uc?export=download&id={file_id}"
    response = requests.get(url)
    if response.status_code == 200:
        with open(dest_path, 'wb') as f:
            f.write(response.content)
        print(f"✅ Downloaded CSV to {dest_path}")
    else:
        print("❌ Failed to download file")
        sys.exit(1)

download_csv_from_drive(file_id, CSV_DEST_PATH)

# Step 3: Append new questions to master JSON DB
convert_and_append(CSV_DEST_PATH, JSON_DB_PATH)
