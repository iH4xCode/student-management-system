# 🎓 Student Management System

A comprehensive web-based student management system with enrollment tracking, grade management, and intuitive dashboard. Built with modern web technologies for educational institutions.

## 📸 Preview

```
📊 Dashboard  |  👥 Students  |  📚 Subjects  |  📝 Grades
```

### ✨ Key Features
- 🎯 **Student Management** - Add, edit, view, and delete student records
- 📚 **Subject Management** - Create and organize academic subjects
- 🔄 **Enrollment System** - Flexible student-subject enrollment
- 📊 **Grade Tracking** - Activities, quizzes, and exams with percentage calculations
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎨 **Modern UI** - Clean, intuitive interface with smooth animations

---

## 🚀 Quick Start

### Prerequisites
Make sure you have these installed:
- **Node.js** (version 14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)

### 📥 Installation

#### Option 1: Clone from GitHub
```bash
# Clone the repository
git clone https://github.com/iH4xCode/student-management-system.git

# Navigate to project directory
cd student-management-system

# Install dependencies
npm install

# Start the application
npm start
```

#### Option 2: Download ZIP
1. Download the ZIP file from GitHub
2. Extract to your desired location
3. Open terminal/command prompt in the extracted folder
4. Run the installation commands:
```bash
npm install
npm start
```

### 🌐 Access the Application
Once started, open your browser and go to:
```
http://localhost:3000
```

---

## 💻 Development Setup

### 🔧 Environment Setup

