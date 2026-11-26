"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  Lock,
  Mail,
  QrCode,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import {
  DashboardRole,
  getDashboardPath,
  useAuth,
} from "@/context/AuthContext";
import "../home.css";

const DASHBOARD_OPTIONS: Array<{
  id: DashboardRole;
  title: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: "student",
    title: "Student Dashboard",
    tagline: "Manage event registrations, QR passes & schedule",
    icon: GraduationCap,
  },
  {
    id: "volunteer",
    title: "Volunteer Console",
    tagline: "Operate live Gate Scanner HUD & check-in feeds",
    icon: QrCode,
  },
  {
    id: "organizer",
    title: "Organizer Dashboard",
    tagline: "Create events, track venue capacity & export rosters",
    icon: LayoutDashboard,
  },
];

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    user,
    role,
    needsRoleSelection,
    loading,
    isConfigured,
    signIn,
    signUp,
    signInWithGoogle,
    assignRole,
    resetPassword,
  } = useAuth();

  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const selectRoleParam = searchParams.get("selectRole") === "1";

  const [mode, setMode] = useState<"signin" | "signup" | "reset">(initialMode);
  const [selectedDashboard, setSelectedDashboard] = useState<DashboardRole>("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user && role && !needsRoleSelection) {
      router.replace(getDashboardPath(role));
    }
  }, [loading, user, role, needsRoleSelection, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMsg(null);
    setSubmitting(true);
    try {
      if (mode === "signin") {
        const assigned = await signIn(email.trim(), password);
        if (assigned) {
          router.replace(getDashboardPath(assigned));
        }
      } else if (mode === "signup") {
        const assigned = await signUp(
          name.trim(),
          email.trim(),
          password,
          selectedDashboard
        );
        router.replace(getDashboardPath(assigned));
      } else {
        await resetPassword(email.trim());
        setInfoMsg("Password reset email sent. Check your inbox.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Authentication failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setInfoMsg(null);
    setSubmitting(true);
    try {
      const assigned = await signInWithGoogle(
        mode === "signup" ? selectedDashboard : undefined
      );
      if (assigned) {
        router.replace(getDashboardPath(assigned));
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
      router.replace(getDashboardPath(selectedDashboard));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not assign dashboard role."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // If user signed in but needs role assignment
  if (!loading && user && (needsRoleSelection || selectRoleParam || !role)) {
    return (
      <div className="auth-box">
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div className="logo" style={{ justifyContent: "center", marginBottom: 12 }}>
            <i />EventHub
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>Assign Account Workspace</h2>
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 6 }}>
            Welcome, <b>{user.displayName || user.email}</b>. Choose your portal:
          </p>
        </div>

        {error && (
          <div style={{ background: "rgba(255,80,80,.15)", border: "1px solid #FF5050", color: "#FF8080", padding: "10px 14px", borderRadius: 12, fontSize: 13, marginBottom: 16 }}>
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
                className={`role-btn ${active ? "active" : ""}`}
                style={{ flexDirection: "row", justifyContent: "flex-start", padding: "16px 20px" }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: active ? "var(--mag)" : "rgba(255,255,255,.08)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon className="w-5 h-5" />
                </div>
                <div style={{ textAlign: "left", flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{opt.title}</div>
                  <div style={{ color: "var(--muted)", fontSize: 12 }}>{opt.tagline}</div>
                </div>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={submitting}
          onClick={handleCompleteRoleAssignment}
          className="btn"
          style={{ width: "100%", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          {submitting ? <Loader2 className="animate-spin" style={{ width: 18, height: 18 }} /> : <>Continue to Selected Workspace <ArrowRight style={{ width: 16, height: 16 }} /></>}
        </button>
      </div>
    );
  }

  return (
    <div className="auth-box">
      {/* Auth Card Header */}
      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <div className="logo" style={{ justifyContent: "center", marginBottom: 10 }}>
          <i />EventHub
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800 }}>
          {mode === "signin"
            ? "Sign In to EventHub"
            : mode === "signup"
              ? "Create Your Account"
              : "Reset Password"}
        </h2>
        <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>
          {mode === "signin"
            ? "Access your passes and assigned dashboard workspace"
            : mode === "signup"
              ? "Select your role to get access to custom tools"
              : "Enter your student email for a password reset token"}
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      {mode !== "reset" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, background: "rgba(0,0,0,.3)", padding: 4, borderRadius: 999, marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => { setMode("signin"); setError(null); }}
            style={{
              background: mode === "signin" ? "var(--g)" : "transparent",
              color: "#fff",
              border: 0,
              borderRadius: 999,
              padding: "8px 16px",
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
              color: "#fff",
              border: 0,
              borderRadius: 999,
              padding: "8px 16px",
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
        <div style={{ background: "rgba(255,80,80,.15)", border: "1px solid #FF5050", color: "#FF8080", padding: "10px 14px", borderRadius: 12, fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {infoMsg && (
        <div style={{ background: "rgba(61,220,151,.15)", border: "1px solid var(--mint)", color: "var(--mint)", padding: "10px 14px", borderRadius: 12, fontSize: 13, marginBottom: 16 }}>
          {infoMsg}
        </div>
      )}

      {/* Role Picker on Signup */}
      {mode === "signup" && (
        <div style={{ marginBottom: 18 }}>
          <small style={{ color: "var(--muted)", textTransform: "uppercase", fontSize: 11, fontWeight: 700, letterSpacing: ".06em", display: "block", marginBottom: 8 }}>
            Select Workspace Role *
          </small>
          <div className="role-selector" style={{ margin: "0 0 16px" }}>
            {DASHBOARD_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = selectedDashboard === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedDashboard(opt.id)}
                  className={`role-btn ${active ? "active" : ""}`}
                >
                  <Icon className="w-5 h-5" />
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{opt.title.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Email/Password Form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {mode === "signup" && (
          <div className="form-group" style={{ margin: 0 }}>
            <label>Full Name</label>
            <input
              type="text"
              required
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Chen"
            />
          </div>
        )}

        <div className="form-group" style={{ margin: 0 }}>
          <label>Campus Email</label>
          <input
            type="email"
            required
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex.chen@campus.edu"
          />
        </div>

        {mode !== "reset" && (
          <div className="form-group" style={{ margin: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <label>Password</label>
              {mode === "signin" && (
                <button
                  type="button"
                  onClick={() => { setMode("reset"); setError(null); }}
                  style={{ background: "none", border: 0, color: "var(--mag)", fontSize: 12, cursor: "pointer", fontWeight: 600 }}
                >
                  Forgot?
                </button>
              )}
            </div>
            <input
              type="password"
              required
              minLength={6}
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="btn"
          style={{ width: "100%", padding: "12px 20px", marginTop: 8 }}
        >
          {submitting ? (
            <Loader2 className="animate-spin" style={{ width: 18, height: 18, margin: "0 auto" }} />
          ) : mode === "signin" ? (
            "Sign In →"
          ) : mode === "signup" ? (
            `Create ${selectedDashboard.toUpperCase()} Account →`
          ) : (
            "Send Reset Link"
          )}
        </button>
      </form>

      {/* Google OAuth Provider */}
      {mode !== "reset" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
            <span style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={handleGoogle}
            className="btn-secondary"
            style={{ width: "100%", justifyContent: "center", padding: "11px 18px" }}
          >
            <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24">
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
          style={{ background: "none", border: 0, color: "var(--muted)", fontSize: 13, marginTop: 16, cursor: "pointer", width: "100%", textAlign: "center" }}
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
      <div className="app" id="top">
        <PublicHeader />

        <main className="pad" style={{ minHeight: "75vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Suspense fallback={<div style={{ textAlign: "center", padding: 40 }}><Loader2 className="animate-spin" style={{ margin: "0 auto" }} /></div>}>
            <LoginFormContent />
          </Suspense>
        </main>

        <PublicFooter />
      </div>
    </div>
  );
}
