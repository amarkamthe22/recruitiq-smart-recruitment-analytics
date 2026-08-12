const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const crypto = require("crypto");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// =====================================================
// MYSQL CONNECTION
// =====================================================

const db = mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "amar3612@+",
    database: "recruitiq"
});

const PORT = 5000;

// =====================================================
// HELPERS
// =====================================================

function normalize(value) {
    return String(value || "")
        .toLowerCase()
        .trim();
}

function num(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function parseYears(value) {
    const text = String(value || "").toLowerCase();

    if (text.includes("fresher")) return 0;

    const match = text.match(/\d+(?:\.\d+)?/);

    return match ? Number(match[0]) : 0;
}

function parseMinimumYears(value) {
    const match = String(value || "")
        .match(/\d+(?:\.\d+)?/);

    return match ? Number(match[0]) : 0;
}

function splitSkills(value) {
    return String(value || "")
        .split(",")
        .map(x => normalize(x))
        .filter(Boolean);
}

function token() {
    return crypto.randomBytes(32).toString("hex");
}

// =====================================================
// POSITION SKILLS
// =====================================================

const POSITION_SKILLS = {

    "Data Analyst": [
        "sql",
        "python",
        "power bi",
        "excel",
        "tableau",
        "statistics",
        "pandas",
        "numpy"
    ],

    "Business Analyst": [
        "sql",
        "excel",
        "power bi",
        "tableau",
        "analytics",
        "requirements",
        "communication"
    ],

    "Data Engineer": [
        "python",
        "sql",
        "etl",
        "aws",
        "spark"
    ],

    "Python Developer": [
        "python",
        "django",
        "flask",
        "fastapi",
        "sql",
        "git",
        "api"
    ],

    "DevOps Engineer": [
        "aws",
        "docker",
        "kubernetes",
        "linux",
        "git",
        "jenkins"
    ],

    "Product Designer": [
        "figma",
        "ui",
        "ux",
        "prototyping"
    ]
};

// =====================================================
// ATS CALCULATION
// =====================================================

function calculateATS(data) {

    const position =
        data.position || "Data Analyst";

    const required =
        POSITION_SKILLS[position] ||
        POSITION_SKILLS["Data Analyst"];

    const text = normalize(
        `${data.skills || ""} ${data.resume_text || ""}`
    );

    const matched = required.filter(skill =>
        text.includes(skill)
    );

    // Skills = 40
    const skillScore =
        Math.round(
            (matched.length / required.length) * 40
        );

    // Experience = 15
    const years =
        parseYears(data.experience);

    const experienceScore =
        Math.min(
            15,
            Math.round((years / 2) * 15)
        );

    // Education = 10
    const education =
        normalize(
            data.education ||
            data.qualification
        );

    let educationScore = 0;

    if (education) {

        if (
            education.includes("be") ||
            education.includes("b.e") ||
            education.includes("btech") ||
            education.includes("b.tech") ||
            education.includes("bachelor") ||
            education.includes("engineering") ||
            education.includes("bsc") ||
            education.includes("mca") ||
            education.includes("mba") ||
            education.includes("master")
        ) {
            educationScore = 10;
        } else {
            educationScore = 7;
        }
    }

    // Aptitude = 15
    const aptitude =
        Math.max(
            0,
            Math.min(
                100,
                num(data.aptitude_score)
            )
        );

    const aptitudeScore =
        Math.round(aptitude * 0.15);

    // Interview = 20
    const interview =
        Math.max(
            0,
            Math.min(
                100,
                num(data.interview_score)
            )
        );

    const interviewScore =
        Math.round(interview * 0.20);

    const score =
        Math.min(
            100,
            skillScore +
            experienceScore +
            educationScore +
            aptitudeScore +
            interviewScore
        );

    let label = "Low Match";

    if (score >= 80) {
        label = "Strong Match";
    }
    else if (score >= 60) {
        label = "Good Match";
    }
    else if (score >= 40) {
        label = "Moderate Match";
    }

    return {
        score,
        label,
        matched
    };
}

// =====================================================
// RECRUITMENT CRITERIA
// =====================================================

function checkCriteria(candidate, job) {

    const requiredSkills =
        splitSkills(
            job.required_skills ||
            job.skills
        );

    const candidateSkills =
        splitSkills(candidate.skills);

    const matchedSkills =
        requiredSkills.filter(required =>
            candidateSkills.some(candidateSkill =>
                candidateSkill === required ||
                candidateSkill.includes(required) ||
                required.includes(candidateSkill)
            )
        );

    const missingSkills =
        requiredSkills.filter(required =>
            !candidateSkills.some(candidateSkill =>
                candidateSkill === required ||
                candidateSkill.includes(required) ||
                required.includes(candidateSkill)
            )
        );

    const candidateExperience =
        parseYears(candidate.experience);

    const minimumExperience =
        parseMinimumYears(
            job.minimum_experience ||
            job.experience
        );

    const experiencePass =
        candidateExperience >= minimumExperience;

    const education =
        normalize(
            candidate.education ||
            candidate.qualification
        );

    const requiredEducation =
        normalize(job.education);

    let educationPass = true;

    if (
        requiredEducation &&
        requiredEducation !== "any"
    ) {

        educationPass =
            education.includes("be") ||
            education.includes("b.e") ||
            education.includes("btech") ||
            education.includes("b.tech") ||
            education.includes("bachelor") ||
            education.includes("engineering") ||
            education.includes(requiredEducation);
    }

    const atsScore =
        num(candidate.ats_score);

    const minimumATS =
        num(job.minimum_ats_score);

    const atsPass =
        atsScore >= minimumATS;

    const skillPass =
        requiredSkills.length === 0 ||
        matchedSkills.length >=
        Math.ceil(requiredSkills.length * 0.5);

    const eligible =
        skillPass &&
        experiencePass &&
        educationPass &&
        atsPass;

    return {

        eligible,

        skills_pass:
            skillPass,

        experience_pass:
            experiencePass,

        education_pass:
            educationPass,

        ats_pass:
            atsPass,

        candidate_experience:
            candidateExperience,

        minimum_experience:
            minimumExperience,

        ats_score:
            atsScore,

        minimum_ats_score:
            minimumATS,

        matched_skills:
            matchedSkills,

        missing_skills:
            missingSkills
    };
}

// =====================================================
// HOME
// =====================================================

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "RecruitIQ Backend is Running",
        version: "6.0"
    });

});

