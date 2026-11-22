# EventHub

Campus Events, Digital QR Ticketing, Gate Check-in & Operations Platform.

## Project Structure

- `frontend/` — Next.js (App Router) + Tailwind CSS v4 + Google Fonts + Firebase Auth & Firestore
- `backend/` — Backend services (ready for API development)

## Getting Started (Frontend)

```bash
cd frontend
cp .env.example .env.local
# Fill in your Firebase NEXT_PUBLIC_FIREBASE_* credentials in frontend/.env.local
npm install
npm run dev
```

## Role-Based Dashboards

During signup (`/login?mode=signup`), each user selects the dashboard assigned to their account:

1. **Student Dashboard** (`/dashboard/student`) — Manage registered events, digital QR passes, bookmarked tracks, and schedule.
2. **Volunteer Dashboard** (`/dashboard/volunteer`) — Live Gate Scanner Console with QR validation, manual wedge fallback, and real-time scan logs.
3. **Organizer Dashboard** (`/dashboard/organizer`) — Event management, venue load & capacity tracking, attendee registry, manual overrides, and CSV export.
