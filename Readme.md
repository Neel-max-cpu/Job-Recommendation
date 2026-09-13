# Job Recommendation Engine

A backend API that matches candidates with jobs using a transparent, rule-based scoring system.

The engine evaluates candidates based on:

- Skills
- Years of experience
- Location / remote availability
- Salary compatibility

Jobs with missing **must-have skills are excluded completely**, while experience gaps and other mismatches reduce the recommendation score.

## Tech Stack

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- Prisma ORM
- Vitest
- Docker / Docker Compose

## Architecture

The application follows a simple layered architecture:

```text
Controller
    ↓
Service
    ↓
Scoring Service
    ↓
Prisma
    ↓
PostgreSQL
```

### Project Structure

```text
src/
├── controller/
├── service/
├── routes/
├── model/
│   ├── candidateModel/
│   ├── jobModel/
│   └── scoreModel/
├── lib/
│   └── prisma.ts
├── app.ts
└── server.ts

prisma/
└── schema.prisma

tests/
└── scoringService.test.ts
```

The scoring logic is kept separate from database access so that the recommendation rules can be tested independently.

---

# Getting Started

## Prerequisites

- Node.js 22+
- PostgreSQL 16+
- npm

Alternatively, Docker can be used to run both the API and PostgreSQL.

## Local Development

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/job_recommendation
```

Run PostgreSQL and apply the Prisma migrations:

```bash
npx prisma migrate deploy
```

Generate Prisma Client if required:

```bash
npx prisma generate
```

Start the development server:

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:3000
```

Health check:

```http
GET /health
```

Response:

```json
{
  "status": "ok"
}
```

To View DB:
```bash
npx prisma studio
```


---

# Docker

The project includes Docker support for running the complete application.

Start the API and PostgreSQL:

```bash
docker compose up --build
```

The API will be available at:

```text
http://localhost:3000
```

The PostgreSQL database runs as a separate Compose service.

Database migrations are automatically applied when the API container starts.

To stop the services:

```bash
docker compose down
```

To remove the database volume as well:

```bash
docker compose down -v
```

---

# API Endpoints

## Create Candidate

```http
POST /candidates/create
```

Example request:

```json
{
  "name": "NAME",
  "skills": [
    "Skil1",
    "Skil2",
    "Skil3",
  ],
  "yearsOfExperience": 1.5,
  "location": "Gurugram",
  "expectedSalary": 8
}
```

`expectedSalary` is assumed to use the same unit as the job salary range.

---

## Create Job

```http
POST /jobs/create
```

Example request:

```json
{
  "title": "Job Title",
  "requiredSkills": [
    {
      "skill": "Skill1",
      "type": "MUST_HAVE"
    },
    {
      "skill": "Skill2",
      "type": "MUST_HAVE"
    },
    {
      "skill": "Skill3",
      "type": "NICE_TO_HAVE"
    }
  ],
  "minYearsExperience": 2,
  "location": "Gurugram",
  "salaryRange": {
    "min": 7,
    "max": 12
  },
  "remoteAllowed": true
}
```

Skill types:

```text
MUST_HAVE
NICE_TO_HAVE
```

---

# Candidate Recommendations

```http
GET /recommendations/candidates/:id
```

Example:

```http
GET /recommendations/candidates/1
```

The endpoint returns jobs ranked by descending score for that particular Candidate(:id).

A limit can optionally be supplied:

```http
GET /recommendations/candidates/1?limit=5
```

Custom scoring weights can also be supplied:

```http
GET /recommendations/candidates/1?skillsWeight=60&experienceWeight=15&locationWeight=15&salaryWeight=10
```

The four weights must add up to exactly `100`.

---

# Reverse Recommendations (BONUS)

The API also supports the reverse view:

```http
GET /recommendations/jobs/:id
```

This returns candidates ranked for a specific job.

Example:

```http
GET /recommendations/jobs/1?limit=5
```

