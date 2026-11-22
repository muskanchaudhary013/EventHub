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
  User,
} from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { BRAND_LOGO_URL } from "@/lib/eventhub-data";
import {
  DashboardRole,
  getDashboardPath,
  useAuth,
} from "@/context/AuthContext";

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
  const [selectedDashboard, setSelectedDashboard] =
    useState<DashboardRole>("student");
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

  // Step 2 for signed-in users who haven't picked a dashboard yet (e.g., first-time Google Sign-In)
  if (!loading && user && (needsRoleSelection || selectRoleParam || !role)) {
    return (
      <div className="max-w-lg w-full mx-auto">
        <div className="bg-surface-container-lowest rounded-3xl border border-[#E8E2D5] shadow-md p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF7F0] border border-[#E8E2D5] flex items-center justify-center mx-auto">
              <img
                src={BRAND_LOGO_URL}
                alt="EventHub"
                className="h-7 w-auto object-contain"
              />
            </div>
            <h1 className="font-headline text-headline-md font-extrabold text-on-surface">
              Assign Your Account Dashboard
            </h1>
            <p className="text-[13.5px] text-on-surface-variant">
              Welcome,{" "}
              <strong className="text-on-surface">
                {user.displayName || user.email}
              </strong>
              . Choose which dashboard workspace should be assigned to your
              account.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-error-container text-on-error-container text-[13px] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2.5">
            {DASHBOARD_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = selectedDashboard === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedDashboard(opt.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3.5 cursor-pointer ${
                    active
                      ? "bg-primary-fixed/35 border-primary-container ring-2 ring-primary-container/25"
                      : "bg-surface-container-low border-[#E8E2D5] hover:bg-surface-container"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      active
                        ? "bg-primary-container text-on-primary"
                        : "bg-surface-container-lowest text-on-surface border border-[#E8E2D5]"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-headline text-[15px] font-bold text-on-surface">
                      {opt.title}
                    </p>
                    <p className="text-[12.5px] text-on-surface-variant">
                      {opt.tagline}
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      active
                        ? "border-primary-container bg-primary-container"
                        : "border-outline-variant"
                    }`}
                  >
                    {active && (
                      <span className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={handleCompleteRoleAssignment}
            className="w-full py-3 px-4 rounded-xl bg-primary-container hover:bg-[#E0484D] text-on-primary font-bold text-[14.5px] flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Continue to Selected Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg w-full mx-auto">
      <div className="bg-surface-container-lowest rounded-3xl border border-[#E8E2D5] shadow-md p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF7F0] border border-[#E8E2D5] flex items-center justify-center mx-auto">
            <img
              src={BRAND_LOGO_URL}
              alt="EventHub"
              className="h-7 w-auto object-contain"
            />
          </div>
          <h1 className="font-headline text-headline-md font-extrabold text-on-surface">
            {mode === "signin"
              ? "Sign in to EventHub"
              : mode === "signup"
                ? "Create your EventHub account"
                : "Reset your password"}
          </h1>
          <p className="text-[13.5px] text-on-surface-variant">
            {mode === "signin"
              ? "Access your assigned EventHub dashboard securely."
              : mode === "signup"
                ? "Choose the dashboard role to assign to your new account."
                : "Enter your account email and we'll send a reset link."}
          </p>
        </div>

        {/* Mode Switcher */}
        {mode !== "reset" && (
          <div className="p-1 bg-surface-container-low rounded-xl grid grid-cols-2 text-[13px] font-semibold border border-[#E8E2D5]/70">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                mode === "signin"
                  ? "bg-surface-container-lowest text-on-surface shadow-2xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                mode === "signup"
                  ? "bg-surface-container-lowest text-on-surface shadow-2xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {!isConfigured && (
          <div className="p-3.5 rounded-xl bg-secondary-fixed/60 border border-secondary/20 text-[12.5px] text-on-secondary-fixed flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Firebase credentials pending</p>
              <p className="opacity-90 mt-0.5">
                Add your{" "}
                <code className="font-mono">NEXT_PUBLIC_FIREBASE_*</code> values
                in <code className="font-mono">frontend/.env.local</code> and
                restart the dev server.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-error-container text-on-error-container text-[13px] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {infoMsg && (
          <div className="p-3 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed text-[13px] flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* Dashboard Role Picker during Signup */}
        {mode === "signup" && (
          <div className="space-y-2">
            <label className="block text-label-token uppercase text-on-surface-variant">
              Select Dashboard to Assign *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {DASHBOARD_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const active = selectedDashboard === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedDashboard(opt.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1.5 cursor-pointer ${
                      active
                        ? "bg-primary-fixed/35 border-primary-container ring-2 ring-primary-container/25"
                        : "bg-surface-container-low border-[#E8E2D5] hover:bg-surface-container"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        active
                          ? "bg-primary-container text-on-primary"
                          : "bg-surface-container-lowest text-on-surface border border-[#E8E2D5]"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-headline text-[13px] font-bold text-on-surface leading-tight">
                      {opt.title.replace(" Dashboard", "").replace(" Console", "")}
                    </span>
                    <span className="text-[11px] leading-snug text-on-surface-variant">
                      {opt.tagline}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Google Sign-In */}
        {mode !== "reset" && (
          <>
            <button
              type="button"
              disabled={submitting}
              onClick={handleGoogle}
              className="w-full py-2.5 px-4 rounded-xl border border-[#E8E2D5] bg-surface-container-lowest hover:bg-surface-container-low text-on-surface text-[14px] font-semibold flex items-center justify-center gap-2.5 transition-colors disabled:opacity-60 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.45c-.28 1.48-1.12 2.74-2.38 3.58v2.98h3.85c2.25-2.07 3.57-5.12 3.57-8.59z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.85-2.98c-1.07.72-2.44 1.15-4.08 1.15-3.14 0-5.8-2.12-6.75-4.97H1.27v3.08C3.24 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.25 14.3a7.17 7.17 0 010-4.6V6.62H1.27a12 12 0 000 10.76l3.98-3.08z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.24 2.7 1.27 6.62l3.98 3.08C6.2 6.87 8.86 4.75 12 4.75z"
                />
              </svg>
              <span>
                {mode === "signup"
                  ? `Sign up with Google (${selectedDashboard})`
                  : "Continue with Google"}
              </span>
            </button>

            <div className="relative flex items-center">
              <div className="flex-1 border-t border-[#E8E2D5]" />
              <span className="px-3 text-label-token uppercase text-on-surface-variant">
                Or with email
              </span>
              <div className="flex-1 border-t border-[#E8E2D5]" />
            </div>
          </>
        )}

        {/* Email / Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "signup" && (
            <div>
              <label className="block text-label-token uppercase text-on-surface-variant mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Chen"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-surface-container-low border border-[#E8E2D5] text-[14px] text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-label-token uppercase text-on-surface-variant mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@campus.edu"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-surface-container-low border border-[#E8E2D5] text-[14px] text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container"
              />
            </div>
          </div>

          {mode !== "reset" && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-label-token uppercase text-on-surface-variant">
                  Password
                </label>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("reset");
                      setError(null);
                    }}
                    className="text-[12px] font-medium text-primary hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-surface-container-low border border-[#E8E2D5] text-[14px] text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-primary-container hover:bg-[#E0484D] text-on-primary font-bold text-[14.5px] flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>
                  {mode === "signin"
                    ? "Sign In to Dashboard"
                    : mode === "signup"
                      ? `Create Account & Open ${selectedDashboard.charAt(0).toUpperCase() + selectedDashboard.slice(1)} Dashboard`
                      : "Send Reset Link"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {mode === "reset" && (
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError(null);
              setInfoMsg(null);
            }}
            className="w-full text-center text-[13px] font-semibold text-on-surface-variant hover:text-on-surface cursor-pointer"
          >
            ← Back to Sign In
          </button>
        )}

        <div className="pt-2 border-t border-[#E8E2D5] flex items-center justify-center gap-1.5 text-[12px] text-on-surface-variant">
          <ShieldCheck className="w-4 h-4 text-tertiary" />
          <span>Protected by Firebase Authentication</span>
        </div>
      </div>

      <p className="text-center text-[13px] text-on-surface-variant mt-5">
        Looking for your event ticket?{" "}
        <Link
          href="/passes"
          className="font-semibold text-primary hover:underline"
        >
          View My Passes →
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />
      <main className="w-full pt-16 flex-1 flex items-center justify-center px-4 py-10">
        <Suspense
          fallback={
            <div className="p-8 text-center text-on-surface-variant text-sm">
              Loading sign-in portal...
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
