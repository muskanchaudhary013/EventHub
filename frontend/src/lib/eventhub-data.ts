export type TrackCategory =
  | "all"
  | "hackathon"
  | "robotics"
  | "design"
  | "cultural"
  | "esports";

export interface EventItem {
  id: string;
  trackCode: string;
  title: string;
  subtitle: string;
  description: string;
  category: Exclude<TrackCategory, "all">;
  categoryLabel: string;
  statusBadge: string;
  statusTone: "amber" | "crimson" | "emerald" | "neutral";
  teamSpec: string;
  teamType: "solo" | "team" | "both";
  entryType: "free" | "paid";
  feeNumeric: number;
  feeLabel: string;
  maxTeamMembers?: number;
  prizeLabel: string;
  prizeTone: "primary" | "tertiary" | "neutral";
  registeredCount: number;
  capacityCount: number;
  quotaLabel: string;
  quotaUnit: string;
  progressColor: string;
  dateShort: string;
  dateFilter: "fri" | "sat" | "sun";
  dateFull: string;
  venue: string;
  ctaLabel: string;
  imageUrl: string;
  featured?: boolean;
  organizerNote?: string;
  perks?: string[];
}

export interface DigitalPass {
  id: string;
  passCode: string;
  eventTitle: string;
  trackLabel: string;
  shortTabLabel: string;
  dateRange: string;
  gateTime: string;
  venue: string;
  teamName?: string;
  booth?: string;
  tierLabel: string;
  holderName: string;
  holderEmail: string;
  teammates: Array<{ name: string; role: string; icon: "palette" | "terminal" | "cpu" }>;
  countdownLabel: string;
  sigHash: string;
  status: "Confirmed" | "Check-In Ready" | "Checked In";
  dotColor: "coral" | "emerald" | "amber";
}

export interface ScanLogEntry {
  id: string;
  time: string;
  attendee: string;
  subtitle?: string;
  event: string;
  passId: string;
  status: "Valid" | "Duplicate" | "Manual" | "Late";
  lateMinutes?: number;
}

export interface AttendeeRecord {
  id: string;
  passId: string;
  initials: string;
  name: string;
  email: string;
  teamInfo: string;
  event: string;
  eventKey: "hackcampus" | "robowars" | "pixelcraft" | "cyberpulse";
  track: string;
  type: "Solo" | "Team";
  typeLabel: string;
  status: "Present" | "Late" | "Pending" | "Blocked";
  statusLabel: string;
  scanTime: string;
  gateLocation: string;
}

export const BRAND_LOGO_URL = "/logo.png";

export const SCANNER_BG_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCd0z40ueULmgwn33vwF2Ce2GvGHV5R7jrmpZxMOAkjgddrvlCZwFdXjm3tm8TcRIovD13QJSY4mDgvFoCsG7nleXCeu6RfOLMN1q6vUMGLiEUCon1yt2rIWHXZ8zel86uzO07Bf9J2kmscf3oq-FpKUXW_vjfeuFiqQLp7VogRqVdnIY3agoJC3TcksJUVrUD7yRtXAPFLcOVStUVPf1Ufh1IwjDX2sICdq6hC7o0";

export const ALEX_AVATAR_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCI9FiteORUzoZZoPqvZvKaeXVhQsWg5tqZYhtsE8zcX-Fumyco4hKG5-9Q9CVyGLMhlDgtRRUE0M1FB2rkkBw4lhwXgX_wUN6KoFFviHRQLvZHd5fIwlXMwjbq7HxIY3YcYnxHAxcJc5u4pj_IZj_eTKSyclUYme2rYHSpQBIHJUXKUTGBHJM_0JrtCdYjbGpl9MnQdDkyU48lIOn4x1gpaJtkbOE_NQTyTvLh8kY";