1. **Install Node.js**
   - Go to [nodejs.org](https://nodejs.org/)
   - Download the LTS version
   - Follow installation instructions for your OS

2. **Verify Installation**
   ```bash
   node --version
   npm --version
   ```

3. **Clone and Setup**
   ```bash
   git clone https://github.com/iH4xCode/student-management-system.git
   cd student-management-system
   npm install
   ```

### 🎮 Available Scripts

```bash
# Start the application (production mode)
npm start

# Start with auto-restart for development
npm run dev

# Install dependencies
npm install

# Check for updates
npm outdated
```

---

## 📁 Project Structure

```
student-management-system/
├── 📄 package.json          # Dependencies and scripts
├── 📄 server.js             # Express server and API routes
├── 📄 .gitignore           # Git ignore rules
├── 📄 README.md            # This file
└── 📁 public/              # Frontend files
    ├── 📄 index.html       # Main application page
    ├── 📄 script.js        # Frontend JavaScript
    └── 📄 style.css        # Application styling
```

---

## 🎯 How to Use

### 🏠 Dashboard
- View **total students**, **subjects**, and **grades** at a glance
- Quick overview of system statistics

### 👥 Student Management

#### ➕ Adding Students
1. Go to **Students** tab
2. Click **"Add Student"** button
3. Fill in the form:
   - **First Name** *(required)*
   - **Last Name** *(required)*
   - **Email** *(required, must be unique)*
   - **Student ID** *(required, must be unique)*
   - **Date of Birth** *(optional)*
4. Click **"Add Student"**

#### 👀 Viewing Student Details
1. Find the student in the list
2. Click **"View Details"**
3. See complete academic record with all subjects and grades

#### ✏️ Editing Students
1. Click **"Edit"** on any student card
2. Modify the information
3. Click **"Update Student"**

#### 🎒 Managing Enrollments
1. Click **"Manage Enrollments"** on student card
2. **To Enroll**: Select subject from dropdown → Click "Enroll"
3. **To Unenroll**: Click "Unenroll" next to subject *(warning: deletes all grades)*

### 📚 Subject Management

#### ➕ Adding Subjects
1. Go to **Subjects** tab
2. Click **"Add Subject"**
3. Fill in:
   - **Subject Name** *(e.g., "Mathematics")*
   - **Subject Code** *(e.g., "MATH101")*
   - **Description** *(optional)*
   - **Credits** *(default: 3)*
4. Click **"Add Subject"**

### 📝 Grade Management

#### 📊 Adding Grades
1. Go to **Grades** tab
2. **Select a student** from dropdown
3. Choose the subject you want to add grades for
4. Click **"Add Grade"** button
5. Fill in grade details:
   - **Grade Type**: Activity, Quiz, or Exam
   - **Grade Name** *(e.g., "Midterm Exam", "Quiz 1")*
   - **Score** *(points earned)*
   - **Max Score** *(total possible points)*
6. Click **"Add Grade"**

#### ✏️ Editing Grades
1. In the grades table, click **"Edit"** next to any grade
2. Modify the information
3. Click **"Update Grade"**

#### 🗑️ Deleting Grades
1. Click **"Delete"** next to any grade
2. Confirm the deletion

---

## 🛠️ Technical Details

### 🔧 Technologies Used
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: SQLite3 (file-based, no setup required)
- **Styling**: Custom CSS with modern design principles

### 🗄️ Database Schema

#### Students Table
```sql
- id (Primary Key)
- first_name
- last_name
- email (Unique)
- student_id (Unique)
- date_of_birth
- created_at
```

#### Subjects Table
```sql
- id (Primary Key)
- name
- code (Unique)
- description
- credits
```

#### Enrollments Table
```sql
- id (Primary Key)
- student_id (Foreign Key)
- subject_id (Foreign Key)
- enrolled_date
```

#### Grades Table
```sql
- id (Primary Key)
- enrollment_id (Foreign Key)
- grade_type (activity/quiz/exam)
- grade_name
- score
- max_score
- date_recorded
```

### 🔌 API Endpoints

#### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student with subjects
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

#### Subjects
- `GET /api/subjects` - Get all subjects
- `POST /api/subjects` - Create new subject

#### Enrollments
- `POST /api/enrollments` - Enroll student in subject
- `DELETE /api/enrollments/:id` - Unenroll student

#### Grades
- `GET /api/students/:id/grades` - Get student's grades
- `POST /api/grades` - Add new grade
- `PUT /api/grades/:id` - Update grade
- `DELETE /api/grades/:id` - Delete grade

---

## 🌐 Deployment

### 🚀 Deploy to Render (Free Hosting)

1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Create Render Account**:
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

3. **Deploy**:
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub repository
   - Configure:
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
   - Click **"Create Web Service"**

4. **Access Your Live App**:
   - Your app will be available at: `https://your-app-name.onrender.com`

### 🔧 Environment Variables (Optional)
```bash
# For production deployment
NODE_ENV=production
PORT=3000
```

---

## 🚨 Troubleshooting

### ❌ Common Issues

#### "Error loading students"
- **Cause**: Accessing HTML file directly instead of through server
- **Solution**: Always use `http://localhost:3000`, not file:// URLs

#### "Port 3000 already in use"
```bash
# Kill the process using port 3000
npx kill-port 3000

# Or use a different port
PORT=3001 npm start
```

#### "Cannot find module" errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Database issues
- Delete `students.db` file and restart - it will recreate with sample data

### 🔍 Getting Help

1. **Check browser console** (F12 → Console tab)
2. **Check server logs** in terminal
3. **Verify file structure** matches the project structure above
4. **Ensure all dependencies are installed**: `npm install`

---

## 🤝 Contributing

### 🛠️ Development Workflow

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Commit with clear messages**:
   ```bash
   git commit -m "Add: Amazing new feature"
   ```
6. **Push and create Pull Request**

### 📝 Coding Standards
- Use meaningful variable names
- Add comments for complex logic
- Follow existing code structure
- Test all functionality before submitting

---

## 🔮 Future Enhancements

### 🎯 Planned Features
- [ ] **User Authentication** - Login system for teachers/admins
- [ ] **Grade Analytics** - Charts and statistics
- [ ] **Export Features** - PDF reports and CSV exports
- [ ] **Email Notifications** - Grade updates and announcements
- [ ] **Attendance Tracking** - Student attendance management
- [ ] **Parent Portal** - Parent access to student grades
- [ ] **Mobile App** - Native mobile application

### 💡 Ideas Welcome!
Have suggestions? Create an issue or submit a pull request!

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**iH4xCode**
- GitHub: [@iH4xCode](https://github.com/iH4xCode)
- Repository: [student-management-system](https://github.com/iH4xCode/student-management-system)

---

## 🙏 Acknowledgments

- Built with modern web development best practices
- Responsive design inspired by material design principles
- RESTful API architecture
- SQLite for lightweight, portable database

---

## ⭐ Star This Project

If you found this project helpful, please consider giving it a star on GitHub! It helps others discover the project and motivates continued development.

---

**Happy Teaching! 🎓✨**

---

> **Note**: This is an educational project designed for learning web development concepts. For production use in real educational institutions, additional security measures and features should be implemented.
