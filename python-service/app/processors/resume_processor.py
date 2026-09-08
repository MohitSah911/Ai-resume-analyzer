import re
from app.processors.skill_taxonomy import extract_skills_from_text

def extract_email(text: str):
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    match = re.search(email_pattern, text)
    return match.group(0) if match else None

def extract_phone(text: str):
    phone_pattern = r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
    match = re.search(phone_pattern, text)
    return match.group(0) if match else None

def process_resume_text(text: str):
    # Clean text
    clean_text = re.sub(r'\s+', ' ', text).strip()
    
    email = extract_email(clean_text)
    phone = extract_phone(clean_text)
    skills = extract_skills_from_text(clean_text)
    
    return {
        "email": email,
        "phone": phone,
        "skills": skills,
        "raw_text_length": len(text)
    }
