"use client";

import React from "react";
import { Clock, CalendarDays, Wine, ShieldCheck, Check, Sparkles } from "lucide-react";
import { PartnerFormData } from "@/lib/partner-types";

interface Step3Props {
  data: PartnerFormData;
  errors: Record<string, string>;
  onChange: <K extends keyof PartnerFormData>(field: K, value: PartnerFormData[K]) => void;
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const OUTLET_CATEGORIES = [
  {
    id: "Restaurant with Bar",
    title: "Restaurant with Bar",
    desc: "Dining venue with dedicated bar service, cocktails & spirit selection",
  },
  {
    id: "Liquor Store / Retail Outlet",
    title: "Liquor Store / Retail Outlet",
    desc: "Specialized spirits store, boutique bottle shop or licensed depot",
  },
  {
    id: "Supermarket",
    title: "Supermarket",
    desc: "Commercial supermarket or hypermarket with an authorized alcohol aisle",
  },
];

export default function Step3BusinessOperations({ data, errors, onChange }: Step3Props) {
  const selectedDays = data.operatingDays || [];

  const toggleDay = (day: string) => {
    let next: string[];
    if (selectedDays.includes(day)) {
      next = selectedDays.filter((d) => d !== day);
    } else {
      next = [...selectedDays, day];
    }
    onChange("operatingDays", next);
  };

  const selectAllDays = () => {
    onChange("operatingDays", [...DAYS_OF_WEEK]);
  };

  return (
    <div className="step-content">
      <div className="step-header">
        <span className="step-header__eyebrow">Section C · Questions 19 to 23</span>
        <h2 className="step-header__title">Business Operations</h2>
        <p className="step-header__desc">
          Operating schedule, outlet classification, and alcohol management details.
        </p>
      </div>

      <div className="form-grid">
        {/* 19. What are the opening hours of your business? */}
        <div className="col-12 form-field">
          <label className="field-label" htmlFor="openingHours">
            <span>
              19. What are the opening hours of your business? <span className="required-star">*</span>
            </span>
          </label>
          <div className="input-with-icon">
            <Clock size={16} className="input-icon" />
            <input
              id="openingHours"
              type="text"
              className={`form-input ${errors.openingHours ? "has-error" : ""}`}
              value={data.openingHours || ""}
              onChange={(e) => onChange("openingHours", e.target.value)}
            />
          </div>
          {errors.openingHours && (
            <span className="field-error-msg">{errors.openingHours}</span>
          )}
        </div>

        {/* 20. On which days of the week does your business operate? */}
        <div className="col-12 form-field">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <label className="field-label" style={{ marginBottom: 0 }}>
              <span>
                20. On which days of the week does your business operate? <span className="required-star">*</span>
              </span>
            </label>
            <button
              type="button"
              onClick={selectAllDays}
              style={{
                background: "transparent",
                border: "none",
                color: "#b08d57",
                fontSize: "0.75rem",
                cursor: "pointer",
                textDecoration: "underline",
                letterSpacing: "0.05em",
              }}
            >
              Select All 7 Days
            </button>
          </div>

          <div className="operating-days-grid" style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = selectedDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  className={`partner-option-pill ${isSelected ? "is-selected" : ""}`}
                  onClick={() => toggleDay(day)}
                  style={{ minWidth: "105px", justifyContent: "center" }}
                >
                  {isSelected ? <Check size={14} color="#b08d57" /> : <span className="partner-option-pill__dot" />}
                  <span>{day}</span>
                </button>
              );
            })}
          </div>
          {errors.operatingDays && (
            <span className="field-error-msg">{errors.operatingDays}</span>
          )}
        </div>

        {/* 21. Which category best describes your outlet? */}
        <div className="col-12 form-field">
          <label className="field-label">
            <span>
              21. Which category best describes your outlet? <span className="required-star">*</span>
            </span>
          </label>
          <div className="outlet-category-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "0.85rem" }}>
            {OUTLET_CATEGORIES.map((cat) => {
              const isSelected = data.outletCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onChange("outletCategory", cat.id)}
                  className={`partner-card-select ${isSelected ? "is-selected" : ""}`}
                  style={{
                    background: isSelected ? "rgba(176, 141, 87, 0.12)" : "rgba(18, 18, 18, 0.6)",
                    border: `1.5px solid ${isSelected ? "#b08d57" : "rgba(245, 241, 232, 0.12)"}`,
                    borderRadius: "10px",
                    padding: "1.1rem 1.2rem",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                    <span style={{ fontFamily: "var(--font-heading), Georgia, serif", fontSize: "1.05rem", color: isSelected ? "#b08d57" : "#f5f1e8", fontWeight: 500 }}>
                      {cat.title}
                    </span>
                    <span
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        border: `1.5px solid ${isSelected ? "#b08d57" : "rgba(245, 241, 232, 0.3)"}`,
                        display: "grid",
                        placeItems: "center",
                        background: isSelected ? "#b08d57" : "transparent",
                      }}
                    >
                      {isSelected && <Check size={11} color="#0b0b0b" strokeWidth={3} />}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "rgba(245, 241, 232, 0.65)", lineHeight: 1.45 }}>
                    {cat.desc}
                  </p>
                </button>
              );
            })}
          </div>
          {errors.outletCategory && (
            <span className="field-error-msg">{errors.outletCategory}</span>
          )}
        </div>

        {/* 22. Does your business currently sell alcoholic beverages? */}
        <div className="col-6 form-field">
          <label className="field-label">
            <span>
              22. Does your business currently sell alcoholic beverages? <span className="required-star">*</span>
            </span>
          </label>
          <div style={{ display: "flex", gap: "0.85rem" }}>
            {[
              { label: "Yes", val: true },
              { label: "No", val: false },
            ].map((opt) => {
              const isSelected = data.sellsAlcohol === opt.val;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => onChange("sellsAlcohol", opt.val)}
                  className={`partner-option-pill ${isSelected ? "is-selected" : ""}`}
                  style={{ flex: 1, justifyContent: "center", padding: "0.75rem 1rem" }}
                >
                  <span className="partner-option-pill__dot" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
          {errors.sellsAlcohol && (
            <span className="field-error-msg">{errors.sellsAlcohol}</span>
          )}
        </div>

        {/* 23. Does your business have a designated bar manager? */}
        <div className="col-6 form-field">
          <label className="field-label">
            <span>
              23. Does your business have a designated bar manager? <span className="required-star">*</span>
            </span>
          </label>
          <div style={{ display: "flex", gap: "0.85rem" }}>
            {[
              { label: "Yes", val: true },
              { label: "No", val: false },
            ].map((opt) => {
              const isSelected = data.hasBarManager === opt.val;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => onChange("hasBarManager", opt.val)}
                  className={`partner-option-pill ${isSelected ? "is-selected" : ""}`}
                  style={{ flex: 1, justifyContent: "center", padding: "0.75rem 1rem" }}
                >
                  <span className="partner-option-pill__dot" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
          {errors.hasBarManager && (
            <span className="field-error-msg">{errors.hasBarManager}</span>
          )}
        </div>
      </div>
    </div>
  );
}
