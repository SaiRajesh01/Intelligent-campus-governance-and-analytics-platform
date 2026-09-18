# Smart Campus Governance & Intelligence System (SCGIS)

A full-stack, enterprise-grade governance and grievance intelligence platform for academic institutions. SCGIS enables students to submit and track complaints transparently, empowers department heads to resolve issues within strict SLA deadlines, and equips campus administrators with AI-assisted classification, SLA escalation monitoring, and institutional trend forecasting.

---

## 🌟 Key Features

- **Role-Based Access Control (RBAC)**:
  - **Student**: File complaints (with option for anonymity), monitor live ticket status, view SLA timelines, and submit star feedback ratings upon resolution.
  - **Department Head**: Dedicated queue to manage assigned department grievances, update workflow status, track resolution milestones, and communicate resolutions.
  - **Administrator**: Master governance console to oversee campus-wide complaints, execute bulk status updates, prune invalid records, monitor SLA escalations, and analyze institutional performance.
- **AI-Powered Categorization & Urgency Escalation**:
  - Automatic category classification and keyword-driven urgency escalation (Low, Medium, High, Critical) ensuring safety and infrastructure emergencies are prioritized instantly.
- **Automated SLA Tracking & Cron Escalation**:
  - Department-specific and urgency-based SLA deadline calculation.
  - Background cron job running every 15 minutes to automatically flag and escalate overdue complaints.
- **Real-Time WebSocket Notifications & Live Toast Alerts**:
  - Socket.io powered instant notifications dispatched to student submitters and department heads when tickets are filed, updated, or escalated.
  - Notification dropdown panel with unread badge counter and floating toast alerts.
- **Institutional Analytics & Predictive Forecasting**:
  - Interactive charts powered by Recharts (Volume trends, Category breakdown pie charts, Department load bar graphs).
  - Moving-average time-series forecasting estimating future complaint volumes.
  - Department Leaderboard gamified by resolution rate (40%), SLA compliance (40%), and turnaround speed (20%).
- **Theme Engine (Dark / Light Mode)**:
  - Global theme toggle persisted across all views with tailored high-contrast accessible color tokens.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4 + Vanilla CSS Design Tokens
- **Routing**: React Router DOM v7
- **Data Visualization**: Recharts v3
- **Networking & Real-Time**: Axios + Socket.io Client
- **Linter**: Oxlint

### Backend
- **Runtime**: Node.js (CommonJS)
- **Framework**: Express 5
- **Database**: MongoDB with Mongoose ODM
- **Real-Time Engine**: Socket.io Server
- **Security & Auth**: JSON Web Tokens (JWT), bcryptjs password hashing, custom input validation middleware
- **Scheduled Tasks**: node-cron (automated SLA escalation check every 15 minutes)

---

## 🏗 System Architecture & Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React 19 + Vite)                      │
│   Student Portal  │  Department Queue  │  Admin Console & Analytics    │
│   ThemeContext    │  AuthContext       │  NotificationContext (Socket) │
└───────────────────┬────────────────────────────┬───────────────────────┘
                    │ REST API (Axios)           │ WebSockets (Socket.io)
                    ▼                            ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     BACKEND (Express 5 + Socket.io)                    │
│   Auth Controller  │ Complaint Controller │ Analytics & Leaderboard    │
│   Validation MW    │ Role & Auth MW       │ Escalation Cron Service    │
└───────────────────┬────────────────────────────────────────────────────┘
                    │ Mongoose ODM
                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        DATABASE (MongoDB Atlas)                        │
│   Users  │  Departments  │  Complaints  │  Notifications  │  Feedback │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Flow Description:
1. **Complaint Submission**: Student submits a grievance $\rightarrow$ Validation Middleware sanitizes inputs $\rightarrow$ AI Categorization Service detects department/urgency $\rightarrow$ SLA deadline calculated $\rightarrow$ Complaint saved $\rightarrow$ Socket.io emits live alert to assigned Department Head.
2. **Status Update**: Department Head resolves grievance $\rightarrow$ Status timeline logged $\rightarrow$ Submitter receives real-time notification $\rightarrow$ Submitter can submit star feedback.
3. **Automated Escalation**: Scheduled cron checks active tickets $\rightarrow$ If `slaDeadline < now` and status is open/in-progress $\rightarrow$ Automatically escalates status and alerts administrators.

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or later
- **MongoDB**: Local MongoDB instance or MongoDB Atlas connection URI

---

### 1. Backend Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/smart_campus?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_min_32_characters
NODE_ENV=development
```

```bash
# 4. (Optional) Seed initial departments and mock data
node scripts/seedDepartments.js
node scripts/seedComplaints.js

# 5. Start the backend server
npm run dev
# Server will run on http://localhost:5000
```

---

### 2. Frontend Setup

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

```bash
# 4. Start the Vite development server
npm run dev
# Frontend will run on http://localhost:5173
```

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user (Student, Department Head, Admin) |
| `POST` | `/api/auth/login` | Public | Authenticate user and receive JWT bearer token |

### Departments (`/api/departments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/departments` | Public | Fetch list of all campus departments |
| `POST` | `/api/departments` | Admin | Create a new campus department |

### Complaints (`/api/complaints`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/complaints` | Authenticated | Submit a new grievance (with AI auto-tagging & SLA) |
| `GET` | `/api/complaints` | Authenticated | Fetch complaints (scoped: student=self, dept=assigned, admin=all) |
| `GET` | `/api/complaints/:id` | Authenticated | Fetch full details, history, and feedback for a ticket |
| `PUT` | `/api/complaints/:id/status` | Dept / Admin | Update workflow status (`open`, `in-progress`, `escalated`, `resolved`, `closed`) |
| `DELETE` | `/api/complaints/:id` | Admin | Permanently delete a complaint record |
| `POST` | `/api/complaints/:id/feedback` | Student Submitter | Submit star rating (1-5) and satisfaction comment |

### Notifications (`/api/notifications`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | Authenticated | Get paginated notification history & unread count |
| `PUT` | `/api/notifications/read-all` | Authenticated | Mark all notifications as read |
| `PUT` | `/api/notifications/:id/read` | Authenticated | Mark a single notification as read |
| `DELETE` | `/api/notifications/:id` | Authenticated | Delete a notification item |

### Analytics & Intelligence (`/api/analytics`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/analytics/summary` | Admin / Dept | High-level metrics (volume, status counts, avg turnaround) |
| `GET` | `/api/analytics/leaderboard` | Admin / Dept | Gamified department resolution & SLA compliance rankings |
| `GET` | `/api/analytics/trends` | Admin / Dept | Historical timeline volume & moving-average prediction |

---

## 📦 Deployment Configuration

### Backend (Render / Railway)
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Required Environment Variables**:
  - `PORT=5000`
  - `MONGO_URI=<your_mongodb_connection_string>`
  - `JWT_SECRET=<your_jwt_secret_min_32_chars>`
  - `NODE_ENV=production`

### Frontend (Vercel / Netlify)
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Required Environment Variables**:
  - `VITE_API_BASE_URL=https://<your-backend-domain>/api`
  - `VITE_SOCKET_URL=https://<your-backend-domain>`
- **SPA Routing**: Handled via `vercel.json` and `netlify.toml` rewrite rules.

---

## 📄 License
ISC License. Designed and built for Smart Campus Governance (SCGIS).