This endpoint uses the same scoring engine and therefore keeps candidate-to-job and job-to-candidate recommendations consistent.

---

# Scoring System

The recommendation score is between **0 and 100**.

The default weighting is:

| Factor | Weight |
|---|---:|
| Skills | 50 |
| Experience | 20 |
| Location | 15 |
| Salary | 15 |
| **Total** | **100** |

The scoring system is intentionally deterministic and explainable rather than using machine learning.

Each recommendation includes both the total score and its individual breakdown.

---

## 1. Skills — 50 points

Skills are divided into:

- Must-have skills: 80% of skill weight → **40 points**
- Nice-to-have skills: 20% of skill weight → **10 points**

### Must-have skills

Every must-have skill must be present.

If even one must-have skill is missing:

```text
Job is excluded from recommendations.
```

This is a hard business rule because a candidate who cannot satisfy a mandatory requirement should not be ranked above candidates who can.

Skill comparison is case-insensitive and ignores surrounding whitespace.

For example:

```text
"Java"
"java"
" Java "
```

are treated as the same skill.

### Nice-to-have skills

Nice-to-have skills do not affect eligibility.

The available 10 points are distributed proportionally based on the number of matched nice-to-have skills.

For example, if a job has two nice-to-have skills and the candidate has one:

```text
1 / 2 × 10 = 5 points
```

If a job has no nice-to-have skills, the full 10 points are awarded.

This avoids penalizing jobs simply because they did not define optional skills.

---

## 2. Experience — 20 points

Experience is capped at the full weight.

The formula is:

```text
min(candidateExperience / requiredExperience, 1) × experienceWeight
```

For example, with a 2-year requirement and a candidate with 1.5 years:

```text
1.5 / 2 × 20
= 15 points
```

A candidate with more experience than required receives the full 20 points.

Experience below the requirement does **not** exclude the candidate because the assignment explicitly requires experience gaps to be penalized rather than hard-filtered.

If a job requires zero years of experience, the candidate receives the full experience score.

---

## 3. Location — 15 points

Location has three outcomes:

| Condition | Score |
|---|---:|
| Exact location match | 15 |
| Different location + remote allowed | 10 |
| Different location + remote not allowed | 0 |

Location matching is case-insensitive.

For example:

```text
Candidate: Gurugram
Job: gurugram
```

receives the full location score.

A remote job receives a partial score rather than the full score because an exact location match is considered a stronger fit.

---

## 4. Salary — 15 points

Salary compatibility is based on the candidate's expected salary and the job's salary range.

### Job maximum below candidate expectation

```text
jobMax < expectedSalary
```

Score:

```text
0
```

The job cannot meet the candidate's minimum expectation.

### Candidate expectation at or below job minimum

```text
expectedSalary <= jobMin
```

Score:

```text
15
```

The entire salary range comfortably meets the candidate's expectation.

### Candidate expectation inside the salary range

The score is proportional to how much of the range remains above the candidate's expectation:

```text
(jobMax - expectedSalary)
-------------------------------- × salaryWeight
(jobMax - jobMin)
```

For example:

```text
Job range:        7 - 12
Expected salary:  8

(12 - 8) / (12 - 7) × 15
= 12 points
```

This rewards jobs that offer more room above the candidate's expectation.

---

# Hard Filtering vs Scoring

The system intentionally distinguishes between requirements that determine eligibility and requirements that influence ranking.

### Hard filter

Only missing **must-have skills** cause a job to be excluded.

### Soft scoring

The following affect the score but do not automatically exclude a candidate:

- Experience below the requirement
- Location mismatch
- Missing nice-to-have skills
- Salary mismatch

This prevents the recommendation engine from being unnecessarily strict while still respecting mandatory job requirements.

---

# Configurable Weights

The default weights are:

```text
skills      = 50
experience  = 20
location    = 15
salary      = 15
```

They can be overridden through query parameters:

