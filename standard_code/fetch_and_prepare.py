import os
import io
import sys
import csv
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from convert_csv_to_json import convert_and_append

# 📍 Get absolute paths relative to this script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SERVICE_ACCOUNT_FILE = os.path.join(SCRIPT_DIR, 'service_account_key.json')
CSV_DEST_PATH = os.path.join(SCRIPT_DIR, 'public', 'data', 'questions.csv')
JSON_DEST_PATH = os.path.join(SCRIPT_DIR, 'public', 'data', 'questions_and_choices.json')

UPLOAD_FOLDER_ID = "1OFwXpixZoprnl1eC9NIv-vQwzAiU4D3P"

# 🔐 Load credentials
credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE,
    scopes=["https://www.googleapis.com/auth/drive"],
)

drive_service = build("drive", "v3", credentials=credentials)

def find_latest_csv_file(folder_id):
    query = f"'{folder_id}' in parents and mimeType='text/csv'"
    results = drive_service.files().list(
        q=query, orderBy='createdTime desc', pageSize=1, fields="files(id, name, createdTime)"
    ).execute()
    files = results.get("files", [])
    return files[0]["id"] if files else None

def download_csv_from_drive(file_id, dest_path):
    request = drive_service.files().get_media(fileId=file_id)
    fh = io.BytesIO()
    downloader = MediaIoBaseDownload(fh, request)

    done = False
    while not done:
        status, done = downloader.next_chunk()

    fh.seek(0)
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    with open(dest_path, "wb") as f:
        f.write(fh.read())

# 🚀 Main execution
file_id = find_latest_csv_file(UPLOAD_FOLDER_ID)
if not file_id:
    print("❌ No CSV files found in upload folder.")
    sys.exit(1)

print("⬇️  Downloading latest CSV from Google Drive...")
download_csv_from_drive(file_id, CSV_DEST_PATH)

print("✅ CSV downloaded. Converting to JSON...")
convert_and_append(CSV_DEST_PATH, JSON_DEST_PATH)

print("🎉 Question set updated successfully.")
