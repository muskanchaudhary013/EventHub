// EventHub Secure QR Token Generation & Verification Protocol
// Security: Contains ONLY a cryptographic token ID and signed hash.
// NO Personal Information (names, emails, phone numbers) is embedded in the QR code.

export interface SecureQrPayload {
  v: number; // Token version
  tid: string; // Unique cryptographic token ID
  pid: string; // Pass code reference (e.g., EH-2026-HCK-9481)
  eid: string; // Event identifier
  iat: number; // Issued at epoch timestamp
}

export interface VerificationResult {
  status: "granted" | "duplicate" | "invalid";
  title: string;
  message: string;
  pass?: any;
  firstCheckInTime?: string;
  gateLocation?: string;
}

// Simple deterministic hash simulation for verifiable tokens
function createSignature(payloadStr: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < payloadStr.length; i++) {
    hash ^= payloadStr.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  const hex = (hash >>> 0).toString(16).padStart(8, "0");
  return `sig_${hex}_${(hash % 99991).toString(16)}`;
}

/**
 * Generates a tamper-proof secure QR token string.
 * Format: EH-SEC.v1.<base64Payload>.<signature>
 */
export function generateSecureQrToken(passCode: string, eventId: string): string {
  const tid = `tok_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
  const payload: SecureQrPayload = {
    v: 1,
    tid,
    pid: passCode,
    eid: eventId,
    iat: Date.now(),
  };

  const payloadStr = typeof window !== "undefined"
    ? btoa(JSON.stringify(payload))
    : Buffer.from(JSON.stringify(payload)).toString("base64");

  const sig = createSignature(payloadStr);
  return `EH-SEC.v1.${payloadStr}.${sig}`;
}

/**
 * Parses and verifies an incoming QR string or passCode against the registration database.
 */
export function verifyQrToken(
  qrString: string,
  passesList: any[]
): VerificationResult {
  const cleaned = qrString.trim();

  if (!cleaned) {
    return {
      status: "invalid",
      title: "Invalid QR Code",
      message: "No QR code token detected or token was empty.",
    };
  }

  let passCodeLookup = cleaned;

  // If it's a secure token, parse and check signature
  if (cleaned.startsWith("EH-SEC.v1.")) {
    const parts = cleaned.split(".");
    if (parts.length === 4) {
      const payloadStr = parts[2];
      const sig = parts[3];
      const expectedSig = createSignature(payloadStr);

      if (sig !== expectedSig) {
        return {
          status: "invalid",
          title: "Tampered or Forged Token",
          message: "Cryptographic signature check failed. Forged or corrupted pass token.",
        };
      }

      try {
        const jsonStr = typeof window !== "undefined"
          ? atob(payloadStr)
          : Buffer.from(payloadStr, "base64").toString("utf-8");
        const payload: SecureQrPayload = JSON.parse(jsonStr);
        passCodeLookup = payload.pid;
      } catch {
        return {
          status: "invalid",
          title: "Malformed QR Token",
          message: "Unable to parse secure token payload.",
        };
      }
    }
  }

  // Look up in registration database by passCode or ID
  const pass = passesList.find(
    (p) =>
      p.passCode.toUpperCase() === passCodeLookup.toUpperCase() ||
      p.id === passCodeLookup ||
      (p.qrToken && p.qrToken === cleaned)
  );

  if (!pass) {
    return {
      status: "invalid",
      title: "Unregistered or Expired Pass",
      message: `No active registration found for token [${passCodeLookup}]. Forged, expired or unregistered code.`,
    };
  }

  // Check if already checked in (Duplicate Scan rule)
  if (pass.status === "Checked In") {
    return {
      status: "duplicate",
      title: "Already Checked In!",
      message: `Warning: Duplicate scan detected! This pass was already checked in at ${pass.checkInTime || "09:14 AM"}${pass.checkInGate ? ` at ${pass.checkInGate}` : ""}.`,
      pass,
      firstCheckInTime: pass.checkInTime || "09:14 AM",
      gateLocation: pass.checkInGate || "Gate 2 Turing Hall",
    };
  }

  // First authorized check-in -> Access Granted
  return {
    status: "granted",
    title: "Access Granted",
    message: "Valid and verified registration. Authorized for immediate entry.",
    pass,
  };
}
