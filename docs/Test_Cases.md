# RecruitIQ - Test Cases

## 1. Testing Overview

RecruitIQ was tested across the major application modules to verify frontend functionality, backend API operations, database persistence, recruitment criteria evaluation, analytics and reporting features.

Testing was performed using:

- Web browser
- RecruitIQ frontend
- Node.js/Express backend
- MySQL database
- Direct API requests
- SQL verification queries

---

## 2. Test Environment

| Component | Details |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Database Name | recruitiq |
| Backend Port | 5000 |
| Testing Type | Functional Testing |
| Database Verification | MySQL queries |

---

## 3. Candidate Management Test Cases

| Test ID | Test Case | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| TC-C01 | Open Candidates page | Candidate list should be displayed | Candidate list displayed | PASS |
| TC-C02 | Add candidate | New candidate should be stored in database | Candidate stored successfully | PASS |
| TC-C03 | Edit candidate | Candidate information should be updated | Candidate updated successfully | PASS |
| TC-C04 | Delete candidate | Candidate should be removed | Candidate deleted successfully | PASS |
| TC-C05 | Candidate count verification | UI count should match database count | 32 candidates verified | PASS |
| TC-C06 | Candidate status verification | Candidate statuses should be stored correctly | Statuses verified | PASS |

---

## 4. Job Management Test Cases

| Test ID | Test Case | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| TC-J01 | Open Jobs page | Job list should be displayed | Job list displayed | PASS |
| TC-J02 | Add job | New job should be stored in database | Job added successfully | PASS |
| TC-J03 | Edit job | Job information should be updated | Job updated successfully | PASS |
| TC-J04 | Delete job | Job should be removed | Job deleted successfully | PASS |
| TC-J05 | Job count verification | UI count should match database count | 4 jobs verified | PASS |

---

## 5. Recruitment Criteria / ATS Test Cases

| Test ID | Test Case | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| TC-A01 | Check candidate criteria | Candidate eligibility should be calculated | Criteria result returned | PASS |
| TC-A02 | Skill matching | Required and matched skills should be displayed | Matched/missing skills displayed | PASS |
| TC-A03 | Experience validation | Candidate experience should be compared with job requirement | Experience result displayed | PASS |
| TC-A04 | Education validation | Candidate education should be compared with job requirement | Education result displayed | PASS |
| TC-A05 | ATS score validation | Candidate ATS score should be compared with minimum ATS score | ATS result displayed | PASS |

### Sample Criteria Test

Candidate:

```text
Name: Neha Patil
Position: Business Analyst
Experience: 2 Years
ATS Score: 54
Status: Selected

Criteria evaluation was displayed in the RecruitIQ candidate details screen.

Result:

Criteria Result: ELIGIBLE

The criteria module evaluated the candidate against the configured recruitment requirements.

6. Interview Management Test Cases
Test ID	Test Case	Expected Result	Actual Result	Status
TC-I01	Open Interviews page	Interview records should be displayed	Interview list displayed	PASS
TC-I02	Schedule interview	New interview should be stored in database	Interview scheduled successfully	PASS
TC-I03	Update interview status	Interview status should be updated	Status updated successfully	PASS
TC-I04	Update interview score	Interview score should be stored	Interview score updated successfully	PASS
TC-I05	Delete interview	Interview should be removed	Interview deleted successfully	PASS
TC-I06	Interview count verification	UI count should match database count	5 interviews verified	PASS
7. Analytics Test Cases
Test ID	Test Case	Expected Result	Actual Result	Status
TC-AN01	Open Analytics page	Analytics dashboard should load	Analytics displayed	PASS
TC-AN02	Total candidates	Total should match database	32 candidates displayed	PASS
TC-AN03	Applied candidates	Applied count should be displayed	13 displayed	PASS
TC-AN04	Shortlisted candidates	Shortlisted count should be displayed	9 displayed	PASS
TC-AN05	Selected candidates	Selected count should be displayed	5 displayed	PASS
TC-AN06	Interview statistics	Interview count should be displayed	4 displayed	PASS
8. Reports Test Cases
Test ID	Test Case	Expected Result	Actual Result	Status
TC-R01	Open Reports page	Recruitment reports should be displayed	Reports displayed	PASS
TC-R02	Status filter	Candidates should be filtered by status	Status filtering working	PASS
TC-R03	Position filter	Candidates should be filtered by position	Position filtering working	PASS
TC-R04	Minimum ATS score filter	Candidates meeting ATS score should be displayed	ATS filtering working	PASS
TC-R05	Generate report	Report should be generated according to filters	Report generated successfully	PASS
TC-R06	CSV export	Report data should be exported as CSV	CSV export working	PASS
TC-R07	Print/PDF	Report should be printable/exportable	Print/PDF option working	PASS
9. Database Verification Test Cases
Test ID	Test Case	Expected Result	Actual Result	Status
TC-DB01	Verify candidates table	Candidate records should exist	32 records found	PASS
TC-DB02	Verify jobs table	Job records should exist	4 records found	PASS
TC-DB03	Verify interviews table	Interview records should exist	5 records found	PASS
TC-DB04	Verify selected candidates	Selected candidates should be counted correctly	5 selected candidates found	PASS
TC-DB05	Verify shortlisted candidates	Shortlisted candidates should be counted correctly	9 shortlisted candidates found	PASS
10. Database Verification Queries

The following SQL queries were used to verify the application data:

SELECT COUNT(*) AS total_candidates
FROM candidates;

SELECT COUNT(*) AS total_jobs
FROM jobs;

SELECT COUNT(*) AS total_interviews
FROM interviews;

SELECT COUNT(*) AS selected_candidates
FROM candidates
WHERE status = 'Selected';

SELECT COUNT(*) AS shortlisted_candidates
FROM candidates
WHERE status = 'Shortlisted';
Verified Results
Data	Verified Value
Total Candidates	32
Total Jobs	4
Total Interviews	5
Selected Candidates	5
Shortlisted Candidates	9
11. Overall Testing Result

All major RecruitIQ modules were tested successfully.

Modules Tested
Authentication
Candidate Management
Job Management
Recruitment Criteria / ATS
Interview Management
Analytics
Reports
Database Integration
Overall Result

PASS