import crypto from "crypto";
import { Pass } from "../models/Pass.js";
import { Event } from "../models/Event.js";
import { Attendee } from "../models/Attendee.js";

// GET /api/passes
export const getPasses = async (req, res, next) => {
  try {
    const { email, userUid } = req.query;
    const query = {};

    if (email) query.holderEmail = email;
    if (userUid) query.userUid = userUid;

    const passes = await Pass.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: passes.length, data: passes });
  } catch (error) {
    next(error);
  }
};

// GET /api/passes/:passCode
export const getPassByCode = async (req, res, next) => {
  try {
    const { passCode } = req.params;
    const pass = await Pass.findOne({ passCode });

    if (!pass) {
      return res.status(404).json({ success: false, message: "Pass not found" });
    }

    res.json({ success: true, data: pass });
  } catch (error) {
    next(error);
  }
};

// POST /api/passes (Register / Claim a pass)
export const createPass = async (req, res, next) => {
  try {
    const {
      eventId,
      eventTitle,
      trackLabel,
      shortTabLabel,
      dateRange,
      venue,
      holderName,
      holderEmail,
      userUid,
      teamName,
      tierLabel,
      teammates = [],
    } = req.body;

    if (!eventTitle || !holderName || !holderEmail) {
      return res.status(400).json({ success: false, message: "Event, holder name, and email are required" });
    }

    // Generate unique passCode: EH-2026-XXX-####
    // Single pass generated for Solo OR entire Team (never emailed; displayed on confirmation screen)
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const passCode = `EH-2026-${(eventTitle.slice(0, 3)).toUpperCase()}-${randCode}`;
    const secret = process.env.QR_TOKEN_SECRET || process.env.JWT_SECRET || "eventhub-hmac-secret";
    const tokenPayload = Buffer.from(
      JSON.stringify({
        v: 1,
        tid: crypto.randomBytes(8).toString("hex"),
        pid: passCode,
        eid: eventId ? String(eventId) : "event",
        iat: Date.now(),
      })
    ).toString("base64url");
    const hmacSig = crypto.createHmac("sha256", secret).update(tokenPayload).digest("base64url");
    const qrToken = `EH-SEC.v1.${tokenPayload}.${hmacSig}`;
    const sigHash = `sha256:${crypto.createHmac("sha256", secret).update(qrToken).digest("hex").slice(0, 24)}`;

    const pass = await Pass.create({
      passCode,
      qrToken,
      eventId,
      eventTitle,
      trackLabel: trackLabel || "General Track",
      shortTabLabel: shortTabLabel || `${eventTitle.slice(0, 16)}...`,
      dateRange: dateRange || "Upcoming Fest",
      venue: venue || "Main Campus Hall",
      holderName,
      holderEmail,
      userUid,
      teamName: teamName || (teammates.length > 0 ? "Team Attendee" : "Solo Participant"),
      tierLabel: tierLabel || "Student Pass",
      teammates,
      sigHash,
      status: "Confirmed",
      dotColor: "emerald",
    });

    // Also register attendee in live gate manifest
    const initials = holderName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    await Attendee.findOneAndUpdate(
      { passId: passCode },
      {
        passId: passCode,
        initials: initials || "AT",
        name: holderName,
        email: holderEmail,
        teamInfo: teamName || (teammates.length > 0 ? `Team (${teammates.length + 1} pax)` : "Solo Participant"),
        event: eventTitle,
        track: trackLabel || "General Track",
        type: teammates.length > 0 ? "Team" : "Solo",
        typeLabel: teammates.length > 0 ? `Team (${teammates.length + 1} pax)` : "Solo",
        status: "Pending",
        statusLabel: "Pending",
        scanTime: "Unscanned",
        gateLocation: "En route",
      },
      { upsert: true, new: true }
    );

    // Increment registered count if eventId exists
    if (eventId) {
      await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: 1 } }).catch(() => null);
    }

    res.status(201).json({ success: true, data: pass });
  } catch (error) {
    next(error);
  }
};
