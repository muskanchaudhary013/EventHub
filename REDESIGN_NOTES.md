# EventHub: project and redesign summary (for handing to another AI)

## 1. Project
- **EventHub**: Smart Event Management System, Hack4Tech Problem Statement 4 (Event AI Build-a-thon), Team Byte Busters.
- Goal: discover events, register solo or as a team, receive a unique QR pass, scan it at the gate (Valid / Already checked in / Invalid), and show organizers live attendance.
- Roles: student, volunteer (scanner), organizer (admin dashboard).
- Stack: Next.js 15, React 19, Tailwind 4, Firebase Auth/Firestore (configured via env), lucide-react.

## 2. State of the code BEFORE this redesign (findings)
- `backend/` contains only a README. The deck promises JWT, bcrypt, signed QR tokens, rate limiting, email delivery and an audit log; none of that exists server-side yet.
- Events, passes, attendees and scan logs live in React state (`src/context/EventHubContext.tsx`) seeded from mock data (`src/lib/eventhub-data.ts`). Nothing persists across refresh. Firebase is set up but the context does not use it.
- Passes are not really signed: the pass code and `sigHash` come from a random number. Registration modal pre-fills mock values ("Alex Rivera").
- Roles are self-selected at signup, which conflicts with "role-based access".
- The original zip contained `.next` and was ~740 MB uncompressed.

## 3. What was done in this session
1. Built a standalone HTML live preview of a redesigned homepage, then restyled it to match a user-supplied reference (dark purple/magenta "EventEase" style).
2. Ported that design into the real Next.js app (homepage only):
   - `frontend/src/app/page.tsx`: fully rewritten. Still uses the real `useEventHub()` data, `useAuth()`, the existing `QuickRegistrationModal` and `QrCodeSvg`.
   - `frontend/src/app/home.css`: new, all styles scoped under `.eh` so other pages are unaffected.
   - `frontend/src/app/layout.tsx`: added the Montserrat font (`--font-montserrat`).
   - Originals saved as `frontend/page.original.tsx.txt` and `frontend/layout.original.tsx.txt` (restore by copying back and renaming).
3. New homepage sections: gradient pill header; hero with countdown; 5-card event carousel with real event photos (centre card enlarged); event tracks tiles that filter the grid; "Trending at the fest" search plus day and solo/team filters; photo event cards with seats-left bar and working bookmark star; QR pass demo with a gate-scanner simulation (first scan = Valid, second = Already checked in); registration totals per track from real data; "Running an event?" CTA; footer.
4. Verified: `tsc --noEmit` passes with zero errors. A full `next build` could not be completed in the sandbox only because it cannot download Google Fonts; run `npm install && npm run dev` locally.

## 4. Things the team must do or know
- Set the real fest start in `FEST_START_ISO` at the top of `src/app/page.tsx` (currently a placeholder, 2026-12-12 09:00 IST). The countdown runs to it.
- The registration popup and the other pages (login, passes, FAQ, student/volunteer/organizer dashboards) still use the OLD light theme, so they look different from the new homepage until restyled.
- The old homepage's ticker banner, rulebook drawer and entry (free/paid) filter were dropped in the new design. Restore from `page.original.tsx.txt` if needed.
- "Event news", Instagram gallery and newsletter blocks from the reference were intentionally left out as irrelevant to EventHub.

## 5. Suggested next steps
1. Restyle the registration modal, `/passes`, `/login`, `/faq` and the three dashboards in the same dark purple theme.
2. Make data real: write registrations, passes and scans to Firestore.
3. Generate real signed QR tokens and verify them in the scanner (server-side or Cloud Function); block duplicate scans for real.
4. Assign roles server-side instead of letting users pick them at signup.
5. Build the backend items from the deck (rate limiting, audit log, email delivery, CSV export).