// =====================================================
// LOGIN
// =====================================================

app.post("/api/auth/login", (req, res) => {

    const {
        email,
        password
    } = req.body;

    if (!email || !password) {

        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

    db.query(
        `
        SELECT *
        FROM users
        WHERE LOWER(email) = ?
        LIMIT 1
        `,
        [
            String(email)
                .trim()
                .toLowerCase()
        ],
        (err, rows) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: "Login failed",
                    error: err.message
                });
            }

            if (
                !rows.length ||
                rows[0].password !== password
            ) {

                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });
            }

            const user = rows[0];
            const authToken = token();

            db.query(
                `
                UPDATE users
                SET auth_token = ?
                WHERE id = ?
                `,
                [
                    authToken,
                    user.id
                ],
                () => {

                    res.json({
                        success: true,
                        message: "Login successful",
                        token: authToken,
                        user: {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role
                        }
                    });

                }
            );
        }
    );
});

// =====================================================
// JOBS - GET
// =====================================================

app.get("/api/jobs", (req, res) => {

    db.query(
        `
        SELECT *
        FROM jobs
        ORDER BY id DESC
        `,
        (err, rows) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: "Could not fetch jobs",
                    error: err.message
                });
            }

            res.json({
                success: true,
                jobs: rows
            });

        }
    );
});

// =====================================================
// JOB - GET ONE
// =====================================================

