import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Event } from "../models/Event.js";
import { Pass } from "../models/Pass.js";
import { ScanLog } from "../models/ScanLog.js";
import { Attendee } from "../models/Attendee.js";

const INITIAL_EVENTS = [
  {
    trackCode: "HACK-AI-01",
    title: "HackCampus 2026: 36-Hour AI Hackathon",
    subtitle: "Flagship Hackathon",
    description:
      "Build agentic AI workflows, spatial intelligence systems, or zero-knowledge verifiable credentials. Mentored by Silicon Valley engineers with high-performance edge compute clusters on-site.",
    category: "hackathon",
    categoryLabel: "Flagship Hackathon",
    statusBadge: "Only 14 Spots Left",
    statusTone: "amber",
    teamSpec: "Teams of 2-4",
    teamType: "both",
    entryType: "free",
    prizeLabel: "Prize Pool: $12,500",
    prizeTone: "tertiary",
    registeredCount: 186,
    capacityCount: 200,
    quotaLabel: "Allocation Manifest",
    quotaUnit: "Hacker Teams Accreditated",
    progressColor: "bg-primary-container",
    dateShort: "Dec 11-13, 2026 (36h)",
    dateFilter: "fri",
    dateFull: "Dec 11-13, 2026",
    venue: "Main Quad & Turing Hall",
    ctaLabel: "Register Solo or Team",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBf1sizUemuI_G8GVz3DkqnPT6uB7HAoWMwPhJu9Ug2Z0kwcor_mMYkO-enprnwQR5UWVM95-UTFnwN20vrS7Nj5A2xBhY8mfOKwRDMjZsJg4GVyXcnfc4bApaOIJt2D4L-wICfQmV5PMI2nYxOY3DlmPdo80qfgdUSdTu3CpvDMK87EoDA9iaVMJRwucMNfcvJWdtpH-Xv8vqiWxj5pgEkvcwaew1Pf_PqURjUcWA",
    featured: true,
    organizerNote:
      "Presented by Department of Computer Science & Engineering in partnership with OpenAI Campus Fellowship & GitHub Education.",
  },
  {
    trackCode: "ROBO-HW-02",
    title: "RoboWars: Combat Robotics Championship",
    subtitle: "Heavyweight & Featherweight",
    description:
      "15kg and 60kg autonomous & RF pneumatic crushers compete inside the armored octagon. Pit crews get dedicated telemetry desks.",
    category: "robotics",
    categoryLabel: "Hardware",
    statusBadge: "3 Spots Left",
    statusTone: "amber",
    teamSpec: "Heavyweight & Featherweight",
    teamType: "team",
    entryType: "paid",
    prizeLabel: "Prize: $5,000",
    prizeTone: "primary",
    registeredCount: 29,
    capacityCount: 32,
    quotaLabel: "Arena Quota",
    quotaUnit: "Bots Registered",
    progressColor: "bg-error",
    dateShort: "Fri Dec 11",
    dateFilter: "fri",
    dateFull: "Fri Dec 11, 2026",
    venue: "Mech Hangar B",
    ctaLabel: "Get Combat Pass",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBdcxfi8UoP4-EpPyKOGruUCok84QD4cijohgRlt3EAFQMdADIiZ-zrx7NUC_arzuf16jsM1_hex95YODGxv9B7X3XHg4I1ZlSSCNgPlWZlComBiAluQHVXIzd_p__Z4G1lkue7mGeBxKkbNpszYT8g8WGYaQTMMm2L4DGgP6n7mZ7BqSNW6TzpyOBX6cHSWMh6Y1jv15sVrztTwshT8PSVMhyI6HiWTNBJ0SyZfNs",
  },
  {
    trackCode: "DES-PX-04",
    title: "PixelCraft UI/UX Design Sprint",
    subtitle: "Solo or Duo",
    description:
      "6-hour lightning design sprint: Redesign decentralized education infrastructure for next-billion users. Judged by senior product designers.",
    category: "design",
    categoryLabel: "Design Track",
    statusBadge: "Closing in 4 Hours",
    statusTone: "crimson",
    teamSpec: "Solo or Duo",
    teamType: "both",
    entryType: "free",
    prizeLabel: "Prize: $3,200",
    prizeTone: "tertiary",
    registeredCount: 92,
    capacityCount: 100,
    quotaLabel: "Seats Registered",
    quotaUnit: "Designers",
    progressColor: "bg-secondary-container",
    dateShort: "Fri Dec 11",
    dateFilter: "fri",
    dateFull: "Fri Dec 11, 2026",
    venue: "Design Studio 3",
    ctaLabel: "Get Sprint Pass",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAFCv89F8T4sBB4McBumECiaiYChqxPdCf5BSUyP26YKkPqZBsRAwPebdhP8X4sdcHltqnATnHqc1T31x00zq8ypy8UwEIgNEVgtY7OVbxUFHz5r5hU34-bkL9YOuInnuUxNDI7orgV5XFa-G9F9A1KZDK-rBcAeCwFn46bNlEJ5HNfhf_o-wQWu_xHSsf78FBphu_9oFJkE567WCun7I05WkfJrDewxFELXS7ID4c",
  },
  {
    trackCode: "CUL-BOTB-03",
    title: "Battle of the Bands: Campus Rock Fest",
    subtitle: "Audience & Band Registrations",
    description:
      "12 collegiate indie and rock bands face off under professional festival sound rigs. Exclusive merchandise tokens included with RSVP.",
    category: "cultural",
    categoryLabel: "Cultural",
    statusBadge: "Passes Selling Fast",
    statusTone: "emerald",
    teamSpec: "Audience & Band Registrations",
    teamType: "both",
    entryType: "free",
    prizeLabel: "Free Student Pass",
    prizeTone: "neutral",
    registeredCount: 128,
    capacityCount: 150,
    quotaLabel: "General Admission",
    quotaUnit: "Registered",
    progressColor: "bg-primary-container",
    dateShort: "Sat Dec 12",
    dateFilter: "sat",
    dateFull: "Sat Dec 12, 2026",
    venue: "Open Amphitheater",
    ctaLabel: "Get Free Pass",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCn3ww7fZqMoN6JEP9guLkJJb80Xysp7SGVuM13B_Q-j5I3SJMLqAJPvULh4EbYW5pFW3VH9zPv8RkaSitEkiw450ve3pRlWdaehYHRoqH1Oe6n3OZ1nNVKacn7poHtRsyYf73OzO3qeHMIWHrr5d6o8DyLGKyOjeWZeJUMeCNqPmWcd2Nkuh9emq5Z1TFmyz0gr_4S46QgNayVWTdZp2Pt3CmVJuA8-LgwxYCUZw4",
  },
  {
    trackCode: "AI-PC-05",
    title: "PromptCraft: Generative AI Showdown",
    subtitle: "Solo Competitor",
    description:
      "Reverse-engineer multimodal diffusion artifacts and build self-correcting agent chains under real-time benchmark evaluation.",
    category: "hackathon",
    categoryLabel: "AI Track",
    statusBadge: "Instant QR Pass",
    statusTone: "neutral",
    teamSpec: "Solo Competitor",
    teamType: "solo",
    entryType: "free",
    prizeLabel: "Prize: $2,500",
    prizeTone: "tertiary",
    registeredCount: 44,
    capacityCount: 60,
    quotaLabel: "Lab Quota",
    quotaUnit: "Registered",
    progressColor: "bg-tertiary-container",
    dateShort: "Sat Dec 12",
    dateFilter: "sat",
    dateFull: "Sat Dec 12, 2026",
    venue: "Lab 404, CS Wing",
    ctaLabel: "Get Pass",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBZ18CnS5Tdawp2ceLAdCVZSEYtAGF9CRuL-8xu3B5dsBpxSWJQcRICIw87ruva1AM3CdW2EZWkc5ZBBzoFwc8FaeFr1UvDfByGDds9zo58rasx2oPwOIz2wvuaDYuWnQ-JtrcV_Q5c9YG-nBqBF5LBE7BSh6B2psOHJBwMy7Q2z6ECvySNVDO7DIV9UXem3-Do0lIduPhLHb7V9HVHw7LQe6F1juKH92wsJercL2U",
  },
  {
    trackCode: "ESP-VAL-06",
    title: "Valorant Collegiate Invitational",
    subtitle: "Teams of 5 + 1 Sub",
    description:
      "Double elimination bracket hosted on zero-ping LAN servers. Main-stage caster desk and live Twitch stream broadcast integration.",
    category: "esports",
    categoryLabel: "Esports LAN",
    statusBadge: "2 Team Slots Left",
    statusTone: "amber",
    teamSpec: "Teams of 5 + 1 Sub",
    teamType: "team",
    entryType: "paid",
    prizeLabel: "Prize: $4,000",
    prizeTone: "primary",
    registeredCount: 14,
    capacityCount: 16,
    quotaLabel: "Team Slots",
    quotaUnit: "Teams Checked In",
    progressColor: "bg-secondary-container",
    dateShort: "Sat Dec 12",
    dateFilter: "sat",
    dateFull: "Sat Dec 12, 2026",
    venue: "Gaming Arena",
    ctaLabel: "Register Squad",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA1wWGiOCh8GQcr5lEeD-s9D_MDWDWblUGHYCF_zQpmmQp9sJpqUKGv3pBSfc5DNW5XYMVDb67p0l4UrJ85j4_oGswA_GgYJXb0UiGv1Lk1kIx7vSASMIteqm7gVc6KBUQIn-PqMfPBccOKEUg3Uf8P7DbH5zr2cvRV3GGYiLt423Aaor_2Iq948166Z0VhT1DRwbSvT1TWbWg8pade6AXrnY7qdmb8XhMVq1hSr40",
  },
  {
    trackCode: "KEY-TH-08",
    title: "Keynote: Autonomous Systems by Dr. Thorne",
    subtitle: "General Student RSVP",
    description:
      "Chief Scientist at Apex Robotics explores real-world foundation models for humanoid autonomy, physical AI, and edge verification.",
    category: "robotics",
    categoryLabel: "Distinguished Keynote",
    statusBadge: "Open for All",
    statusTone: "neutral",
    teamSpec: "General Student RSVP",
    teamType: "solo",
    entryType: "free",
    prizeLabel: "Certificate Issued",
    prizeTone: "tertiary",
    registeredCount: 410,
    capacityCount: 500,
    quotaLabel: "Auditorium Seats",
    quotaUnit: "RSVPs",
    progressColor: "bg-tertiary-container",
    dateShort: "Sun Dec 13",
    dateFilter: "sun",
    dateFull: "Sun Dec 13, 2026",
    venue: "Kavli Auditorium",
    ctaLabel: "RSVP Keynote Pass",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAZlGwD1bnh8JU5r6rEoHwS7Q-8NpAwYpfK58mf_ci9X3kI6aNr8gQ3UrWtFUfXg_8TUHBxUV_Ue-7WafxA6nWV9E_xGoazaAPc8X22hSZJ3MHEI8DIXfwQVYXYJKBumwxyIBgYysxOiw--QfLa4ZpqUQUBFYe9moQUyvrMTdvqBdrEPkZHBoKZNOB34v20qCyCYG3AUPjn8nitGn-XXYVZUJlLt2wJNkpmY18muJg",
  },
];

