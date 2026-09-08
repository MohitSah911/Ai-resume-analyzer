import re

# Comprehensive centralized skill taxonomy
SKILLS_TAXONOMY = {
    # Languages
    "javascript": "JavaScript", "js": "JavaScript",
    "python": "Python", "python3": "Python",
    "java": "Java",
    "c++": "C++", "cpp": "C++",
    "c#": "C#", "csharp": "C#",
    "typescript": "TypeScript", "ts": "TypeScript",
    "go": "Go", "golang": "Go",
    "ruby": "Ruby",
    "php": "PHP",
    "swift": "Swift",
    "kotlin": "Kotlin",
    "rust": "Rust",
    
    # Frontend
    "html": "HTML", "html5": "HTML",
    "css": "CSS", "css3": "CSS",
    "react": "React", "reactjs": "React", "react.js": "React",
    "angular": "Angular", "angularjs": "Angular",
    "vue": "Vue", "vuejs": "Vue", "vue.js": "Vue",
    "next.js": "Next.js", "nextjs": "Next.js",
    
    # Backend
    "node": "Node.js", "nodejs": "Node.js", "node.js": "Node.js",
    "express": "Express", "expressjs": "Express", "express.js": "Express",
    "django": "Django",
    "flask": "Flask",
    "fastapi": "FastAPI",
    "spring": "Spring", "spring boot": "Spring", "springboot": "Spring",
    ".net": ".NET", "asp.net": ".NET", "dotnet": ".NET",
    
    # Databases
    "sql": "SQL",
    "mysql": "MySQL",
    "postgresql": "PostgreSQL", "postgres": "PostgreSQL",
    "mongodb": "MongoDB", "mongo": "MongoDB",
    "redis": "Redis",
    
    # DevOps/Cloud
    "aws": "AWS", "amazon web services": "AWS",
    "gcp": "GCP", "google cloud": "GCP", "google cloud platform": "GCP",
    "azure": "Azure", "microsoft azure": "Azure",
    "docker": "Docker",
    "kubernetes": "Kubernetes", "k8s": "Kubernetes",
    "git": "Git",
    "ci/cd": "CI/CD", "cicd": "CI/CD",
    "jenkins": "Jenkins",
    "github actions": "GitHub Actions",
    
    # ML/AI
    "machine learning": "Machine Learning", "ml": "Machine Learning",
    "deep learning": "Deep Learning", "dl": "Deep Learning",
    "nlp": "NLP", "natural language processing": "NLP",
    "generative ai": "Generative AI", "genai": "Generative AI",
    "llm": "LLM", "large language models": "LLM",
    "rag": "RAG", "retrieval augmented generation": "RAG"
}

def normalize_skill(skill: str) -> str:
    s = skill.lower().strip()
    return SKILLS_TAXONOMY.get(s, s)

def extract_skills_from_text(text: str):
    text_lower = text.lower()
    found_skills = set()
    
    # Sort keys by length descending to match longest phrases first
    keys = sorted(SKILLS_TAXONOMY.keys(), key=len, reverse=True)
    
    for key in keys:
        # Negative lookbehind and lookahead for word characters (a-z, 0-9).
        # This allows matching symbols safely (e.g. C++ instead of just C).
        pattern = rf'(?<![a-z0-9]){re.escape(key)}(?![a-z0-9])'
        if re.search(pattern, text_lower):
            found_skills.add(SKILLS_TAXONOMY[key])
            
    return list(found_skills)
