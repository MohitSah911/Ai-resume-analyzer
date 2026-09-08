from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import os

app = FastAPI(title="AI Resume Analyzer Python Service")

CLIENT_URL = os.getenv("CLIENT_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[CLIENT_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Python service is running"}

class TextPayload(BaseModel):
    text: str

from app.processors.resume_processor import process_resume_text

@app.post("/api/process-resume")
def process_resume(payload: TextPayload):
    structured_data = process_resume_text(payload.text)
    return {"status": "success", "data": structured_data}

from app.processors.job_processor import extract_job_info

@app.post("/api/process-job")
def process_job(payload: TextPayload):
    structured_data = extract_job_info(payload.text)
    return {"status": "success", "data": structured_data}

class MatchPayload(BaseModel):
    resume_skills: list
    job_required_skills: list
    job_preferred_skills: list = []

from app.services.scoring_service import calculate_match_score

@app.post("/api/calculate-match")
def calculate_match(payload: MatchPayload):
    result = calculate_match_score(
        payload.resume_skills,
        payload.job_required_skills,
        payload.job_preferred_skills
    )
    return {"status": "success", "data": result}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
