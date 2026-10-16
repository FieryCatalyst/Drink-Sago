"use client";

import React from "react";
import { Building2, Globe, Phone, Mail, Calendar, Hash, Store, TrendingUp, User } from "lucide-react";
import { PartnerFormData } from "@/lib/partner-types";

interface Step1Props {
  data: PartnerFormData;
  errors: Record<string, string>;
  onChange: <K extends keyof PartnerFormData>(field: K, value: PartnerFormData[K]) => void;
}

const BUSINESS_TYPE_OPTIONS = [
  "Bar / Pub",
  "Hotel / Resort",
  "Nightclub / Lounge",
  "Other",
];

export default function Step1BusinessInfo({ data, errors, onChange }: Step1Props) {
  return (
    <div className="step-content">
      <div className="step-header">
        <span className="step-header__eyebrow">Section A · Questions 1 to 12</span>
        <h2 className="step-header__title">Basic Business Details</h2>
        <p className="step-header__desc">
          Official identity and management contacts for your business establishment.
        </p>
      </div>

      <div className="form-grid">
        {/* 1. What is your registered business name? */}
        <div className="col-6 form-field">
          <label className="field-label" htmlFor="registeredBusinessName">
            <span>
              1. What is your registered business name? <span className="required-star">*</span>
            </span>
          </label>
          <div className="input-with-icon">
            <Building2 size={16} className="input-icon" />
            <input
              id="registeredBusinessName"
              type="text"
              className={`form-input ${errors.registeredBusinessName ? "has-error" : ""}`}
              value={data.registeredBusinessName || ""}
              onChange={(e) => {
                const val = e.target.value;
                onChange("registeredBusinessName", val);
                if (!data.tradingName) {
                  onChange("tradingName", val);
                }
              }}
            />
          </div>
          {errors.registeredBusinessName && (
            <span className="field-error-msg">{errors.registeredBusinessName}</span>
          )}
        </div>

        {/* 2. What is your business registration number? */}
        <div className="col-6 form-field">
          <label className="field-label" htmlFor="businessRegistrationNumber">
            <span>
              2. What is your business registration number? <span className="required-star">*</span>
            </span>
          </label>
          <div className="input-with-icon">
            <Hash size={16} className="input-icon" />
            <input
              id="businessRegistrationNumber"
              type="text"
              className={`form-input ${errors.businessRegistrationNumber ? "has-error" : ""}`}
              value={data.businessRegistrationNumber || ""}
              onChange={(e) => onChange("businessRegistrationNumber", e.target.value)}
            />
          </div>
          {errors.businessRegistrationNumber && (
            <span className="field-error-msg">{errors.businessRegistrationNumber}</span>
          )}
        </div>

        {/* 3. What is your business website URL? */}
        <div className="col-6 form-field">
          <label className="field-label" htmlFor="businessWebsite">
            <span>
              3. What is your business website URL? <span className="field-optional">(Optional)</span>
            </span>
          </label>
          <div className="input-with-icon">
            <Globe size={16} className="input-icon" />
            <input
              id="businessWebsite"
              type="url"
              className={`form-input ${errors.businessWebsite ? "has-error" : ""}`}
              value={data.businessWebsite || ""}
              onChange={(e) => onChange("businessWebsite", e.target.value)}
            />
          </div>
          {errors.businessWebsite && (
            <span className="field-error-msg">{errors.businessWebsite}</span>
          )}
        </div>

        {/* 4. What is your official business phone number? */}
        <div className="col-6 form-field">
          <label className="field-label" htmlFor="businessPhone">
            <span>
              4. What is your official business phone number? <span className="required-star">*</span>
            </span>
          </label>
          <div className="input-with-icon">
            <Phone size={16} className="input-icon" />
            <input
              id="businessPhone"
              type="tel"
              className={`form-input ${errors.businessPhone ? "has-error" : ""}`}
              value={data.businessPhone || ""}
              onChange={(e) => onChange("businessPhone", e.target.value)}
            />
          </div>
          {errors.businessPhone && (
            <span className="field-error-msg">{errors.businessPhone}</span>
          )}
        </div>

        {/* 5. What is the full name of the business manager? */}
        <div className="col-6 form-field">
          <label className="field-label" htmlFor="managerFullName">
            <span>
              5. What is the full name of the business manager? <span className="required-star">*</span>
            </span>
          </label>
          <div className="input-with-icon">
            <User size={16} className="input-icon" />
            <input
              id="managerFullName"
              type="text"
              className={`form-input ${errors.managerFullName ? "has-error" : ""}`}
              value={data.managerFullName || data.ownerFullName || ""}
              onChange={(e) => {
                onChange("managerFullName", e.target.value);
                onChange("ownerFullName", e.target.value);
              }}
            />
          </div>
          {errors.managerFullName && (
            <span className="field-error-msg">{errors.managerFullName}</span>
          )}
        </div>

        {/* 6. What is the phone number of the business manager? */}
        <div className="col-6 form-field">
          <label className="field-label" htmlFor="managerPhone">
            <span>
              6. What is the phone number of the business manager? <span className="required-star">*</span>
            </span>
          </label>
          <div className="input-with-icon">
            <Phone size={16} className="input-icon" />
            <input
              id="managerPhone"
              type="tel"
              className={`form-input ${errors.managerPhone ? "has-error" : ""}`}
              value={data.managerPhone || data.ownerPhone || ""}
              onChange={(e) => {
                onChange("managerPhone", e.target.value);
                onChange("ownerPhone", e.target.value);
              }}
            />
          </div>
          {errors.managerPhone && (
            <span className="field-error-msg">{errors.managerPhone}</span>
          )}
        </div>

        {/* 7. What is your business type? */}
        <div className="col-12 form-field">
          <label className="field-label">
            <span>
              7. What is your business type? <span className="required-star">*</span>
            </span>
          </label>
          <div className="partner-options-grid">
            {BUSINESS_TYPE_OPTIONS.map((type) => {
              const isSelected = data.businessType === type;
              return (
                <button
                  key={type}
                  type="button"
                  className={`partner-option-pill ${isSelected ? "is-selected" : ""}`}
                  onClick={() => onChange("businessType", type)}
                >
                  <span className="partner-option-pill__dot" />
                  <span>{type === "Other" ? "Other (please specify)" : type}</span>
                </button>
              );
            })}
          </div>

          {data.businessType === "Other" && (
            <div style={{ marginTop: "0.85rem" }}>
              <input
                type="text"
                className={`form-input ${errors.businessTypeOther ? "has-error" : ""}`}
                value={data.businessTypeOther || ""}
                onChange={(e) => onChange("businessTypeOther", e.target.value)}
              />
              {errors.businessTypeOther && (
                <span className="field-error-msg">{errors.businessTypeOther}</span>
              )}
            </div>
          )}

          {errors.businessType && (
            <span className="field-error-msg">{errors.businessType}</span>
          )}
        </div>

        {/* 8. What is your trading name or bar name? */}
        <div className="col-6 form-field">
          <label className="field-label" htmlFor="tradingName">
            <span>
              8. What is your trading name or bar name? <span className="required-star">*</span>
            </span>
          </label>
          <div className="input-with-icon">
            <Store size={16} className="input-icon" />
            <input
              id="tradingName"
              type="text"
              className={`form-input ${errors.tradingName ? "has-error" : ""}`}
              value={data.tradingName || ""}
              onChange={(e) => onChange("tradingName", e.target.value)}
            />
          </div>
          {errors.tradingName && (
            <span className="field-error-msg">{errors.tradingName}</span>
          )}
        </div>

        {/* 9. When was your business established? */}
        <div className="col-6 form-field">
          <label className="field-label" htmlFor="dateOfEstablishment">
            <span>
              9. When was your business established? <span className="required-star">*</span>
            </span>
          </label>
          <div className="input-with-icon">
            <Calendar size={16} className="input-icon" />
            <input
              id="dateOfEstablishment"
              type="date"
              className={`form-input ${errors.dateOfEstablishment ? "has-error" : ""}`}
              value={data.dateOfEstablishment || ""}
              onChange={(e) => onChange("dateOfEstablishment", e.target.value)}
            />
          </div>
          {errors.dateOfEstablishment && (
            <span className="field-error-msg">{errors.dateOfEstablishment}</span>
          )}
        </div>

        {/* 10. What is your business email address? */}
        <div className="col-6 form-field">
          <label className="field-label" htmlFor="businessEmail">
            <span>
              10. What is your business email address? <span className="required-star">*</span>
            </span>
          </label>
          <div className="input-with-icon">
            <Mail size={16} className="input-icon" />
            <input
              id="businessEmail"
              type="email"
              className={`form-input ${errors.businessEmail ? "has-error" : ""}`}
              value={data.businessEmail || ""}
              onChange={(e) => onChange("businessEmail", e.target.value)}
            />
          </div>
          {errors.businessEmail && (
            <span className="field-error-msg">{errors.businessEmail}</span>
          )}
        </div>

        {/* 11. How many outlets does your business operate? */}
        <div className="col-6 form-field">
          <label className="field-label" htmlFor="numberOfOutlets">
            <span>
              11. How many outlets does your business operate? <span className="required-star">*</span>
            </span>
          </label>
          <div className="input-with-icon">
            <Hash size={16} className="input-icon" />
            <input
              id="numberOfOutlets"
              type="number"
              min={1}
              className={`form-input ${errors.numberOfOutlets ? "has-error" : ""}`}
              value={data.numberOfOutlets ?? 1}
              onChange={(e) => onChange("numberOfOutlets", Math.max(1, parseInt(e.target.value, 10) || 1))}
            />
          </div>
          {errors.numberOfOutlets && (
            <span className="field-error-msg">{errors.numberOfOutlets}</span>
          )}
        </div>

        {/* 12. What is the average monthly sales volume of your business? (Optional) */}
        <div className="col-12 form-field">
          <label className="field-label" htmlFor="monthlySalesVolume">
            <span>
              12. What is the average monthly sales volume of your business? <span className="field-optional">(Optional)</span>
            </span>
          </label>
          <div className="input-with-icon">
            <TrendingUp size={16} className="input-icon" />
            <input
              id="monthlySalesVolume"
              type="text"
              className="form-input"
              value={data.monthlySalesVolume || ""}
              onChange={(e) => onChange("monthlySalesVolume", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