app.get("/api/jobs/:id", (req, res) => {

    db.query(
        `
        SELECT *
        FROM jobs
        WHERE id = ?
        `,
        [req.params.id],
        (err, rows) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: "Could not fetch job",
                    error: err.message
                });
            }

            if (!rows.length) {

                return res.status(404).json({
                    success: false,
                    message: "Job not found"
                });
            }

            res.json({
                success: true,
                job: rows[0]
            });

        }
    );
});

// =====================================================
// JOB - CREATE
// =====================================================

app.post("/api/jobs", (req, res) => {

    const {
        title,
        department,
        location,
        experience,
        skills,
        salary,
        description,
        status,
        minimum_experience,
        education,
        minimum_ats_score,
        required_skills
    } = req.body;

    if (!title) {

        return res.status(400).json({
            success: false,
            message: "Job title is required"
        });
    }

    db.query(
        `
        INSERT INTO jobs
        (
            title,
            department,
            location,
            experience,
            skills,
            salary,
            description,
            status,
            minimum_experience,
            education,
            minimum_ats_score,
            required_skills
        )
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
        `,
        [
            title,
            department || "",
            location || "",
            experience || "",
            skills || "",
            salary || "",
            description || "",
            status || "Open",
            minimum_experience || experience || "0",
            education || "Any",
            num(minimum_ats_score),
            required_skills || skills || ""
        ],
        (err, result) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: "Job could not be created",
                    error: err.message
                });
            }

            res.status(201).json({
                success: true,
                message: "Job created successfully",
                id: result.insertId
            });

        }
    );
});

// =====================================================
// JOB - UPDATE
// =====================================================

app.put("/api/jobs/:id", (req, res) => {

    const {
        title,
        department,
        location,
        experience,
        skills,
        salary,
        description,
        status,
        minimum_experience,
        education,
        minimum_ats_score,
        required_skills
    } = req.body;

    db.query(
        `
        UPDATE jobs
        SET
            title = ?,
            department = ?,
            location = ?,
            experience = ?,
            skills = ?,
            salary = ?,
            description = ?,
            status = ?,
            minimum_experience = ?,
            education = ?,
            minimum_ats_score = ?,
            required_skills = ?
        WHERE id = ?
        `,
        [
            title,
            department || "",
            location || "",
            experience || "",
            skills || "",
            salary || "",
            description || "",
            status || "Open",
            minimum_experience || experience || "0",
            education || "Any",
            num(minimum_ats_score),
            required_skills || skills || "",
            req.params.id
        ],
        (err, result) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: "Job could not be updated",
                    error: err.message
                });
            }

            if (!result.affectedRows) {

                return res.status(404).json({
                    success: false,
                    message: "Job not found"
                });
            }

            res.json({
                success: true,
                message: "Job updated successfully"
            });

        }
    );
});

// =====================================================
// JOB - DELETE
// =====================================================

app.delete("/api/jobs/:id", (req, res) => {

    db.query(
        `
        DELETE FROM jobs
        WHERE id = ?
        `,
        [req.params.id],
        (err, result) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: "Job could not be deleted",
                    error: err.message
                });
            }

            res.json({
                success: true,
                message: "Job deleted successfully"
            });

        }
    );
});

// =====================================================
// CANDIDATES - GET ALL
// =====================================================

app.get("/api/candidates", (req, res) => {

    db.query(
        `
        SELECT
            c.*,
            j.title AS applied_job,
            j.department AS job_department,
            j.location AS job_location,
            j.minimum_experience,
            j.education AS job_education,
            j.minimum_ats_score,
            j.required_skills
        FROM candidates c
        LEFT JOIN jobs j
            ON c.job_id = j.id
        ORDER BY c.id DESC
        `,
        (err, rows) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: "Could not fetch candidates",
                    error: err.message
                });
            }

            res.json({
                success: true,
                candidates: rows
            });

        }
    );
});

// =====================================================
// CANDIDATE - GET ONE
// =====================================================

