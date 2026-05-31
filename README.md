# ⚡ TaskFlow — MERN Task Automation App

A full-stack task management application built with the MERN stack, featuring a Kanban board, JWT authentication, drag-and-drop, and automated email notifications.

![TaskFlow](https://img.shields.io/badge/Stack-MERN-818CF8?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-34D399?style=for-the-badge)

## 🚀 Features

- **Kanban Board** — drag and drop tasks across To Do, In Progress, Review and Done columns
- **JWT Authentication** — secure login and signup with hashed passwords
- **Task Automation** — scheduler automatically moves overdue tasks and sends email alerts
- **Email Notifications** — daily overdue task emails via Resend API
- **Search & Filter** — filter tasks by priority or search by title and assignee
- **Due Dates & Assignees** — track deadlines with color coded overdue indicators
- **Dark Neon UI** — professional dark theme with neon color accents

## 🛠️ Tech Stack

### Frontend
- React 18 with Vite
- Axios for API calls
- CSS-in-JS styling

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT for authentication
- bcryptjs for password hashing
- node-cron for task scheduling
- Resend for email notifications

## 📁 Project Structure
mern-task-app/
├── client/                 # React frontend
│   └── src/
│       ├── api/            # Axios API helpers
│       ├── components/     # React components
│       └── App.jsx
└── server/                 # Express backend
├── middleware/         # Auth middleware
├── models/             # Mongoose schemas
├── routes/             # API routes
├── services/           # Email service
└── scheduler.js        # Task automation

## ⚙️ Getting Started

### Prerequisites
- Node.js v18+
- MongoDB running locally
- Resend API key

### Installation

1. Clone the repo
```bash
git clone https://github.com/khushi21jain/mern-task-app.git
cd mern-task-app
```

2. Install server dependencies
```bash
cd server
npm install
```

3. Install client dependencies
```bash
cd ../client
npm install
```

4. Create `server/.env`

MONGO_URI=mongodb://localhost:27017/mern-task-app
PORT=5000
JWT_SECRET=your_jwt_secret
RESEND_API_KEY=your_resend_api_key

5. Start the server
```bash
cd server
npm start
```

6. Start the client
```bash
cd client
npm run dev
```

7. Open `http://localhost:5173`

## 📸 Screenshots

> Kanban board with dark neon theme, JWT login, drag and drop cards

## 🔗 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login and get token | No |
| GET | `/api/tasks` | Get all tasks | Yes |
| POST | `/api/tasks` | Create a task | Yes |
| PUT | `/api/tasks/:id` | Update a task | Yes |
| DELETE | `/api/tasks/:id` | Delete a task | Yes |

## 👩‍💻 Author

**Khushi Jain**
- GitHub: [@khushi21jain](https://github.com/khushi21jain)

## 📄 License

MIT License