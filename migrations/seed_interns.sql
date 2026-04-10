-- Dummy Data for Intern Management

INSERT INTO interns (full_name, email, role, project, mentor, start_date, end_date, status)
VALUES 
('Alice Smith', 'alice@example.com', 'Frontend Developer', 'Project Alpha', 'John Mentor', '2024-01-01', '2024-04-01', 'Completed'),
('Bob Johnson', 'bob@example.com', 'Backend Developer', 'Project Beta', 'Sarah Mentor', '2024-03-15', '2024-06-15', 'In Progress'),
('Charlie Brown', 'charlie@example.com', 'Fullstack Developer', 'Project Gamma', 'Mike Mentor', '2024-04-01', '2024-07-01', 'Joined'),
('Diana Prince', 'diana@example.com', 'Mobile Developer', 'Project Delta', 'Kate Mentor', '2024-04-15', '2024-05-15', 'Interview'),
('Edward Norton', 'edward@example.com', 'DevOps Intern', 'Infrastructure', 'Chris Mentor', '2024-05-01', '2024-08-01', 'Scheduled');

INSERT INTO intern_evaluations (intern_id, technical_score, technical_note, soft_skill_score, soft_skill_note, attitude_score, attitude_note, english_score, final_grade)
SELECT id, 9, 'Excellent skills', 8, 'Good communicator', 10, 'Very proactive', 9, 'Excellent'
FROM interns WHERE full_name = 'Alice Smith';
