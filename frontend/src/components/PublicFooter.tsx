import React from "react";
import Link from "next/link";
import { Instagram, Linkedin, Mail, MapPin, Youtube } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="eh-footer">
      <div className="container">
        <div className="eh-footer-grid">
          <div>
            <Link className="eh-brand" href="/" style={{ marginBottom: 12 }}>
              <img
                src="/logo.png"
                alt="EventHub Logo"
                className="eh-brand-logo"
                style={{ width: 30, height: 30 }}
              />
              <span>
                EVENT<span className="accent">HUB</span>
              </span>
            </Link>
            <p style={{ margin: "8px 0 0", fontSize: 13.5, color: "var(--muted)" }}>
              Discover. Register. Experience.
            </p>
          </div>

          <div>
            <h4>Quick Links</h4>
            <div className="eh-footer-links">
              <Link href="/">Home</Link>
              <Link href="/#events">Events</Link>
              <Link href="/passes">My Passes</Link>
              <Link href="/faq">FAQs</Link>
            </div>
          </div>

          <div>
            <h4>Contact Us</h4>
            <div className="eh-contact-row">
              <Mail className="w-4 h-4" style={{ color: "#c084fc", flexShrink: 0 }} />
              <span>eventhub@hack4tech.in</span>
            </div>
            <div className="eh-contact-row">
              <MapPin className="w-4 h-4" style={{ color: "#c084fc", flexShrink: 0 }} />
              <span>GLA University, Mathura</span>
            </div>
          </div>

          <div>
            <h4>Follow Us</h4>
            <div className="eh-socials">
              <a className="eh-social-btn" href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a className="eh-social-btn" href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
              <a className="eh-social-btn" href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
                <Youtube className="w-4 h-4" />
              </a>
              <a className="eh-social-btn" href="https://x.com" target="_blank" rel="noreferrer" aria-label="X">
                <span style={{ fontWeight: 800, fontSize: 13 }}>𝕏</span>
              </a>
            </div>
          </div>
        </div>

        <div className="eh-footer-bottom">
          © 2026 EventHub. All rights reserved. &nbsp;|&nbsp; Hack4Tech
        </div>
      </div>
    </footer>
  );
}