app.get("/api/candidates/:id", (req, res) => {

    db.query(
        `
        SELECT
            c.*,
            j.title AS applied_job,
            j.department AS job_department,
            j.location AS job_location,
            j.minimum_experience,
            j.education AS job_education,
            j.minimum_ats_score,
            j.required_skills
        FROM candidates c
        LEFT JOIN jobs j
            ON c.job_id = j.id
        WHERE c.id = ?
        `,
        [req.params.id],
        (err, rows) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: "Could not fetch candidate",
                    error: err.message
                });
            }

            if (!rows.length) {

                return res.status(404).json({
                    success: false,
                    message: "Candidate not found"
                });
            }

            res.json({
                success: true,
                candidate: rows[0]
            });

        }
    );
});

// =====================================================
// CANDIDATE - CREATE
// =====================================================

app.post("/api/candidates", (req, res) => {

    const {
        name,
        email,
        phone,
        job_id,
        position,
        experience,
        education,
        skills,
        gender,
        department,
        qualification,
        status,
        applied_date,
        notes,
        resume_text,
        aptitude_score,
        interview_score
    } = req.body;

    if (!name || !email || !job_id) {

        return res.status(400).json({
            success: false,
            message: "Name, email and applied job are required"
        });
    }

    db.query(
        `SELECT * FROM jobs WHERE id = ?`,
        [job_id],
        (jobErr, jobs) => {

            if (jobErr) {

                return res.status(500).json({
                    success: false,
                    message: "Could not verify job",
                    error: jobErr.message
                });
            }

            if (!jobs.length) {

                return res.status(400).json({
                    success: false,
                    message: "Selected job does not exist"
                });
            }

            const job = jobs[0];

            const finalPosition =
                job.title ||
                position ||
                "Data Analyst";

            const ats =
                calculateATS({
                    position: finalPosition,
                    skills,
                    experience,
                    education,
                    qualification,
                    resume_text,
                    aptitude_score,
                    interview_score
                });

            db.query(
                `
                INSERT INTO candidates
                (
                    name,
                    email,
                    phone,
                    job_id,
                    position,
                    experience,
                    education,
                    skills,
                    gender,
                    department,
                    qualification,
                    status,
                    applied_date,
                    notes,
                    resume_text,
                    aptitude_score,
                    interview_score,
                    ats_score,
                    ats_label
                )
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                `,
                [
                    name,
                    email,
                    phone || "",
                    Number(job_id),
                    finalPosition,
                    experience || "",
                    education || "",
                    skills || "",
                    gender || "",
                    job.department || department || "",
                    qualification || education || "",
                    status || "Applied",
                    applied_date || null,
                    notes || "",
                    resume_text || "",
                    num(aptitude_score),
                    num(interview_score),
                    ats.score,
                    ats.label
                ],
                (err, result) => {

                    if (err) {

                        return res.status(500).json({
                            success: false,
                            message: "Candidate could not be saved",
                            error: err.message
                        });
                    }

                    res.status(201).json({
                        success: true,
                        message: "Candidate saved successfully",
                        id: result.insertId,
                        ats_score: ats.score,
                        ats_label: ats.label
                    });

                }
            );
        }
    );
});

// =====================================================
// CANDIDATE - UPDATE
// =====================================================