const INITIAL_PASSES = [
  {
    passCode: "EH-2025-HCK-9481",
    eventTitle: "HackCampus 2025: 36-Hour AI Hackathon",
    trackLabel: "AI / Web3 Track",
    shortTabLabel: "HackCampus 2025 (Active)",
    dateRange: "Oct 24 - 26, 2025",
    gateTime: "Gates open 08:30 AM",
    venue: "Turing Innovation Hall",
    teamName: "Team SyntaxErrors",
    booth: "Booth B-14",
    tierLabel: "3 Registered Engineers · Hackathon Tier A",
    holderName: "Alex Chen",
    holderEmail: "alex.chen@campus.edu",
    teammates: [
      { name: "Maya Patel", role: "UI/UX Lead", icon: "palette" },
      { name: "Jordan Rivera", role: "Fullstack Eng", icon: "terminal" },
    ],
    countdownLabel: "Starts in 02d 14h 22m",
    sigHash: "sha256:7f49a3c9e88c2f10b7492c140",
    status: "Confirmed",
    dotColor: "coral",
  },
  {
    passCode: "EH-2025-RBW-1102",
    eventTitle: "RoboWars 2025 (Featherweight Division)",
    trackLabel: "Robotics Hardware",
    shortTabLabel: "RoboWars 2025",
    dateRange: "Oct 25, 2025",
    gateTime: "Pit opens 01:15 PM",
    venue: "Arena Mech Bay 3",
    teamName: "Solo Combatant",
    booth: "Bay M-03",
    tierLabel: "Solo Combatant · Mech Inspection Cleared",
    holderName: "Alex Chen",
    holderEmail: "alex.chen@campus.edu",
    teammates: [],
    countdownLabel: "Starts in 03d 04h 10m",
    sigHash: "sha256:3d18c7a4e41b9a22f993bc821",
    status: "Check-In Ready",
    dotColor: "emerald",
  },
];

