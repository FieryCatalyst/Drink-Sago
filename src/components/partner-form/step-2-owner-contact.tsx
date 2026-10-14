"use client";

import React from "react";
import { UserCheck, ShieldCheck, Mail, Phone, Briefcase, CheckSquare } from "lucide-react";
import { PartnerFormData } from "@/lib/partner-types";

interface Step2Props {
  data: PartnerFormData;
  errors: Record<string, string>;
  onChange: <K extends keyof PartnerFormData>(field: K, value: PartnerFormData[K]) => void;
}

export default function Step2OwnerContact({ data, errors, onChange }: Step2Props) {
  const handleNameChange = (val: string) => {
    onChange("ownerFullName", val);
    onChange("authContactName", val);
    onChange("authAgreementPerson", val);
    if (!data.signatoryFullName || data.signatoryFullName === data.ownerFullName) {
      onChange("signatoryFullName", val);
    }
  };

  const handlePositionChange = (val: string) => {
    onChange("ownerPosition", val);
    onChange("authContactTitle", val);
    if (!data.signatoryDesignation || data.signatoryDesignation === data.ownerPosition) {
      onChange("signatoryDesignation", val);
    }
  };

  const handleEmailChange = (val: string) => {
    onChange("ownerEmail", val);
    onChange("authContactEmail", val);
  };

  const handlePhoneChange = (val: string) => {
    onChange("ownerPhone", val);
    onChange("authContactPhone", val);
  };

  return (
    <div className="step-content">
      <div className="step-header">
        <span className="step-header__eyebrow">Step 2 of 5</span>
        <h2 className="step-header__title">Primary Contact & Decision Maker</h2>
        <p className="step-header__desc">
          Provide details for the designated representative who will coordinate onboarding, campaigns, and communication with the SAGO team.
        </p>
      </div>

      <div className="section-subcard" style={{ marginTop: 0 }}>
        <h3 className="section-subcard__title">
          <UserCheck size={18} /> Representative Details
        </h3>
        <p className="section-subcard__desc">
          Who is our direct point of contact for this partnership?
        </p>

        <div className="form-grid">
          {/* Full Legal Name */}
          <div className="col-6 form-field">
            <label className="field-label" htmlFor="ownerFullName">
              <span>Full Name <span className="required-star">*</span></span>
            </label>
            <input
              id="ownerFullName"
              type="text"
              className={`form-input ${errors.ownerFullName ? "has-error" : ""}`}
              placeholder="e.g., Peter Kamau Kariuki"
              value={data.ownerFullName || data.authContactName || ""}
              onChange={(e) => handleNameChange(e.target.value)}
            />
            {errors.ownerFullName && (
              <span className="field-error-msg">{errors.ownerFullName}</span>
            )}
          </div>

          {/* Position / Job Title */}
          <div className="col-6 form-field">
            <label className="field-label" htmlFor="ownerPosition">
              <span>Role / Position <span className="required-star">*</span></span>
            </label>
            <input
              id="ownerPosition"
              type="text"
              className={`form-input ${errors.ownerPosition ? "has-error" : ""}`}
              placeholder="e.g., Owner, Managing Director, General Manager"
              value={data.ownerPosition || data.authContactTitle || ""}
              onChange={(e) => handlePositionChange(e.target.value)}
            />
            {errors.ownerPosition && (
              <span className="field-error-msg">{errors.ownerPosition}</span>
            )}
          </div>

          {/* Direct Phone */}
          <div className="col-6 form-field">
            <label className="field-label" htmlFor="ownerPhone">
              <span>Direct Phone / WhatsApp <span className="required-star">*</span></span>
            </label>
            <input
              id="ownerPhone"
              type="tel"
              className={`form-input ${errors.ownerPhone ? "has-error" : ""}`}
              placeholder="e.g., +254 712 345 678"
              value={data.ownerPhone || data.authContactPhone || ""}
              onChange={(e) => handlePhoneChange(e.target.value)}
            />
            {errors.ownerPhone && (
              <span className="field-error-msg">{errors.ownerPhone}</span>
            )}
          </div>

          {/* Direct Email */}
          <div className="col-6 form-field">
            <label className="field-label" htmlFor="ownerEmail">
              <span>Direct Email Address <span className="required-star">*</span></span>
            </label>
            <input
              id="ownerEmail"
              type="email"
              className={`form-input ${errors.ownerEmail ? "has-error" : ""}`}
              placeholder="e.g., peter@velvetoak.co.ke"
              value={data.ownerEmail || data.authContactEmail || ""}
              onChange={(e) => handleEmailChange(e.target.value)}
            />
            {errors.ownerEmail && (
              <span className="field-error-msg">{errors.ownerEmail}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Authority Confirmation ── */}
      <div className="section-subcard">
        <h3 className="section-subcard__title">
          <ShieldCheck size={18} /> Signing Authority
        </h3>
        <p className="section-subcard__desc">
          Confirm authority to enter into partnership discussions.
        </p>

        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "0.85rem",
            cursor: "pointer",
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(176, 141, 87, 0.2)",
            borderRadius: "10px",
            padding: "1rem",
          }}
        >
          <input
            type="checkbox"
            checked={data.authContactCanSign !== false}
            onChange={(e) => onChange("authContactCanSign", e.target.checked)}
            style={{ marginTop: "0.2rem", accentColor: "#b08d57", width: "18px", height: "18px" }}
          />
          <div style={{ fontSize: "0.88rem", lineHeight: 1.5, color: "rgba(245, 241, 232, 0.9)" }}>
            <strong>Authorized Representative:</strong> I confirm that I am authorized by the proprietors or management to represent this establishment and submit this partnership application to SAGO.
          </div>
        </label>
      </div>
    </div>
  );
}