app.put("/api/candidates/:id", (req, res) => {

    const id = req.params.id;

    db.query(
        `SELECT * FROM candidates WHERE id = ?`,
        [id],
        (findErr, rows) => {

            if (findErr) {

                return res.status(500).json({
                    success: false,
                    message: "Could not find candidate",
                    error: findErr.message
                });
            }

            if (!rows.length) {

                return res.status(404).json({
                    success: false,
                    message: "Candidate not found"
                });
            }

            const old = rows[0];

            const {
                name,
                email,
                phone,
                job_id,
                position,
                experience,
                education,
                skills,
                gender,
                department,
                qualification,
                status,
                applied_date,
                notes,
                resume_text,
                aptitude_score,
                interview_score
            } = req.body;

            const finalJobId =
                job_id || old.job_id;

            db.query(
                `SELECT * FROM jobs WHERE id = ?`,
                [finalJobId],
                (jobErr, jobs) => {

                    if (jobErr) {

                        return res.status(500).json({
                            success: false,
                            message: "Could not verify job",
                            error: jobErr.message
                        });
                    }

                    if (!jobs.length) {

                        return res.status(400).json({
                            success: false,
                            message: "Selected job does not exist"
                        });
                    }

                    const job = jobs[0];

                    const finalPosition =
                        job.title ||
                        position ||
                        old.position ||
                        "Data Analyst";

                    const finalExperience =
                        experience !== undefined
                            ? experience
                            : old.experience;

                    const finalEducation =
                        education !== undefined
                            ? education
                            : old.education;

                    const finalSkills =
                        skills !== undefined
                            ? skills
                            : old.skills;

                    const aptitude =
                        aptitude_score !== undefined
                            ? num(aptitude_score)
                            : num(old.aptitude_score);

                    const interview =
                        interview_score !== undefined
                            ? num(interview_score)
                            : num(old.interview_score);

                    const ats =
                        calculateATS({
                            position: finalPosition,
                            skills: finalSkills,
                            experience: finalExperience,
                            education: finalEducation,
                            qualification:
                                qualification ||
                                finalEducation,
                            resume_text:
                                resume_text !== undefined
                                    ? resume_text
                                    : old.resume_text,
                            aptitude_score: aptitude,
                            interview_score: interview
                        });

                    db.query(
                        `
                        UPDATE candidates
                        SET
                            name = ?,
                            email = ?,
                            phone = ?,
                            job_id = ?,
                            position = ?,
                            experience = ?,
                            education = ?,
                            skills = ?,
                            gender = ?,
                            department = ?,
                            qualification = ?,
                            status = ?,
                            applied_date = ?,
                            notes = ?,
                            resume_text = ?,
                            aptitude_score = ?,
                            interview_score = ?,
                            ats_score = ?,
                            ats_label = ?
                        WHERE id = ?
                        `,
                        [
                            name || old.name,
                            email || old.email,
                            phone || old.phone || "",
                            Number(finalJobId),
                            finalPosition,
                            finalExperience || "",
                            finalEducation || "",
                            finalSkills || "",
                            gender || old.gender || "",
                            job.department ||
                            department ||
                            old.department ||
                            "",
                            qualification ||
                            finalEducation ||
                            old.qualification ||
                            "",
                            status ||
                            old.status ||
                            "Applied",
                            applied_date ||
                            old.applied_date ||
                            null,
                            notes !== undefined
                                ? notes
                                : old.notes || "",
                            resume_text !== undefined
                                ? resume_text
                                : old.resume_text || "",
                            aptitude,
                            interview,
                            ats.score,
                            ats.label,
                            id
                        ],
                        (err, result) => {

                            if (err) {

                                return res.status(500).json({
                                    success: false,
                                    message: "Candidate could not be updated",
                                    error: err.message
                                });
                            }

                            if (!result.affectedRows) {

                                return res.status(404).json({
                                    success: false,
                                    message: "Candidate not found"
                                });
                            }

                            res.json({
                                success: true,
                                message: "Candidate updated successfully",
                                ats_score: ats.score,
                                ats_label: ats.label
                            });

                        }
                    );
                }
            );
        }
    );
});

// =====================================================
// CANDIDATE - DELETE
// =====================================================

app.delete("/api/candidates/:id", (req, res) => {

    const id = req.params.id;

    db.query(
        `
        DELETE FROM interviews
        WHERE candidate_id = ?
        `,
        [id],
        () => {

            db.query(
                `
                DELETE FROM candidates
                WHERE id = ?
                `,
                [id],
                (err, result) => {

                    if (err) {

                        return res.status(500).json({
                            success: false,
                            message: "Candidate could not be deleted",
                            error: err.message
                        });
                    }

                    if (!result.affectedRows) {

                        return res.status(404).json({
                            success: false,
                            message: "Candidate not found"
                        });
                    }

                    res.json({
                        success: true,
                        message: "Candidate deleted successfully"
                    });

                }
            );
        }
    );
});

