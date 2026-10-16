"use client";

import React from "react";
import { MapPin, Building, Signpost, Compass, Mailbox, Flag } from "lucide-react";
import { PartnerFormData } from "@/lib/partner-types";
import { KENYA_COUNTIES, AFRICAN_COUNTRIES } from "@/lib/kenya-data";

interface Step2Props {
  data: PartnerFormData;
  errors: Record<string, string>;
  onChange: <K extends keyof PartnerFormData>(field: K, value: PartnerFormData[K]) => void;
}

export default function Step2BusinessAddress({ data, errors, onChange }: Step2Props) {
  return (
    <div className="step-content">
      <div className="step-header">
        <span className="step-header__eyebrow">Section B · Questions 13 to 18</span>
        <h2 className="step-header__title">Business Address & Location</h2>
        <p className="step-header__desc">
          Physical location and postal details for your venue or commercial establishment.
        </p>
      </div>

      <div className="form-grid">
        {/* 13. In which country is your business located? */}
        <div className="col-6 form-field">
          <label className="field-label" htmlFor="country">
            <span>
              13. In which country is your business located? <span className="required-star">*</span>
            </span>
          </label>
          <div className="input-with-icon">
            <Flag size={16} className="input-icon" />
            <select
              id="country"
              className={`form-select ${errors.country ? "has-error" : ""}`}
              value={data.country || ""}
              onChange={(e) => {
                const newCountry = e.target.value;
                onChange("country", newCountry);
                if (newCountry !== "Kenya") {
                  onChange("county", "");
                }
              }}
            >
              <option value="">-- Select Country --</option>
              {AFRICAN_COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          {errors.country && <span className="field-error-msg">{errors.country}</span>}
        </div>

        {/* 14. In which county is your business located? */}
        <div className="col-6 form-field">
          <label className="field-label" htmlFor="county">
            <span>
              14. In which county is your business located? <span className="required-star">*</span>
            </span>
          </label>
          <div className="input-with-icon">
            <Compass size={16} className="input-icon" />
            {data.country === "Kenya" ? (
              <select
                id="county"
                className={`form-select ${errors.county ? "has-error" : ""}`}
                value={data.county || ""}
                onChange={(e) => onChange("county", e.target.value)}
              >
                <option value="">-- Select Kenyan County --</option>
                {KENYA_COUNTIES.map((county) => (
                  <option key={county} value={county}>
                    {county}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="county"
                type="text"
                className={`form-input ${errors.county ? "has-error" : ""}`}
                value={data.county || ""}
                onChange={(e) => onChange("county", e.target.value)}
              />
            )}
          </div>
          {errors.county && <span className="field-error-msg">{errors.county}</span>}
        </div>

        {/* 15. What is the town or city of your business? */}
        <div className="col-6 form-field">
          <label className="field-label" htmlFor="townCity">
            <span>
              15. What is the town or city of your business? <span className="required-star">*</span>
            </span>
          </label>
          <div className="input-with-icon">
            <Building size={16} className="input-icon" />
            <input
              id="townCity"
              type="text"
              className={`form-input ${errors.townCity ? "has-error" : ""}`}
              value={data.townCity || ""}
              onChange={(e) => onChange("townCity", e.target.value)}
            />
          </div>
          {errors.townCity && <span className="field-error-msg">{errors.townCity}</span>}
        </div>

        {/* 16. What is the estate or area where your business is located? */}
        <div className="col-6 form-field">
          <label className="field-label" htmlFor="estateArea">
            <span>
              16. What is the estate or area where your business is located? <span className="required-star">*</span>
            </span>
          </label>
          <div className="input-with-icon">
            <Signpost size={16} className="input-icon" />
            <input
              id="estateArea"
              type="text"
              className={`form-input ${errors.estateArea ? "has-error" : ""}`}
              value={data.estateArea || ""}
              onChange={(e) => onChange("estateArea", e.target.value)}
            />
          </div>
          {errors.estateArea && <span className="field-error-msg">{errors.estateArea}</span>}
        </div>

        {/* 17. What is the street name or building name of your business? */}
        <div className="col-6 form-field">
          <label className="field-label" htmlFor="streetBuilding">
            <span>
              17. What is the street name or building name of your business? <span className="required-star">*</span>
            </span>
          </label>
          <div className="input-with-icon">
            <MapPin size={16} className="input-icon" />
            <input
              id="streetBuilding"
              type="text"
              className={`form-input ${errors.streetBuilding ? "has-error" : ""}`}
              value={data.streetBuilding || ""}
              onChange={(e) => onChange("streetBuilding", e.target.value)}
            />
          </div>
          {errors.streetBuilding && (
            <span className="field-error-msg">{errors.streetBuilding}</span>
          )}
        </div>

        {/* 18. What is your business postal address? */}
        <div className="col-6 form-field">
          <label className="field-label" htmlFor="postalAddress">
            <span>
              18. What is your business postal address? <span className="required-star">*</span>
            </span>
          </label>
          <div className="input-with-icon">
            <Mailbox size={16} className="input-icon" />
            <input
              id="postalAddress"
              type="text"
              className={`form-input ${errors.postalAddress ? "has-error" : ""}`}
              value={data.postalAddress || ""}
              onChange={(e) => onChange("postalAddress", e.target.value)}
            />
          </div>
          {errors.postalAddress && (
            <span className="field-error-msg">{errors.postalAddress}</span>
          )}
        </div>
      </div>
    </div>
  );
}
