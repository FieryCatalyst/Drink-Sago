"use client";

import React from "react";
import { Building2, MapPin, Phone, Mail, Sparkles, Compass } from "lucide-react";
import { PartnerFormData } from "@/lib/partner-types";
import { KENYA_COUNTIES, AFRICAN_COUNTRIES, BUSINESS_TYPES } from "@/lib/kenya-data";

interface Step1Props {
  data: PartnerFormData;
  errors: Record<string, string>;
  onChange: <K extends keyof PartnerFormData>(field: K, value: PartnerFormData[K]) => void;
  onGoToStep?: (step: number) => void;
}

export default function Step1BusinessInfo({ data, errors, onChange, onGoToStep }: Step1Props) {
  return (
    <div className="step-content">
      {/* ── Form Transparency & Overview Banner ── */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(176, 141, 87, 0.12) 0%, rgba(23, 23, 23, 0.8) 100%)",
          border: "1px solid rgba(176, 141, 87, 0.3)",
          borderRadius: "14px",
          padding: "1.25rem 1.5rem",
          marginBottom: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Sparkles size={18} color="#b08d57" />
            <span style={{ fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#b08d57" }}>
              5-Step Fast Partner Application · Takes ~3 Minutes
            </span>
          </div>
          <span style={{ fontSize: "0.75rem", color: "rgba(245, 241, 232, 0.6)" }}>
            ⚡ No compulsory image/document uploads required
          </span>
        </div>

        <p style={{ margin: 0, fontSize: "0.88rem", color: "rgba(245, 241, 232, 0.82)", lineHeight: 1.5 }}>
          Feel free to navigate through all 5 steps anytime using the top stepper tabs or <strong>Next / Previous</strong> buttons to explore the form before filling.
        </p>

        {onGoToStep && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.25rem" }}>
            {[
              { num: 1, label: "1. Business" },
              { num: 2, label: "2. Contact" },
              { num: 3, label: "3. Products" },
              { num: 4, label: "4. Operations" },
              { num: 5, label: "5. Review" },
            ].map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => onGoToStep(s.num)}
                style={{
                  background: s.num === 1 ? "rgba(176, 141, 87, 0.25)" : "rgba(255, 255, 255, 0.05)",
                  border: `1px solid ${s.num === 1 ? "rgba(176, 141, 87, 0.5)" : "rgba(255, 255, 255, 0.1)"}`,
                  color: s.num === 1 ? "#d4af37" : "rgba(245, 241, 232, 0.75)",
                  borderRadius: "6px",
                  padding: "0.3rem 0.65rem",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="step-header">
        <span className="step-header__eyebrow">Step 1 of 5</span>
        <h2 className="step-header__title">Business Information & Location</h2>
        <p className="step-header__desc">
          Tell us about your venue, bar, hotel or restaurant establishment and where you operate.
        </p>
      </div>

      {/* ── Section A: Business Identity ── */}
      <div className="section-subcard" style={{ marginTop: 0 }}>
        <h3 className="section-subcard__title">
          <Building2 size={18} /> Official Business Identity
        </h3>
        <p className="section-subcard__desc">
          Basic business details for registration in the SAGO Partner Network.
        </p>

        <div className="form-grid">
          {/* Registered Business Name */}
          <div className="col-6 form-field">
            <label className="field-label" htmlFor="registeredBusinessName">
              <span>Registered Business / Legal Entity Name <span className="required-star">*</span></span>
            </label>
            <input
              id="registeredBusinessName"
              type="text"
              className={`form-input ${errors.registeredBusinessName ? "has-error" : ""}`}
              placeholder="e.g., Nairobi Beverage Holdings Ltd"
              value={data.registeredBusinessName}
              onChange={(e) => {
                const newValue = e.target.value;
                onChange("registeredBusinessName", newValue);
                if (!data.tradingName || data.tradingName === data.registeredBusinessName) {
                  onChange("tradingName", newValue);
                }
              }}
            />
            {errors.registeredBusinessName && (
              <span className="field-error-msg">{errors.registeredBusinessName}</span>
            )}
          </div>

          {/* Trading Name / Bar Name */}
          <div className="col-6 form-field">
            <label className="field-label" htmlFor="tradingName">
              <span>Trading Name / Bar & Venue Name <span className="required-star">*</span></span>
            </label>
            <input
              id="tradingName"
              type="text"
              className={`form-input ${errors.tradingName ? "has-error" : ""}`}
              placeholder="e.g., The Velvet Oak Lounge"
              value={data.tradingName}
              onChange={(e) => {
                const newValue = e.target.value;
                onChange("tradingName", newValue);
                if (!data.outletDisplayName || data.outletDisplayName === data.tradingName) {
                  onChange("outletDisplayName", newValue);
                }
              }}
            />
            {errors.tradingName && (
              <span className="field-error-msg">{errors.tradingName}</span>
            )}
          </div>

          {/* Business Type */}
          <div className="col-6 form-field">
            <label className="field-label" htmlFor="businessType">
              <span>Business / Venue Type <span className="required-star">*</span></span>
            </label>
            <select
              id="businessType"
              className={`form-select ${errors.businessType ? "has-error" : ""}`}
              value={data.businessType}
              onChange={(e) => onChange("businessType", e.target.value)}
            >
              <option value="">-- Select Venue Type --</option>
              {BUSINESS_TYPES.map((bt) => (
                <option key={bt} value={bt}>
                  {bt}
                </option>
              ))}
            </select>
            {errors.businessType && (
              <span className="field-error-msg">{errors.businessType}</span>
            )}
          </div>

          {/* Business Type Other (conditional) */}
          {data.businessType === "Other" && (
            <div className="col-6 form-field">
              <label className="field-label" htmlFor="businessTypeOther">
                <span>Please specify business type <span className="required-star">*</span></span>
              </label>
              <input
                id="businessTypeOther"
                type="text"
                className={`form-input ${errors.businessTypeOther ? "has-error" : ""}`}
                placeholder="e.g., Microbrewery, Wine Bar, etc."
                value={data.businessTypeOther}
                onChange={(e) => onChange("businessTypeOther", e.target.value)}
              />
              {errors.businessTypeOther && (
                <span className="field-error-msg">{errors.businessTypeOther}</span>
              )}
            </div>
          )}

          {/* Business Registration Number (Optional) */}
          <div className="col-6 form-field">
            <label className="field-label" htmlFor="businessRegistrationNumber">
              <span>Business Registration Number <span style={{ color: "rgba(245,241,232,0.45)", fontWeight: 400 }}>(Optional)</span></span>
            </label>
            <input
              id="businessRegistrationNumber"
              type="text"
              className="form-input"
              placeholder="e.g., CPR/2023/123456 (if available)"
              value={data.businessRegistrationNumber}
              onChange={(e) => onChange("businessRegistrationNumber", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Section B: Location & Address ── */}
      <div className="section-subcard">
        <h3 className="section-subcard__title">
          <MapPin size={18} /> Location & Address
        </h3>
        <p className="section-subcard__desc">
          Where is your primary establishment located?
        </p>

        <div className="form-grid">
          {/* Country */}
          <div className="col-4 form-field">
            <label className="field-label" htmlFor="country">
              <span>Country <span className="required-star">*</span></span>
            </label>
            <select
              id="country"
              className={`form-select ${errors.country ? "has-error" : ""}`}
              value={data.country}
              onChange={(e) => onChange("country", e.target.value)}
            >
              {AFRICAN_COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.country && <span className="field-error-msg">{errors.country}</span>}
          </div>

          {/* County / State / Region */}
          <div className="col-4 form-field">
            <label className="field-label" htmlFor="county">
              <span>County / State / Province <span className="required-star">*</span></span>
            </label>
            {data.country === "Kenya" ? (
              <select
                id="county"
                className={`form-select ${errors.county ? "has-error" : ""}`}
                value={data.county}
                onChange={(e) => onChange("county", e.target.value)}
              >
                <option value="">-- Select County --</option>
                {KENYA_COUNTIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="county"
                type="text"
                className={`form-input ${errors.county ? "has-error" : ""}`}
                placeholder="e.g., Lusaka Province, Gauteng"
                value={data.county}
                onChange={(e) => onChange("county", e.target.value)}
              />
            )}
            {errors.county && <span className="field-error-msg">{errors.county}</span>}
          </div>

          {/* Town / City */}
          <div className="col-4 form-field">
            <label className="field-label" htmlFor="townCity">
              <span>Town / City <span className="required-star">*</span></span>
            </label>
            <input
              id="townCity"
              type="text"
              className={`form-input ${errors.townCity ? "has-error" : ""}`}
              placeholder="e.g., Nairobi, Mombasa, Lusaka"
              value={data.townCity}
              onChange={(e) => onChange("townCity", e.target.value)}
            />
            {errors.townCity && <span className="field-error-msg">{errors.townCity}</span>}
          </div>

          {/* Street / Building Address */}
          <div className="col-12 form-field">
            <label className="field-label" htmlFor="streetBuilding">
              <span>Street Address / Building / Area <span style={{ color: "rgba(245,241,232,0.45)", fontWeight: 400 }}>(Optional)</span></span>
            </label>
            <input
              id="streetBuilding"
              type="text"
              className="form-input"
              placeholder="e.g., Westlands Square, Woodvale Grove, 2nd Floor"
              value={data.streetBuilding}
              onChange={(e) => onChange("streetBuilding", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Section C: Contact Coordinates ── */}
      <div className="section-subcard">
        <h3 className="section-subcard__title">
          <Phone size={18} /> Official Business Contacts
        </h3>
        <p className="section-subcard__desc">
          Official communication channels for partnership notifications and onboarding.
        </p>

        <div className="form-grid">
          {/* Business Phone */}
          <div className="col-6 form-field">
            <label className="field-label" htmlFor="businessPhone">
              <span>Official Phone Number / WhatsApp <span className="required-star">*</span></span>
            </label>
            <input
              id="businessPhone"
              type="tel"
              className={`form-input ${errors.businessPhone ? "has-error" : ""}`}
              placeholder="e.g., +254 712 345 678"
              value={data.businessPhone}
              onChange={(e) => {
                const newValue = e.target.value;
                onChange("businessPhone", newValue);
                if (!data.ownerPhone || data.ownerPhone === data.businessPhone) {
                  onChange("ownerPhone", newValue);
                }
              }}
            />
            {errors.businessPhone && (
              <span className="field-error-msg">{errors.businessPhone}</span>
            )}
          </div>

          {/* Business Email */}
          <div className="col-6 form-field">
            <label className="field-label" htmlFor="businessEmail">
              <span>Official Business Email <span className="required-star">*</span></span>
            </label>
            <input
              id="businessEmail"
              type="email"
              className={`form-input ${errors.businessEmail ? "has-error" : ""}`}
              placeholder="e.g., manager@velvetoak.co.ke"
              value={data.businessEmail}
              onChange={(e) => {
                const newValue = e.target.value;
                onChange("businessEmail", newValue);
                if (!data.ownerEmail || data.ownerEmail === data.businessEmail) {
                  onChange("ownerEmail", newValue);
                }
              }}
            />
            {errors.businessEmail && (
              <span className="field-error-msg">{errors.businessEmail}</span>
            )}
          </div>

          {/* Website / Social Link (Optional) */}
          <div className="col-6 form-field">
            <label className="field-label" htmlFor="businessWebsite">
              <span>Website or Social Media Link <span style={{ color: "rgba(245,241,232,0.45)", fontWeight: 400 }}>(Optional)</span></span>
            </label>
            <input
              id="businessWebsite"
              type="url"
              className="form-input"
              placeholder="e.g., https://instagram.com/velvetoak"
              value={data.businessWebsite}
              onChange={(e) => onChange("businessWebsite", e.target.value)}
            />
          </div>

          {/* Operating Outlets count */}
          <div className="col-6 form-field">
            <label className="field-label" htmlFor="numberOfOutlets">
              <span>Number of Outlets Joining <span style={{ color: "rgba(245,241,232,0.45)", fontWeight: 400 }}>(Optional, Default: 1)</span></span>
            </label>
            <input
              id="numberOfOutlets"
              type="number"
              min="1"
              max="50"
              className="form-input"
              value={data.numberOfOutlets || 1}
              onChange={(e) => onChange("numberOfOutlets", Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