// =====================================================
// CANDIDATE CRITERIA
// =====================================================

app.get("/api/candidates/:id/criteria", (req, res) => {

    db.query(
        `
        SELECT
            c.*,
            j.title AS job_title,
            j.minimum_experience,
            j.education AS job_education,
            j.minimum_ats_score,
            j.required_skills,
            j.skills AS job_skills
        FROM candidates c
        LEFT JOIN jobs j
            ON c.job_id = j.id
        WHERE c.id = ?
        `,
        [req.params.id],
        (err, rows) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: "Criteria check failed",
                    error: err.message
                });
            }

            if (!rows.length) {

                return res.status(404).json({
                    success: false,
                    message: "Candidate not found"
                });
            }

            const candidate = rows[0];

            const job = {
                title: candidate.job_title,
                minimum_experience:
                    candidate.minimum_experience,
                education:
                    candidate.job_education,
                minimum_ats_score:
                    candidate.minimum_ats_score,
                required_skills:
                    candidate.required_skills ||
                    candidate.job_skills
            };

            const result =
                checkCriteria(
                    candidate,
                    job
                );

            res.json({
                success: true,

                candidate: {
                    id: candidate.id,
                    name: candidate.name,
                    email: candidate.email,
                    position: candidate.position,
                    status: candidate.status,
                    ats_score: candidate.ats_score
                },

                job,

                criteria: result
            });

        }
    );
});

// =====================================================
// INTERVIEWS - GET
// =====================================================

app.get("/api/interviews", (req, res) => {

    db.query(
        `
        SELECT
            i.*,
            c.name AS candidate_name,
            c.email AS candidate_email,
            c.position AS candidate_position,
            j.title AS job_title
        FROM interviews i
        INNER JOIN candidates c
            ON i.candidate_id = c.id
        LEFT JOIN jobs j
            ON i.job_id = j.id
        ORDER BY i.interview_date DESC, i.id DESC
        `,
        (err, rows) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: "Could not fetch interviews",
                    error: err.message
                });
            }

            res.json({
                success: true,
                interviews: rows
            });

        }
    );
});

// =====================================================
// INTERVIEW - CREATE
// =====================================================

app.post("/api/interviews", (req, res) => {

    const {
        candidate_id,
        job_id,
        interview_date,
        interview_time,
        interviewer,
        interview_type,
        status,
        meeting_link,
        interview_score,
        notes
    } = req.body;

    if (
        !candidate_id ||
        !interview_date ||
        !interview_time
    ) {

        return res.status(400).json({
            success: false,
            message: "Candidate, date and time are required"
        });
    }

    const score =
        Math.max(
            0,
            Math.min(
                100,
                num(interview_score)
            )
        );

    db.query(
        `
        INSERT INTO interviews
        (
            candidate_id,
            job_id,
            interview_date,
            interview_time,
            interviewer,
            interview_type,
            status,
            meeting_link,
            interview_score,
            notes
        )
        VALUES (?,?,?,?,?,?,?,?,?,?)
        `,
        [
            Number(candidate_id),
            job_id ? Number(job_id) : null,
            interview_date,
            interview_time,
            interviewer || "",
            interview_type || "Online",
            status || "Scheduled",
            meeting_link || "",
            score,
            notes || ""
        ],
        (err, result) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: "Interview could not be scheduled",
                    error: err.message
                });
            }

            db.query(
                `
                UPDATE candidates
                SET interview_score = ?
                WHERE id = ?
                `,
                [
                    score,
                    Number(candidate_id)
                ]
            );

            res.status(201).json({
                success: true,
                message: "Interview scheduled successfully",
                id: result.insertId
            });

        }
    );
});

// =====================================================
// INTERVIEW - UPDATE
// =====================================================

