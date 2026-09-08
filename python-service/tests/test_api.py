import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "message": "Python service is running"}

def test_process_resume_no_text():
    response = client.post("/api/process-resume", json={"text": ""})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "skills" in data["data"]

def test_skill_extraction():
    text = "We need C++, C#, .NET, ASP.NET, JavaScript (JS), React, React.js, ReactJS, Node, Node.js, NodeJS, Mongo, MongoDB, Postgres, and PostgreSQL."
    from app.processors.skill_taxonomy import extract_skills_from_text
    skills = extract_skills_from_text(text)
    expected_skills = [
        "C++", "C#", ".NET", "JavaScript", "React", "Node.js", "MongoDB", "PostgreSQL"
    ]
    for skill in expected_skills:
        assert skill in skills, f"Missing {skill} in {skills}"

def test_jd_classification():
    text = "Must have strong Java and React experience. Knowledge of AWS is a plus. Python is preferred. Docker is mandatory."
    from app.processors.job_processor import extract_job_info
    data = extract_job_info(text)
    
    assert "Java" in data["requiredSkills"]
    assert "React" in data["requiredSkills"]
    assert "Docker" in data["requiredSkills"]
    
    assert "AWS" in data["preferredSkills"]
    assert "Python" in data["preferredSkills"]
    
    assert "Java" not in data["preferredSkills"]
    assert "AWS" not in data["requiredSkills"]

def test_scoring_behavior():
    from app.services.scoring_service import calculate_match_score

    # 1. Positive match
    res = calculate_match_score(["Java", "React"], ["Java", "Docker"], ["AWS"])
    assert res["score"] > 0
    assert "Java" in res["matched_skills"]
    assert "Docker" in res["missing_skills"]

    # 2. Actual 0% match
    res = calculate_match_score(["Python"], ["Java", "Docker"], ["AWS"])
    assert res["score"] == 0
    assert len(res["matched_skills"]) == 0
    assert "Java" in res["missing_skills"]

    # 3. No recognized JD skills
    res = calculate_match_score(["Python"], [], [])
    assert res["score"] is None
    assert "Unable to calculate" in res["error"]
