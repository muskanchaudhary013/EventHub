import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Event } from "../models/Event.js";
import { Pass } from "../models/Pass.js";
import { ScanLog } from "../models/ScanLog.js";
import { Attendee } from "../models/Attendee.js";
import { Notification } from "../models/Notification.js";

const INITIAL_EVENTS = [
  {
    trackCode: "HACK-AI-00",
    title: "AI Build-a-thon",
    subtitle: "Think. Build. Innovate.",
    description:
      "Build innovative solutions using AI and showcase your skills! Mentorship, cloud compute, and fast-track evaluation for top student teams.",
    category: "hackathon",
    categoryLabel: "Hackathon",
    statusBadge: "Popular",
    statusTone: "amber",
    teamSpec: "Solo or Squad (up to 3)",
    teamType: "both",
    entryType: "paid",
    feeNumeric: 299,
    feeLabel: "₹299",
    maxTeamMembers: 3,
    prizeLabel: "Prize Pool: ₹1,50,000",
    prizeTone: "primary",
    registeredCount: 0,
    capacityCount: 200,
    quotaLabel: "Allocation Manifest",
    quotaUnit: "Seats",
    progressColor: "bg-primary-container",
    dateShort: "24 Nov 2026",
    dateFilter: "fri",
    dateFull: "24 Nov 2026",
    venue: "Seminar Hall, GLA",
    ctaLabel: "Register Solo or Squad",
    imageUrl:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    organizerNote:
      "Organized by Hack4Tech & Department of Computer Applications, GLA University.",
  },
  {
    trackCode: "TALK-AI-01",
    title: "Tech Talks: Generative AI & Systems",
    subtitle: "Learn. Grow. Innovate.",
    description:
      "Distinguished keynotes and deep-dive technical sessions by leading architects and research fellows.",
    category: "hackathon",
    categoryLabel: "Talk",
    statusBadge: "Limited Seats",
    statusTone: "amber",
    teamSpec: "Solo Attendee",
    teamType: "solo",
    entryType: "paid",
    feeNumeric: 99,
    feeLabel: "₹99",
    maxTeamMembers: 1,
    prizeLabel: "Verified Certificate",
    prizeTone: "tertiary",
    registeredCount: 0,
    capacityCount: 100,
    quotaLabel: "Auditorium Seats",
    quotaUnit: "Seats",
    progressColor: "bg-primary-container",
    dateShort: "22 Nov 2026",
    dateFilter: "fri",
    dateFull: "22 Nov 2026",
    venue: "Auditorium, GLA",
    ctaLabel: "Register for Talk",
    imageUrl:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    featured: false,
  },
  {
    trackCode: "WKP-DEV-02",
    title: "Web Dev Workshop: Full-Stack Modern Apps",
    subtitle: "Hands-on Lab",
    description:
      "Build and deploy production-grade Next.js, Node.js, and cloud backend microservices in an interactive hands-on lab.",
    category: "design",
    categoryLabel: "Workshop",
    statusBadge: "Hands-on",
    statusTone: "emerald",
    teamSpec: "Solo or Duo",
    teamType: "both",
    entryType: "paid",
    feeNumeric: 149,
    feeLabel: "₹149",
    maxTeamMembers: 2,
    prizeLabel: "Badge & Swag",
    prizeTone: "tertiary",
    registeredCount: 0,
    capacityCount: 60,
    quotaLabel: "Lab Capacity",
    quotaUnit: "Seats",
    progressColor: "bg-secondary-container",
    dateShort: "26 Nov 2026",
    dateFilter: "sat",
    dateFull: "26 Nov 2026",
    venue: "LAB-2, GLA",
    ctaLabel: "Register for Workshop",
    imageUrl:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
    featured: false,
  },
  {
    trackCode: "CMP-ALG-03",
    title: "Code Combat: Algorithmic Duel",
    subtitle: "Solve. Compete. Win.",
    description:
      "Fast-paced competitive programming showdown testing algorithms, data structures, and optimization speed.",
    category: "hackathon",
    categoryLabel: "Competition",
    statusBadge: "Registration Open",
    statusTone: "crimson",
    teamSpec: "Solo or Duo",
    teamType: "both",
    entryType: "paid",
    feeNumeric: 199,
    feeLabel: "₹199",
    maxTeamMembers: 2,
    prizeLabel: "Prize Pool: ₹50,000",
    prizeTone: "primary",
    registeredCount: 0,
    capacityCount: 100,
    quotaLabel: "Arena Slots",
    quotaUnit: "Seats",
    progressColor: "bg-error",
    dateShort: "28 Nov 2026",
    dateFilter: "sat",
    dateFull: "28 Nov 2026",
    venue: "Seminar Hall, GLA",
    ctaLabel: "Register for Combat",
    imageUrl:
      "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=1200&q=80",
    featured: false,
  },
  {
    trackCode: "HACK-AI-01",
    title: "HackCampus 2026: 36-Hour AI Hackathon",
    subtitle: "Flagship Hackathon",
    description:
      "Build agentic AI workflows, spatial intelligence systems, or zero-knowledge verifiable credentials with high-performance edge compute clusters on-site.",
    category: "hackathon",
    categoryLabel: "Flagship Hackathon",
    statusBadge: "Registration Open",
    statusTone: "amber",
    teamSpec: "Teams of 2-4",
    teamType: "both",
    entryType: "paid",
    feeNumeric: 299,
    feeLabel: "₹299",
    maxTeamMembers: 4,
    prizeLabel: "Prize Pool: ₹1,00,000",
    prizeTone: "tertiary",
    registeredCount: 0,
    capacityCount: 200,
    quotaLabel: "Allocation Manifest",
    quotaUnit: "Hacker Teams",
    progressColor: "bg-primary-container",
    dateShort: "Dec 11-13, 2026 (36h)",
    dateFilter: "fri",
    dateFull: "Dec 11-13, 2026",
    venue: "Main Quad & Innovation Hall",
    ctaLabel: "Register Solo or Team",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBf1sizUemuI_G8GVz3DkqnPT6uB7HAoWMwPhJu9Ug2Z0kwcor_mMYkO-enprnwQR5UWVM95-UTFnwN20vrS7Nj5A2xBhY8mfOKwRDMjZsJg4GVyXcnfc4bApaOIJt2D4L-wICfQmV5PMI2nYxOY3DlmPdo80qfgdUSdTu3CpvDMK87EoDA9iaVMJRwucMNfcvJWdtpH-Xv8vqiWxj5pgEkvcwaew1Pf_PqURjUcWA",
    featured: true,
    organizerNote:
      "Presented in partnership with Hack4Tech & Student Developer Community.",
  },
  {
    trackCode: "ROBO-HW-02",
    title: "RoboWars: Combat Robotics Championship",
    subtitle: "Heavyweight & Featherweight",
    description:
      "15kg and 60kg autonomous & RF pneumatic crushers compete inside the armored octagon. Pit crews get dedicated telemetry desks.",
    category: "robotics",
    categoryLabel: "Hardware",
    statusBadge: "Registration Open",
    statusTone: "amber",
    teamSpec: "Heavyweight & Featherweight",
    teamType: "team",
    entryType: "paid",
    feeNumeric: 499,
    feeLabel: "₹499",
    maxTeamMembers: 4,
    prizeLabel: "Prize: ₹50,000",
    prizeTone: "primary",
    registeredCount: 0,
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
    statusBadge: "Registration Open",
    statusTone: "crimson",
    teamSpec: "Solo or Duo",
    teamType: "both",
    entryType: "paid",
    feeNumeric: 199,
    feeLabel: "₹199",
    maxTeamMembers: 2,
    prizeLabel: "Prize: ₹25,000",
    prizeTone: "tertiary",
    registeredCount: 0,
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
      "Collegiate indie and rock bands face off under professional festival sound rigs. Exclusive merchandise tokens included with RSVP.",
    category: "cultural",
    categoryLabel: "Cultural",
    statusBadge: "Passes Open",
    statusTone: "emerald",
    teamSpec: "Audience & Band Registrations",
    teamType: "both",
    entryType: "free",
    feeNumeric: 0,
    feeLabel: "Free",
    maxTeamMembers: 6,
    prizeLabel: "Free Student Pass",
    prizeTone: "neutral",
    registeredCount: 0,
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
    entryType: "paid",
    feeNumeric: 149,
    feeLabel: "₹149",
    maxTeamMembers: 1,
    prizeLabel: "Prize: ₹20,000",
    prizeTone: "tertiary",
    registeredCount: 0,
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
      "Double elimination bracket hosted on zero-ping LAN servers. Main-stage caster desk and live stream broadcast integration.",
    category: "esports",
    categoryLabel: "Esports LAN",
    statusBadge: "Registration Open",
    statusTone: "amber",
    teamSpec: "Teams of 5 + 1 Sub",
    teamType: "team",
    entryType: "paid",
    feeNumeric: 599,
    feeLabel: "₹599",
    maxTeamMembers: 6,
    prizeLabel: "Prize: ₹40,000",
    prizeTone: "primary",
    registeredCount: 0,
    capacityCount: 16,
    quotaLabel: "Team Slots",
    quotaUnit: "Teams",
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
      "Distinguished robotics scientist explores real-world foundation models for humanoid autonomy, physical AI, and edge verification.",
    category: "robotics",
    categoryLabel: "Distinguished Keynote",
    statusBadge: "Open for All",
    statusTone: "neutral",
    teamSpec: "General Student RSVP",
    teamType: "solo",
    entryType: "free",
    feeNumeric: 0,
    feeLabel: "Free",
    maxTeamMembers: 1,
    prizeLabel: "Certificate Issued",
    prizeTone: "tertiary",
    registeredCount: 0,
    capacityCount: 500,
    quotaLabel: "Auditorium Seats",
    quotaUnit: "RSVPs",
    progressColor: "bg-tertiary-container",
    dateShort: "Sun Dec 13",
    dateFilter: "sun",
    dateFull: "Sun Dec 13, 2026",
    venue: "Main Auditorium",
    ctaLabel: "RSVP Keynote Pass",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAZlGwD1bnh8JU5r6rEoHwS7Q-8NpAwYpfK58mf_ci9X3kI6aNr8gQ3UrWtFUfXg_8TUHBxUV_Ue-7WafxA6nWV9E_xGoazaAPc8X22hSZJ3MHEI8DIXfwQVYXYJKBumwxyIBgYysxOiw--QfLa4ZpqUQUBFYe9moQUyvrMTdvqBdrEPkZHBoKZNOB34v20qCyCYG3AUPjn8nitGn-XXYVZUJlLt2wJNkpmY18muJg",
  },
];

async function seed() {
  const conn = await connectDB();
  if (!conn) {
    console.error("Could not connect to MongoDB. Skipping seeding.");
    process.exit(1);
  }

  console.log("Seeding EventHub real live events (no demo passes/scans/attendees)...");

  try {
    await Event.deleteMany({});
    await Pass.deleteMany({});
    await ScanLog.deleteMany({});
    await Attendee.deleteMany({});
    await Notification.deleteMany({});

    // Seed ONLY real event catalogue with 0 registrations
    await Event.insertMany(INITIAL_EVENTS);

    console.log(`✅ EventHub Database seeded successfully: ${INITIAL_EVENTS.length} real events added with 0 demo registrations.`);
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seed();
