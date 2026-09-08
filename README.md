# AI Resume Analyzer

An intelligent resume analysis and mock interview platform designed to help candidates prepare for product-based company interviews.

## Features

- **Resume Parsing & Skill Extraction:** Automatically extracts text from PDF resumes using `pdfplumber` and identifies core skills using a robust taxonomy-based matching algorithm.
- **Job Description Matching:** Compares extracted skills against a target Job Description (JD) to calculate a match score based on required vs. preferred skills.
- **AI-Powered Feedback:** Utilizes Google's Gemini API to provide constructive, fact-checked feedback on resume strengths and missing skills.
- **Mock Interview Generation:** Automatically generates personalized, technical interview questions based on the candidate's specific resume and the target JD.
- **Interactive Interview Evaluation:** Conducts a step-by-step mock interview, evaluating candidate answers in real-time.

## Architecture

The system follows a microservices-inspired architecture:

- **Frontend (React/Vite):** A dynamic, responsive UI allowing users to upload resumes, paste JDs, view analysis, and practice interviews.
- **Gateway/Backend (Node.js/Express):** Handles user authentication, file uploads, database operations (MongoDB), orchestrates requests, and directly interfaces with the Gemini API for generative AI tasks.
- **Processing Service (Python/FastAPI):** A dedicated text processing engine responsible for PDF parsing, text normalization, regex-based skill extraction, and scoring algorithms using `numpy`/`pandas`.

## Prerequisites

- **Node.js** (v18+)
- **Python** (v3.14+)
- **uv** (Python package manager)
- **MongoDB** (Local instance or Atlas cluster)
- **Google Gemini API Key**

## Setup Instructions

### 1. Database & Environment

1. Ensure MongoDB is running locally or you have an Atlas connection string.
2. Navigate to the `server/` directory and copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Update `.env` with your `MONGO_URI`, `JWT_SECRET`, and `GEMINI_API_KEY`.
4. (Optional) In `python-service/`, copy `.env.example` to `.env` if you need specific Python configs.

### 2. Quick Start (All Services)

We have provided a unified command to install and start all services concurrently from the root directory.

```bash
# Install dependencies for root, server, client, and python-service
npm run install:all

# Start all three services concurrently
npm run dev
```

The services will start on:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001`
- Python Service: `http://localhost:8001`

### 3. Individual Service Startup (Optional)

If you prefer to run services individually:

**Node.js Backend**
```bash
cd server
npm install
npm run dev
```

**Python Processing Service**
```bash
cd python-service
uv pip install -r pyproject.toml
uv run uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

**React Frontend**
```bash
cd client
npm install
npm run dev
```

## Testing

**Backend Tests (Node.js)**
```bash
cd server
npm run test
```

**Python Tests**
```bash
cd python-service
uv run pytest tests/
```

## Engineering Notes

- **Skill Extraction:** We utilize a taxonomy-based approach (`skill_taxonomy.py`) with word-boundary lookarounds to safely extract complex skill symbols (e.g., `C++`, `.NET`) without catastrophic regex backtracking.
- **Data Contracts:** The Node.js Gateway handles data normalization to ensure that potential malformed outputs from the Python service do not break the frontend UI.
- **Security:** Standard protections including CORS enforcement, file type validation (PDF only), authentication (JWT), and IDOR protection on sensitive resources.
