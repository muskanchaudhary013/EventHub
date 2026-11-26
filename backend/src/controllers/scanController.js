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

// POST /api/scans (Check-in via QR / PassCode)
export const logScan = async (req, res, next) => {
  try {
    const { passCode, gateLocation = "Gate 1", scannedBy = "Volunteer Scanner" } = req.body;

    if (!passCode) {
      return res.status(400).json({ success: false, message: "Pass code is required" });
    }

    const pass = await Pass.findOne({ passCode });

    const nowTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    if (!pass) {
      const scanLog = await ScanLog.create({
        time: nowTime,
        attendee: "Unregistered Holder",
        event: "Unknown Event",
        passId: passCode,
        status: "Manual",
        gateLocation,
      });

      return res.status(404).json({
        success: false,
        status: "Manual",
        message: "Pass not found in registry. Manual desk check required.",
        data: scanLog,
      });
    }

    // Check if duplicate scan
    if (pass.status === "Checked In") {
      const scanLog = await ScanLog.create({
        time: nowTime,
        attendee: pass.holderName,
        subtitle: pass.teamName ? `(${pass.teamName})` : "",
        event: pass.eventTitle,
        passId: passCode,
        status: "Duplicate",
        gateLocation,
      });

      await Attendee.findOneAndUpdate(
        { passId: passCode },
        {
          status: "Blocked",
          statusLabel: "Duplicate Scan Blocked",
          scanTime: `${nowTime} (Duplicate)`,
          gateLocation: `${gateLocation} • Blocked`,
        }
      ).catch(() => null);

      return res.status(409).json({
        success: false,
        status: "Duplicate",
        message: `Pass was already scanned. Duplicate check-in flagged.`,
        data: scanLog,
      });
    }

    // Mark pass as checked in
    pass.status = "Checked In";
    pass.dotColor = "emerald";
    pass.checkedInAt = new Date();
    await pass.save();

    const scanLog = await ScanLog.create({
      time: nowTime,
      attendee: pass.holderName,
      subtitle: pass.teamName ? `(${pass.teamName})` : "",
      event: pass.eventTitle,
      passId: passCode,
      status: "Valid",
      gateLocation,
    });

    await Attendee.findOneAndUpdate(
      { passId: passCode },
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
      message: `Verified: ${pass.holderName} check-in authorized for ${pass.eventTitle}`,
      data: {
        pass,
        scanLog,
      },
    });
  } catch (error) {
    next(error);
  }
};