app.put("/api/interviews/:id", (req, res) => {

    const id =
        Number(req.params.id);

    const {
        candidate_id,
        job_id,
        interview_date,
        interview_time,
        interviewer,
        interview_type,
        status,
        meeting_link,
        interview_score,
        notes
    } = req.body;

    if (
        !candidate_id ||
        !interview_date ||
        !interview_time
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Candidate, date and time are required"
        });
    }

    const allowedStatus = [
        "Scheduled",
        "Completed",
        "Cancelled"
    ];

    const finalStatus =
        allowedStatus.includes(status)
            ? status
            : "Scheduled";

    const score =
        Math.max(
            0,
            Math.min(
                100,
                num(interview_score)
            )
        );

    db.query(
        `
        UPDATE interviews
        SET
            candidate_id = ?,
            job_id = ?,
            interview_date = ?,
            interview_time = ?,
            interviewer = ?,
            interview_type = ?,
            status = ?,
            meeting_link = ?,
            interview_score = ?,
            notes = ?
        WHERE id = ?
        `,
        [
            Number(candidate_id),
            job_id ? Number(job_id) : null,
            interview_date,
            interview_time,
            interviewer || "",
            interview_type || "Online",
            finalStatus,
            meeting_link || "",
            score,
            notes || "",
            id
        ],
        (err, result) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message:
                        "Interview could not be updated",
                    error: err.message
                });
            }

            if (!result.affectedRows) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Interview not found"
                });
            }

            db.query(
                `
                UPDATE candidates
                SET interview_score = ?
                WHERE id = ?
                `,
                [
                    score,
                    Number(candidate_id)
                ]
            );

            res.json({
                success: true,
                message:
                    "Interview updated successfully"
            });

        }
    );
});

// =====================================================
// INTERVIEW - DELETE
// =====================================================

app.delete("/api/interviews/:id", (req, res) => {

    const id =
        Number(req.params.id);

    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {

        return res.status(400).json({
            success: false,
            message: "Invalid interview ID"
        });
    }

    db.query(
        `
        DELETE FROM interviews
        WHERE id = ?
        `,
        [id],
        (err, result) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message:
                        "Interview could not be deleted",
                    error: err.message
                });
            }

            if (!result.affectedRows) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Interview not found"
                });
            }

            res.json({
                success: true,
                message:
                    "Interview deleted successfully"
            });

        }
    );
});

// =====================================================
// ANALYTICS SUMMARY
// =====================================================

app.get("/api/analytics/summary", (req, res) => {

    db.query(
        `
        SELECT
            COUNT(*) AS total_candidates,

            SUM(
                LOWER(COALESCE(status,'')) = 'applied'
            ) AS applied_candidates,

            SUM(
                LOWER(COALESCE(status,'')) = 'shortlisted'
            ) AS shortlisted_candidates,

            SUM(
                LOWER(COALESCE(status,'')) = 'selected'
            ) AS selected_candidates,

            SUM(
                LOWER(COALESCE(status,'')) IN
                ('interview','interviewed')
            ) AS interviewed_candidates,

            SUM(
                LOWER(COALESCE(status,'')) = 'rejected'
            ) AS rejected_candidates,

            ROUND(
                AVG(COALESCE(ats_score,0)),
                2
            ) AS average_score

        FROM candidates
        `,
        (err, rows) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: "Analytics failed",
                    error: err.message
                });
            }

            res.json({
                success: true,
                summary: rows[0]
            });

        }
    );
});

// =====================================================
// STATUS ANALYTICS
// =====================================================

app.get("/api/analytics/status", (req, res) => {

    db.query(
        `
        SELECT
            status,
            COUNT(*) AS total
        FROM candidates
        GROUP BY status
        ORDER BY total DESC
        `,
        (err, rows) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: "Status analytics failed",
                    error: err.message
                });
            }

            res.json({
                success: true,
                data: rows
            });

        }
    );
});

