const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database setup - Use persistent storage for production
const dbPath = process.env.NODE_ENV === 'production' 
  ? path.join(__dirname, 'data', 'students.db')
  : 'students.db';

// Ensure data directory exists for production
if (process.env.NODE_ENV === 'production') {
  const fs = require('fs');
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Students table
  db.run(`CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    student_id TEXT UNIQUE NOT NULL,
    date_of_birth DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Subjects table
  db.run(`CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    credits INTEGER DEFAULT 3
  )`);

  // Student-Subject enrollment table
  db.run(`CREATE TABLE IF NOT EXISTS enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    subject_id INTEGER,
    enrolled_date DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (student_id) REFERENCES students (id),
    FOREIGN KEY (subject_id) REFERENCES subjects (id),
    UNIQUE(student_id, subject_id)
  )`);

  // Grades table
  db.run(`CREATE TABLE IF NOT EXISTS grades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    enrollment_id INTEGER,
    grade_type TEXT CHECK(grade_type IN ('activity', 'quiz', 'exam')),
    grade_name TEXT NOT NULL,
    score REAL NOT NULL,
    max_score REAL NOT NULL,
    date_recorded DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments (id)
  )`);

  // Insert sample data only if tables are empty
  db.get("SELECT COUNT(*) as count FROM students", (err, row) => {
    if (err) {
      console.error('Error checking students table:', err);
      return;
    }
    
    if (row.count === 0) {
      console.log('Inserting sample data...');
      
      db.run(`INSERT INTO students (first_name, last_name, email, student_id, date_of_birth) VALUES
        ('John', 'Doe', 'john.doe@email.com', 'STU001', '2000-05-15'),
        ('Jane', 'Smith', 'jane.smith@email.com', 'STU002', '2001-03-22'),
        ('Mike', 'Johnson', 'mike.johnson@email.com', 'STU003', '1999-11-08')`);

      db.run(`INSERT INTO subjects (name, code, description, credits) VALUES
        ('Mathematics', 'MATH101', 'Basic Mathematics', 3),
        ('Physics', 'PHYS101', 'Introduction to Physics', 4),
        ('Chemistry', 'CHEM101', 'General Chemistry', 3),
        ('Computer Science', 'CS101', 'Programming Fundamentals', 4)`);

      db.run(`INSERT INTO enrollments (student_id, subject_id) VALUES
        (1, 1), (1, 2), (1, 4),
        (2, 1), (2, 3), (2, 4),
        (3, 2), (3, 3), (3, 4)`);

      db.run(`INSERT INTO grades (enrollment_id, grade_type, grade_name, score, max_score) VALUES
        (1, 'activity', 'Activity 1', 85, 100),
        (1, 'quiz', 'Quiz 1', 92, 100),
        (1, 'exam', 'Midterm', 78, 100),
        (2, 'activity', 'Lab 1', 88, 100),
        (2, 'quiz', 'Quiz 1', 95, 100),
        (3, 'activity', 'Assignment 1', 90, 100),
        (4, 'quiz', 'Quiz 1', 87, 100),
        (5, 'activity', 'Lab Report', 92, 100)`);
    }
  });
});

// Serve the main HTML file for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// STUDENT ENDPOINTS

// GET all students
app.get('/api/students', (req, res) => {
  db.all(`SELECT * FROM students ORDER BY last_name, first_name`, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// GET student by ID with subjects and grades
app.get('/api/students/:id', (req, res) => {
  const studentId = req.params.id;
  
  const query = `
    SELECT 
      s.*,
      sub.id as subject_id,
      sub.name as subject_name,
      sub.code as subject_code,
      sub.credits,
      e.id as enrollment_id
    FROM students s
    LEFT JOIN enrollments e ON s.id = e.student_id
    LEFT JOIN subjects sub ON e.subject_id = sub.id
    WHERE s.id = ?
  `;
  
  db.all(query, [studentId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (rows.length === 0) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }
    
    const student = {
      id: rows[0].id,
      first_name: rows[0].first_name,
      last_name: rows[0].last_name,
      email: rows[0].email,
      student_id: rows[0].student_id,
      date_of_birth: rows[0].date_of_birth,
      created_at: rows[0].created_at,
      subjects: []
    };
    
    rows.forEach(row => {
      if (row.subject_id) {
        student.subjects.push({
          id: row.subject_id,
          name: row.subject_name,
          code: row.subject_code,
          credits: row.credits,
          enrollment_id: row.enrollment_id
        });
      }
    });
    
    res.json(student);
  });
});

// GET available subjects for student enrollment
app.get('/api/students/:id/available-subjects', (req, res) => {
  const studentId = req.params.id;
  
  const query = `
    SELECT s.* FROM subjects s
    WHERE s.id NOT IN (
      SELECT e.subject_id FROM enrollments e WHERE e.student_id = ?
    )
    ORDER BY s.name
  `;
  
  db.all(query, [studentId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// POST create new student
app.post('/api/students', (req, res) => {
  const { first_name, last_name, email, student_id, date_of_birth } = req.body;
  
  if (!first_name || !last_name || !email || !student_id) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  
  // Check if student_id or email already exists
  db.get('SELECT id FROM students WHERE student_id = ? OR email = ?', [student_id, email], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (row) {
      // Check which field is duplicate
      db.get('SELECT student_id, email FROM students WHERE student_id = ?', [student_id], (err, studentIdRow) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        if (studentIdRow) {
          res.status(400).json({ error: 'Student ID already exists. Please use a different Student ID.' });
          return;
        }
        
        res.status(400).json({ error: 'Email already exists. Please use a different email address.' });
      });
      return;
    }
    
    // If no duplicates, proceed with insertion
    const query = `INSERT INTO students (first_name, last_name, email, student_id, date_of_birth) 
                   VALUES (?, ?, ?, ?, ?)`;
    
    db.run(query, [first_name, last_name, email, student_id, date_of_birth], function(err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, message: 'Student created successfully' });
    });
  });
});

// PUT update student
app.put('/api/students/:id', (req, res) => {
  const { first_name, last_name, email, student_id, date_of_birth } = req.body;
  const id = req.params.id;
  
  if (!first_name || !last_name || !email || !student_id) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  
  // Check if student_id or email already exists for a different student
  db.get('SELECT id FROM students WHERE (student_id = ? OR email = ?) AND id != ?', [student_id, email, id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (row) {
      // Check which field is duplicate
      db.get('SELECT student_id, email FROM students WHERE student_id = ? AND id != ?', [student_id, id], (err, studentIdRow) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        if (studentIdRow) {
          res.status(400).json({ error: 'Student ID already exists. Please use a different Student ID.' });
          return;
        }
        
        res.status(400).json({ error: 'Email already exists. Please use a different email address.' });
      });
      return;
    }
    
    // If no duplicates, proceed with update
    const query = `UPDATE students SET first_name = ?, last_name = ?, email = ?, 
                   student_id = ?, date_of_birth = ? WHERE id = ?`;
    
    db.run(query, [first_name, last_name, email, student_id, date_of_birth, id], function(err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Student not found' });
        return;
      }
      
      res.json({ message: 'Student updated successfully' });
    });
  });
});

// DELETE student
app.delete('/api/students/:id', (req, res) => {
  const id = req.params.id;
  
  db.run('DELETE FROM students WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Student deleted successfully' });
  });
});

// SUBJECT ENDPOINTS

// GET all subjects
app.get('/api/subjects', (req, res) => {
  db.all('SELECT * FROM subjects ORDER BY name', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// POST create subject
app.post('/api/subjects', (req, res) => {
  const { name, code, description, credits } = req.body;
  
  if (!name || !code) {
    res.status(400).json({ error: 'Name and code are required' });
    return;
  }
  
  const query = 'INSERT INTO subjects (name, code, description, credits) VALUES (?, ?, ?, ?)';
  
  db.run(query, [name, code, description, credits || 3], function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, message: 'Subject created successfully' });
  });
});

// ENROLLMENT ENDPOINTS

// POST enroll student in subject
app.post('/api/enrollments', (req, res) => {
  const { student_id, subject_id } = req.body;
  
  if (!student_id || !subject_id) {
    res.status(400).json({ error: 'Student ID and Subject ID are required' });
    return;
  }
  
  // Check if enrollment already exists
  db.get('SELECT id FROM enrollments WHERE student_id = ? AND subject_id = ?', 
    [student_id, subject_id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (row) {
      res.status(400).json({ error: 'Student is already enrolled in this subject' });
      return;
    }
    
    const query = 'INSERT INTO enrollments (student_id, subject_id) VALUES (?, ?)';
    
    db.run(query, [student_id, subject_id], function(err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, message: 'Student enrolled successfully' });
    });
  });
});

// DELETE enrollment (unenroll)
app.delete('/api/enrollments/:id', (req, res) => {
  const enrollmentId = req.params.id;
  
  // First delete all grades for this enrollment
  db.run('DELETE FROM grades WHERE enrollment_id = ?', [enrollmentId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Then delete the enrollment
    db.run('DELETE FROM enrollments WHERE id = ?', [enrollmentId], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Enrollment not found' });
        return;
      }
      
      res.json({ message: 'Student unenrolled successfully' });
    });
  });
});

// GRADES ENDPOINTS

// GET grades for enrollment
app.get('/api/enrollments/:enrollmentId/grades', (req, res) => {
  const enrollmentId = req.params.enrollmentId;
  
  db.all('SELECT * FROM grades WHERE enrollment_id = ? ORDER BY date_recorded DESC', 
    [enrollmentId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// POST add grade
app.post('/api/grades', (req, res) => {
  const { enrollment_id, grade_type, grade_name, score, max_score } = req.body;
  
  if (!enrollment_id || !grade_type || !grade_name || score === undefined || max_score === undefined) {
    res.status(400).json({ error: 'All fields are required' });
    return;
  }
  
  if (!['activity', 'quiz', 'exam'].includes(grade_type)) {
    res.status(400).json({ error: 'Invalid grade type' });
    return;
  }
  
  if (score < 0 || max_score <= 0 || score > max_score) {
    res.status(400).json({ error: 'Invalid score values' });
    return;
  }
  
  const query = `INSERT INTO grades (enrollment_id, grade_type, grade_name, score, max_score) 
                 VALUES (?, ?, ?, ?, ?)`;
  
  db.run(query, [enrollment_id, grade_type, grade_name, score, max_score], function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, message: 'Grade added successfully' });
  });
});

// PUT update grade
app.put('/api/grades/:id', (req, res) => {
  const { grade_type, grade_name, score, max_score } = req.body;
  const id = req.params.id;
  
  if (!grade_type || !grade_name || score === undefined || max_score === undefined) {
    res.status(400).json({ error: 'All fields are required' });
    return;
  }
  
  if (!['activity', 'quiz', 'exam'].includes(grade_type)) {
    res.status(400).json({ error: 'Invalid grade type' });
    return;
  }
  
  if (score < 0 || max_score <= 0 || score > max_score) {
    res.status(400).json({ error: 'Invalid score values' });
    return;
  }
  
  const query = `UPDATE grades SET grade_type = ?, grade_name = ?, score = ?, max_score = ? 
                 WHERE id = ?`;
  
  db.run(query, [grade_type, grade_name, score, max_score, id], function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Grade not found' });
      return;
    }
    
    res.json({ message: 'Grade updated successfully' });
  });
});

// DELETE grade
app.delete('/api/grades/:id', (req, res) => {
  const id = req.params.id;
  
  db.run('DELETE FROM grades WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Grade not found' });
      return;
    }
    
    res.json({ message: 'Grade deleted successfully' });
  });
});

// GET detailed grades for a student
app.get('/api/students/:id/grades', (req, res) => {
  const studentId = req.params.id;
  
  const query = `
    SELECT 
      g.*,
      sub.name as subject_name,
      sub.code as subject_code,
      e.id as enrollment_id
    FROM grades g
    JOIN enrollments e ON g.enrollment_id = e.id
    JOIN subjects sub ON e.subject_id = sub.id
    WHERE e.student_id = ?
    ORDER BY sub.name, g.grade_type, g.date_recorded
  `;
  
  db.all(query, [studentId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed.');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed.');
    process.exit(0);
  });
});