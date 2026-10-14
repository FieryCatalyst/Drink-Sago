"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Building2,
  User,
  Wine,
  CreditCard,
  Edit3,
  ShieldCheck,
  Lock,
  ArrowRight,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { PartnerFormData } from "@/lib/partner-types";
import SignaturePad from "./signature-pad";

interface Step5Props {
  data: PartnerFormData;
  errors: Record<string, string>;
  onGoToStep: (stepNumber: number) => void;
  onSubmit: () => Promise<void>;
  onChange: <K extends keyof PartnerFormData>(field: K, value: PartnerFormData[K]) => void;
  isSubmitting: boolean;
}

export default function Step5ReviewSubmit({
  data,
  errors,
  onGoToStep,
  onSubmit,
  onChange,
  isSubmitting,
}: Step5Props) {
  const selectedProducts = (data.products || []).filter((p) => p.selected);

  return (
    <div className="step-content">
      <div className="step-header">
        <span className="step-header__eyebrow">Step 5 of 5</span>
        <h2 className="step-header__title">Review & Submit Application</h2>
        <p className="step-header__desc">
          Review your application summary below. You can jump back to edit any section or complete your digital confirmation and submit.
        </p>
      </div>

      {/* ── Summary Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {/* Step 1 Summary */}
        <div
          style={{
            background: "rgba(23, 23, 23, 0.7)",
            border: "1px solid rgba(176, 141, 87, 0.25)",
            borderRadius: "12px",
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#b08d57", fontSize: "0.82rem", fontWeight: 700 }}>
                <Building2 size={16} /> 1. Venue & Business
              </div>
              <button
                type="button"
                onClick={() => onGoToStep(1)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#d4af37",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <Edit3 size={13} /> Edit
              </button>
            </div>
            <div style={{ fontSize: "0.85rem", color: "rgba(245, 241, 232, 0.8)", lineHeight: 1.6 }}>
              <div><strong>Name:</strong> {data.tradingName || data.registeredBusinessName || "Not provided"}</div>
              <div><strong>Type:</strong> {data.businessType || "Not selected"}</div>
              <div><strong>Location:</strong> {[data.townCity, data.county, data.country].filter(Boolean).join(", ") || "Not set"}</div>
              <div><strong>Phone:</strong> {data.businessPhone || "Not set"}</div>
            </div>
          </div>
        </div>

        {/* Step 2 Summary */}
        <div
          style={{
            background: "rgba(23, 23, 23, 0.7)",
            border: "1px solid rgba(176, 141, 87, 0.25)",
            borderRadius: "12px",
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#b08d57", fontSize: "0.82rem", fontWeight: 700 }}>
                <User size={16} /> 2. Contact Person
              </div>
              <button
                type="button"
                onClick={() => onGoToStep(2)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#d4af37",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <Edit3 size={13} /> Edit
              </button>
            </div>
            <div style={{ fontSize: "0.85rem", color: "rgba(245, 241, 232, 0.8)", lineHeight: 1.6 }}>
              <div><strong>Name:</strong> {data.ownerFullName || data.authContactName || "Not provided"}</div>
              <div><strong>Role:</strong> {data.ownerPosition || data.authContactTitle || "Not provided"}</div>
              <div><strong>Direct Phone:</strong> {data.ownerPhone || data.authContactPhone || "Not provided"}</div>
              <div><strong>Direct Email:</strong> {data.ownerEmail || data.authContactEmail || "Not provided"}</div>
            </div>
          </div>
        </div>

        {/* Step 3 Summary */}
        <div
          style={{
            background: "rgba(23, 23, 23, 0.7)",
            border: "1px solid rgba(176, 141, 87, 0.25)",
            borderRadius: "12px",
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#b08d57", fontSize: "0.82rem", fontWeight: 700 }}>
                <Wine size={16} /> 3. Partnership & Products
              </div>
              <button
                type="button"
                onClick={() => onGoToStep(3)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#d4af37",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <Edit3 size={13} /> Edit
              </button>
            </div>
            <div style={{ fontSize: "0.85rem", color: "rgba(245, 241, 232, 0.8)", lineHeight: 1.6 }}>
              <div><strong>Model:</strong> {data.partnershipType}</div>
              <div><strong>Duration:</strong> {data.agreementDuration || "12 Months"}</div>
              <div><strong>Selected Products:</strong> {selectedProducts.length} SAGO expression(s)</div>
              <div><strong>Pricing:</strong> Discussed after onboarding</div>
            </div>
          </div>
        </div>

        {/* Step 4 Summary */}
        <div
          style={{
            background: "rgba(23, 23, 23, 0.7)",
            border: "1px solid rgba(176, 141, 87, 0.25)",
            borderRadius: "12px",
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#b08d57", fontSize: "0.82rem", fontWeight: 700 }}>
                <CreditCard size={16} /> 4. Operations & Payout
              </div>
              <button
                type="button"
                onClick={() => onGoToStep(4)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#d4af37",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <Edit3 size={13} /> Edit
              </button>
            </div>
            <div style={{ fontSize: "0.85rem", color: "rgba(245, 241, 232, 0.8)", lineHeight: 1.6 }}>
              <div><strong>Redemption:</strong> {data.redemptionMethod || "Both Methods"}</div>
              <div><strong>Settlement:</strong> {data.requiresSettlement ? "Reimbursement / Commission" : "Standard Promo (No cash reimbursement required)"}</div>
              <div><strong>Attachments:</strong> {(data.documents || []).length} optional file(s)</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section B: Legal Declarations & Terms ── */}
      <div className="section-subcard">
        <h3 className="section-subcard__title">
          <ShieldCheck size={18} /> Partnership Declarations
        </h3>
        <p className="section-subcard__desc">
          Please confirm acceptance of SAGO partner terms and ethical spirits service standards.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
              cursor: "pointer",
              background: "rgba(255, 255, 255, 0.02)",
              border: `1px solid ${errors.privacyNoticeAcknowledged ? "#ef4444" : "rgba(176, 141, 87, 0.2)"}`,
              borderRadius: "8px",
              padding: "0.85rem",
            }}
          >
            <input
              type="checkbox"
              checked={data.privacyNoticeAcknowledged}
              onChange={(e) => onChange("privacyNoticeAcknowledged", e.target.checked)}
              style={{ marginTop: "0.2rem", accentColor: "#b08d57", width: "18px", height: "18px" }}
            />
            <div style={{ fontSize: "0.85rem", lineHeight: 1.5, color: "rgba(245, 241, 232, 0.88)" }}>
              <strong>Terms & Responsible Service:</strong> I agree to the SAGO Partner Network Terms. Our establishment strictly enforces the legal minimum drinking age (18+ in Kenya, 21+ where applicable) and commits to dispensing only genuine, authentic SAGO Whisky products. <span className="required-star">*</span>
            </div>
          </label>
          {errors.privacyNoticeAcknowledged && (
            <span className="field-error-msg" style={{ marginTop: "-0.4rem" }}>
              {errors.privacyNoticeAcknowledged}
            </span>
          )}

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
              cursor: "pointer",
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(176, 141, 87, 0.2)",
              borderRadius: "8px",
              padding: "0.85rem",
            }}
          >
            <input
              type="checkbox"
              checked={data.marketingCommsConsent}
              onChange={(e) => onChange("marketingCommsConsent", e.target.checked)}
              style={{ marginTop: "0.2rem", accentColor: "#b08d57", width: "18px", height: "18px" }}
            />
            <div style={{ fontSize: "0.85rem", lineHeight: 1.5, color: "rgba(245, 241, 232, 0.88)" }}>
              <strong>Promotional Visibility:</strong> We authorize SAGO to list our venue name and location on the SAGO website and partner finder to drive customers to our venue.
            </div>
          </label>
        </div>
      </div>

      {/* ── Section C: Digital Confirmation & Signature ── */}
      <div className="section-subcard">
        <h3 className="section-subcard__title">
          <Lock size={18} /> Digital Confirmation & Signature
        </h3>
        <p className="section-subcard__desc">
          Sign or type your full legal name to execute this partner onboarding application.
        </p>

        <div className="form-grid">
          <div className="col-6 form-field">
            <label className="field-label" htmlFor="signatoryFullName">
              <span>Signatory Full Legal Name <span className="required-star">*</span></span>
            </label>
            <input
              id="signatoryFullName"
              type="text"
              className={`form-input ${errors.signatoryFullName ? "has-error" : ""}`}
              placeholder="e.g., Peter Kamau Kariuki"
              value={data.signatoryFullName}
              onChange={(e) => onChange("signatoryFullName", e.target.value)}
            />
            {errors.signatoryFullName && (
              <span className="field-error-msg">{errors.signatoryFullName}</span>
            )}
          </div>

          <div className="col-6 form-field">
            <label className="field-label" htmlFor="signatoryDesignation">
              <span>Signatory Role / Designation</span>
            </label>
            <input
              id="signatoryDesignation"
              type="text"
              className="form-input"
              placeholder="e.g., Managing Director / Owner"
              value={data.signatoryDesignation}
              onChange={(e) => onChange("signatoryDesignation", e.target.value)}
            />
          </div>

          <div className="col-12 form-field">
            <label className="field-label">
              <span>Authorized Signature (Draw or Confirm Name) <span className="required-star">*</span></span>
            </label>
            <SignaturePad
              value={data.signatureData || ""}
              signerName={data.signatoryFullName || data.ownerFullName || ""}
              onChange={(sig: string) => onChange("signatureData", sig)}
            />
            {errors.signatureData && (
              <span className="field-error-msg">{errors.signatureData}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Submission Action ── */}
      <div
        style={{
          marginTop: "2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="btn-wizard-next"
          style={{
            padding: "1rem 3rem",
            fontSize: "1.05rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            borderRadius: "10px",
            minWidth: "280px",
            justifyContent: "center",
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={20} className="spin" /> Submitting Application...
            </>
          ) : (
            <>
              Submit Partner Application <ArrowRight size={18} />
            </>
          )}
        </button>

        <span style={{ fontSize: "0.8rem", color: "rgba(245, 241, 232, 0.55)" }}>
          Your application will be instantly recorded and reviewed by our brand partnerships team.
        </span>
      </div>
    </div>
  );
}
