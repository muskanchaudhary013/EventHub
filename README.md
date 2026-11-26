# EventHub — Smart Campus Event Management System
> **Hack4Tech Problem Statement 4** | **Team Byte Busters**

EventHub is a modern full-stack MERN + Next.js platform for discovering campus events, issuing cryptographic QR entry passes, scanning at gates in real time, and tracking multi-track live attendance across student, volunteer, and organizer dashboards.

---

## Repository Structure

```
EventHub/
├── frontend/             # Next.js 15, React 19, Tailwind CSS v4, Firebase Auth
│   ├── src/app/          # App Router (pages: /, /passes, /faq, /login, /dashboard/*, /scanner, /admin)
│   ├── src/components/   # Reusable UI components & modals
│   ├── src/context/      # AuthContext & EventHubContext
│   ├── src/lib/          # API client (api.ts), Firebase SDK, Stitch MCP, data models
│   └── .env.example      # Frontend environment template
├── backend/              # Node.js, Express, MongoDB Atlas, Mongoose
│   ├── src/config/       # MongoDB connection manager (db.js)
│   ├── src/controllers/  # Event, Pass, Scan, Attendee, and User controllers
│   ├── src/models/       # Mongoose schemas (Event, Pass, ScanLog, Attendee, User)
│   ├── src/routes/       # Modular REST endpoints under /api/*
│   ├── src/seed/         # Atlas database seed script (seedData.js)
│   └── .env.example      # Backend environment template
├── .gitattributes        # Standardizes LF line endings across Windows, Mac & Linux
├── .gitignore            # Protects credentials, OS files, and editor caches
└── package.json          # Root scripts to run both frontend and backend
```

---

## Quick Start Guide for Teammates

### 1. Clone the Repository
```bash
git clone https://github.com/muskanchaudhary013/EventHub.git
cd EventHub
```

### 2. Install All Dependencies
You can install both frontend and backend dependencies in one step:
```bash
npm run install:all
```
*(Or install them individually via `cd frontend && npm install` and `cd backend && npm install`)*

### 3. Setup Environment Files
Create local `.env` files from the examples:

- **Frontend**:
  Copy `frontend/.env.example` to `frontend/.env.local`:
  ```bash
  # Windows PowerShell:
  Copy-Item frontend\.env.example frontend\.env.local

  # Mac / Linux:
  cp frontend/.env.example frontend/.env.local
  ```

- **Backend**:
  Copy `backend/.env.example` to `backend/.env`:
  ```bash
  # Windows PowerShell:
  Copy-Item backend\.env.example backend\.env

  # Mac / Linux:
  cp backend/.env.example backend/.env
  ```
  *(Fill in your MongoDB Atlas cluster URI in `backend/.env`)*

### 4. Run the Project
- **Run Both Frontend & Backend Concurrently:**
  ```bash
  npm run dev
  ```
- **Or Run Separately:**
  - Frontend (`http://localhost:3000`): `npm run dev:frontend`
  - Backend (`http://localhost:5000`): `npm run dev:backend`

- **Seed the Database with Initial Fest Events:**
  ```bash
  npm run seed
  ```

---

## Team Git Collaboration Best Practices

To make sure everyone can pull, branch, commit, and push smoothly without conflicts:

1. **Always pull before starting new work:**
   ```bash
   git pull origin master
   ```
2. **Work in a feature branch for new changes:**
   ```bash
   git checkout -b feature/your-feature-name
   # ... make changes ...
   git add .
   git commit -m "feat: description of change"
   git push origin feature/your-feature-name
   ```
3. **Never commit `.env` or `.env.local` files:**
   These files are ignored in `.gitignore` to keep database credentials and API keys secure and device-specific.
4. **Editor agnostic:**
   Editor folders like `.vscode` and `.idea` are automatically ignored. You and your teammates can use VS Code, WebStorm, or any IDE on Windows, Mac, or Linux without collisions.
