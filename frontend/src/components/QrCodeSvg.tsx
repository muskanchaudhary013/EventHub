"use client";

import React, { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import { Download, FileText, Check } from "lucide-react";
import { DigitalPass } from "@/lib/eventhub-data";

interface QrCodeSvgProps {
  value?: string;
  size?: number | "sm" | "lg";
  seed?: string;
  className?: string;
  showActions?: boolean;
  pass?: DigitalPass;
  downloadName?: string;
}

export function QrCodeSvg({
  value,
  size = "lg",
  seed = "EH-2026-HCK-9481",
  className = "",
  showActions = false,
  pass,
  downloadName,
}: QrCodeSvgProps) {
  // Use value if provided, otherwise fallback to seed
  const qrData = value || seed;

  const [dataUrl, setDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Compute pixel dimension based on size prop
  const pixelSize =
    typeof size === "number" ? size : size === "sm" ? 80 : 180;

  useEffect(() => {
    let isMounted = true;

    QRCode.toDataURL(qrData, {
      width: pixelSize * 2, // High resolution for sharp rendering
      margin: 1.5,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    })
      .then((url) => {
        if (isMounted) setDataUrl(url);
      })
      .catch((err) => {
        console.error("Failed to generate QR code", err);
      });

    return () => {
      isMounted = false;
    };
  }, [qrData, pixelSize]);

  // Download QR Code as PNG image
  const handleDownloadPng = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${downloadName || qrData.replace(/[^a-zA-Z0-9_-]/g, "_")}_QR.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Download / Print pass as PDF or structured document
  const handleDownloadPdf = () => {
    if (!pass) {
      handleDownloadPng();
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>EventHub Entry Pass - ${pass.passCode}</title>
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            body {
              font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
              background: #f8fafc;
              margin: 0;
              padding: 20px;
            }
            .pass-card {
              max-width: 540px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 16px;
              border: 2px solid #7c3aed;
              box-shadow: 0 10px 25px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            .pass-header {
              background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
              color: #ffffff;
              padding: 24px;
              text-align: center;
            }
            .pass-header h1 { margin: 0 0 6px; font-size: 24px; }
            .pass-header p { margin: 0; opacity: 0.9; font-size: 14px; }
            .pass-body { padding: 24px; text-align: center; }
            .qr-image {
              width: 200px;
              height: 200px;
              margin: 0 auto 16px;
              display: block;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 8px;
            }
            .pass-code {
              font-family: monospace;
              font-size: 20px;
              font-weight: 700;
              letter-spacing: 2px;
              color: #7c3aed;
              margin-bottom: 20px;
            }
            .info-table {
              width: 100%;
              text-align: left;
              border-collapse: collapse;
              margin-top: 10px;
              font-size: 14px;
            }
            .info-table td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }
            .info-table td.label { font-weight: 600; color: #64748b; width: 40%; }
            .info-table td.value { font-weight: 700; color: #0f172a; }
            .footer-note {
              margin-top: 20px;
              font-size: 12px;
              color: #94a3b8;
              text-align: center;
              border-top: 1px dashed #cbd5e1;
              padding-top: 12px;
            }
          </style>
        </head>
        <body>
          <div class="pass-card">
            <div class="pass-header">
              <h1>EVENTHUB VERIFIED ENTRY PASS</h1>
              <p>${pass.eventTitle}</p>
            </div>
            <div class="pass-body">
              <img src="${dataUrl}" class="qr-image" alt="QR Code" />
              <div class="pass-code">${pass.passCode}</div>
              <table class="info-table">
                <tr><td class="label">Attendee / Leader:</td><td class="value">${pass.holderName}</td></tr>
                ${pass.teamName && pass.teamName !== "Solo Entrant" ? `<tr><td class="label">Team / Squad:</td><td class="value">${pass.teamName}</td></tr>` : ""}
                ${pass.teammates && pass.teammates.length > 0 ? `<tr><td class="label">Team Members:</td><td class="value">${pass.teammates.map(t => t.name).join(", ")}</td></tr>` : ""}
                <tr><td class="label">Dates:</td><td class="value">${pass.dateRange}</td></tr>
                <tr><td class="label">Venue:</td><td class="value">${pass.venue}</td></tr>
                <tr><td class="label">Tier / Gate:</td><td class="value">${pass.tierLabel} (${pass.gateTime})</td></tr>
                <tr><td class="label">Security Token:</td><td class="value">${pass.sigHash}</td></tr>
              </table>
              <div class="footer-note">
                • Present this QR pass at the entrance scanner turnstile for immediate check-in.<br/>
                • Single authorized entry token. Duplicates will trigger a security flag.
              </div>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Clean high-contrast QR display container */}
      <div
        style={{
          width: pixelSize + 16,
          height: pixelSize + 16,
          background: "#FFFFFF",
          borderRadius: 14,
          padding: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
          border: "2px solid rgba(168, 85, 247, 0.35)",
        }}
      >
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={`QR Code for ${qrData}`}
            style={{
              width: pixelSize,
              height: pixelSize,
              display: "block",
              borderRadius: 6,
            }}
          />
        ) : (
          <div
            style={{
              width: pixelSize,
              height: pixelSize,
              background: "#F1F5F9",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94A3B8",
              fontSize: 12,
            }}
          >
            Generating QR...
          </div>
        )}
      </div>

      {/* Action buttons (Download image / Download PDF) */}
      {showActions && (
        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            type="button"
            onClick={handleDownloadPng}
            className="eh-back-btn"
            style={{
              padding: "7px 14px",
              fontSize: 12.5,
              borderRadius: 9999,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
            title="Download QR Code Image"
          >
            <Download className="w-3.5 h-3.5" />
            Download QR (PNG)
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            className="eh-back-btn"
            style={{
              padding: "7px 14px",
              fontSize: 12.5,
              borderRadius: 9999,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
            title="Save or Print Entry Pass PDF"
          >
            <FileText className="w-3.5 h-3.5" />
            Download Pass (PDF)
          </button>
        </div>
      )}
    </div>
  );
}
