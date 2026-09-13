# WasteZero — Smart Waste Pickup & Recycling Platform

Full-stack app built from the project spec + mockups: React (Vite, Tailwind) frontend,
Node/Express backend, MongoDB database, JWT auth, Socket.io real-time chat, and an
admin panel.

## Stack

- **Frontend:** React 18, Vite, React Router, Tailwind CSS, Socket.io-client, Axios, react-hot-toast, lucide-react
- **Backend:** Node.js, Express, MongoDB/Mongoose, JWT, bcrypt, Socket.io, express-validator, helmet, rate limiting
- **Auth:** JWT bearer tokens, role-based access control (`volunteer`, `ngo`, `agent`, `admin`)

## Project structure

```
wastezero/
├── backend/
│   ├── config/db.js            MongoDB connection
│   ├── models/                 Mongoose schemas (User, Pickup, Opportunity, Application, Message, WasteStat, Notification, AdminLog)
│   ├── middleware/              auth (JWT), role guard, validation, central error handler
│   ├── controllers/             business logic per module
│   ├── routes/                  Express routers (all prefixed /api/...)
│   ├── socket/socketHandler.js  authenticated Socket.io chat
│   ├── utils/matching.js        agent-assignment & volunteer-match scoring
│   ├── utils/seed.js            demo data matching the mockups
│   └── server.js                app entrypoint
└── frontend/
    └── src/
        ├── api/                 axios instance + typed endpoint calls
        ├── context/              Auth, Theme (dark mode), Socket
        ├── components/           Sidebar, Navbar, Layout, ProtectedRoute, etc.
        ├── pages/                one file per screen from the mockups
        └── App.jsx               routing (public + protected + role-gated)
```

## Prerequisites

- Node.js 18+
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas connection string

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env      # edit JWT_SECRET and MONGO_URI if needed
npm install
npm run seed               # optional: creates demo accounts + sample opportunities
npm run dev                 # http://localhost:5000
```

Demo accounts created by `npm run seed`:

| Role      | Username     | Password      |
|-----------|--------------|---------------|
| Admin     | `admin`      | `admin123`    |
| NGO       | `greenearth` | `ngo12345`    |
| Volunteer | `ganesh`     | `volunteer123`|
| Agent     | `agent1`     | `agent12345`  |

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

The Vite dev server proxies `/api` and `/socket.io` to `http://localhost:5000` (see
`vite.config.js`), so no CORS setup is needed in development.

### 3. Production build

```bash
cd frontend
npm run build                # outputs static files to frontend/dist
```

Serve `frontend/dist` from any static host (Netlify, Vercel, Nginx, etc.) and point
`CLIENT_URL` in the backend `.env` at that origin. Set `VITE_API_URL` in the frontend
if the API is on a different origin than the frontend in production.

## What's implemented

- **Auth:** register/login with JWT, hashed passwords (bcrypt), role selection
  (Volunteer / NGO / Admin at signup; `agent` role used internally for pickup routing),
  route-level and role-level authorization, brute-force rate limiting on auth endpoints.
- **User management:** profile editing, password change, per-role dashboards.
- **Pickups:** schedule a pickup, automatic best-agent assignment (proximity +
  workload scoring), status lifecycle (pending → assigned → in-progress → completed),
  cancellation, waste-stat + CO₂ logging on completion.
- **Opportunities:** NGO/Admin create, edit, delete; search & status filter; volunteer
  applications with a skill/location match score.
- **Messaging:** real-time chat over Socket.io (JWT-authenticated sockets), REST
  fallback, conversation list with unread counts, typing-safe reconnect handling.
- **Notifications:** in-app bell with live socket push + REST history, mark
  read/all-read.
- **Admin panel:** platform stats, user management (suspend/reinstate/delete —
  admins protected from self-action), admin action log, downloadable JSON report.
- **UI:** responsive sidebar/topbar layout, dark mode (persisted), loading states,
  empty states, inline form validation with field-level error messages, toast
  notifications for every success/error path.
- **Security:** helmet, mongo-sanitize, xss-clean, rate limiting, centralized error
  handler that never leaks stack traces in production, suspended-user lockout.

## Notes on scope

This was built from the provided project spec and UI mockups (no existing codebase
was supplied) — see the milestone breakdown in the original brief for the module
mapping. A few pragmatic decisions worth knowing about:

- The spec mixes two related concepts (waste **pickups** with agent assignment, and
  volunteer **opportunities** with NGOs) — both are modeled as first-class features,
  matching what the mockups show (Schedule Pickup + Opportunities as separate nav
  items).
- `role` includes `agent` (not in the original signup dropdown) because pickups need
  someone to be assigned to; create agent accounts via the admin panel or the seed
  script for now — you may want to add an admin-only "create agent" UI.
- Image uploads aren't wired to file storage — opportunities take an `imageUrl`
  string field. Swap in S3/Cloudinary if you need actual uploads.
- Email notifications are stubbed as "coming soon" in Settings — only in-app +
  socket notifications are implemented.
