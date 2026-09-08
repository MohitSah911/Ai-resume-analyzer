import pandas as pd
import numpy as np

def calculate_match_score(resume_skills: list, job_required_skills: list, job_preferred_skills: list = None):
    job_preferred_skills = job_preferred_skills or []
    if not job_required_skills and not job_preferred_skills:
        return {
            "score": None,
            "error": "Unable to calculate a reliable match score because no recognized skills were extracted.",
            "matched_skills": [],
            "missing_skills": [],
            "breakdown": {"required_score": 0, "preferred_score": 0}
        }
        
    job_preferred_skills = job_preferred_skills or []
    
    # Use Pandas for data alignment / analysis (required by prompt)
    # We will create DataFrames to easily calculate overlaps
    
    # Create a dataframe for all skills in the job
    skills_data = []
    for s in job_required_skills:
        skills_data.append({"skill": s, "type": "required", "weight": 1.0})
    for s in job_preferred_skills:
        skills_data.append({"skill": s, "type": "preferred", "weight": 0.5})
        
    df_job = pd.DataFrame(skills_data)
    
    # Ensure uniqueness
    df_job = df_job.drop_duplicates(subset=["skill"]).set_index("skill")
    
    # Check overlaps
    df_job["matched"] = df_job.index.isin(resume_skills)
    
    # Calculate score using numpy/pandas
    df_job["earned_score"] = np.where(df_job["matched"], df_job["weight"], 0.0)
    
    total_possible = df_job["weight"].sum()
    total_earned = df_job["earned_score"].sum()
    
    match_percentage = int((total_earned / total_possible) * 100) if total_possible > 0 else 0
    
    matched_skills = df_job[df_job["matched"]].index.tolist()
    missing_skills = df_job[~df_job["matched"]].index.tolist()
    
    req_df = df_job[df_job["type"] == "required"]
    pref_df = df_job[df_job["type"] == "preferred"]
    
    req_score = int((req_df["earned_score"].sum() / req_df["weight"].sum() * 100)) if len(req_df) > 0 else 0
    pref_score = int((pref_df["earned_score"].sum() / pref_df["weight"].sum() * 100)) if len(pref_df) > 0 else 0

    return {
        "score": match_percentage,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "breakdown": {
            "required_score": req_score,
            "preferred_score": pref_score
        }
    }