```text
skillsWeight
experienceWeight
locationWeight
salaryWeight
```

Example:

```http
GET /recommendations/candidates/1?skillsWeight=60&experienceWeight=15&locationWeight=15&salaryWeight=10
```

All weights must:

- Be non-negative
- Be finite numbers
- Add up to exactly 100

This allows different recommendation strategies without changing the scoring implementation.

---

# Validation

The API validates candidate and job creation requests before interacting with the database.

Examples of invalid input include:

- Missing candidate name
- Empty skill list
- Negative experience
- Negative expected salary
- Missing job title
- Invalid salary ranges
- Negative minimum experience
- Invalid `remoteAllowed` value
- Missing skill type

Invalid requests return HTTP `400`.

Missing candidates/jobs return HTTP `404`.

---

# Testing

The scoring engine is covered with Vitest.

Run:

```bash
npm test
```

Current tests cover:

- Missing must-have skills
- Expected scoring calculation
- Experience cap
- Experience penalty
- Case-insensitive location
- Exact location scoring
- Remote location scoring
- Nice-to-have partial scoring
- Missing nice-to-have skills
- No nice-to-have skills
- Salary above expectation
- Salary below job maximum
- Salary equal to job minimum

The scoring logic is isolated from the database, making these business rules fast and deterministic to test.

---

# Design Decisions

### Why rule-based scoring?

The assignment does not require machine learning, and a deterministic scoring system provides:

- Explainability
- Predictable behavior
- Easy testing
- Easy weight customization
- Clear feedback through score breakdowns

A recommendation such as:

```json
{
  "score": 82,
  "breakdown": {
    "skills": 40,
    "experience": 15,
    "location": 15,
    "salary": 12
  }
}
```

makes it clear why a candidate received the recommendation.

### Why exclude missing must-have skills?

A must-have skill represents an explicit eligibility requirement. Treating it as a weighted score could allow candidates who completely lack a mandatory skill to outrank otherwise qualified candidates.

### Why penalize experience instead of filtering?

The assignment explicitly requires candidates below the minimum experience to remain eligible. The proportional score provides a gradual penalty instead of an abrupt exclusion.

---

# Assumptions

- Salary values use a consistent unit between candidates and jobs. The API does not perform currency conversion.
- Skill matching is case-insensitive and ignores leading/trailing whitespace.
- Location matching is case-insensitive.
- Exact location is considered stronger than remote eligibility.
- A remote job with a different location receives two-thirds of the location weight.
- When a job has no nice-to-have skills, the full nice-to-have portion of the skill score is awarded.
- Scores are rounded to two decimal places.
- Recommendation results are sorted by descending score.
- `limit` is optional; when provided it must be a positive integer.

---

# Future Improvements

Potential improvements for a production system include:

- Pagination for large recommendation result sets
- Database-level filtering before scoring
- More sophisticated skill normalization and aliases
  - e.g. `Postgres` vs `PostgreSQL`
- Currency and salary-period normalization
  - annual vs monthly compensation
- Candidate/job preference signals
- Industry/domain compatibility
- Recency of skills or experience
- Caching for frequently requested recommendations
- Background processing for large candidate/job datasets
- Authentication and authorization
- API documentation using OpenAPI/Swagger
- Integration tests using a dedicated test database
- More advanced ranking or ML-based recommendations if sufficient historical hiring data becomes available

---

# AI Usage Disclosure

- ### Where AI Was Used: 
  Brainstorming architecture patterns, drafting initial boilerplate/documentation, and surfacing edge cases during test planning.

- ### Manual Overrides & Human Ownership: 
  AI suggestions were frequently edited or discarded. The core scoring mechanisms, validation boundaries, final architectural patterns, and integration tests were manually authored and verified to ensure accuracy and prevent hallucinations.

---

# Scripts

```bash
npm run dev      # Start development server
npm run build    # Build TypeScript
npm start        # Start compiled server
npm test         # Run tests
```

---
