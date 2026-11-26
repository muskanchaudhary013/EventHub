"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  CreditCard,
  Download,
  Info,
  Landmark,
  Mail,
  MapPin,
  Phone,
  QrCode,
  ShieldCheck,
  Ticket,
  Trash2,
  User,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { EventItem, DigitalPass } from "@/lib/eventhub-data";
import { useEventHub } from "@/context/EventHubContext";
import { useAuth } from "@/context/AuthContext";
import { QrCodeSvg } from "@/components/QrCodeSvg";
import "@/app/register/register.css";

interface TeamMemberField {
  id: string;
  name: string;
  phone: string;
  otpSent: boolean;
  timer: number;
}

interface EventRegistrationFormProps {
  event: EventItem;
}

export function EventRegistrationForm({ event }: EventRegistrationFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { registerPass } = useEventHub();

  const maxMembers = event.maxTeamMembers || 3;
  const initialMode = event.teamType === "team" ? "team" : "solo";

  const [mode, setMode] = useState<"solo" | "team">(initialMode);

  // Solo fields
  const [soloName, setSoloName] = useState(user?.displayName || "");
  const [soloEmail, setSoloEmail] = useState(user?.email || "");
  const [soloEmailOtp, setSoloEmailOtp] = useState("");
  const [soloEmailOtpSent, setSoloEmailOtpSent] = useState(false);
  const [soloEmailTimer, setSoloEmailTimer] = useState(59);

  const [soloPhone, setSoloPhone] = useState("");
  const [soloPhoneOtp, setSoloPhoneOtp] = useState("");
  const [soloPhoneOtpSent, setSoloPhoneOtpSent] = useState(false);
  const [soloPhoneTimer, setSoloPhoneTimer] = useState(59);

  // Team fields
  const [teamName, setTeamName] = useState("");
  const [leaderName, setLeaderName] = useState(user?.displayName || "");
  const [leaderEmail, setLeaderEmail] = useState(user?.email || "");
  const [leaderEmailOtp, setLeaderEmailOtp] = useState("");
  const [leaderEmailOtpSent, setLeaderEmailOtpSent] = useState(false);
  const [leaderEmailTimer, setLeaderEmailTimer] = useState(59);

  const [leaderPhone, setLeaderPhone] = useState("");
  const [leaderPhoneOtp, setLeaderPhoneOtp] = useState("");
  const [leaderPhoneOtpSent, setLeaderPhoneOtpSent] = useState(false);
  const [leaderPhoneTimer, setLeaderPhoneTimer] = useState(59);

  useEffect(() => {
    if (user?.displayName) {
      if (!soloName) setSoloName(user.displayName);
      if (!leaderName) setLeaderName(user.displayName);
    }
    if (user?.email) {
      if (!soloEmail) setSoloEmail(user.email);
      if (!leaderEmail) setLeaderEmail(user.email);
    }
  }, [user]);

  const [teamMembers, setTeamMembers] = useState<TeamMemberField[]>([
    { id: "m-1", name: "", phone: "", otpSent: false, timer: 59 },
    { id: "m-2", name: "", phone: "", otpSent: false, timer: 59 },
  ]);

  // Payment method selection (prototype)
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "wallet" | "netbanking">("upi");
  const [agreed, setAgreed] = useState(true);

  // Status and issued pass
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issuedPass, setIssuedPass] = useState<DigitalPass | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // OTP Timers countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setSoloEmailTimer((t) => (t > 0 ? t - 1 : 59));
      setSoloPhoneTimer((t) => (t > 0 ? t - 1 : 59));
      setLeaderEmailTimer((t) => (t > 0 ? t - 1 : 59));
      setLeaderPhoneTimer((t) => (t > 0 ? t - 1 : 59));
      setTeamMembers((prev) =>
        prev.map((m) => ({
          ...m,
          timer: m.timer > 0 ? m.timer - 1 : 59,
        }))
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSendSoloEmailOtp = () => {
    if (!soloEmail) {
      setErrorMessage("Please enter your email address first.");
      return;
    }
    setErrorMessage("");
    setSoloEmailOtpSent(true);
    setSoloEmailTimer(59);
    setSoloEmailOtp("");
  };

  const handleSendSoloPhoneOtp = () => {
    if (!soloPhone) {
      setErrorMessage("Please enter your phone number first.");
      return;
    }
    setErrorMessage("");
    setSoloPhoneOtpSent(true);
    setSoloPhoneTimer(59);
    setSoloPhoneOtp("");
  };

  const handleSendLeaderEmailOtp = () => {
    if (!leaderEmail) {
      setErrorMessage("Please enter leader's email address first.");
      return;
    }
    setErrorMessage("");
    setLeaderEmailOtpSent(true);
    setLeaderEmailTimer(59);
    setLeaderEmailOtp("");
  };

  const handleSendLeaderPhoneOtp = () => {
    if (!leaderPhone) {
      setErrorMessage("Please enter leader's phone number first.");
      return;
    }
    setErrorMessage("");
    setLeaderPhoneOtpSent(true);
    setLeaderPhoneTimer(59);
    setLeaderPhoneOtp("");
  };

  const handleSendMemberOtp = (id: string) => {
    setTeamMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, otpSent: true, timer: 59 } : m))
    );
  };

  const handleAddMember = () => {
    if (teamMembers.length >= maxMembers) return;
    setTeamMembers((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        name: "",
        phone: "",
        otpSent: false,
        timer: 59,
      },
    ]);
  };

  const handleRemoveMember = (id: string) => {
    if (teamMembers.length <= 1) return;
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleMemberChange = (id: string, field: "name" | "phone", val: string) => {
    setTeamMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: val } : m))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!agreed) {
      setErrorMessage("Please agree to the Terms & Conditions and Privacy Policy to proceed.");
      return;
    }

    if (mode === "solo") {
      if (!soloName.trim()) {
        setErrorMessage("Please enter your full name.");
        return;
      }
      if (!soloEmail.trim()) {
        setErrorMessage("Please enter your email address.");
        return;
      }
    } else {
      if (!teamName.trim()) {
        setErrorMessage("Please enter your team name.");
        return;
      }
      if (!leaderName.trim()) {
        setErrorMessage("Please enter leader's name.");
        return;
      }
      if (!leaderEmail.trim()) {
        setErrorMessage("Please enter leader's email address.");
        return;
      }
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const isTeamReg = mode === "team";
      const holderName = isTeamReg ? leaderName.trim() : soloName.trim();
      const holderEmail = isTeamReg ? leaderEmail.trim() : soloEmail.trim();
      const holderPhone = isTeamReg ? leaderPhone.trim() : soloPhone.trim();

      const pass = registerPass({
        event,
        holderName,
        holderEmail,
        holderPhone,
        isTeam: isTeamReg,
        teamName: isTeamReg ? teamName.trim() : undefined,
        teammatesList: isTeamReg
          ? teamMembers.map((m, i) => ({
              name: m.name.trim() || `Member ${i + 1}`,
              phone: m.phone.trim(),
              role: "Team Member",
            }))
          : undefined,
        paymentMethod,
      });

      setIssuedPass(pass);
      setIsSubmitting(false);
    }, 800);
  };

  const formatTimer = (sec: number) => {
    return `00:${sec < 10 ? `0${sec}` : sec}`;
  };

  return (
    <div className="eh-reg-container">
      {/* Top Event Mini Banner */}
      <section className="eh-reg-topcard">
        <div>
          <Link href="/#events" className="eh-back-btn">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Event
          </Link>
        </div>

        <div className="eh-top-banner-inner">
          <div className="eh-top-banner-left">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="eh-top-thumb"
            />
            <div className="eh-top-info">
              <span className="eh-top-badge">{event.categoryLabel}</span>
              <h1 className="eh-top-title">{event.title}</h1>
              <div className="eh-top-meta">
                <span>
                  <Calendar className="w-3.5 h-3.5" style={{ color: "#d97706" }} />
                  {event.dateFull}
                </span>
                <span>
                  <MapPin className="w-3.5 h-3.5" style={{ color: "#d97706" }} />
                  {event.venue}
                </span>
              </div>
            </div>
          </div>

          <div className="eh-top-banner-right">
            <span className="eh-top-fee-label">Registration Fee</span>
            <span className="eh-top-fee-value">{event.feeLabel}</span>
          </div>
        </div>
      </section>

      {/* Main Registration Area: 2 Columns */}
      <form onSubmit={handleSubmit}>
        <div className="eh-reg-grid">
          {/* Left Column: Form Details Card */}
          <div className="eh-reg-maincard">
            <div className="eh-card-header">
              <div className="eh-card-icon-bubble">
                {mode === "solo" ? (
                  <User className="w-5 h-5" />
                ) : (
                  <Users className="w-5 h-5" />
                )}
              </div>
              <div className="eh-card-title-group">
                {mode === "solo" ? (
                  <>
                    <h2>
                      Solo <span>Participant</span>
                    </h2>
                    <p>Register yourself for this exciting event!</p>
                  </>
                ) : (
                  <>
                    <h2>
                      <span>Registration</span>
                    </h2>
                    <p>Choose your preferred mode and fill in the details to register for this event!</p>
                  </>
                )}
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="eh-mode-switcher">
              <button
                type="button"
                className={`eh-mode-btn ${mode === "solo" ? "active" : ""}`}
                onClick={() => setMode("solo")}
              >
                <User className="w-4 h-4" />
                Solo Participant
              </button>
              <button
                type="button"
                className={`eh-mode-btn ${mode === "team" ? "active" : ""}`}
                onClick={() => setMode("team")}
              >
                <Users className="w-4 h-4" />
                Team / Squad
              </button>
            </div>

            {errorMessage && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  color: "#fca5a5",
                  padding: "10px 14px",
                  borderRadius: 10,
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Info className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Solo Participant Form */}
            {mode === "solo" && (
              <div>
                {/* Full Name */}
                <div className="eh-form-group">
                  <label className="eh-form-label">
                    Full Name <span className="req">*</span>
                  </label>
                  <div className="eh-input-wrap">
                    <User className="w-4 h-4 eh-input-icon" />
                    <input
                      type="text"
                      className="eh-input-field"
                      placeholder="Enter your full name"
                      value={soloName}
                      onChange={(e) => setSoloName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="eh-form-group">
                  <label className="eh-form-label">
                    Email Address <span className="req">*</span>
                  </label>
                  <div className="eh-input-wrap">
                    <Mail className="w-4 h-4 eh-input-icon" />
                    <input
                      type="email"
                      className="eh-input-field"
                      placeholder="Enter your email address"
                      value={soloEmail}
                      onChange={(e) => setSoloEmail(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="eh-send-otp-btn"
                      onClick={handleSendSoloEmailOtp}
                    >
                      {soloEmailOtpSent ? "Resend OTP" : "Send OTP"}
                    </button>
                  </div>
                  <span className="eh-field-helper">
                    <Info className="w-3.5 h-3.5" />
                    We'll send a verification code to your email.
                  </span>
                </div>

                {/* Email OTP */}
                <div className="eh-form-group">
                  <label className="eh-form-label">
                    Enter Email OTP <span className="req">*</span>
                  </label>
                  <div className="eh-input-wrap">
                    <ShieldCheck className="w-4 h-4 eh-input-icon" />
                    <input
                      type="text"
                      maxLength={6}
                      className="eh-input-field"
                      placeholder="Enter 6-digit code"
                      value={soloEmailOtp}
                      onChange={(e) => setSoloEmailOtp(e.target.value)}
                    />
                    <span className="eh-otp-timer">{formatTimer(soloEmailTimer)}</span>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="eh-form-group">
                  <label className="eh-form-label">
                    Phone Number <span className="req">*</span>
                  </label>
                  <div className="eh-input-wrap">
                    <Phone className="w-4 h-4 eh-input-icon" />
                    <input
                      type="tel"
                      className="eh-input-field"
                      placeholder="Enter your phone number"
                      value={soloPhone}
                      onChange={(e) => setSoloPhone(e.target.value)}
                    />
                    <button
                      type="button"
                      className="eh-send-otp-btn"
                      onClick={handleSendSoloPhoneOtp}
                    >
                      {soloPhoneOtpSent ? "Resend OTP" : "Send OTP"}
                    </button>
                  </div>
                  <span className="eh-field-helper">
                    <Info className="w-3.5 h-3.5" />
                    We'll send a verification code to your phone number.
                  </span>
                </div>

                {/* Phone OTP */}
                <div className="eh-form-group">
                  <label className="eh-form-label">
                    Enter Phone OTP <span className="req">*</span>
                  </label>
                  <div className="eh-input-wrap">
                    <ShieldCheck className="w-4 h-4 eh-input-icon" />
                    <input
                      type="text"
                      maxLength={6}
                      className="eh-input-field"
                      placeholder="Enter 6-digit code"
                      value={soloPhoneOtp}
                      onChange={(e) => setSoloPhoneOtp(e.target.value)}
                    />
                    <span className="eh-otp-timer">{formatTimer(soloPhoneTimer)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Team / Squad Form */}
            {mode === "team" && (
              <div>
                <h3 className="eh-form-section-title">Team Details</h3>

                {/* Row 1: Team Name & Leader Name */}
                <div className="eh-2col-grid">
                  <div className="eh-form-group">
                    <label className="eh-form-label">
                      Team Name <span className="req">*</span>
                    </label>
                    <div className="eh-input-wrap">
                      <Users className="w-4 h-4 eh-input-icon" />
                      <input
                        type="text"
                        className="eh-input-field"
                        placeholder="Enter your team name"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="eh-form-group">
                    <label className="eh-form-label">
                      Leader's Name <span className="req">*</span>
                    </label>
                    <div className="eh-input-wrap">
                      <User className="w-4 h-4 eh-input-icon" />
                      <input
                        type="text"
                        className="eh-input-field"
                        placeholder="Enter leader's name"
                        value={leaderName}
                        onChange={(e) => setLeaderName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Leader Email & Leader Phone */}
                <div className="eh-2col-grid">
                  <div className="eh-form-group">
                    <label className="eh-form-label">
                      Leader's Email Address <span className="req">*</span>
                    </label>
                    <div className="eh-input-wrap">
                      <Mail className="w-4 h-4 eh-input-icon" />
                      <input
                        type="email"
                        className="eh-input-field"
                        placeholder="Enter email address"
                        value={leaderEmail}
                        onChange={(e) => setLeaderEmail(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="eh-send-otp-btn"
                        onClick={handleSendLeaderEmailOtp}
                      >
                        {leaderEmailOtpSent ? "Resend" : "Send OTP"}
                      </button>
                    </div>
                    <span className="eh-field-helper">
                      <Info className="w-3.5 h-3.5" />
                      We'll send a verification code to your email.
                    </span>
                  </div>

                  <div className="eh-form-group">
                    <label className="eh-form-label">
                      Leader's Phone Number <span className="req">*</span>
                    </label>
                    <div className="eh-input-wrap">
                      <Phone className="w-4 h-4 eh-input-icon" />
                      <input
                        type="tel"
                        className="eh-input-field"
                        placeholder="Enter phone number"
                        value={leaderPhone}
                        onChange={(e) => setLeaderPhone(e.target.value)}
                      />
                      <button
                        type="button"
                        className="eh-send-otp-btn"
                        onClick={handleSendLeaderPhoneOtp}
                      >
                        {leaderPhoneOtpSent ? "Resend" : "Send OTP"}
                      </button>
                    </div>
                    <span className="eh-field-helper">
                      <Info className="w-3.5 h-3.5" />
                      We'll send a verification code to your phone number.
                    </span>
                  </div>
                </div>

                {/* Row 3: OTP inputs for Leader */}
                <div className="eh-2col-grid">
                  <div className="eh-form-group">
                    <label className="eh-form-label">
                      Enter Email OTP <span className="req">*</span>
                    </label>
                    <div className="eh-input-wrap">
                      <ShieldCheck className="w-4 h-4 eh-input-icon" />
                      <input
                        type="text"
                        maxLength={6}
                        className="eh-input-field"
                        placeholder="Enter 6-digit code"
                        value={leaderEmailOtp}
                        onChange={(e) => setLeaderEmailOtp(e.target.value)}
                      />
                      <span className="eh-otp-timer">{formatTimer(leaderEmailTimer)}</span>
                    </div>
                  </div>

                  <div className="eh-form-group">
                    <label className="eh-form-label">
                      Enter Phone OTP <span className="req">*</span>
                    </label>
                    <div className="eh-input-wrap">
                      <ShieldCheck className="w-4 h-4 eh-input-icon" />
                      <input
                        type="text"
                        maxLength={6}
                        className="eh-input-field"
                        placeholder="Enter 6-digit code"
                        value={leaderPhoneOtp}
                        onChange={(e) => setLeaderPhoneOtp(e.target.value)}
                      />
                      <span className="eh-otp-timer">{formatTimer(leaderPhoneTimer)}</span>
                    </div>
                  </div>
                </div>

                {/* Team Members List */}
                <h3 className="eh-form-section-title" style={{ marginTop: 20 }}>
                  Team Members (Max {maxMembers} Members)
                </h3>

                <div>
                  {teamMembers.map((member, idx) => (
                    <div key={member.id} className="eh-member-row">
                      <div className="eh-member-badge">{idx + 1}</div>

                      <div className="eh-input-wrap" style={{ margin: 0 }}>
                        <User className="w-4 h-4 eh-input-icon" />
                        <input
                          type="text"
                          className="eh-input-field"
                          placeholder="Enter member name"
                          value={member.name}
                          onChange={(e) => handleMemberChange(member.id, "name", e.target.value)}
                        />
                      </div>

                      <div className="eh-input-wrap" style={{ margin: 0 }}>
                        <Phone className="w-4 h-4 eh-input-icon" />
                        <input
                          type="tel"
                          className="eh-input-field"
                          placeholder="Enter phone number"
                          value={member.phone}
                          onChange={(e) => handleMemberChange(member.id, "phone", e.target.value)}
                        />
                        <button
                          type="button"
                          className="eh-send-otp-btn"
                          onClick={() => handleSendMemberOtp(member.id)}
                        >
                          {member.otpSent ? "Resend" : "Send OTP"}
                        </button>
                      </div>

                      <button
                        type="button"
                        className="eh-trash-btn"
                        onClick={() => handleRemoveMember(member.id)}
                        title="Remove member"
                        disabled={teamMembers.length <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {teamMembers.length < maxMembers && (
                    <button
                      type="button"
                      className="eh-add-member-btn"
                      onClick={handleAddMember}
                    >
                      + Add Another Member
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Event Summary Card */}
          <div className="eh-reg-summarycard">
            <div className="eh-summary-head">
              <Ticket className="w-4 h-4" style={{ color: "#d97706" }} />
              <span>Event Summary</span>
            </div>

            <img
              src={event.imageUrl}
              alt={event.title}
              className="eh-summary-thumb"
            />

            <div className="eh-summary-details">
              <span className="eh-top-badge">{event.categoryLabel}</span>
              <h3 className="eh-summary-title">{event.title}</h3>
              <div className="eh-summary-meta">
                <span>
                  <Calendar className="w-3.5 h-3.5" style={{ color: "#d97706" }} />
                  {event.dateFull}
                </span>
                <span>
                  <MapPin className="w-3.5 h-3.5" style={{ color: "#d97706" }} />
                  {event.venue}
                </span>
              </div>
            </div>

            <div className="eh-summary-divider" />

            <div className="eh-summary-fee-block">
              <span className="eh-summary-fee-label">Registration Fee</span>
              <span className="eh-summary-fee-value">{event.feeLabel}</span>
            </div>

            <ul className="eh-perks-list">
              <li className="eh-perk-item">
                <span className="eh-perk-check">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span>Get your QR Pass</span>
              </li>
              <li className="eh-perk-item">
                <span className="eh-perk-check">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span>Access event updates</span>
              </li>
              <li className="eh-perk-item">
                <span className="eh-perk-check">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span>Join the Hack4Tech community!</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Card: Payment Method Selection */}
        <section className="eh-payment-card">
          <div className="eh-payment-head">
            <div className="eh-payment-icon">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="eh-payment-head-text">
              <h3>
                Payment Method <span className="req">*</span>
              </h3>
              <p>Choose your preferred payment method (Prototype Simulation)</p>
            </div>
          </div>

          <div className="eh-methods-grid">
            {/* UPI */}
            <div
              className={`eh-method-option ${paymentMethod === "upi" ? "selected" : ""}`}
              onClick={() => setPaymentMethod("upi")}
            >
              <div className="eh-method-top">
                <div className="eh-radio-circle">
                  {paymentMethod === "upi" && <div className="eh-radio-dot" />}
                </div>
                <QrCode className="w-5 h-5 eh-method-icon" />
              </div>
              <div>
                <div className="eh-method-name">UPI</div>
                <div className="eh-method-sub">Pay using UPI</div>
              </div>
            </div>

            {/* Debit / Credit Card */}
            <div
              className={`eh-method-option ${paymentMethod === "card" ? "selected" : ""}`}
              onClick={() => setPaymentMethod("card")}
            >
              <div className="eh-method-top">
                <div className="eh-radio-circle">
                  {paymentMethod === "card" && <div className="eh-radio-dot" />}
                </div>
                <CreditCard className="w-5 h-5 eh-method-icon" />
              </div>
              <div>
                <div className="eh-method-name">Debit / Credit Card</div>
                <div className="eh-method-sub">Visa, Mastercard</div>
              </div>
            </div>

            {/* Wallet */}
            <div
              className={`eh-method-option ${paymentMethod === "wallet" ? "selected" : ""}`}
              onClick={() => setPaymentMethod("wallet")}
            >
              <div className="eh-method-top">
                <div className="eh-radio-circle">
                  {paymentMethod === "wallet" && <div className="eh-radio-dot" />}
                </div>
                <Wallet className="w-5 h-5 eh-method-icon" />
              </div>
              <div>
                <div className="eh-method-name">Wallet</div>
                <div className="eh-method-sub">Paytm, PhonePe, etc.</div>
              </div>
            </div>

            {/* Net Banking */}
            <div
              className={`eh-method-option ${paymentMethod === "netbanking" ? "selected" : ""}`}
              onClick={() => setPaymentMethod("netbanking")}
            >
              <div className="eh-method-top">
                <div className="eh-radio-circle">
                  {paymentMethod === "netbanking" && <div className="eh-radio-dot" />}
                </div>
                <Landmark className="w-5 h-5 eh-method-icon" />
              </div>
              <div>
                <div className="eh-method-name">Net Banking</div>
                <div className="eh-method-sub">All major banks</div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Actions */}
        <div className="eh-action-row">
          <label className="eh-terms-label">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ display: "none" }}
              className="eh-terms-input"
            />
            <span className="eh-custom-check">
              {agreed && <Check className="w-3.5 h-3.5" />}
            </span>
            <span>
              I agree to the{" "}
              <Link href="/faq" className="eh-terms-link">
                Terms & Conditions
              </Link>{" "}
              and{" "}
              <Link href="/faq" className="eh-terms-link">
                Privacy Policy
              </Link>
            </span>
          </label>

          <button
            type="submit"
            className="eh-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>Processing Registration...</>
            ) : (
              <>
                Complete Registration
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Confirmation & Issued Pass Modal */}
      {issuedPass && (
        <div className="eh-ticket-modal-overlay">
          <div className="eh-ticket-modal-card">
            {/* Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid rgba(168, 85, 247, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <CheckCircle2 className="w-5 h-5" style={{ color: "#34d399" }} />
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#fff" }}>
                  Registration Confirmed!
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIssuedPass(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#9490b4",
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ticket Preview Body */}
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 18 }}>
              {/* QR Code and Pass Code */}
              <div
                style={{
                  background: "rgba(10, 7, 20, 0.9)",
                  border: "1px solid rgba(168, 85, 247, 0.35)",
                  borderRadius: 16,
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                  boxShadow: "0 8px 30px rgba(0, 0, 0, 0.4)",
                }}
              >
                <QrCodeSvg
                  value={issuedPass.qrToken || issuedPass.passCode}
                  size={170}
                  showActions={true}
                  pass={issuedPass}
                  downloadName={issuedPass.passCode}
                />
                <div style={{ textAlign: "center" }}>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#d97706",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {issuedPass.passCode}
                  </span>
                  <div style={{ fontSize: 12, color: "#10b981", marginTop: 4, fontWeight: 600 }}>
                    {issuedPass.teamName && issuedPass.teamName !== "Solo Entrant"
                      ? "1 Unified Team QR Pass • Displayed to Team Leader Only"
                      : "Unique Solo QR Pass • Signed Token (No PII)"}
                  </div>
                  <div style={{ fontSize: 11.5, color: "#a8a29e", marginTop: 4 }}>
                    Download as PNG or PDF now — QR codes are not sent via email.
                  </div>
                </div>
              </div>

              {/* Event details summary */}
              <div
                style={{
                  background: "rgba(28, 25, 20, 0.6)",
                  border: "1px solid rgba(245, 158, 11, 0.25)",
                  borderRadius: 14,
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  fontSize: 13,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#a8a29e" }}>Event:</span>
                  <strong style={{ color: "#fff", textAlign: "right" }}>{issuedPass.eventTitle}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#a8a29e" }}>Attendee / Leader:</span>
                  <span style={{ color: "#fff" }}>{issuedPass.holderName}</span>
                </div>
                {issuedPass.teamName && issuedPass.teamName !== "Solo Entrant" && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#a8a29e" }}>Team:</span>
                    <span style={{ color: "#d97706", fontWeight: 600 }}>{issuedPass.teamName}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#9f9cb8" }}>Date & Venue:</span>
                  <span style={{ color: "#fff" }}>{issuedPass.dateRange} • {issuedPass.venue}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#9f9cb8" }}>Fee & Payment:</span>
                  <span style={{ color: "#34d399", fontWeight: 600 }}>
                    {event.feeLabel} • Paid via {paymentMethod.toUpperCase()} (Simulated)
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                <Link
                  href="/passes"
                  className="eh-submit-btn"
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    textDecoration: "none",
                  }}
                >
                  View in My Passes
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="eh-back-btn"
                  style={{
                    padding: "12px 18px",
                    borderRadius: 9999,
                    fontSize: 14,
                  }}
                >
                  <Download className="w-4 h-4" />
                  Print / Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