// =====================================================
// ATS LEADERBOARD
// =====================================================

app.get(
    "/api/analytics/ats-leaderboard",
    (req, res) => {

        db.query(
            `
            SELECT
                id,
                name,
                position,
                job_id,
                ats_score,
                ats_label,
                status
            FROM candidates
            ORDER BY ats_score DESC
            LIMIT 10
            `,
            (err, rows) => {

                if (err) {

                    return res.status(500).json({
                        success: false,
                        message:
                            "ATS leaderboard failed",
                        error: err.message
                    });
                }

                res.json({
                    success: true,
                    data: rows
                });

            }
        );
    }
);

// =====================================================
// ATS RECALCULATE
// =====================================================

function recalculateAllATS(req, res) {

    db.query(
        `
        SELECT
            c.*,
            j.title AS job_title
        FROM candidates c
        LEFT JOIN jobs j
            ON c.job_id = j.id
        `,
        (err, candidates) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: "Could not load candidates",
                    error: err.message
                });
            }

            if (!candidates.length) {

                return res.json({
                    success: true,
                    message: "No candidates found",
                    updated: 0
                });
            }

            let completed = 0;
            let failed = 0;

            candidates.forEach(candidate => {

                const ats =
                    calculateATS({
                        position:
                            candidate.job_title ||
                            candidate.position ||
                            "Data Analyst",

                        skills:
                            candidate.skills || "",

                        experience:
                            candidate.experience || "",

                        education:
                            candidate.education || "",

                        qualification:
                            candidate.qualification || "",

                        resume_text:
                            candidate.resume_text || "",

                        aptitude_score:
                            candidate.aptitude_score || 0,

                        interview_score:
                            candidate.interview_score || 0
                    });

                db.query(
                    `
                    UPDATE candidates
                    SET
                        ats_score = ?,
                        ats_label = ?
                    WHERE id = ?
                    `,
                    [
                        ats.score,
                        ats.label,
                        candidate.id
                    ],
                    updateErr => {

                        if (updateErr) {
                            failed++;
                        }
                        else {
                            completed++;
                        }

                        if (
                            completed + failed ===
                            candidates.length
                        ) {

                            if (failed > 0) {

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "ATS calculation failed",
                                    updated: completed,
                                    failed
                                });
                            }

                            res.json({
                                success: true,
                                message:
                                    "ATS scores recalculated successfully",
                                updated: completed,
                                total_candidates:
                                    candidates.length
                            });
                        }

                    }
                );

            });

        }
    );
}

app.post(
    "/api/ats/recalculate",
    recalculateAllATS
);

app.post(
    "/api/analytics/recalculate-ats",
    recalculateAllATS
);

app.post(
    "/api/analytics/recalculate",
    recalculateAllATS
);

app.post(
    "/api/recalculate-ats",
    recalculateAllATS
);

// =====================================================
// TEST APIs
// =====================================================

app.get("/api/ats/test", (req, res) => {

    res.json({
        success: true,
        message:
            "ATS API is working correctly",
        endpoint:
            "POST /api/ats/recalculate"
    });

});

app.get("/api/criteria/test", (req, res) => {

    res.json({
        success: true,
        message:
            "Recruitment Criteria API is working correctly"
    });

});

// =====================================================
// UNKNOWN API
// =====================================================

app.use("/api", (req, res) => {

    res.status(404).json({
        success: false,
        message: "API route not found",
        route:
            `${req.method} ${req.originalUrl}`
    });

});

// =====================================================
// MYSQL CONNECT
// =====================================================

db.connect(err => {

    if (err) {

        console.log(
            "❌ MySQL Connection Failed:",
            err.message
        );

        return;
    }

    console.log(
        "✅ MySQL Connected Successfully"
    );

});

// =====================================================
// START SERVER
// =====================================================

app.listen(
    PORT,
    () => {

        console.log(
            "🚀 RecruitIQ Backend Started"
        );

        console.log(
            `http://localhost:${PORT}`
        );

    }
);