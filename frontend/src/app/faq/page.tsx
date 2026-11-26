"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Lock,
  QrCode,
  ShieldCheck,
  Users,
  Wrench,
  Search,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import "../home.css";

interface FaqItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  category: "passes" | "gates" | "teams" | "rules";
  categoryLabel: string;
  body: string;
}

const FAQS: FaqItem[] = [
  {
    icon: QrCode,
    category: "passes",
    categoryLabel: "Passes & QR",
    title: "How do digital QR passes work offline?",
    body: "Each issued pass stores a cryptographic SHA-256 validation token on your device. Even if venue Wi-Fi slows down during peak check-in rushes, gate scanners validate your pass in under a second.",
  },
  {
    icon: Wrench,
    category: "rules",
    categoryLabel: "Safety & Hardware",
    title: "What are the RoboWars and hardware safety rules?",
    body: "Hardware hackathon and RoboWars entrants must inspect and tag LiPo battery packs and pneumatic cylinders at Turing Hall Mech Hangar B before entering the competition octagon.",
  },
  {
    icon: ShieldCheck,
    category: "gates",
    categoryLabel: "Gate Check-in",
    title: "What happens if a pass triggers a duplicate scan alert?",
    body: "Gate volunteers immediately see a yellow warning banner with the original turnstile ID and timestamp. Attendees can present a matching student ID at the Admin Help Desk to resolve the duplicate check-in.",
  },
  {
    icon: Users,
    category: "teams",
    categoryLabel: "Team Registration",
    title: "How do team registrations and member passes work?",
    body: "When a team lead registers a squad, all accredited teammates receive identical passes under the shared team booth ID. Teammates can walk through turnstiles together or individually.",
  },
  {
    icon: Sparkles,
    category: "passes",
    categoryLabel: "Certificates",
    title: "Are participation certificates and prize tokens verified?",
    body: "Yes, organizers issue verifiable credentials directly to your student email. Every accredited attendee with a valid gate check-in receives their digital badge immediately after closing ceremonies.",
  },
  {
    icon: Lock,
    category: "rules",
    categoryLabel: "Security",
    title: "Can I transfer or screenshot my digital pass?",
    body: "Passes are bound to your student profile and verified against the live gate manifest. We recommend saving your pass to Apple Wallet or opening EventHub directly at the gate for fastest entry.",
  },
];

export default function FaqPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesFilter = filter === "all" || faq.category === filter;
    const matchesSearch =
      !search.trim() ||
      faq.title.toLowerCase().includes(search.toLowerCase()) ||
      faq.body.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="eh">
      <div className="app" id="top">
        <PublicHeader />

        <main className="pad">
          {/* Page Hero Header */}
          <div className="page-title-wrap">
            <div className="page-tag">
              <HelpCircle style={{ width: 14, height: 14 }} />
              Gate Knowledge Base
            </div>
            <h1 className="page-h1">Frequently Asked Questions</h1>
            <p className="page-sub">
              Everything students, gate volunteers, and fest organizers need for fast, seamless accreditation and turnstile operations.
            </p>

            {/* Search and Category Filter Bar */}
            <div className="bar" style={{ marginTop: 26 }}>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search rules, passes, or gate check-in..."
                aria-label="Search FAQ"
              />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                aria-label="Filter by category"
              >
                <option value="all">All Topics</option>
                <option value="passes">Passes &amp; QR</option>
                <option value="gates">Gate Check-in</option>
                <option value="teams">Team Squads</option>
                <option value="rules">Safety &amp; Rules</option>
              </select>
            </div>
          </div>

          {/* FAQ Cards Grid */}
          <div className="faq-grid">
            {filteredFaqs.map((faq, index) => {
              const Icon = faq.icon;
              const isOpen = openIndex === index;
              return (
                <div
                  key={faq.title}
                  className="faq-card"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  style={{ cursor: "pointer" }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div className="faq-icon-box" style={{ marginBottom: 0 }}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: ".06em",
                        color: "var(--muted)",
                        fontWeight: 700,
                        border: "1px solid var(--line)",
                        borderRadius: 999,
                        padding: "4px 10px",
                      }}
                    >
                      {faq.categoryLabel}
                    </span>
                  </div>
                  <h3>{faq.title}</h3>
                  <p style={{ marginTop: 6 }}>{faq.body}</p>
                </div>
              );
            })}
          </div>

          {filteredFaqs.length === 0 && (
            <div className="empty" style={{ margin: "30px 0" }}>
              No questions found matching your search. Try another keyword or browse all topics.
            </div>
          )}

          {/* Bottom Security Banner */}
          <div className="faq-banner">
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  background: "rgba(224,64,251,.2)",
                  color: "var(--mag)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Lock style={{ width: 24, height: 24 }} />
              </div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Ready to head to the turnstile?</h3>
                <p style={{ color: "var(--muted)", fontSize: 14, margin: "4px 0 0" }}>
                  Your cryptographic entry pass is pre-cached on your device. Show your QR token at Gate 1 or 2.
                </p>
              </div>
            </div>
            <Link className="btn" href="/passes">
              View My Passes →
            </Link>
          </div>
        </main>

        <PublicFooter />
      </div>
    </div>
  );
}
