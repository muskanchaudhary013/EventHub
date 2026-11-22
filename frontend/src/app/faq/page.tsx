"use client";

import React from "react";
import Link from "next/link";
import {
  HelpCircle,
  Lock,
  QrCode,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";

const FAQS = [
  {
    icon: QrCode,
    title: "How do digital QR passes work offline?",
    body: "Each issued pass stores a signed cryptographic token locally on your device. Even if campus Wi-Fi slows down during peak check-in hours, gate scanners validate your pass in under a second.",
  },
  {
    icon: Wrench,
    title: "What are the Turing Hardware Bay safety rules?",
    body: "Hardware hackathon and RoboWars entrants must tag batteries, LiPo packs, and soldering equipment at the Turing Hall Loading Bay before entering pit tables.",
  },
  {
    icon: ShieldCheck,
    title: "What happens if a pass triggers a duplicate scan alert?",
    body: "Gate volunteers immediately see an alert showing the original gate and timestamp. Present a matching university photo ID to clear an accidental double tap or resolve pass issues.",
  },
  {
    icon: Users,
    title: "How do team registrations and member passes work?",
    body: "When a team lead registers a squad, every listed teammate receives an accredited pass under the shared team booth ID. Teams can check in together at any campus gate or individually.",
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />
      <main className="w-full pt-16 flex-1">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 space-y-8">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-label-token uppercase font-bold">
              <HelpCircle className="w-3.5 h-3.5" />
              Accreditation &amp; Help Center
            </span>
            <h1 className="font-headline text-headline-lg font-extrabold text-on-surface">
              EventHub FAQ &amp; Gate Guidelines
            </h1>
            <p className="text-[15px] text-on-surface-variant">
              Everything students, gate volunteers, and fest organizers need for
              fast, seamless check-in operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FAQS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-surface-container-lowest rounded-2xl p-5 border border-[#E8E2D5] shadow-sm space-y-2.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="font-headline text-[17px] font-bold text-on-surface">
                    {item.title}
                  </h2>
                  <p className="text-[13px] leading-5 text-on-surface-variant">
                    {item.body}
                  </p>
                </div>
              );
            })}
          </div>

          <div
            id="security"
            className="bg-surface-container-low rounded-2xl p-6 border border-[#E8E2D5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-tertiary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-headline text-[16px] font-bold text-on-surface">
                  Security &amp; Privacy
                </h3>
                <p className="text-[13px] text-on-surface-variant">
                  Student registrations and digital QR passes are protected with
                  end-to-end cryptographic verification and strictly scoped to
                  campus event operations.
                </p>
              </div>
            </div>
            <Link
              href="/passes"
              className="px-4 py-2 rounded-lg bg-primary-container text-on-primary text-[13px] font-semibold shrink-0 hover:bg-[#E0484D]"
            >
              View My Passes
            </Link>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
