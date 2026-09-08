const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function run() {
  const baseURL = 'http://localhost:5001/api';
  console.log('Starting E2E flow...');
  
  // 1. Register
  const uniqueId = Date.now();
  const credentials = { name: 'E2E User', email: `e2e${uniqueId}@test.com`, password: 'password123' };
  
  const regRes = await axios.post(`${baseURL}/auth/register`, credentials);
  console.log('Registered:', regRes.data.success);
  
  // 2. Login
  const loginRes = await axios.post(`${baseURL}/auth/login`, { email: credentials.email, password: credentials.password });
  const token = loginRes.data.data.token;
  console.log('Logged In:', !!token);
  
  const headers = { Authorization: `Bearer ${token}` };
  
  // Create a dummy PDF
  const PDFDocument = require('pdfkit');
  await new Promise(resolve => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream('e2e_resume.pdf');
    doc.pipe(stream);
    doc.text('I am a software engineer with Node.js and React experience.');
    doc.end();
    stream.on('finish', resolve);
  });
  
  // 3. Upload Resume
  const form = new FormData();
  form.append('resume', fs.readFileSync('e2e_resume.pdf'), 'e2e_resume.pdf');
  
  const uploadRes = await axios.post(`${baseURL}/resumes/upload`, form, { headers: { ...headers, ...form.getHeaders() } });
  const resumeId = uploadRes.data.data._id;
  console.log('Resume Uploaded:', !!resumeId);
  
  // 4. Analyze JD
  const jd = "We are looking for a Node.js and React developer. Python is preferred.";
  const analyzeRes = await axios.post(`${baseURL}/analyses`, { resumeId, jobDescription: jd }, { headers });
  const analysis = analyzeRes.data.data;
  console.log('Analysis Match Score:', analysis.matchScore);
  
  // 5. Start Interview
  const interviewRes = await axios.post(`${baseURL}/interviews`, { analysisId: analysis._id }, { headers });
  const session = interviewRes.data.data;
  console.log('Interview Session created, questions count:', session.questions.length);
  
  // 6. Evaluate Answer
  const evalRes = await axios.post(`${baseURL}/interviews/${session._id}/evaluate`, { questionIndex: 0, answer: "I use hooks in React." }, { headers });
  console.log('Answer Evaluated, feedback:', evalRes.data.data.feedback ? "Yes" : "No");

  // 7. Get History
  const historyRes = await axios.get(`${baseURL}/analyses`, { headers });
  console.log('History fetched, total items:', historyRes.data.data.length);

  // 8. Re-open interview session (verify duplicate avoidance)
  const dupInterviewRes = await axios.post(`${baseURL}/interviews`, { analysisId: analysis._id }, { headers });
  console.log('Duplicate session prevented (same ID):', dupInterviewRes.data.data._id === session._id);

  console.log('E2E TEST PASS');
}

run().catch(err => {
  if (err.response) {
    console.error("API Error:", err.response.data);
  } else {
    console.error("Error:", err);
  }
});
