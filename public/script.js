const API_BASE = 'http://localhost:3000/api';
let currentStudents = [];
let currentSubjects = [];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadDashboard();
    loadStudents();
    loadSubjects();
    loadStudentSelect();
    
    // Form submissions
    document.getElementById('addStudentForm').addEventListener('submit', handleAddStudent);
    document.getElementById('editStudentForm').addEventListener('submit', handleEditStudent);
    document.getElementById('addSubjectForm').addEventListener('submit', handleAddSubject);
    document.getElementById('addGradeForm').addEventListener('submit', handleAddGrade);
    document.getElementById('editGradeForm').addEventListener('submit', handleEditGrade);
});

// Tab functionality
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

// API functions
async function apiRequest(endpoint, method = 'GET', data = null) {
    try {
        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };
        
        if (data) {
            config.body = JSON.stringify(data);
        }
        
        const response = await fetch(`${API_BASE}${endpoint}`, config);
        
        if (!response.ok) {
            // Parse the error response to get the specific error message
            const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        // Don't show generic error here, let the calling function handle it
        throw error;
    }
}

// Dashboard functions
async function loadDashboard() {
    try {
        const [students, subjects] = await Promise.all([
            apiRequest('/students'),
            apiRequest('/subjects')
        ]);
        
        // Get total grades count
        let totalGrades = 0;
        for (const student of students) {
            const grades = await apiRequest(`/students/${student.id}/grades`);
            totalGrades += grades.length;
        }
        
        document.getElementById('totalStudents').textContent = students.length;
        document.getElementById('totalSubjects').textContent = subjects.length;
        document.getElementById('totalGrades').textContent = totalGrades;
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Student functions
async function loadStudents() {
    try {
        const students = await apiRequest('/students');
        currentStudents = students;
        displayStudents(students);
    } catch (error) {
        document.getElementById('studentsContainer').innerHTML = '<p class="alert alert-error">Error loading students</p>';
    }
}

function displayStudents(students) {
    const container = document.getElementById('studentsContainer');
    
    if (students.length === 0) {
        container.innerHTML = '<p>No students found.</p>';
        return;
    }
    
    container.innerHTML = students.map(student => `
        <div class="student-card">
            <h3>${student.first_name} ${student.last_name}</h3>
            <div class="student-info">
                <div class="info-item">
                    <span class="info-label">Student ID</span>
                    <span class="info-value">${student.student_id}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Email</span>
                    <span class="info-value">${student.email}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Date of Birth</span>
                    <span class="info-value">${student.date_of_birth || 'Not provided'}</span>
                </div>
            </div>
            <button class="btn" onclick="viewStudentDetails(${student.id})">View Details</button>
            <button class="btn btn-secondary" onclick="editStudent(${student.id})">Edit</button>
            <button class="btn btn-success" onclick="manageEnrollments(${student.id})">Manage Enrollments</button>
            <button class="btn btn-danger" onclick="deleteStudent(${student.id})">Delete</button>
        </div>
    `).join('');
}

async function editStudent(studentId) {
    try {
        const student = await apiRequest(`/students/${studentId}`);
        
        // Populate the edit form with current student data
        document.getElementById('editStudentId').value = student.id;
        document.getElementById('editFirstName').value = student.first_name;
        document.getElementById('editLastName').value = student.last_name;
        document.getElementById('editEmail').value = student.email;
        document.getElementById('editStudentIdField').value = student.student_id;
        document.getElementById('editDateOfBirth').value = student.date_of_birth || '';
        
        // Show the edit modal
        document.getElementById('editStudentModal').style.display = 'block';
        
    } catch (error) {
        showAlert('Error loading student data for editing', 'error');
    }
}

async function handleEditStudent(e) {
    e.preventDefault();
    
    const studentId = document.getElementById('editStudentId').value;
    const formData = {
        first_name: document.getElementById('editFirstName').value,
        last_name: document.getElementById('editLastName').value,
        email: document.getElementById('editEmail').value,
        student_id: document.getElementById('editStudentIdField').value,
        date_of_birth: document.getElementById('editDateOfBirth').value || null
    };
    
    try {
        await apiRequest(`/students/${studentId}`, 'PUT', formData);
        showAlert('Student updated successfully', 'success');
        closeModal('editStudentModal');
        loadStudents();
        loadStudentSelect();
        loadDashboard();
    } catch (error) {
        // Show the specific error message from the server
        showAlert(error.message, 'error');
    }
}

async function manageEnrollments(studentId) {
    try {
        const [student, availableSubjects] = await Promise.all([
            apiRequest(`/students/${studentId}`),
            apiRequest(`/students/${studentId}/available-subjects`)
        ]);
        
        document.getElementById('enrollmentStudentId').value = studentId;
        
        // Display current enrollments
        const currentEnrollmentsHtml = student.subjects.length > 0 ? 
            student.subjects.map(subject => `
                <div class="enrollment-item">
                    <span>${subject.code} - ${subject.name} (${subject.credits} credits)</span>
                    <button class="btn btn-danger btn-sm" onclick="unenrollStudent(${subject.enrollment_id})">Unenroll</button>
                </div>
            `).join('') : '<p>No current enrollments</p>';
        
        document.getElementById('currentEnrollments').innerHTML = currentEnrollmentsHtml;
        
        // Populate available subjects dropdown
        const availableSubjectsSelect = document.getElementById('availableSubjects');
        availableSubjectsSelect.innerHTML = '<option value="">Select a subject...</option>' +
            availableSubjects.map(subject => 
                `<option value="${subject.id}">${subject.code} - ${subject.name}</option>`
            ).join('');
        
        document.getElementById('enrollmentModal').style.display = 'block';
        
    } catch (error) {
        showAlert('Error loading enrollment data', 'error');
    }
}

async function enrollStudent() {
    const studentId = document.getElementById('enrollmentStudentId').value;
    const subjectId = document.getElementById('availableSubjects').value;
    
    if (!subjectId) {
        showAlert('Please select a subject', 'error');
        return;
    }
    
    try {
        await apiRequest('/enrollments', 'POST', {
            student_id: parseInt(studentId),
            subject_id: parseInt(subjectId)
        });
        
        showAlert('Student enrolled successfully', 'success');
        manageEnrollments(studentId); // Refresh the enrollment modal
        loadDashboard();
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

async function unenrollStudent(enrollmentId) {
    if (confirm('Are you sure you want to unenroll this student? This will also delete all grades for this subject.')) {
        try {
            await apiRequest(`/enrollments/${enrollmentId}`, 'DELETE');
            showAlert('Student unenrolled successfully', 'success');
            
            // Refresh the enrollment modal
            const studentId = document.getElementById('enrollmentStudentId').value;
            manageEnrollments(studentId);
            loadDashboard();
        } catch (error) {
            showAlert(error.message, 'error');
        }
    }
}

async function viewStudentDetails(studentId) {
    try {
        // Get student basic info and grades
        const [studentResponse, gradesResponse] = await Promise.all([
            apiRequest(`/students/${studentId}`),
            apiRequest(`/students/${studentId}/grades`)
        ]);
        
        const student = studentResponse;
        const grades = gradesResponse;
        
        console.log('Student data:', student);
        console.log('Grades data:', grades);
        
        // Group grades by subject, but include all enrolled subjects
        const subjectData = {};
        
        // First, add all enrolled subjects (even without grades)
        if (student.subjects && student.subjects.length > 0) {
            student.subjects.forEach(subject => {
                const key = `${subject.code} - ${subject.name}`;
                subjectData[key] = {
                    code: subject.code,
                    name: subject.name,
                    credits: subject.credits,
                    activities: [],
                    quizzes: [],
                    exams: []
                };
            });
        }
        
        // Then add grades to existing subjects
        if (grades && grades.length > 0) {
            grades.forEach(grade => {
                console.log('Processing grade:', grade);
                
                // Build the key exactly as we did above
                const key = `${grade.subject_code} - ${grade.subject_name}`;
                
                // Check if this subject exists in our enrolled subjects
                if (subjectData[key]) {
                    // Validate grade_type and build array name
                    const gradeType = grade.grade_type;
                    let arrayName;
                    
                    if (gradeType === 'activity') {
                        arrayName = 'activities';
                    } else if (gradeType === 'quiz') {
                        arrayName = 'quizzes';
                    } else if (gradeType === 'exam') {
                        arrayName = 'exams';
                    } else {
                        console.warn('Unknown grade type:', gradeType);
                        return; // Skip this grade
                    }
                    
                    // Add grade to the appropriate array
                    subjectData[key][arrayName].push(grade);
                } else {
                    // Grade exists for a subject the student is no longer enrolled in
                    console.warn('Grade found for unenrolled subject:', key);
                    
                    // Create subject entry for orphaned grades
                    if (!subjectData[key]) {
                        subjectData[key] = {
                            code: grade.subject_code,
                            name: grade.subject_name,
                            credits: 'N/A', // Unknown credits for unenrolled subject
                            activities: [],
                            quizzes: [],
                            exams: [],
                            isUnenrolled: true // Flag to show differently
                        };
                    }
                    
                    // Add the grade
                    const gradeType = grade.grade_type;
                    if (gradeType === 'activity') {
                        subjectData[key].activities.push(grade);
                    } else if (gradeType === 'quiz') {
                        subjectData[key].quizzes.push(grade);
                    } else if (gradeType === 'exam') {
                        subjectData[key].exams.push(grade);
                    }
                }
            });
        }
        
        const detailsHtml = `
            <div class="student-card">
                <h3>${student.first_name} ${student.last_name}</h3>
                <div class="student-info">
                    <div class="info-item">
                        <span class="info-label">Student ID</span>
                        <span class="info-value">${student.student_id}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Email</span>
                        <span class="info-value">${student.email}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Date of Birth</span>
                        <span class="info-value">${student.date_of_birth || 'Not provided'}</span>
                    </div>
                </div>
                <h4>Enrolled Subjects & Grades</h4>
                ${Object.keys(subjectData).length > 0 ? `
                    <div class="subjects-grid">
                        ${Object.entries(subjectData).map(([subjectKey, subject]) => `
                            <div class="subject-card ${subject.isUnenrolled ? 'unenrolled-subject' : ''}">
                                <h5>
                                    ${subjectKey} 
                                    ${subject.isUnenrolled ? 
                                        '<span class="unenrolled-badge">Previous Enrollment</span>' : 
                                        `(${subject.credits} credits)`
                                    }
                                </h5>
                                ${subject.isUnenrolled ? `
                                    <p class="text-muted" style="font-size: 0.9rem; margin-bottom: 0.5rem;">
                                        📚 This student was previously enrolled in this subject. Grades are preserved for record keeping.
                                    </p>
                                ` : ''}
                                <div class="grade-breakdown">
                                    ${subject.activities.length > 0 ? `
                                        <div class="grade-type activity">
                                            <strong>Activities:</strong>
                                            <span>${subject.activities.map(g => `${g.grade_name}: ${g.score}/${g.max_score} (${((g.score/g.max_score)*100).toFixed(1)}%)`).join(', ')}</span>
                                        </div>
                                    ` : `
                                        <div class="grade-type activity">
                                            <strong>Activities:</strong>
                                            <span class="text-muted">No activities recorded yet</span>
                                        </div>
                                    `}
                                    ${subject.quizzes.length > 0 ? `
                                        <div class="grade-type quiz">
                                            <strong>Quizzes:</strong>
                                            <span>${subject.quizzes.map(g => `${g.grade_name}: ${g.score}/${g.max_score} (${((g.score/g.max_score)*100).toFixed(1)}%)`).join(', ')}</span>
                                        </div>
                                    ` : `
                                        <div class="grade-type quiz">
                                            <strong>Quizzes:</strong>
                                            <span class="text-muted">No quizzes recorded yet</span>
                                        </div>
                                    `}
                                    ${subject.exams.length > 0 ? `
                                        <div class="grade-type exam">
                                            <strong>Exams:</strong>
                                            <span>${subject.exams.map(g => `${g.grade_name}: ${g.score}/${g.max_score} (${((g.score/g.max_score)*100).toFixed(1)}%)`).join(', ')}</span>
                                        </div>
                                    ` : `
                                        <div class="grade-type exam">
                                            <strong>Exams:</strong>
                                            <span class="text-muted">No exams recorded yet</span>
                                        </div>
                                    `}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="alert alert-info">
                        <p><strong>This student is not enrolled in any subjects yet.</strong></p>
                        <p>To add grades for this student:</p>
                        <ol style="margin-left: 1.5rem; margin-top: 0.5rem;">
                            <li>Click "Back to Students" below</li>
                            <li>Click "Manage Enrollments" for this student</li>
                            <li>Enroll them in the desired subjects</li>
                            <li>Then go to the "Grades" tab to add grades</li>
                        </ol>
                    </div>
                `}
                <div style="margin-top: 1.5rem;">
                    <button class="btn btn-secondary" onclick="loadStudents()">Back to Students</button>
                    ${Object.keys(subjectData).length === 0 ? `
                        <button class="btn btn-success" onclick="manageEnrollments(${student.id})">Manage Enrollments</button>
                    ` : ''}
                </div>
            </div>
        `;
        
        document.getElementById('studentsContainer').innerHTML = detailsHtml;
        
    } catch (error) {
        console.error('Error loading student details:', error);
        showAlert('Error loading student details: ' + error.message, 'error');
        
        // Show a fallback error message in the container
        document.getElementById('studentsContainer').innerHTML = `
            <div class="student-card">
                <h3>Error Loading Student Details</h3>
                <div class="alert alert-error">
                    <p><strong>Unable to load student information.</strong></p>
                    <p>Error: ${error.message}</p>
                    <p>Debug information:</p>
                    <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                        <li>Student ID: ${studentId}</li>
                        <li>Check browser console for more details</li>
                        <li>Try refreshing the page</li>
                    </ul>
                </div>
                <button class="btn btn-secondary" onclick="loadStudents()">Back to Students</button>
                <button class="btn btn-primary" onclick="viewStudentDetails(${studentId})" style="margin-left: 0.5rem;">Retry</button>
            </div>
        `;
    }
}

async function deleteStudent(studentId) {
    if (confirm('Are you sure you want to delete this student?')) {
        try {
            await apiRequest(`/students/${studentId}`, 'DELETE');
            showAlert('Student deleted successfully', 'success');
            loadStudents();
            loadDashboard();
        } catch (error) {
            showAlert('Error deleting student', 'error');
        }
    }
}

// Subject functions
async function loadSubjects() {
    try {
        const subjects = await apiRequest('/subjects');
        currentSubjects = subjects;
        displaySubjects(subjects);
    } catch (error) {
        document.getElementById('subjectsTable').innerHTML = '<tr><td colspan="4" class="alert alert-error">Error loading subjects</td></tr>';
    }
}

function displaySubjects(subjects) {
    const tbody = document.getElementById('subjectsTable');
    
    if (subjects.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">No subjects found.</td></tr>';
        return;
    }
    
    tbody.innerHTML = subjects.map(subject => `
        <tr>
            <td>${subject.code}</td>
            <td>${subject.name}</td>
            <td>${subject.credits}</td>
            <td>${subject.description || 'No description'}</td>
        </tr>
    `).join('');
}

// Grade functions
async function loadStudentSelect() {
    try {
        const students = await apiRequest('/students');
        const select = document.getElementById('studentSelect');
        
        select.innerHTML = '<option value="">Choose a student...</option>' +
            students.map(student => 
                `<option value="${student.id}">${student.first_name} ${student.last_name} (${student.student_id})</option>`
            ).join('');
    } catch (error) {
        console.error('Error loading student select:', error);
    }
}

async function loadStudentGrades() {
    const studentId = document.getElementById('studentSelect').value;
    const container = document.getElementById('gradesContainer');
    
    if (!studentId) {
        container.innerHTML = '';
        return;
    }
    
    try {
        // Get student info and grades
        const [studentResponse, gradesResponse] = await Promise.all([
            apiRequest(`/students/${studentId}`),
            apiRequest(`/students/${studentId}/grades`)
        ]);
        
        const student = studentResponse;
        const grades = gradesResponse;
        
        // Group grades by subject
        const gradesBySubject = {};
        
        // First, add all enrolled subjects (even without grades)
        if (student.subjects && student.subjects.length > 0) {
            student.subjects.forEach(subject => {
                gradesBySubject[subject.code] = {
                    name: subject.name,
                    enrollment_id: subject.enrollment_id,
                    grades: []
                };
            });
        }
        
        // Then add grades to existing subjects
        if (grades && grades.length > 0) {
            grades.forEach(grade => {
                const key = grade.subject_code;
                if (gradesBySubject[key]) {
                    gradesBySubject[key].grades.push(grade);
                }
            });
        }
        
        if (Object.keys(gradesBySubject).length === 0) {
            container.innerHTML = `
                <h3>Grades for ${student.first_name} ${student.last_name}</h3>
                <div class="alert alert-info">
                    <p><strong>This student is not enrolled in any subjects yet.</strong></p>
                    <p>To add grades for this student:</p>
                    <ol style="margin-left: 1.5rem; margin-top: 0.5rem;">
                        <li>Go to the "Students" tab</li>
                        <li>Find "${student.first_name} ${student.last_name}" and click "Manage Enrollments"</li>
                        <li>Enroll them in the desired subjects</li>
                        <li>Come back to this "Grades" tab to add grades</li>
                    </ol>
                    <button class="btn btn-success" onclick="showTab('students')" style="margin-top: 1rem;">Go to Students Tab</button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <h3>Grades for ${student.first_name} ${student.last_name}</h3>
            ${Object.entries(gradesBySubject).map(([code, subject]) => `
                <div class="subject-card">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h4>${code} - ${subject.name}</h4>
                        <button class="btn btn-success" onclick="showAddGradeModal(${subject.enrollment_id})">Add Grade</button>
                    </div>
                    ${subject.grades.length > 0 ? `
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Name</th>
                                    <th>Score</th>
                                    <th>Percentage</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${subject.grades.map(grade => `
                                    <tr>
                                        <td><span class="grade-type ${grade.grade_type}">${grade.grade_type.charAt(0).toUpperCase() + grade.grade_type.slice(1)}</span></td>
                                        <td>${grade.grade_name}</td>
                                        <td>${grade.score}/${grade.max_score}</td>
                                        <td>${((grade.score / grade.max_score) * 100).toFixed(1)}%</td>
                                        <td>${new Date(grade.date_recorded).toLocaleDateString()}</td>
                                        <td>
                                            <button class="btn btn-secondary btn-sm" onclick="editGrade(${grade.id})">Edit</button>
                                            <button class="btn btn-danger btn-sm" onclick="deleteGrade(${grade.id})">Delete</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : `
                        <p class="text-muted" style="margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 5px;">
                            📝 No grades recorded yet for this subject. Click "Add Grade" above to start adding grades.
                        </p>
                    `}
                </div>
            `).join('')}
        `;
        
    } catch (error) {
        console.error('Error loading grades:', error);
        container.innerHTML = `
            <div class="alert alert-error">
                <p><strong>Error loading grades</strong></p>
                <p>${error.message}</p>
                <p>Please try refreshing the page or contact support if the problem persists.</p>
            </div>
        `;
    }
}

async function editGrade(gradeId) {
    try {
        // Get grade details by finding it in the current data
        const studentId = document.getElementById('studentSelect').value;
        const grades = await apiRequest(`/students/${studentId}/grades`);
        const grade = grades.find(g => g.id === gradeId);
        
        if (!grade) {
            showAlert('Grade not found', 'error');
            return;
        }
        
        // Populate edit form
        document.getElementById('editGradeId').value = grade.id;
        document.getElementById('editGradeType').value = grade.grade_type;
        document.getElementById('editGradeName').value = grade.grade_name;
        document.getElementById('editGradeScore').value = grade.score;
        document.getElementById('editGradeMaxScore').value = grade.max_score;
        
        document.getElementById('editGradeModal').style.display = 'block';
        
    } catch (error) {
        showAlert('Error loading grade data', 'error');
    }
}

async function handleEditGrade(e) {
    e.preventDefault();
    
    const gradeId = document.getElementById('editGradeId').value;
    const formData = {
        grade_type: document.getElementById('editGradeType').value,
        grade_name: document.getElementById('editGradeName').value,
        score: parseFloat(document.getElementById('editGradeScore').value),
        max_score: parseFloat(document.getElementById('editGradeMaxScore').value)
    };
    
    try {
        await apiRequest(`/grades/${gradeId}`, 'PUT', formData);
        showAlert('Grade updated successfully', 'success');
        closeModal('editGradeModal');
        loadStudentGrades();
        loadDashboard();
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

async function deleteGrade(gradeId) {
    if (confirm('Are you sure you want to delete this grade?')) {
        try {
            await apiRequest(`/grades/${gradeId}`, 'DELETE');
            showAlert('Grade deleted successfully', 'success');
            loadStudentGrades();
            loadDashboard();
        } catch (error) {
            showAlert(error.message, 'error');
        }
    }
}

// Modal functions
function showAddStudentModal() {
    document.getElementById('addStudentModal').style.display = 'block';
}

function showAddSubjectModal() {
    document.getElementById('addSubjectModal').style.display = 'block';
}

function showAddGradeModal(enrollmentId) {
    document.getElementById('gradeEnrollmentId').value = enrollmentId;
    document.getElementById('addGradeModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    // Reset forms
    document.querySelectorAll(`#${modalId} form`).forEach(form => form.reset());
}

// Form handlers
async function handleAddStudent(e) {
    e.preventDefault();
    
    const formData = {
        first_name: document.getElementById('firstName').value,
        last_name: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        student_id: document.getElementById('studentId').value,
        date_of_birth: document.getElementById('dateOfBirth').value || null
    };
    
    try {
        await apiRequest('/students', 'POST', formData);
        showAlert('Student added successfully', 'success');
        closeModal('addStudentModal');
        loadStudents();
        loadStudentSelect();
        loadDashboard();
    } catch (error) {
        // Show the specific error message from the server
        showAlert(error.message, 'error');
    }
}

async function handleAddSubject(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('subjectName').value,
        code: document.getElementById('subjectCode').value,
        description: document.getElementById('subjectDescription').value || null,
        credits: parseInt(document.getElementById('subjectCredits').value)
    };
    
    try {
        await apiRequest('/subjects', 'POST', formData);
        showAlert('Subject added successfully', 'success');
        closeModal('addSubjectModal');
        loadSubjects();
        loadDashboard();
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

async function handleAddGrade(e) {
    e.preventDefault();
    
    const formData = {
        enrollment_id: parseInt(document.getElementById('gradeEnrollmentId').value),
        grade_type: document.getElementById('gradeType').value,
        grade_name: document.getElementById('gradeName').value,
        score: parseFloat(document.getElementById('gradeScore').value),
        max_score: parseFloat(document.getElementById('gradeMaxScore').value)
    };
    
    try {
        await apiRequest('/grades', 'POST', formData);
        showAlert('Grade added successfully', 'success');
        closeModal('addGradeModal');
        loadStudentGrades();
        loadDashboard();
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Utility functions
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    // Insert at the top of the container
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    // Remove after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}