from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import httpx

load_dotenv()

app = FastAPI()

LINGO_API_KEY = os.getenv("LINGO_API_KEY")

class TranslationRequest(BaseModel):
    text: str
    target_lang: str

@app.post("/translate")
async def translate_text(request: TranslationRequest):
    url = "https://api.lingo.dev/v1/translate"
    headers = {
        "Authorization": f"Bearer {LINGO_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "text": request.text,
        "target_lang": request.target_lang
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()

    return {"translated_text": data.get("translated_text", "No translation received")}
