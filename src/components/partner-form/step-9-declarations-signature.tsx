"use client";

import React from "react";
import Link from "next/link";
import { CheckSquare, ShieldCheck, FileCheck, ExternalLink } from "lucide-react";
import { PartnerFormData } from "@/lib/partner-types";
import { getCountryDeclarationConfig } from "@/lib/country-declarations";
import SignaturePad from "./signature-pad";

interface Step9Props {
  data: PartnerFormData;
  errors: Record<string, string>;
  onChange: <K extends keyof PartnerFormData>(field: K, value: PartnerFormData[K]) => void;
}

export default function Step9DeclarationsSignature({ data, errors, onChange }: Step9Props) {
  const countryConfig = getCountryDeclarationConfig(data.country || "Kenya");
  const countryDeclarations = countryConfig.declarations;
  const declarations = data.declarations || [];

  const handleToggleDeclaration = (index: number) => {
    const updated = [...declarations];
    while (updated.length < countryDeclarations.length) {
      updated.push(false);
    }
    updated[index] = !updated[index];
    onChange("declarations", updated);
  };

  const handleAcceptAllDeclarations = () => {
    onChange(
      "declarations",
      new Array(countryDeclarations.length).fill(true)
    );
  };

  return (
    <div className="step-content">
      <div className="step-header">
        <span className="step-header__eyebrow">Step 9 of 10</span>
        <h2 className="step-header__title">Declarations, Statutory Consent & Authorized Signature</h2>
        <p className="step-header__desc">
          Review legal declarations for {countryConfig.country}, acknowledge {countryConfig.demonym} data protection privacy compliance, and provide the authorized executive signature.
        </p>
      </div>

      {/* ── Section A: Mandatory Legal Declarations ── */}
      <div className="section-subcard" style={{ marginTop: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.5rem",
          }}
        >
          <h3 className="section-subcard__title" style={{ margin: 0 }}>
            <FileCheck size={18} /> Official Partnership Declarations & Undertakings ({countryConfig.country})
          </h3>
          <button
            type="button"
            onClick={handleAcceptAllDeclarations}
            className="btn-secondary"
            style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}
          >
            Accept All Declarations
          </button>
        </div>
        <p className="section-subcard__desc">
          Each declaration below is required to confirm the statutory authority, licensing validity, and legitimacy of this submission in {countryConfig.country}.
        </p>

        {errors.declarations && (
          <div
            style={{
              color: "#ef5350",
              fontSize: "0.82rem",
              marginBottom: "1rem",
              background: "rgba(111,20,30,0.2)",
              padding: "0.6rem 1rem",
              borderRadius: "8px",
            }}
          >
            {errors.declarations}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          {countryDeclarations.map((statement, idx) => {
            const isChecked = Boolean(declarations[idx]);
            return (
              <label
                key={idx}
                className={`custom-checkbox-row ${isChecked ? "is-checked" : ""}`}
                style={{ padding: "0.7rem 0.95rem" }}
              >
                <input
                  type="checkbox"
                  className="custom-checkbox-input"
                  checked={isChecked}
                  onChange={() => handleToggleDeclaration(idx)}
                />
                <span
                  style={{
                    fontSize: "0.82rem",
                    color: isChecked ? "#f5f1e8" : "rgba(245, 241, 232, 0.75)",
                    lineHeight: 1.45,
                  }}
                >
                  <strong style={{ color: "#b08d57", marginRight: "0.4rem" }}>
                    {idx + 1}.
                  </strong>
                  {statement}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* ── Section B: Data Protection Notice ── */}
      <div className="section-subcard">
        <h3 className="section-subcard__title">
          <ShieldCheck size={18} /> {countryConfig.dataProtectionTitle}
        </h3>
        <p className="section-subcard__desc">
          {countryConfig.dataProtectionSubtitle}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Privacy Notice Acceptance */}
          <label className={`custom-checkbox-row ${data.privacyNoticeAcknowledged ? "is-checked" : ""}`}>
            <input
              type="checkbox"
              className="custom-checkbox-input"
              checked={data.privacyNoticeAcknowledged}
              onChange={(e) => onChange("privacyNoticeAcknowledged", e.target.checked)}
            />
            <div className="checkbox-text-content">
              <span className="checkbox-title">
                Acknowledgement of SAGO Privacy Notice ({countryConfig.actName}) <span className="required-star">*</span>
              </span>
              <span className="checkbox-desc">
                {countryConfig.privacyConsentStatement}{" "}
                <Link
                  href="/privacy"
                  target="_blank"
                  style={{ color: "#d4af37", textDecoration: "underline", marginLeft: "0.3rem" }}
                >
                  Read full SAGO Privacy Policy <ExternalLink size={11} style={{ display: "inline" }} />
                </Link>
              </span>
            </div>
          </label>
          {errors.privacyNoticeAcknowledged && (
            <span className="field-error-msg">{errors.privacyNoticeAcknowledged}</span>
          )}

          {/* Optional Marketing Communications */}
          <label className={`custom-checkbox-row ${data.marketingCommsConsent ? "is-checked" : ""}`}>
            <input
              type="checkbox"
              className="custom-checkbox-input"
              checked={data.marketingCommsConsent}
              onChange={(e) => onChange("marketingCommsConsent", e.target.checked)}
            />
            <div className="checkbox-text-content">
              <span className="checkbox-title">Optional SAGO Trade Bulletins & Product Releases</span>
              <span className="checkbox-desc">
                Receive commercial trade updates, new spirit releases, cocktail masterclass invites, and partner incentives in {countryConfig.country}. (You may unsubscribe at any time).
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* ── Section C: Authorized Executive Signature ── */}
      <div className="section-subcard">
        <h3 className="section-subcard__title">
          <CheckSquare size={18} /> Authorized Signatory Execution
        </h3>
        <p className="section-subcard__desc">
          The signatory executing this application confirms having full legal capacity to bind the applicant business.
        </p>

        <div className="form-grid" style={{ marginBottom: "1.5rem" }}>
          <div className="col-4 form-field">
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

          <div className="col-4 form-field">
            <label className="field-label" htmlFor="signatoryDesignation">
              <span>Official Designation / Title <span className="required-star">*</span></span>
            </label>
            <input
              id="signatoryDesignation"
              type="text"
              className={`form-input ${errors.signatoryDesignation ? "has-error" : ""}`}
              placeholder="e.g., Managing Director / Owner"
              value={data.signatoryDesignation}
              onChange={(e) => onChange("signatoryDesignation", e.target.value)}
            />
            {errors.signatoryDesignation && (
              <span className="field-error-msg">{errors.signatoryDesignation}</span>
            )}
          </div>

          <div className="col-4 form-field">
            <label className="field-label" htmlFor="signatoryBusinessName">
              <span>Business Entity Represented <span className="required-star">*</span></span>
            </label>
            <input
              id="signatoryBusinessName"
              type="text"
              className={`form-input ${errors.signatoryBusinessName ? "has-error" : ""}`}
              placeholder="e.g., Nairobi Beverage Holdings Ltd"
              value={data.signatoryBusinessName}
              onChange={(e) => onChange("signatoryBusinessName", e.target.value)}
            />
            {errors.signatoryBusinessName && (
              <span className="field-error-msg">{errors.signatoryBusinessName}</span>
            )}
          </div>
        </div>

        {/* Signature Pad */}
        <div className="form-field">
          <label className="field-label">
            <span>Authorized Signature <span className="required-star">*</span></span>
          </label>
          <SignaturePad
            value={data.signatureData}
            signerName={data.signatoryFullName}
            onChange={(sigUrl) => onChange("signatureData", sigUrl)}
          />
          {errors.signatureData && (
            <span className="field-error-msg">{errors.signatureData}</span>
          )}
        </div>
      </div>
    </div>
  );
}
