import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { BRAND_LOGO_URL } from "@/lib/eventhub-data";

export function PublicFooter() {
  return (
    <footer className="w-full bg-[#FAF7F0] border-t border-[#E8E2D5] mt-10">
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <img
                src={BRAND_LOGO_URL}
                alt="EventHub Brand Logo"
                className="h-6 w-auto object-contain"
              />
              <span className="font-headline text-[19px] font-bold tracking-tight text-on-surface">
                EventHub
              </span>
            </div>
            <p className="text-[13px] leading-5 text-on-surface-variant max-w-md">
              High-velocity hackathon organization, multi-track collegiate fest
              ticketing, NFC/QR gate accreditation, and real-time campus event
              operations.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-[#E8E2D5] bg-surface-container-lowest text-label-token uppercase text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-tertiary-container" />
                All Systems Operational
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-[#E8E2D5] bg-surface-container-lowest text-label-token uppercase text-on-surface-variant">
                <ShieldCheck className="w-3.5 h-3.5 text-tertiary" />
                Verified Campus Ticketing
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-headline text-[16px] font-semibold text-on-surface mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-[13px] text-on-surface-variant">
              <li>
                <Link href="/" className="hover:text-on-surface transition-colors">
                  Explore Events
                </Link>
              </li>
              <li>
                <Link
                  href="/passes"
                  className="hover:text-on-surface transition-colors"
                >
                  My Passes &amp; Tickets
                </Link>
              </li>
              <li>
                <Link
                  href="/login?next=/admin"
                  className="hover:text-on-surface transition-colors"
                >
                  Organizer Portal Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/login?next=/scanner"
                  className="hover:text-on-surface transition-colors"
                >
                  Volunteer Gate Access
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-headline text-[16px] font-semibold text-on-surface mb-3">
              Support
            </h4>
            <ul className="space-y-2 text-[13px] text-on-surface-variant">
              <li>
                <Link
                  href="/passes#retrieve"
                  className="hover:text-on-surface transition-colors"
                >
                  Find Pass by Email
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-on-surface transition-colors"
                >
                  FAQ &amp; Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-on-surface transition-colors"
                >
                  Organizer Accreditation Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/faq#security"
                  className="hover:text-on-surface transition-colors"
                >
                  Security &amp; Privacy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-[#E8E2D5] gap-3 text-[13px] text-on-surface-variant">
          <span>
            © 2025 EventHub Inc. · Campus Events &amp; Ticketing Platform. All
            rights reserved.
          </span>
          <div className="flex items-center gap-4 text-[12px]">
            <Link
              href="/faq#security"
              className="hover:text-on-surface transition-colors"
            >
              Privacy Policy
            </Link>
            <Link href="/faq" className="hover:text-on-surface transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
