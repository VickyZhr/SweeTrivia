import requests

def download_csv_from_drive(file_id: str, dest_path: str = 'questions.csv'):
    url = f'https://drive.google.com/uc?export=download&id={file_id}'
    session = requests.Session()
    response = session.get(url, stream=True)

    # If it's a confirmation page, try to bypass
    for key, value in response.cookies.items():
        if key.startswith('download_warning'):
            confirm_token = value
            url = f'https://drive.google.com/uc?export=download&confirm={confirm_token}&id={file_id}'
            response = session.get(url, stream=True)

    print(f"🔍 Downloaded {len(response.content)} bytes from Google Drive")

    with open(dest_path, 'wb') as f:
        f.write(response.content)
