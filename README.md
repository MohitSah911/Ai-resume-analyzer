# AI Resume Analyzer

An AI-powered resume analysis and mock interview platform that helps candidates evaluate their resume against a target Job Description (JD) and prepare for technical interviews.

## Features

- Resume PDF parsing and text extraction
- Automatic skill extraction from resumes
- Resume vs Job Description matching and scoring
- AI-powered resume feedback using Google Gemini API
- Personalized technical mock interview generation
- Interactive interview answer evaluation
- JWT-based authentication and authorization
- Protected user routes and user-specific resources
- Resume analysis and interview history

## Tech Stack

### Frontend

- React
- Vite
- JavaScript
- Tailwind CSS
- Axios
- React Router

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Multer
- Google Gemini API

### Python Processing Service

- Python
- FastAPI
- pdfplumber
- NumPy
- Pandas
- Pydantic
- Regex-based skill extraction

### Testing

- Jest
- Supertest
- MongoDB Memory Server
- Pytest

## Architecture

The application follows a microservices-inspired architecture with a React frontend, a Node.js/Express backend, and a separate Python/FastAPI processing service.

```text
                         React Frontend
                                |
                                v
                      Node.js / Express API
                         /            \
                        /              \
                       v                v
                  MongoDB          Gemini API
                       |
                       v
                Python / FastAPI
                Processing Service
                       |
             -------------------------
             |           |           |
             v           v           v
         PDF Parsing  Skill      Resume/JD
                      Extraction   Scoring
```

### Responsibilities

**React Frontend**

- Resume upload
- Job Description input
- Resume analysis results
- Mock interview interface
- Authentication screens
- Interview history

**Node.js / Express Backend**

- Authentication and authorization
- File upload handling
- MongoDB operations
- API routing
- Communication with the Python service
- Gemini API integration

**Python / FastAPI Service**

- PDF text extraction
- Text processing and normalization
- Skill extraction
- Resume/JD matching
- Resume scoring

## How It Works

1. User creates an account and logs in.
2. User uploads a PDF resume and provides a target Job Description.
3. The Node.js backend receives the request and coordinates processing.
4. The Python service extracts resume text and identifies relevant skills.
5. Resume skills are compared with the target Job Description.
6. A match score and analysis are returned.
7. Gemini generates additional feedback on the resume.
8. Personalized technical interview questions are generated.
9. The user completes the mock interview.
10. The system evaluates the answers.
11. Resume analysis and interview results are stored for later review.

## Running Locally

### Prerequisites

- Node.js 18+
- Python 3.14+
- MongoDB or MongoDB Atlas
- uv
- Google Gemini API key

### Setup

Clone the repository:

```bash
git clone https://github.com/MohitSah911/Ai-resume-analyzer.git
cd Ai-resume-analyzer
```

Create the backend environment file:

```text
server/.env
```

Use `server/.env.example` as a reference and add your own MongoDB and Gemini credentials.

Install dependencies:

```bash
npm run install:all
```

Start the application:

```bash
npm run dev
```

Services:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001`
- Python Service: `http://localhost:8001`

### Running Services Individually

#### Frontend

```bash
cd client
npm install
npm run dev
```

#### Backend

```bash
cd server
npm install
npm run dev
```

#### Python Service

```bash
cd python-service
uv sync
uv run uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

## Testing

### Backend Tests

```bash
cd server
npm test
```

### Python Tests

```bash
cd python-service
uv run pytest tests/
```

## Engineering Highlights

- Separated Node.js API and Python resume-processing responsibilities
- Taxonomy-based skill extraction
- Resume and Job Description matching and scoring
- JWT-based authentication and authorization
- Protected API routes and user-specific resource access
- PDF file validation
- Backend data validation and normalization
- Automated backend and Python test suites

## Project Structure

```text
ai-resume-analyzer/
│
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   └── package.json
│
├── server/                  # Node.js / Express backend
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   └── package.json
│
├── python-service/          # Python / FastAPI processing service
│   ├── app/
│   ├── src/
│   ├── tests/
│   ├── pyproject.toml
│   └── uv.lock
│
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## Security

Sensitive credentials are stored in environment variables and are not committed to the repository.

The application includes:

- JWT authentication
- Password hashing
- Protected routes
- Authorization checks
- PDF file validation
- CORS configuration
- User-specific resource protection

## Future Improvements

- Advanced semantic skill matching
- Resume improvement recommendations
- Interview difficulty selection
- Performance analytics
- Cloud deployment
- Production monitoring and logging

## Author

**Mohit Kumar**

GitHub: [MohitSah911](https://github.com/MohitSah911)