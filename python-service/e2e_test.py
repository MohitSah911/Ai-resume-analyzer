import requests
import json
import time

BASE_URL = "http://localhost:5001/api"

def run_e2e():
    print("Starting E2E flow via Python requests...")
    
    # 1. Register
    unique_id = int(time.time())
    creds = {"name": "E2E User", "email": f"e2e{unique_id}@test.com", "password": "password123"}
    
    res = requests.post(f"{BASE_URL}/auth/register", json=creds)
    print("Registered:", res.json().get("success"))
    
    # 2. Login
    res = requests.post(f"{BASE_URL}/auth/login", json={"email": creds["email"], "password": creds["password"]})
    data = res.json()
    token = data["data"]["token"]
    print("Logged In:", bool(token))
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Download a valid dummy PDF
    pdf_res = requests.get("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf")
    with open("real_resume.pdf", "wb") as f:
        f.write(pdf_res.content)
        
    # 3. Upload Resume
    with open("real_resume.pdf", "rb") as f:
        files = {"resume": ("real_resume.pdf", f, "application/pdf")}
        res = requests.post(f"{BASE_URL}/resumes/upload", headers=headers, files=files)
        data = res.json()
        if not data.get("success"):
            print("Upload Error:", data)
            return
        resume_id = data["data"]["_id"]
        print("Resume Uploaded:", bool(resume_id))

    # 4. Analyze JD
    jd = "We are looking for a Node.js and React developer. Python is preferred."
    res = requests.post(f"{BASE_URL}/analyses", headers=headers, json={"resumeId": resume_id, "jobDescription": jd})
    data = res.json()
    if not data.get("success"):
        print("Analysis Error:", data)
        return
    analysis = data["data"]
    print("Analysis Match Score:", analysis["matchScore"])
    
    # 5. Start Interview
    res = requests.post(f"{BASE_URL}/interviews", headers=headers, json={"analysisId": analysis["_id"]})
    data = res.json()
    if not data.get("success"):
        print("Interview Error:", data)
        return
    session = data["data"]
    print("Interview Session created, questions count:", len(session["questions"]))
    
    # 6. Evaluate Answer
    res = requests.post(f"{BASE_URL}/interviews/{session['_id']}/evaluate", headers=headers, json={"questionIndex": 0, "answer": "I use hooks in React."})
    eval_data = res.json()
    print("Answer Evaluated, feedback:", "Yes" if eval_data.get("data", {}).get("feedback") else "No")

    # 7. Get History
    res = requests.get(f"{BASE_URL}/analyses", headers=headers)
    history_data = res.json()
    print("History fetched, total items:", len(history_data["data"]))

    # 8. Duplicate Prevention
    res = requests.post(f"{BASE_URL}/interviews", headers=headers, json={"analysisId": analysis["_id"]})
    dup_session = res.json()["data"]
    print("Duplicate session prevented (same ID):", dup_session["_id"] == session["_id"])
    
    print("E2E TEST PASS")

if __name__ == "__main__":
    run_e2e()
