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


## 👤 Author

**iH4xCode**
- GitHub: [@iH4xCode](https://github.com/iH4xCode)
- Repository: [student-management-system](https://github.com/iH4xCode/student-management-system)


