"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Copy,
  Check,
  Printer,
  Mail,
  ShieldCheck,
  Calendar,
  Building,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { PartnerFormData } from "@/lib/partner-types";

interface SubmissionSuccessProps {
  reference: string;
  status: string;
  submittedAt: string;
  data: PartnerFormData;
  onReset?: () => void;
}

export default function SubmissionSuccess({
  reference,
  status,
  submittedAt,
  data,
}: SubmissionSuccessProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="submission-card">
      <div className="submission-icon-wrap">
        <CheckCircle2 size={38} />
      </div>

      <span className="partner-hero__badge" style={{ marginBottom: "0.75rem" }}>
        Application Received · Status: Pending Review
      </span>

      <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "#f5f1e8", marginBottom: "0.5rem" }}>
        Application Submitted Successfully
      </h2>

      <p style={{ color: "rgba(245, 241, 232, 0.7)", fontSize: "0.95rem", lineHeight: 1.6, maxWidth: "560px", margin: "0 auto" }}>
        Thank you for applying to become an official SAGO Business Partner. Your application has been logged in our verification registry.
      </p>

      {/* Reference Card */}
      <div className="reference-pill">
        <span>{reference}</span>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            background: "none",
            border: "none",
            color: copied ? "#81c784" : "#b08d57",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            padding: "0.2rem",
          }}
          title="Copy Reference Number"
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </button>
      </div>

      <p style={{ fontSize: "0.78rem", color: "rgba(245, 241, 232, 0.5)", marginBottom: "2rem" }}>
        Submitted on: {new Date(submittedAt).toLocaleString()} · Keep this reference for communications.
      </p>

      {/* Key Summary Snapshot */}
      <div
        style={{
          background: "rgba(10, 10, 10, 0.8)",
          border: "1px solid rgba(176, 141, 87, 0.2)",
          borderRadius: "14px",
          padding: "1.25rem",
          textAlign: "left",
          marginBottom: "2rem",
          fontSize: "0.85rem",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <span style={{ color: "rgba(245, 241, 232, 0.5)", fontSize: "0.74rem" }}>Trading Name:</span>
            <div style={{ fontWeight: 600, color: "#f5f1e8" }}>{data.tradingName}</div>
          </div>
          <div>
            <span style={{ color: "rgba(245, 241, 232, 0.5)", fontSize: "0.74rem" }}>Location:</span>
            <div style={{ fontWeight: 600, color: "#f5f1e8" }}>
              {data.townCity}, {data.county} ({data.country})
            </div>
          </div>
          <div>
            <span style={{ color: "rgba(245, 241, 232, 0.5)", fontSize: "0.74rem" }}>Authorized Representative:</span>
            <div style={{ fontWeight: 600, color: "#f5f1e8" }}>{data.authContactName}</div>
          </div>
          <div>
            <span style={{ color: "rgba(245, 241, 232, 0.5)", fontSize: "0.74rem" }}>Official Contact:</span>
            <div style={{ fontWeight: 600, color: "#f5f1e8" }}>{data.businessEmail}</div>
          </div>
        </div>
      </div>

      {/* Next Steps Timeline */}
      <div style={{ textAlign: "left", marginBottom: "2.5rem" }}>
        <h4 style={{ fontSize: "1rem", fontWeight: 600, color: "#b08d57", marginBottom: "1rem" }}>
          Next Steps in the Onboarding Process:
        </h4>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[
            {
              step: "1",
              title: "Compliance & Licensing Verification",
              desc: "SAGO verification officers will validate your County Single Business Permit and liquor licences (typically 3–5 business days).",
            },
            {
              step: "2",
              title: "Commercial Alignment & Agreement Execution",
              desc: "A formal SAGO Partner Agreement will be generated confirming your approved promotional discounts and participating SKUs.",
            },
            {
              step: "3",
              title: "Partner Portal & Staff QR Access",
              desc: "Your designated outlet manager will receive secure login credentials and instructions to train bar staff on QR coupon validation.",
            },
            {
              step: "4",
              title: "Promotional Launch & POS Kit Delivery",
              desc: "Your venue is listed on the official SAGO Store Locator and promotional POS materials are delivered to your outlet.",
            },
          ].map((item) => (
            <div key={item.step} style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start" }}>
              <span
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: "rgba(176, 141, 87, 0.2)",
                  color: "#d4af37",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "2px",
                }}
              >
                {item.step}
              </span>
              <div>
                <span style={{ fontWeight: 600, color: "#f5f1e8", fontSize: "0.88rem", display: "block" }}>
                  {item.title}
                </span>
                <span style={{ fontSize: "0.78rem", color: "rgba(245, 241, 232, 0.6)", lineHeight: 1.4 }}>
                  {item.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "2rem",
        }}
      >
        <button
          type="button"
          onClick={handlePrint}
          className="btn-secondary"
          style={{ padding: "0.75rem 1.4rem" }}
        >
          <Printer size={15} /> Print Application Receipt
        </button>

        <Link
          href={`/partners/status?ref=${encodeURIComponent(reference)}`}
          className="btn-primary"
          style={{ padding: "0.75rem 1.6rem" }}
        >
          Track Application Status <ArrowRight size={15} />
        </Link>
      </div>

      {/* Support Contact */}
      <div
        style={{
          borderTop: "1px solid rgba(176, 141, 87, 0.15)",
          paddingTop: "1.5rem",
          fontSize: "0.78rem",
          color: "rgba(245, 241, 232, 0.55)",
        }}
      >
        Questions about your application? Contact our Partnership Team at{" "}
        <a
          href="mailto:partnerships@drinksago.com"
          style={{ color: "#d4af37", textDecoration: "underline" }}
        >
          partnerships@drinksago.com
        </a>
      </div>
    </div>
  );
}
