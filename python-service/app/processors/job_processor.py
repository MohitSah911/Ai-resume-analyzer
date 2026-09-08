import re
from app.processors.skill_taxonomy import extract_skills_from_text

def extract_job_info(text: str):
    clean_text = re.sub(r'\s+', ' ', text).strip()
    
    # Split into rough sentences or bullet points
    segments = re.split(r'[.!?\n]+', clean_text)
    
    required = set()
    preferred = set()
    
    preferred_keywords = ["preferred", "nice to have", "bonus", "plus", "good to have", "desired"]
    
    for segment in segments:
        skills_in_segment = extract_skills_from_text(segment)
        if not skills_in_segment:
            continue
            
        is_preferred = any(pk in segment.lower() for pk in preferred_keywords)
        
        for skill in skills_in_segment:
            if is_preferred:
                preferred.add(skill)
            else:
                required.add(skill)
                
    # A skill might be found in both (e.g., listed in requirements and later in "nice to have additional experience in X").
    # If it's in required, it takes precedence.
    preferred = preferred - required

    return {
        "requiredSkills": list(required),
        "preferredSkills": list(preferred),
        "keywords": list(required | preferred)
    }
