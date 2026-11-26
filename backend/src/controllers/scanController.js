import crypto from "crypto";
import { ScanLog } from "../models/ScanLog.js";
import { Pass } from "../models/Pass.js";
import { Attendee } from "../models/Attendee.js";

// GET /api/scans
export const getScanLogs = async (req, res, next) => {
  try {
    const logs = await ScanLog.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    next(error);
  }
};

// POST /api/scans (Server-side cryptographic QR verification & attendance update)
export const logScan = async (req, res, next) => {
  try {
    const {
      qrToken,
      passCode: rawPassCode,
      gateLocation = "Gate 1",
    } = req.body;

    const rawInput = (qrToken || rawPassCode || "").trim();

    if (!rawInput) {
      return res.status(400).json({
        success: false,
        status: "Invalid",
        message: "QR token or pass code is required",
      });
    }

    let lookupPassCode = rawInput;

    // Verify cryptographic HMAC signature if a signed QR token is provided
    if (rawInput.startsWith("EH-SEC.v1.")) {
      const parts = rawInput.split(".");
      if (parts.length !== 4) {
        return res.status(401).json({
          success: false,
          status: "Invalid",
          message: "Invalid or unauthorized registration: malformed QR token.",
        });
      }

      const [, , payloadB64, providedSig] = parts;
      const secret = process.env.QR_TOKEN_SECRET || process.env.JWT_SECRET || "eventhub-hmac-secret";
      const expectedSig = crypto.createHmac("sha256", secret).update(payloadB64).digest("base64url");

      if (providedSig !== expectedSig) {
        return res.status(401).json({
          success: false,
          status: "Invalid",
          message: "Invalid or unauthorized registration: forged or tampered QR signature.",
        });
      }

      try {
        const decoded = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
        lookupPassCode = decoded.pid;
      } catch {
        return res.status(401).json({
          success: false,
          status: "Invalid",
          message: "Invalid or unauthorized registration: unreadable QR payload.",
        });
      }
    }

    const pass = await Pass.findOne({
      $or: [{ passCode: lookupPassCode }, { qrToken: rawInput }],
    });

    const nowTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    if (!pass || pass.status === "Cancelled") {
      const scanLog = await ScanLog.create({
        time: nowTime,
        attendee: "Unauthorized / Unregistered",
        event: "Unknown Event",
        passId: lookupPassCode,
        status: "Manual",
        gateLocation,
      });

      return res.status(404).json({
        success: false,
        status: "Invalid",
        message: "Invalid or unauthorized registration: forged, expired, or unregistered QR code.",
        data: scanLog,
      });
    }

    // Duplicate scan check — return original check-in timestamp
    if (pass.status === "Checked In") {
      const originalTimestamp = pass.checkedInAt
        ? new Date(pass.checkedInAt).toLocaleString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        : "Earlier today";

      const scanLog = await ScanLog.create({
        time: nowTime,
        attendee: pass.holderName,
        subtitle: pass.teamName ? `(${pass.teamName})` : "",
        event: pass.eventTitle,
        passId: pass.passCode,
        status: "Duplicate",
        gateLocation,
      });

      return res.status(409).json({
        success: false,
        status: "Duplicate",
        message: `Already checked in at ${originalTimestamp} (${pass.checkedInGate || gateLocation}). Duplicate entry refused.`,
        originalCheckInAt: pass.checkedInAt,
        originalCheckInTime: originalTimestamp,
        originalGate: pass.checkedInGate || gateLocation,
        data: { pass, scanLog },
      });
    }

    // First authorized check-in -> Access granted
    pass.status = "Checked In";
    pass.dotColor = "emerald";
    pass.checkedInAt = new Date();
    pass.checkedInGate = gateLocation;
    await pass.save();

    const scanLog = await ScanLog.create({
      time: nowTime,
      attendee: pass.holderName,
      subtitle: pass.teamName ? `(${pass.teamName})` : "",
      event: pass.eventTitle,
      passId: pass.passCode,
      status: "Valid",
      gateLocation,
    });

    await Attendee.findOneAndUpdate(
      { passId: pass.passCode },
      {
        status: "Present",
        statusLabel: "Present",
        scanTime: nowTime,
        gateLocation,
      }
    ).catch(() => null);

    res.json({
      success: true,
      status: "Valid",
      message: `Valid and verified registration. Access granted for ${pass.holderName} (${pass.eventTitle}).`,
      data: {
        pass,
        scanLog,
      },
    });
  } catch (error) {
    next(error);
  }
};