export const INITIAL_EVENTS: EventItem[] = [
  {
    id: "ai-build-a-thon",
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
    registeredCount: 120,
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
    perks: [
      "Get your QR Pass",
      "Access event updates",
      "Join the Hack4Tech community!",
    ],
  },
  {
    id: "tech-talks",
    trackCode: "TALK-AI-01",
    title: "Tech Talks: Generative AI & Systems",
    subtitle: "Learn. Grow. Innovate.",
    description:
      "Distinguished keynotes and deep-dive technical sessions by Silicon Valley architects and research fellows.",
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
    registeredCount: 80,
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
    perks: [
      "Get your QR Pass",
      "Access event updates",
      "Join the Hack4Tech community!",
    ],
  },
  {
    id: "web-dev-workshop",
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
    registeredCount: 50,
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
    perks: [
      "Get your QR Pass",
      "Access event updates",
      "Join the Hack4Tech community!",
    ],
  },
  {
    id: "code-combat",
    trackCode: "CMP-ALG-03",
    title: "Code Combat: Algorithmic Duel",
    subtitle: "Solve. Compete. Win.",
    description:
      "Fast-paced competitive programming showdown testing algorithms, data structures, and optimization speed.",
    category: "hackathon",
    categoryLabel: "Competition",
    statusBadge: "Closing Soon",
    statusTone: "crimson",
    teamSpec: "Solo or Duo",
    teamType: "both",
    entryType: "paid",
    feeNumeric: 199,
    feeLabel: "₹199",
    maxTeamMembers: 2,
    prizeLabel: "Prize Pool: ₹50,000",
    prizeTone: "primary",
    registeredCount: 45,
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
    perks: [
      "Get your QR Pass",
      "Access event updates",
      "Join the Hack4Tech community!",
    ],
  },
  {
    id: "hackcampus-2026",
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
    entryType: "paid",
    feeNumeric: 299,
    feeLabel: "₹299",
    maxTeamMembers: 4,
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
    perks: [
      "Get your QR Pass",
      "Access event updates",
      "Join the Hack4Tech community!",
    ],
  },
  {
    id: "robowars-2026",
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
    feeNumeric: 499,
    feeLabel: "₹499",
    maxTeamMembers: 4,
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
    perks: [
      "Get your QR Pass",
      "Access event updates",
      "Join the Hack4Tech community!",
    ],
  },
  {
    id: "pixelcraft-sprint",
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
    entryType: "paid",
    feeNumeric: 199,
    feeLabel: "₹199",
    maxTeamMembers: 2,
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
    perks: [
      "Get your QR Pass",
      "Access event updates",
      "Join the Hack4Tech community!",
    ],
  },
  {
    id: "battle-of-the-bands",
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
    feeNumeric: 0,
    feeLabel: "Free",
    maxTeamMembers: 6,
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
    perks: [
      "Get your QR Pass",
      "Access event updates",
      "Join the Hack4Tech community!",
    ],
  },
  {
    id: "promptcraft-genai",
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
    perks: [
      "Get your QR Pass",
      "Access event updates",
      "Join the Hack4Tech community!",
    ],
  },
  {
    id: "valorant-invitational",
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
    feeNumeric: 599,
    feeLabel: "₹599",
    maxTeamMembers: 6,
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
    perks: [
      "Get your QR Pass",
      "Access event updates",
      "Join the Hack4Tech community!",
    ],
  },
  {
    id: "keynote-dr-thorne",
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
    feeNumeric: 0,
    feeLabel: "Free",
    maxTeamMembers: 1,
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
    perks: [
      "Get your QR Pass",
      "Access event updates",
      "Join the Hack4Tech community!",
    ],
  },
];
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAZlGwD1bnh8JU5r6rEoHwS7Q-8NpAwYpfK58mf_ci9X3kI6aNr8gQ3UrWtFUfXg_8TUHBxUV_Ue-7WafxA6nWV9E_xGoazaAPc8X22hSZJ3MHEI8DIXfwQVYXYJKBumwxyIBgYysxOiw--QfLa4ZpqUQUBFYe9moQUyvrMTdvqBdrEPkZHBoKZNOB34v20qCyCYG3AUPjn8nitGn-XXYVZUJlLt2wJNkpmY18muJg",
  },
];

export const INITIAL_PASSES: DigitalPass[] = [
  {
    id: "pass-1",
    passCode: "EH-2026-HCK-9481",
    eventTitle: "HackCampus 2026: 36-Hour AI Hackathon",
    trackLabel: "AI / Web3 Track",
    shortTabLabel: "HackCampus 2026 (Active)",
    dateRange: "Dec 11 - 13, 2026",
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
    countdownLabel: "Starts in 14d 22h",
    sigHash: "sha256:7f49a3c9e...88c2f10b",
    status: "Confirmed",
    dotColor: "coral",
  },
  {
    id: "pass-2",
    passCode: "EH-2026-RBW-1102",
    eventTitle: "RoboWars: Combat Robotics Championship",
    trackLabel: "Robotics Hardware",
    shortTabLabel: "RoboWars 2026",
    dateRange: "Dec 11, 2026",
    gateTime: "Pit opens 01:15 PM",
    venue: "Arena Mech Bay 3",
    teamName: "Solo Combatant",
    booth: "Bay M-03",
    tierLabel: "Solo Combatant · Mech Inspection Cleared",
    holderName: "Alex Chen",
    holderEmail: "alex.chen@campus.edu",
    teammates: [],
    countdownLabel: "Starts in 15d 04h",
    sigHash: "sha256:3d18c7a4e...41b9a22f",
    status: "Check-In Ready",
    dotColor: "emerald",
  },
];

export const INITIAL_SCAN_LOGS: ScanLogEntry[] = [
  {
    id: "scan-1",
    time: "09:14:02",
    attendee: "Alex Chen",
    subtitle: "(Team SyntaxErrors)",
    event: "HackCampus 2026",
    passId: "EH-2026-HCK-9481",
    status: "Valid",
  },
  {
    id: "scan-2",
    time: "09:13:41",
    attendee: "Priya Sharma",
    event: "Stanford AI Summit",
    passId: "EH-2025-ENG-3190",
    status: "Duplicate",
  },
  {
    id: "scan-3",
    time: "09:12:15",
    attendee: "Marcus Brody",
    event: "Robotics Arena V",
    passId: "EH-2025-ROB-1102",
    status: "Manual",
  },
  {
    id: "scan-4",
    time: "09:10:55",
    attendee: "Jordan Rivera",
    event: "Algorithmic Game Design",
    passId: "EH-2025-DES-8114",
    status: "Late",
    lateMinutes: 10,
  },
  {
    id: "scan-5",
    time: "09:09:40",
    attendee: "Elena Rostova",
    subtitle: "(Faculty Advisor)",
    event: "HackCampus 2025",
    passId: "EH-2025-FAC-0042",
    status: "Valid",
  },
];

export const INITIAL_ATTENDEES: AttendeeRecord[] = [
  {
    id: "att-1",
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
    id: "att-2",
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
    id: "att-3",
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
    id: "att-4",
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
    id: "att-5",
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
