import React from "react";
import Link from "next/link";

export function PublicFooter() {
  return (
    <footer>
      <div>
        <div className="logo" style={{ marginBottom: 12, color: "#fff" }}>
          <i />EventHub
        </div>
        Discover, register, scan, and manage every campus fest and hackathon event on one platform. Built by Team Byte Busters.
      </div>
      <div>
        <h4>Explore</h4>
        <Link href="/#events">Hackathons &amp; AI</Link>
        <Link href="/#events">Robotics &amp; Hardware</Link>
        <Link href="/#events">Design &amp; UI/UX</Link>
        <Link href="/#events">Esports &amp; Gaming</Link>
      </div>
      <div>
        <h4>Platform</h4>
        <Link href="/passes">Event passes</Link>
        <Link href="/scanner">Gate scanner</Link>
        <Link href="/admin">Live attendance</Link>
        <Link href="/dashboard">Dashboard</Link>
      </div>
      <div>
        <h4>Help &amp; Account</h4>
        <Link href="/passes">Find my pass</Link>
        <Link href="/faq">FAQ &amp; Rules</Link>
        <Link href="/login">Sign in</Link>
      </div>
      <div className="cp">© 2026 EventHub. All rights reserved.</div>
    </footer>
  );
}