const INITIAL_SCAN_LOGS = [
  {
    time: "09:14:02",
    attendee: "Alex Chen",
    subtitle: "(Team SyntaxErrors)",
    event: "HackCampus 2025",
    passId: "EH-2025-HCK-9481",
    status: "Valid",
  },
  {
    time: "09:13:41",
    attendee: "Priya Sharma",
    event: "Stanford AI Summit",
    passId: "EH-2025-ENG-3190",
    status: "Duplicate",
  },
  {
    time: "09:12:15",
    attendee: "Marcus Brody",
    event: "Robotics Arena V",
    passId: "EH-2025-ROB-1102",
    status: "Manual",
  },
  {
    time: "09:10:55",
    attendee: "Jordan Rivera",
    event: "Algorithmic Game Design",
    passId: "EH-2025-DES-8114",
    status: "Late",
    lateMinutes: 10,
  },
  {
    time: "09:09:40",
    attendee: "Elena Rostova",
    subtitle: "(Faculty Advisor)",
    event: "HackCampus 2025",
    passId: "EH-2025-FAC-0042",
    status: "Valid",
  },
];

const INITIAL_ATTENDEES = [
  {
    passId: "EH-2025-HCK-9481",
    initials: "AC",
    name: "Alex Chen",
    email: "alex.chen@campus.edu",
    teamInfo: "Team: QuantumLeap (+2 teammates)",
    event: "HackCampus 48h",
    eventKey: "hackcampus",
    track: "AI & Distributed Systems",
    type: "Team",
    typeLabel: "Team (3 pax)",
    status: "Present",
    statusLabel: "Present",
    scanTime: "09:14 AM",
    gateLocation: "Gate 2 (Turnstile B)",
  },
  {
    passId: "EH-2025-RBW-2391",
    initials: "MP",
    name: "Maya Patel",
    email: "maya.patel@campus.edu",
    teamInfo: "Solo Participant",
    event: "RoboWars Arena",
    eventKey: "robowars",
    track: "Heavyweight Combat",
    type: "Solo",
    typeLabel: "Solo",
    status: "Late",
    statusLabel: "Late (90m+)",
    scanTime: "10:45 AM",
    gateLocation: "Gate 4 (Admin Desk)",
  },
  {
    passId: "EH-2025-PXC-7102",
    initials: "JD",
    name: "Jordan Diaz",
    email: "jordan.diaz@campus.edu",
    teamInfo: "Solo Participant",
    event: "PixelCraft UI/UX",
    eventKey: "pixelcraft",
    track: "Design Marathon",
    type: "Solo",
    typeLabel: "Solo",
    status: "Pending",
    statusLabel: "Pending",
    scanTime: "Unscanned",
    gateLocation: "En route",
  },
  {
    passId: "EH-2025-HCK-1102",
    initials: "SK",
    name: "Siddharth Kumar",
    email: "skumar@campus.edu",
    teamInfo: "Team: HyperCode (+3 teammates)",
    event: "HackCampus 48h",
    eventKey: "hackcampus",
    track: "Web3 Infrastructure",
    type: "Team",
    typeLabel: "Team (4 pax)",
    status: "Blocked",
    statusLabel: "Scan Blocked",
    scanTime: "09:21 AM (Duplicate)",
    gateLocation: "Gate 1 • First seen 08:50",
  },
  {
    passId: "EH-2025-CYB-4089",
    initials: "EW",
    name: "Elena Watson",
    email: "elena.watson@campus.edu",
    teamInfo: "Solo Participant",
    event: "CyberPulse CTF",
    eventKey: "cyberpulse",
    track: "Binary Exploitation",
    type: "Solo",
    typeLabel: "Solo",
    status: "Present",
    statusLabel: "Present",
    scanTime: "08:44 AM",
    gateLocation: "Gate 3 (East Access)",
  },
];

async function seed() {
  const conn = await connectDB();
  if (!conn) {
    console.error("Could not connect to MongoDB. Skipping seeding.");
    process.exit(1);
  }

  console.log("Seeding EventHub database...");

  try {
    await Event.deleteMany({});
    await Pass.deleteMany({});
    await ScanLog.deleteMany({});
    await Attendee.deleteMany({});

    await Event.insertMany(INITIAL_EVENTS);
    await Pass.insertMany(INITIAL_PASSES);
    await ScanLog.insertMany(INITIAL_SCAN_LOGS);
    await Attendee.insertMany(INITIAL_ATTENDEES);

    console.log("✅ EventHub Database seeded successfully on MongoDB Atlas!");
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seed();
