"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  QrCode,
} from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import {
  DashboardRole,
  getDashboardPath,
  useAuth,
} from "@/context/AuthContext";
import "../home.css";

const DASHBOARD_OPTIONS: {
  id: DashboardRole;
  title: string;
  tagline: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: "student",
    title: "Student Participant",
    tagline: "Event discovery, ticket wallet & live registration passes",
    desc: "Browse tech, gaming, cultural and workshop tracks, register solo or squad, and keep your offline cryptographic QR pass ready on campus.",
    icon: GraduationCap,
  },
  {
    id: "volunteer",
    title: "Volunteer Scanner",
    tagline: "Ultra-fast camera HUD & gate verification console",
    desc: "Point your phone camera at attendee badges at venue gates. Validate HMAC tokens, detect duplicates in real-time, and track gate throughput.",
    icon: QrCode,
  },
  {
    id: "organizer",
    title: "Organizer Executive",
    tagline: "Live telemetry, sector load & master attendee registry",
    desc: "Command center for Hack4Tech: track headcount across auditorium/halls, audit gate logs, override badge scans, and export CSV reports.",
    icon: LayoutDashboard,
  },
];

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectRoleParam = searchParams.get("selectRole") === "1";

  const {
    user,
    role,
    loading,
    needsRoleSelection,
    signIn,
    signUp,
    resetPassword,
    signInWithGoogle,
    assignRole,
  } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedDashboard, setSelectedDashboard] =
    useState<DashboardRole>("student");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user && role && !needsRoleSelection && !selectRoleParam) {
      router.replace(getDashboardPath(role));
    }
  }, [user, role, loading, needsRoleSelection, selectRoleParam, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMsg(null);
    setSubmitting(true);

    try {
      if (mode === "signin") {
        const nextRole = await signIn(email.trim(), password);
        if (nextRole) {
          router.replace(getDashboardPath(nextRole));
        }
      } else if (mode === "signup") {
        const nextRole = await signUp(name.trim(), email.trim(), password, selectedDashboard);
        router.replace(getDashboardPath(nextRole));
      } else {
        await resetPassword(email.trim());
        setInfoMsg(
          "Password reset link dispatched. Please inspect your campus inbox."
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Authentication encountered an error."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const assigned = await signInWithGoogle();
      if (assigned) {
        const target = getDashboardPath(assigned);
        router.replace(target);
        if (typeof window !== "undefined") {
          setTimeout(() => {
            if (window.location.pathname !== target) {
              window.location.assign(target);
            }
          }, 150);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Google sign-in could not be completed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteRoleAssignment = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await assignRole(selectedDashboard);
      const target = getDashboardPath(selectedDashboard);
      router.replace(target);
      if (typeof window !== "undefined") {
        setTimeout(() => {
          if (window.location.pathname !== target) {
            window.location.assign(target);
          }
        }, 150);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not assign dashboard role."
      );
      setSubmitting(false);
    }
  };

  if (!loading && user && (needsRoleSelection || selectRoleParam || !role)) {
    return (
      <div className="eh-auth-card">
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <img src="/logo.png" alt="EventHub" className="eh-brand-logo" style={{ width: 44, height: 44, margin: "0 auto 12px" }} />
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "inherit" }}>Assign Your Workspace</h1>
          <p style={{ color: "var(--color-on-surface, #1c1917)", fontSize: 14, fontWeight: 500, marginTop: 6 }}>
            Welcome, <strong style={{ color: "var(--color-on-surface, #1c1917)", fontWeight: 700 }}>{user.displayName || user.email}</strong>. Pick the dashboard role for your account:
          </p>
        </div>

        {error && (
          <div style={{ background: "rgba(248,113,113,.15)", border: "1px solid rgba(248,113,113,.45)", color: "#fca5a5", padding: "10px 14px", borderRadius: 12, fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
          {DASHBOARD_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = selectedDashboard === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedDashboard(opt.id)}
                className={`eh-role-tile ${active ? "active" : ""}`}
                style={{ flexDirection: "row", justifyContent: "flex-start", padding: "14px 16px", gap: 14, textAlign: "left" }}
              >
                <span
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: active ? "var(--g)" : "rgba(245,158,11,0.12)",
                    color: active ? "#171511" : "inherit",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon className="w-5 h-5" />
                </span>
                <span>
                  <strong style={{ display: "block", fontSize: 14.5, color: "var(--color-on-surface, #1c1917)" }}>{opt.title}</strong>
                  <span style={{ display: "block", fontSize: 12, color: "var(--muted, #57534e)", marginTop: 2 }}>{opt.tagline}</span>
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={submitting}
          onClick={handleCompleteRoleAssignment}
          className="eh-btn-primary"
          style={{ width: "100%", height: 46 }}
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Continue to Workspace
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="eh-auth-card">
      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <img src="/logo.png" alt="EventHub" className="eh-brand-logo" style={{ width: 44, height: 44, margin: "0 auto 10px" }} />
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "inherit" }}>
          {mode === "signin"
            ? "Sign in to EventHub"
            : mode === "signup"
              ? "Create your account"
              : "Reset your password"}
        </h1>
        <p style={{ color: "var(--muted, #57534e)", fontSize: 13.5, marginTop: 6 }}>
          {mode === "signin"
            ? "Access your digital QR passes and assigned workspace."
            : mode === "signup"
              ? "Choose your dashboard role and join Hack4Tech events."
              : "Enter your registered email for a password reset link."}
        </p>
      </div>

      {mode !== "reset" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 6,
            background: "rgba(0,0,0,0.05)",
            border: "1px solid rgba(245,158,11,0.25)",
            padding: 4,
            borderRadius: 999,
            marginBottom: 22,
          }}
        >
          <button
            type="button"
            onClick={() => { setMode("signin"); setError(null); }}
            style={{
              background: mode === "signin" ? "var(--g)" : "transparent",
              color: mode === "signin" ? "#171511" : "var(--muted, #57534e)",
              border: 0,
              borderRadius: 999,
              padding: "9px 14px",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode("signup"); setError(null); }}
            style={{
              background: mode === "signup" ? "var(--g)" : "transparent",
              color: mode === "signup" ? "#171511" : "var(--muted, #57534e)",
              border: 0,
              borderRadius: 999,
              padding: "9px 14px",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Create Account
          </button>
        </div>
      )}

      {error && (
        <div style={{ background: "rgba(248,113,113,.15)", border: "1px solid rgba(248,113,113,.45)", color: "#fca5a5", padding: "10px 14px", borderRadius: 12, fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {infoMsg && (
        <div style={{ background: "rgba(52,211,153,.15)", border: "1px solid rgba(52,211,153,.45)", color: "#10b981", padding: "10px 14px", borderRadius: 12, fontSize: 13, marginBottom: 16 }}>
          {infoMsg}
        </div>
      )}

      {mode === "signup" && (
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted, #57534e)", marginBottom: 8 }}>
            Assign Workspace Role
          </label>
          <div className="eh-role-grid">
            {DASHBOARD_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = selectedDashboard === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedDashboard(opt.id)}
                  className={`eh-role-tile ${active ? "active" : ""}`}
                >
                  <Icon className="w-5 h-5" />
                  <span style={{ fontSize: 12, fontWeight: 700 }}>
                    {opt.title.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {mode === "signup" && (
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--color-on-surface-variant, #57534e)", marginBottom: 6 }}>
              Full Name
            </label>
            <input
              type="text"
              required
              className="eh-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
            />
          </div>
        )}

        <div>
          <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--color-on-surface-variant, #57534e)", marginBottom: 6 }}>
            Campus Email
          </label>
          <input
            type="email"
            required
            className="eh-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@campus.edu"
          />
        </div>

        {mode !== "reset" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--color-on-surface-variant, #57534e)" }}>Password</label>
              {mode === "signin" && (
                <button
                  type="button"
                  onClick={() => { setMode("reset"); setError(null); }}
                  style={{ background: "none", border: 0, color: "#d97706", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                >
                  Forgot?
                </button>
              )}
            </div>
            <input
              type="password"
              required
              minLength={6}
              className="eh-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="eh-btn-primary"
          style={{ width: "100%", height: 46, marginTop: 6 }}
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : mode === "signin" ? (
            <>
              Sign In
              <ArrowRight className="w-4 h-4" />
            </>
          ) : mode === "signup" ? (
            <>
              Create {selectedDashboard.toUpperCase()} Account
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            "Send Reset Link"
          )}
        </button>
      </form>

      {mode !== "reset" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(245,158,11,0.2)" }} />
            <span style={{ fontSize: 11.5, color: "var(--muted, #57534e)", textTransform: "uppercase" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "rgba(245,158,11,0.2)" }} />
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={handleGoogle}
            className="eh-btn-outline"
            style={{ width: "100%", height: 44, justifyContent: "center" }}
          >
            <svg style={{ width: 17, height: 17 }} viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Continue with Google
          </button>
        </>
      )}

      {mode === "reset" && (
        <button
          type="button"
          onClick={() => { setMode("signin"); setError(null); }}
          style={{ background: "none", border: 0, color: "var(--muted, #57534e)", fontSize: 13, marginTop: 16, cursor: "pointer", width: "100%", textAlign: "center" }}
        >
          ← Back to Sign In
        </button>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="eh">
      <PublicHeader />
      <main
        className="container"
        style={{
          minHeight: "74vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 28,
        }}
      >
        <Suspense
          fallback={
            <div style={{ padding: 48 }}>
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#f59e0b" }} />
            </div>
          }
        >
          <LoginFormContent />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  );
}
