# RecruitIQ API Documentation

## Overview

RecruitIQ uses a Node.js and Express.js backend to provide REST APIs for authentication, job management, candidate management, recruitment criteria evaluation, interview management and recruitment analytics.

Base URL:

http://localhost:5000

---

# 1. Authentication API

## Login

### Endpoint

POST `/api/auth/login`

### Request Body

```json
{
  "email": "admin@example.com",
  "password": "your_password"
}

Description

Authenticates a recruiter/user using email and password.

Success Response
{
  "success": true,
  "message": "Login successful",
  "token": "authentication_token",
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@example.com",
    "role": "Recruiter"
  }
}

The backend login route accepts email and password from the request body.

2. Jobs API
Get All Jobs
Endpoint

GET /api/jobs

Description

Returns all jobs stored in the database.

Response
{
  "success": true,
  "jobs": []
}

The API retrieves jobs from the jobs table and orders them by ID descending.

Get Job by ID
Endpoint

GET /api/jobs/:id

Example

GET /api/jobs/1

Description

Returns details of a specific job.

Response
{
  "success": true,
  "job": {}
}

Returns 404 if the requested job does not exist.

Create Job
Endpoint

POST /api/jobs

Request Body
{
  "title": "Data Analyst",
  "department": "Analytics",
  "location": "Pune",
  "experience": "0-2 years",
  "skills": "SQL, Python, Power BI",
  "salary": "5 LPA",
  "description": "Data analysis role",
  "status": "Open",
  "minimum_experience": "0-2 years",
  "education": "BE/BTech",
  "minimum_ats_score": 60,
  "required_skills": "SQL, Python, Power BI"
}
Response
{
  "success": true,
  "message": "Job created successfully"
}

The backend exposes the job creation route at POST /api/jobs.

Update Job
Endpoint

PUT /api/jobs/:id

Example

PUT /api/jobs/1

Request Body
{
  "title": "Senior Data Analyst",
  "department": "Analytics",
  "location": "Pune",
  "experience": "2-4 years",
  "status": "Open"
}
Response
{
  "success": true,
  "message": "Job updated successfully"
}

The backend provides a job update route using PUT /api/jobs/:id.

Delete Job
Endpoint

DELETE /api/jobs/:id

Example

DELETE /api/jobs/5

Response
{
  "success": true,
  "message": "Job deleted successfully"
}
3. Candidates API
Get All Candidates
Endpoint

GET /api/candidates

Description

Returns all candidates along with related job information.

Response
{
  "success": true,
  "candidates": []
}

The API joins candidate records with the jobs table using job_id.

Get Candidate by ID
Endpoint

GET /api/candidates/:id

Example

GET /api/candidates/8

Response
{
  "success": true,
  "candidate": {}
}

Returns 404 if the candidate does not exist.

Create Candidate
Endpoint

POST /api/candidates

Request Body
{
  "name": "Neha Patil",
  "email": "neha.patil@gmail.com",
  "phone": "9876543210",
  "job_id": 2,
  "position": "Business Analyst",
  "experience": "2 Years",
  "education": "MBA",
  "skills": "Excel, SQL, Power BI",
  "status": "Applied",
  "applied_date": "2026-08-10",
  "notes": "",
  "resume_text": ""
}
Response
{
  "success": true,
  "message": "Candidate added successfully"
}

The candidate creation API accepts candidate information including job, position, experience, education, skills and status.

Update Candidate
Endpoint

PUT /api/candidates/:id

Example

PUT /api/candidates/8

Response
{
  "success": true,
  "message": "Candidate updated successfully"
}

The update operation also returns the calculated ATS score and ATS label.

Delete Candidate
Endpoint

DELETE /api/candidates/:id

Example

DELETE /api/candidates/8

Response
{
  "success": true,
  "message": "Candidate deleted successfully"
}

When deleting a candidate, associated interview records are also removed before the candidate record is deleted.

4. Recruitment Criteria / ATS API
Check Candidate Criteria
Endpoint

GET /api/candidates/:id/criteria

Example

GET /api/candidates/8/criteria

Description

Checks whether a candidate satisfies the requirements of the job associated with the candidate.

The API evaluates:

Required skills
Minimum experience
Education
Minimum ATS score
Response
{
  "success": true,
  "candidate": {
    "id": 8,
    "name": "Neha Patil",
    "email": "neha.patil@gmail.com",
    "position": "Business Analyst",
    "status": "Selected",
    "ats_score": 54
  },
  "job": {
    "title": "Business Analyst",
    "minimum_experience": "2 years",
    "education": "BE/BTech",
    "minimum_ats_score": 60,
    "required_skills": "Excel, SQL, Power BI, Tableau"
  },
  "criteria": {
    "eligible": false,
    "skills_pass": true,
    "experience_pass": true,
    "education_pass": false,
    "ats_pass": false
  }
}

The criteria API joins the candidate with its job and runs the recruitment criteria check.

5. Interviews API
Get All Interviews
Endpoint

GET /api/interviews

Description

Returns interview records with candidate and job information.

Response
{
  "success": true,
  "interviews": []
}

The API joins interviews with candidates and jobs to provide candidate and job details.

Create Interview
Endpoint

POST /api/interviews

Request Body
{
  "candidate_id": 21,
  "job_id": 2,
  "interview_date": "2026-08-12",
  "interview_time": "10:00",
  "interviewer": "HR Amar Sen",
  "interview_type": "Offline",
  "status": "Scheduled",
  "meeting_link": "",
  "interview_score": 0,
  "notes": ""
}
Required Fields
candidate_id
interview_date
interview_time

The backend validates these three fields before creating an interview.

Update Interview
Endpoint

PUT /api/interviews/:id

Example

PUT /api/interviews/5

Response
{
  "success": true,
  "message": "Interview updated successfully"
}

Interview status and interview score can be updated. The interview score is also stored against the candidate.

Delete Interview
Endpoint

DELETE /api/interviews/:id

Example

DELETE /api/interviews/5

Response
{
  "success": true,
  "message": "Interview deleted successfully"
}
6. Analytics APIs
Analytics Summary
Endpoint

GET /api/analytics/summary

Description

Returns recruitment summary statistics.

Metrics
Total candidates
Applied candidates
Shortlisted candidates
Selected candidates
Interviewed candidates
Rejected candidates
Average ATS score

The summary is calculated directly from the candidates table.

Candidate Status Analytics
Endpoint

GET /api/analytics/status

Description

Returns candidate distribution by recruitment status.

Example Response
{
  "success": true,
  "data": [
    {
      "status": "Applied",
      "total": 13
    },
    {
      "status": "Shortlisted",
      "total": 9
    }
  ]
}

The API groups candidates by their status and counts each group.

ATS Leaderboard
Endpoint

GET /api/analytics/ats-leaderboard

Description

Returns the top candidates ordered by ATS score.

Response
{
  "success": true,
  "data": []
}

The backend orders candidates by ATS score in descending order and returns the top 10 records.

7. Common HTTP Status Codes
Status Code	Meaning
200	Request successful
201	Resource created
400	Invalid request / missing required data
404	Resource not found
500	Internal server/database error
8. Database

Database:

recruitiq

Main tables:

users
jobs
candidates
interviews

The database schema is available in:

database/schema.sql
9. Backend Technology

The API server is implemented using:

Node.js
Express.js
MySQL2
CORS

The backend communicates with the MySQL database and provides JSON responses to the frontend.


# 10. API Testing

The APIs were tested using:

- Browser
- Frontend application
- MySQL verification
- Direct API requests

Major tested areas include:

- Candidate CRUD
- Job CRUD
- Interview CRUD
- Criteria checking
- ATS calculation
- Analytics

The Reports module was also tested through the frontend application, including:

- Report generation
- Status filtering
- Position filtering
- Minimum ATS score filtering
- CSV export
- Print/PDF functionality