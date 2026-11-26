"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  HelpCircle,
  Lock,
  Mail,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
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
    title: "Can I register for multiple events?",
    body: "Yes! You can register for as many Hack4Tech tracks, workshops, and competitions as you like. Every registration issues its own unique cryptographic QR pass inside your My Passes wallet.",
  },
  {
    icon: Users,
    category: "teams",
    categoryLabel: "Team Registration",
    title: "Is team registration mandatory for all events?",
    body: "No. Solo events (like PromptCraft and Keynotes) require only individual sign-up, hybrid tracks let you enter solo or with a team, and squad competitions like RoboWars or Valorant let a team lead register the whole roster under one booth ID.",
  },
  {
    icon: Mail,
    category: "passes",
    categoryLabel: "Passes & QR",
    title: "How do I retrieve my QR pass?",
    body: "Open the My Passes page from the top navigation bar or click 'Retrieve Pass' below. Passes are cached locally for instant offline access, or you can enter your campus email to resend your pass link anytime.",
  },
  {
    icon: ShieldCheck,
    category: "gates",
    categoryLabel: "Gate Check-In",
    title: "What happens if a pass triggers a duplicate scan alert?",
    body: "Gate volunteers immediately see a warning showing the original gate and timestamp. Present a matching university photo ID at the Admin Help Desk to clear an accidental double tap.",
  },
  {
    icon: Wrench,
    category: "rules",
    categoryLabel: "Safety & Hardware",
    title: "What are the Hardware Bay & RoboWars safety rules?",
    body: "Hardware hackathon and RoboWars entrants must inspect and tag LiPo battery packs and soldering equipment at Mech Hangar B / Turing Hall Loading Bay before entering pit tables.",
  },
  {
    icon: Sparkles,
    category: "passes",
    categoryLabel: "Certificates",
    title: "Are participation certificates and prize tokens verified?",
    body: "Yes. Every accredited attendee with a valid gate check-in automatically receives verifiable participation certificates and prize claim tokens after the closing ceremony.",
  },
];

export default function FaqPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
      <PublicHeader />

      <main className="container">
        <section className="eh-sub-hero">
          <div className="eh-sub-tag">
            <HelpCircle className="w-3.5 h-3.5" />
            Help Center &amp; Gate Guidelines
          </div>
          <h1 className="eh-sub-h1">Frequently Asked Questions</h1>
          <p className="eh-sub-p">
            Everything students, gate volunteers, and fest organizers need for smooth registration, QR passes, and instant turnstile check-ins.
          </p>

          <div className="eh-filter-bar" style={{ maxWidth: 760, margin: "28px auto 0" }}>
            <div className="eh-search-wrap">
              <Search className="w-4 h-4" />
              <input
                type="search"
                className="eh-search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search passes, team rules, or gate check-in..."
                aria-label="Search FAQs"
              />
            </div>
            <select
              className="eh-select-pill primary"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label="Filter FAQ category"
            >
              <option value="all">All Topics</option>
              <option value="passes">Passes &amp; QR</option>
              <option value="gates">Gate Check-In</option>
              <option value="teams">Team Registration</option>
              <option value="rules">Safety &amp; Rules</option>
            </select>
          </div>
        </section>

        <section className="eh-section" style={{ paddingTop: 12 }}>
          <div className="eh-faq-list" style={{ maxWidth: 880, margin: "0 auto" }}>
            {filteredFaqs.map((faq, idx) => {
              const Icon = faq.icon;
              const isOpen = openIndex === idx;
              return (
                <div key={faq.title} className={`eh-faq-item ${isOpen ? "open" : ""}`}>
                  <button
                    type="button"
                    className="eh-faq-trigger"
                    aria-expanded={isOpen}
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
                      <span
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          background: "rgba(139, 92, 246, 0.2)",
                          border: "1px solid rgba(192, 132, 252, 0.35)",
                          color: "#d8b4fe",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon className="w-4 h-4" />
                      </span>
                      <span>{faq.title}</span>
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {isOpen && (
                    <div className="eh-faq-answer" style={{ paddingLeft: 66 }}>
                      {faq.body}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredFaqs.length === 0 && (
              <div className="eh-empty">
                No FAQs match your search. Try another keyword or switch to All Topics.
              </div>
            )}
          </div>

          <div className="eh-retrieve-banner" style={{ maxWidth: 880, margin: "34px auto 0" }}>
            <div className="eh-retrieve-left">
              <div className="eh-retrieve-icon">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <strong>Already registered? Access your digital QR pass</strong>
                <div style={{ fontSize: 13, color: "#cfc9e4", marginTop: 2 }}>
                  All passes work offline with cryptographic signature verification.
                </div>
              </div>
            </div>
            <Link className="eh-btn-primary" href="/passes">
              View My Passes
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
