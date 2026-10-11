"use client";

import React from "react";
import { QrCode, Smartphone, Wifi, CheckSquare, ShieldCheck, AlertCircle } from "lucide-react";
import { PartnerFormData } from "@/lib/partner-types";
import { REDEMPTION_METHODS, REDEMPTION_RULES } from "@/lib/kenya-data";

interface Step6Props {
  data: PartnerFormData;
  errors: Record<string, string>;
  onChange: <K extends keyof PartnerFormData>(field: K, value: PartnerFormData[K]) => void;
}

export default function Step6RedemptionSetup({ data, errors, onChange }: Step6Props) {
  const acknowledged = data.acknowledgedRedemptionRules || [];

  const handleToggleRule = (index: number) => {
    const updated = [...acknowledged];
    while (updated.length < REDEMPTION_RULES.length) {
      updated.push(false);
    }
    updated[index] = !updated[index];
    onChange("acknowledgedRedemptionRules", updated);
  };

  const handleAcknowledgeAll = () => {
    onChange(
      "acknowledgedRedemptionRules",
      new Array(REDEMPTION_RULES.length).fill(true)
    );
  };

  return (
    <div className="step-content">
      <div className="step-header">
        <span className="step-header__eyebrow">Step 6 of 10</span>
        <h2 className="step-header__title">QR Code & Coupon Redemption Setup</h2>
        <p className="step-header__desc">
          Configure how your bar staff and bartenders will validate digital customer coupons in the official SAGO Partner Portal.
        </p>
      </div>

      <div
        style={{
          background: "rgba(176, 141, 87, 0.08)",
          border: "1px solid rgba(176, 141, 87, 0.25)",
          borderRadius: "12px",
          padding: "1rem 1.25rem",
          marginBottom: "1.75rem",
          fontSize: "0.82rem",
          color: "rgba(245, 241, 232, 0.8)",
          lineHeight: 1.5,
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <ShieldCheck size={24} color="#b08d57" style={{ flexShrink: 0 }} />
        <div>
          <strong>Technical Architecture Notice:</strong> This onboarding form collects your outlet setup preferences and technical capabilities. Real-time coupon authorization, camera scanning, and redemption execution will be managed inside the authenticated partner portal once your outlet is verified.
        </div>
      </div>

      {/* ── Section A: Outlet Configuration ── */}
      <div className="section-subcard" style={{ marginTop: 0 }}>
        <h3 className="section-subcard__title">
          <QrCode size={18} /> Outlet Redemption Preferences
        </h3>
        <p className="section-subcard__desc">
          Set up staff credentials and primary redemption mechanics for your location.
        </p>

        <div className="form-grid">
          {/* Outlet Display Name */}
          <div className="col-6 form-field">
            <label className="field-label" htmlFor="outletDisplayName">
              <span>Outlet Display Name on Partner Portal <span className="required-star">*</span></span>
            </label>
            <input
              id="outletDisplayName"
              type="text"
              className={`form-input ${errors.outletDisplayName ? "has-error" : ""}`}
              placeholder="e.g., The Velvet Oak - Main Bar"
              value={data.outletDisplayName}
              onChange={(e) => onChange("outletDisplayName", e.target.value)}
            />
            {errors.outletDisplayName && (
              <span className="field-error-msg">{errors.outletDisplayName}</span>
            )}
          </div>

          {/* Redemption Method */}
          <div className="col-6 form-field">
            <label className="field-label" htmlFor="redemptionMethod">
              <span>Redemption Method <span className="required-star">*</span></span>
            </label>
            <select
              id="redemptionMethod"
              className={`form-select ${errors.redemptionMethod ? "has-error" : ""}`}
              value={data.redemptionMethod}
              onChange={(e) => onChange("redemptionMethod", e.target.value)}
            >
              {REDEMPTION_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            {errors.redemptionMethod && (
              <span className="field-error-msg">{errors.redemptionMethod}</span>
            )}
          </div>

          {/* Number of Staff Members Requiring Access */}
          <div className="col-4 form-field">
            <label className="field-label" htmlFor="staffAccessCount">
              <span>Staff Accounts Needed <span className="required-star">*</span></span>
            </label>
            <input
              id="staffAccessCount"
              type="number"
              min={1}
              max={50}
              className={`form-input ${errors.staffAccessCount ? "has-error" : ""}`}
              value={data.staffAccessCount}
              onChange={(e) =>
                onChange("staffAccessCount", Math.max(1, parseInt(e.target.value) || 1))
              }
            />
            {errors.staffAccessCount && (
              <span className="field-error-msg">{errors.staffAccessCount}</span>
            )}
          </div>

          {/* Designated Outlet Manager */}
          <div className="col-4 form-field">
            <label className="field-label" htmlFor="designatedOutletManager">
              <span>Designated Outlet Manager</span>
            </label>
            <input
              id="designatedOutletManager"
              type="text"
              className="form-input"
              placeholder="Manager Name"
              value={data.designatedOutletManager}
              onChange={(e) => onChange("designatedOutletManager", e.target.value)}
            />
          </div>

          {/* Staff Training Completed */}
          <div className="col-4 form-field">
            <label className="field-label" htmlFor="staffTrainingStatus">
              <span>Staff Training Status</span>
            </label>
            <select
              id="staffTrainingStatus"
              className="form-select"
              value={data.staffTrainingStatus}
              onChange={(e) => onChange("staffTrainingStatus", e.target.value)}
            >
              <option value="Pending">Pending (Schedule on Onboarding)</option>
              <option value="Completed">Completed Prior Orientation</option>
              <option value="Virtual Request">Request Virtual Video Training</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Section B: Hardware & Technical Readiness ── */}
      <div className="section-subcard">
        <h3 className="section-subcard__title">
          <Smartphone size={18} /> Hardware & Internet Readiness
        </h3>
        <p className="section-subcard__desc">
          Ensure your bar staff have compatible hardware to verify QR coupons quickly during rush hours.
        </p>

        <div className="form-grid">
          <div className="col-4 form-field">
            <label className="custom-checkbox-row is-checked">
              <input
                type="checkbox"
                className="custom-checkbox-input"
                checked={data.hasSmartphoneTablet}
                onChange={(e) => onChange("hasSmartphoneTablet", e.target.checked)}
              />
              <div className="checkbox-text-content">
                <span className="checkbox-title">Smartphone / Tablet with Camera</span>
                <span className="checkbox-desc">Available behind bar for camera scanning</span>
              </div>
            </label>
          </div>

          <div className="col-4 form-field">
            <label className="custom-checkbox-row is-checked">
              <input
                type="checkbox"
                className="custom-checkbox-input"
                checked={data.hasReliableInternet}
                onChange={(e) => onChange("hasReliableInternet", e.target.checked)}
              />
              <div className="checkbox-text-content">
                <span className="checkbox-title">Reliable Wi-Fi / Cellular Internet</span>
                <span className="checkbox-desc">Stable connection for atomic validation</span>
              </div>
            </label>
          </div>

          <div className="col-4 form-field">
            <label className="custom-checkbox-row is-checked">
              <input
                type="checkbox"
                className="custom-checkbox-input"
                checked={data.requiresOnboardingAssistance}
                onChange={(e) => onChange("requiresOnboardingAssistance", e.target.checked)}
              />
              <div className="checkbox-text-content">
                <span className="checkbox-title">Request In-Person Setup Support</span>
                <span className="checkbox-desc">SAGO rep visits for team training</span>
              </div>
            </label>
          </div>

          <div className="col-6 form-field">
            <label className="field-label" htmlFor="preferredRedemptionDevice">
              <span>Primary Device for Redemption</span>
            </label>
            <select
              id="preferredRedemptionDevice"
              className="form-select"
              value={data.preferredRedemptionDevice}
              onChange={(e) => onChange("preferredRedemptionDevice", e.target.value)}
            >
              <option value="Smartphone / Tablet">Smartphone / Tablet (Recommended)</option>
              <option value="POS Integrated Terminal">POS Integrated Terminal / Computer</option>
              <option value="Manager Handset">Manager Mobile Handset</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Section C: Redemption Operating Rules Acknowledgement ── */}
      <div className="section-subcard">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.5rem",
          }}
        >
          <h3 className="section-subcard__title" style={{ margin: 0 }}>
            <CheckSquare size={18} /> Redemption Protocol Rules & Anti-Fraud Acknowledgement
          </h3>
          <button
            type="button"
            onClick={handleAcknowledgeAll}
            className="btn-secondary"
            style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}
          >
            Acknowledge All Rules
          </button>
        </div>
        <p className="section-subcard__desc">
          All eight operational rules must be formally acknowledged by the applicant prior to partner activation.
        </p>

        {errors.acknowledgedRedemptionRules && (
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
            {errors.acknowledgedRedemptionRules}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          {REDEMPTION_RULES.map((rule, idx) => {
            const isChecked = Boolean(acknowledged[idx]);
            return (
              <label
                key={idx}
                className={`custom-checkbox-row ${isChecked ? "is-checked" : ""}`}
                style={{ padding: "0.65rem 0.9rem" }}
              >
                <input
                  type="checkbox"
                  className="custom-checkbox-input"
                  checked={isChecked}
                  onChange={() => handleToggleRule(idx)}
                />
                <span
                  style={{
                    fontSize: "0.82rem",
                    color: isChecked ? "#f5f1e8" : "rgba(245, 241, 232, 0.7)",
                    lineHeight: 1.45,
                  }}
                >
                  <strong style={{ color: "#b08d57", marginRight: "0.4rem" }}>
                    Rule {idx + 1}:
                  </strong>
                  {rule}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
