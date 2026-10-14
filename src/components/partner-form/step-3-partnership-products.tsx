"use client";

import React from "react";
import { Wine, Tag, Calendar, Check, Sparkles } from "lucide-react";
import { PartnerFormData } from "@/lib/partner-types";
import { PARTNERSHIP_TYPES } from "@/lib/kenya-data";

interface Step3Props {
  data: PartnerFormData;
  errors: Record<string, string>;
  onChange: <K extends keyof PartnerFormData>(field: K, value: PartnerFormData[K]) => void;
}

export default function Step3PartnershipProducts({ data, errors, onChange }: Step3Props) {
  const handleProductToggle = (id: string) => {
    const products = (data.products || []).map((p) => {
      if (p.id === id) {
        return { ...p, selected: !p.selected };
      }
      return p;
    });
    onChange("products", products);
  };

  return (
    <div className="step-content">
      <div className="step-header">
        <span className="step-header__eyebrow">Step 3 of 5</span>
        <h2 className="step-header__title">Partnership Model & SAGO Products</h2>
        <p className="step-header__desc">
          Select how you want to partner with SAGO and which whiskies or serves you would like to feature in your venue.
        </p>
      </div>

      {/* ── Section A: Partnership Model ── */}
      <div className="section-subcard" style={{ marginTop: 0 }}>
        <h3 className="section-subcard__title">
          <Tag size={18} /> Partnership Scope
        </h3>
        <p className="section-subcard__desc">
          Choose the partnership structure that best suits your venue.
        </p>

        <div className="form-grid">
          <div className="col-6 form-field">
            <label className="field-label" htmlFor="partnershipType">
              <span>Partnership Model <span className="required-star">*</span></span>
            </label>
            <select
              id="partnershipType"
              className={`form-select ${errors.partnershipType ? "has-error" : ""}`}
              value={data.partnershipType}
              onChange={(e) => onChange("partnershipType", e.target.value)}
            >
              {PARTNERSHIP_TYPES.map((pt) => (
                <option key={pt} value={pt}>
                  {pt}
                </option>
              ))}
            </select>
            {errors.partnershipType && (
              <span className="field-error-msg">{errors.partnershipType}</span>
            )}
          </div>

          <div className="col-6 form-field">
            <label className="field-label" htmlFor="agreementDuration">
              <span>Preferred Agreement Duration</span>
            </label>
            <select
              id="agreementDuration"
              className="form-select"
              value={data.agreementDuration || "12 Months (Annual Partner)"}
              onChange={(e) => onChange("agreementDuration", e.target.value)}
            >
              <option value="6 Months (Trial Partner)">6 Months (Trial Partner)</option>
              <option value="12 Months (Annual Partner)">12 Months (Annual Partner - Recommended)</option>
              <option value="24 Months (Strategic Multi-Year)">24 Months (Strategic Multi-Year)</option>
            </select>
          </div>

          <div className="col-6 form-field">
            <label className="field-label" htmlFor="preferredStartDate">
              <span>Estimated Launch / Start Date <span style={{ color: "rgba(245,241,232,0.45)", fontWeight: 400 }}>(Optional)</span></span>
            </label>
            <input
              id="preferredStartDate"
              type="date"
              className="form-input"
              value={data.preferredStartDate || ""}
              onChange={(e) => onChange("preferredStartDate", e.target.value)}
            />
          </div>

          <div className="col-6 form-field">
            <label className="field-label">
              <span>Commercial & Pricing Terms</span>
            </label>
            <div
              style={{
                background: "rgba(176, 141, 87, 0.08)",
                border: "1px solid rgba(176, 141, 87, 0.25)",
                borderRadius: "8px",
                padding: "0.65rem 0.9rem",
                fontSize: "0.82rem",
                color: "#d4af37",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                minHeight: "44px",
              }}
            >
              <Sparkles size={16} color="#d4af37" style={{ flexShrink: 0 }} />
              <span>Product pricing will be discussed after onboarding</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section B: Featured SAGO Products ── */}
      <div className="section-subcard">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <h3 className="section-subcard__title">
              <Wine size={18} /> Participating SAGO Products
            </h3>
            <p className="section-subcard__desc">
              Select which SAGO Whisky expressions you will feature. Specific product pricing and volume terms will be discussed after onboarding.
            </p>
          </div>
        </div>

        {/* Notice Banner */}
        <div
          style={{
            background: "rgba(176, 141, 87, 0.06)",
            border: "1px solid rgba(176, 141, 87, 0.22)",
            borderRadius: "10px",
            padding: "0.85rem 1.15rem",
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.65rem",
            fontSize: "0.84rem",
            color: "rgba(245, 241, 232, 0.85)",
            lineHeight: 1.45,
          }}
        >
          <Sparkles size={18} color="#b08d57" style={{ flexShrink: 0 }} />
          <span>
            <strong>Note on Pricing:</strong> Product prices, wholesale supply rates, and campaign promotional margins will be discussed and tailored directly with your team after onboarding.
          </span>
        </div>

        {errors.products && (
          <div style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "1rem" }}>
            {errors.products}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
          {(data.products || []).map((prod) => {
            return (
              <div
                key={prod.id}
                onClick={() => handleProductToggle(prod.id)}
                style={{
                  background: prod.selected ? "rgba(176, 141, 87, 0.1)" : "rgba(255, 255, 255, 0.02)",
                  border: `1.5px solid ${prod.selected ? "#b08d57" : "rgba(255, 255, 255, 0.1)"}`,
                  borderRadius: "12px",
                  padding: "1.25rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "1.1rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                  <div>
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "#b08d57",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {prod.servingType} Format
                    </span>
                    <h4 style={{ margin: 0, fontSize: "1.05rem", color: "#f5f1e8", fontWeight: 600 }}>
                      {prod.productName}
                    </h4>
                  </div>
                  <div
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "6px",
                      border: `1.5px solid ${prod.selected ? "#b08d57" : "rgba(255, 255, 255, 0.3)"}`,
                      background: prod.selected ? "#b08d57" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#0b0b0b",
                      flexShrink: 0,
                    }}
                  >
                    {prod.selected && <Check size={14} strokeWidth={3} />}
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(0, 0, 0, 0.25)",
                    border: "1px dashed rgba(176, 141, 87, 0.3)",
                    borderRadius: "8px",
                    padding: "0.65rem 0.85rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Sparkles size={14} color="#d4af37" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: "0.78rem", color: "rgba(245, 241, 232, 0.78)", lineHeight: 1.4 }}>
                    Product price will be discussed after onboarding
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
