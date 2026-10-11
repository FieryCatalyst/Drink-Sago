"use client";

import React from "react";
import { Plus, Trash2, MapPin, Building2, Store } from "lucide-react";
import { PartnerFormData, AdditionalOutlet } from "@/lib/partner-types";
import { KENYA_COUNTIES, AFRICAN_COUNTRIES, COUNTRY_CURRENCY_MAP, BUSINESS_TYPES } from "@/lib/kenya-data";

interface Step1Props {
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

export default function Step1BusinessInfo({ data, errors, onChange }: Step1Props) {
  const handleOutletChange = (index: number, field: keyof AdditionalOutlet, value: string) => {
    const updated = [...(data.additionalOutlets || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange("additionalOutlets", updated);
  };

  const handleAddOutlet = () => {
    const newOutlet: AdditionalOutlet = {
      id: crypto.randomUUID(),
      outletDisplayName: "",
      county: data.county || "Nairobi",
      townCity: "",
      streetAddress: "",
      managerName: "",
      managerPhone: "",
      operatingHours: data.openingHours || "10:00 AM - 11:00 PM",
      redemptionMethod: "Both Methods",
    };
    onChange("additionalOutlets", [...(data.additionalOutlets || []), newOutlet]);
  };

  const handleRemoveOutlet = (index: number) => {
    const updated = [...(data.additionalOutlets || [])];
    updated.splice(index, 1);
    onChange("additionalOutlets", updated);
  };

  const toggleDay = (day: string) => {
    const currentDays = data.operatingDays || [];
    if (currentDays.includes(day)) {
      onChange(
        "operatingDays",
        currentDays.filter((d) => d !== day)
      );
    } else {
      onChange("operatingDays", [...currentDays, day]);
    }
  };

  return (
    <div className="step-content">
      <div className="step-header">
        <span className="step-header__eyebrow">Step 1 of 10</span>
        <h2 className="step-header__title">Business Information & Location</h2>
        <p className="step-header__desc">
          Provide your official business identity, licensing registration, primary address in {data.country || "your country"}, and operational scale.
        </p>
      </div>

      {/* ── Section A: Basic Business Details ── */}
      <div className="section-subcard" style={{ marginTop: 0 }}>
        <h3 className="section-subcard__title">
          <Building2 size={18} /> Official Business Identity
        </h3>
        <p className="section-subcard__desc">
          Enter the registered company or trading name as registered with the Business Registration Service (BRS).
        </p>

        <div className="form-grid">
          {/* Registered Business Name */}
          <div className="col-6 form-field">
            <label className="field-label" htmlFor="registeredBusinessName">
              <span>Registered Business Name <span className="required-star">*</span></span>
            </label>
            <input
              id="registeredBusinessName"
              type="text"
              className={`form-input ${errors.registeredBusinessName ? "has-error" : ""}`}
              placeholder="e.g., Nairobi Beverage Holdings Ltd"
              value={data.registeredBusinessName}
              onChange={(e) => onChange("registeredBusinessName", e.target.value)}
            />
            {errors.registeredBusinessName && (
              <span className="field-error-msg">{errors.registeredBusinessName}</span>
            )}
          </div>

          {/* Trading Name / Bar Name */}
          <div className="col-6 form-field">
            <label className="field-label" htmlFor="tradingName">
              <span>Trading Name / Bar & Outlet Name <span className="required-star">*</span></span>
            </label>
            <input
              id="tradingName"
              type="text"
              className={`form-input ${errors.tradingName ? "has-error" : ""}`}
              placeholder="e.g., The Velvet Oak Lounge"
              value={data.tradingName}
              onChange={(e) => onChange("tradingName", e.target.value)}
            />
            {errors.tradingName && (
              <span className="field-error-msg">{errors.tradingName}</span>
            )}
          </div>

          {/* Business Type */}
          <div className="col-6 form-field">
            <label className="field-label" htmlFor="businessType">
              <span>Business Category <span className="required-star">*</span></span>
            </label>
            <select
              id="businessType"
              className={`form-select ${errors.businessType ? "has-error" : ""}`}
              value={data.businessType}
              onChange={(e) => onChange("businessType", e.target.value)}
            >
              <option value="">Select Business Type</option>
              {BUSINESS_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.businessType && (
              <span className="field-error-msg">{errors.businessType}</span>
            )}
          </div>

          {/* Business Type Other (Conditional) */}
          {data.businessType === "Other" && (
            <div className="col-6 form-field">
              <label className="field-label" htmlFor="businessTypeOther">
                <span>Specify Business Category <span className="required-star">*</span></span>
              </label>
              <input
                id="businessTypeOther"
                type="text"
                className={`form-input ${errors.businessTypeOther ? "has-error" : ""}`}
                placeholder="Specify your business format"
                value={data.businessTypeOther}
                onChange={(e) => onChange("businessTypeOther", e.target.value)}
              />
              {errors.businessTypeOther && (
                <span className="field-error-msg">{errors.businessTypeOther}</span>
              )}
            </div>
          )}

          {/* Registration Number */}
          <div className={data.businessType === "Other" ? "col-6 form-field" : "col-6 form-field"}>
            <label className="field-label" htmlFor="businessRegistrationNumber">
              <span>BRS Registration / Reg No <span className="required-star">*</span></span>
            </label>
            <input
              id="businessRegistrationNumber"
              type="text"
              className={`form-input ${errors.businessRegistrationNumber ? "has-error" : ""}`}
              placeholder="e.g., CPR/2021/12345 or BN-12345"
              value={data.businessRegistrationNumber}
              onChange={(e) => onChange("businessRegistrationNumber", e.target.value)}
            />
            {errors.businessRegistrationNumber && (
              <span className="field-error-msg">{errors.businessRegistrationNumber}</span>
            )}
          </div>

          {/* Date of Establishment */}
          <div className="col-4 form-field">
            <label className="field-label" htmlFor="dateOfEstablishment">
              <span>Date of Establishment</span>
            </label>
            <input
              id="dateOfEstablishment"
              type="date"
              className="form-input"
              value={data.dateOfEstablishment}
              onChange={(e) => onChange("dateOfEstablishment", e.target.value)}
            />
          </div>

          {/* Business Email */}
          <div className="col-4 form-field">
            <label className="field-label" htmlFor="businessEmail">
              <span>Official Business Email <span className="required-star">*</span></span>
            </label>
            <input
              id="businessEmail"
              type="email"
              className={`form-input ${errors.businessEmail ? "has-error" : ""}`}
              placeholder="info@yourbar.co.ke"
              value={data.businessEmail}
              onChange={(e) => onChange("businessEmail", e.target.value)}
            />
            {errors.businessEmail && (
              <span className="field-error-msg">{errors.businessEmail}</span>
            )}
          </div>

          {/* Business Phone */}
          <div className="col-4 form-field">
            <label className="field-label" htmlFor="businessPhone">
              <span>Business Phone Number <span className="required-star">*</span></span>
            </label>
            <input
              id="businessPhone"
              type="tel"
              className={`form-input ${errors.businessPhone ? "has-error" : ""}`}
              placeholder="+254 712 345 678"
              value={data.businessPhone}
              onChange={(e) => onChange("businessPhone", e.target.value)}
            />
            {errors.businessPhone && (
              <span className="field-error-msg">{errors.businessPhone}</span>
            )}
          </div>

          {/* Business Website */}
          <div className="col-12 form-field">
            <label className="field-label" htmlFor="businessWebsite">
              <span>Website URL <span className="field-hint-inline">(Optional)</span></span>
            </label>
            <input
              id="businessWebsite"
              type="url"
              className={`form-input ${errors.businessWebsite ? "has-error" : ""}`}
              placeholder="https://www.yourbar.co.ke"
              value={data.businessWebsite}
              onChange={(e) => onChange("businessWebsite", e.target.value)}
            />
            {errors.businessWebsite && (
              <span className="field-error-msg">{errors.businessWebsite}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Section B: Business Address & Location ── */}
      <div className="section-subcard">
        <h3 className="section-subcard__title">
          <MapPin size={18} /> Physical Premises & Regional Location
        </h3>
        <p className="section-subcard__desc">
          Official physical location of your primary establishment within Africa.
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
              onChange={(e) => {
                const newCountry = e.target.value;
                onChange("country", newCountry);
                // Also update owner nationality default if not customized
                if (newCountry) {
                  onChange("ownerNationality", newCountry);
                }
                // Also update currency if mapped
                const mappedCurrency = COUNTRY_CURRENCY_MAP[newCountry];
                if (mappedCurrency) {
                  onChange("settlementCurrency", mappedCurrency);
                  const updatedProducts = (data.products || []).map((p) => ({
                    ...p,
                    currency: mappedCurrency,
                  }));
                  onChange("products", updatedProducts);
                }
              }}
            >
              <option value="">Select African Country</option>
              {AFRICAN_COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.country && <span className="field-error-msg">{errors.country}</span>}
          </div>

          {/* County / State / Province */}
          <div className="col-4 form-field">
            <label className="field-label" htmlFor="county">
              <span>
                {data.country === "Kenya" ? "County" : "State / Province / Region"}{" "}
                <span className="required-star">*</span>
              </span>
            </label>
            {data.country === "Kenya" ? (
              <select
                id="county"
                className={`form-select ${errors.county ? "has-error" : ""}`}
                value={data.county}
                onChange={(e) => onChange("county", e.target.value)}
              >
                <option value="">Select Kenyan County</option>
                {KENYA_COUNTIES.map((c) => (
                  <option key={c} value={c}>
                    {c} County
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="county"
                type="text"
                className={`form-input ${errors.county ? "has-error" : ""}`}
                placeholder="e.g., Gauteng, Lusaka Province, Lagos State"
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
              placeholder="e.g., Nairobi, Westlands"
              value={data.townCity}
              onChange={(e) => onChange("townCity", e.target.value)}
            />
            {errors.townCity && <span className="field-error-msg">{errors.townCity}</span>}
          </div>

          {/* Estate / Area */}
          <div className="col-4 form-field">
            <label className="field-label" htmlFor="estateArea">
              <span>Estate / Sub-county</span>
            </label>
            <input
              id="estateArea"
              type="text"
              className="form-input"
              placeholder="e.g., Kilimani, Parklands"
              value={data.estateArea}
              onChange={(e) => onChange("estateArea", e.target.value)}
            />
          </div>

          {/* Street / Building */}
          <div className="col-4 form-field">
            <label className="field-label" htmlFor="streetBuilding">
              <span>Street & Building Name <span className="required-star">*</span></span>
            </label>
            <input
              id="streetBuilding"
              type="text"
              className={`form-input ${errors.streetBuilding ? "has-error" : ""}`}
              placeholder="e.g., Woodvale Grove, The Oval 3rd Floor"
              value={data.streetBuilding}
              onChange={(e) => onChange("streetBuilding", e.target.value)}
            />
            {errors.streetBuilding && (
              <span className="field-error-msg">{errors.streetBuilding}</span>
            )}
          </div>

          {/* Postal Address */}
          <div className="col-4 form-field">
            <label className="field-label" htmlFor="postalAddress">
              <span>Postal Address</span>
            </label>
            <input
              id="postalAddress"
              type="text"
              className="form-input"
              placeholder="P.O. Box 12345 - 00100 Nairobi"
              value={data.postalAddress}
              onChange={(e) => onChange("postalAddress", e.target.value)}
            />
          </div>

          {/* GPS Coordinates */}
          <div className="col-6 form-field">
            <label className="field-label" htmlFor="gpsCoordinates">
              <span>GPS Coordinates <span className="field-hint-inline">(Optional, e.g., -1.2645, 36.8041)</span></span>
            </label>
            <input
              id="gpsCoordinates"
              type="text"
              className="form-input"
              placeholder="-1.2645, 36.8041"
              value={data.gpsCoordinates}
              onChange={(e) => onChange("gpsCoordinates", e.target.value)}
            />
          </div>

          {/* Google Maps Link */}
          <div className="col-6 form-field">
            <label className="field-label" htmlFor="googleMapsLink">
              <span>Google Maps Link <span className="field-hint-inline">(Optional)</span></span>
            </label>
            <input
              id="googleMapsLink"
              type="url"
              className={`form-input ${errors.googleMapsLink ? "has-error" : ""}`}
              placeholder="https://maps.app.goo.gl/..."
              value={data.googleMapsLink}
              onChange={(e) => onChange("googleMapsLink", e.target.value)}
            />
            {errors.googleMapsLink && (
              <span className="field-error-msg">{errors.googleMapsLink}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Section C: Operations & Capacity ── */}
      <div className="section-subcard">
        <h3 className="section-subcard__title">
          <Store size={18} /> Operational Capacity & Outlets
        </h3>
        <p className="section-subcard__desc">
          Describe the operational scale and participating outlets for the SAGO Whisky campaign.
        </p>

        <div className="form-grid">
          {/* Number of Operating Outlets */}
          <div className="col-4 form-field">
            <label className="field-label" htmlFor="numberOfOutlets">
              <span>Number of Operating Outlets <span className="required-star">*</span></span>
            </label>
            <input
              id="numberOfOutlets"
              type="number"
              min={1}
              max={100}
              className={`form-input ${errors.numberOfOutlets ? "has-error" : ""}`}
              value={data.numberOfOutlets}
              onChange={(e) =>
                onChange("numberOfOutlets", Math.max(1, parseInt(e.target.value) || 1))
              }
            />
            {errors.numberOfOutlets && (
              <span className="field-error-msg">{errors.numberOfOutlets}</span>
            )}
          </div>

          {/* Daily Customer Footfall */}
          <div className="col-4 form-field">
            <label className="field-label" htmlFor="dailyCustomerFootfall">
              <span>Avg Daily Customer Footfall</span>
            </label>
            <select
              id="dailyCustomerFootfall"
              className="form-select"
              value={data.dailyCustomerFootfall}
              onChange={(e) => onChange("dailyCustomerFootfall", e.target.value)}
            >
              <option value="">Select Footfall</option>
              <option value="Under 50 patrons/day">Under 50 patrons/day</option>
              <option value="50 - 150 patrons/day">50 - 150 patrons/day</option>
              <option value="150 - 300 patrons/day">150 - 300 patrons/day</option>
              <option value="300 - 600 patrons/day">300 - 600 patrons/day</option>
              <option value="600+ patrons/day">600+ patrons/day</option>
            </select>
          </div>

          {/* Opening Hours */}
          <div className="col-4 form-field">
            <label className="field-label" htmlFor="openingHours">
              <span>Daily Opening Hours</span>
            </label>
            <input
              id="openingHours"
              type="text"
              className="form-input"
              placeholder="e.g., 11:00 AM - 03:00 AM"
              value={data.openingHours}
              onChange={(e) => onChange("openingHours", e.target.value)}
            />
          </div>

          {/* Average Monthly Sales Volume (Optional) */}
          <div className="col-6 form-field">
            <label className="field-label" htmlFor="monthlySalesVolume">
              <span>Avg Monthly Spirit / Liquor Sales <span className="field-hint-inline">(Optional)</span></span>
            </label>
            <select
              id="monthlySalesVolume"
              className="form-select"
              value={data.monthlySalesVolume}
              onChange={(e) => onChange("monthlySalesVolume", e.target.value)}
            >
              <option value="">Prefer not to disclose</option>
              <option value="Under KES 300,000">Under KES 300,000</option>
              <option value="KES 300,000 - 800,000">KES 300,000 - 800,000</option>
              <option value="KES 800,000 - 2,000,000">KES 800,000 - 2,000,000</option>
              <option value="KES 2,000,000+">KES 2,000,000+</option>
            </select>
          </div>

          {/* Operating Days */}
          <div className="col-12 form-field">
            <label className="field-label">
              <span>Operating Days</span>
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = (data.operatingDays || []).includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    style={{
                      background: isSelected ? "rgba(176, 141, 87, 0.25)" : "rgba(14, 14, 14, 0.7)",
                      borderColor: isSelected ? "#b08d57" : "rgba(245, 241, 232, 0.15)",
                      color: isSelected ? "#d4af37" : "#f5f1e8",
                      border: "1px solid",
                      borderRadius: "8px",
                      padding: "0.4rem 0.8rem",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Alcohol Sales & Bar Manager toggles */}
          <div className="col-6 form-field">
            <label className="custom-checkbox-row is-checked">
              <input
                type="checkbox"
                className="custom-checkbox-input"
                checked={data.sellsAlcohol}
                onChange={(e) => onChange("sellsAlcohol", e.target.checked)}
              />
              <div className="checkbox-text-content">
                <span className="checkbox-title">Currently Licensed to Sell Alcohol</span>
                <span className="checkbox-desc">The premises has active authorization for liquor retailing.</span>
              </div>
            </label>
          </div>

          <div className="col-6 form-field">
            <label className="custom-checkbox-row is-checked">
              <input
                type="checkbox"
                className="custom-checkbox-input"
                checked={data.hasBarManager}
                onChange={(e) => onChange("hasBarManager", e.target.checked)}
              />
              <div className="checkbox-text-content">
                <span className="checkbox-title">Designated Bar Manager on Site</span>
                <span className="checkbox-desc">Has dedicated beverage manager overseeing promotions.</span>
              </div>
            </label>
          </div>
        </div>

        {/* Multi-Outlet Configuration */}
        {data.numberOfOutlets > 1 && (
          <div
            style={{
              marginTop: "2rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid rgba(176, 141, 87, 0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <div>
                <h4 style={{ color: "#d4af37", fontSize: "1rem", fontWeight: 600 }}>
                  Additional Participating Outlets ({data.additionalOutlets?.length || 0})
                </h4>
                <p style={{ fontSize: "0.78rem", color: "rgba(245, 241, 232, 0.6)" }}>
                  Provide location and manager details for each additional branch participating in the campaign.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddOutlet}
                className="btn-secondary"
                style={{ padding: "0.45rem 0.9rem", fontSize: "0.75rem" }}
              >
                <Plus size={14} /> Add Branch
              </button>
            </div>

            {(data.additionalOutlets || []).map((outlet, idx) => (
              <div
                key={outlet.id}
                style={{
                  background: "rgba(10, 10, 10, 0.8)",
                  border: "1px solid rgba(176, 141, 87, 0.2)",
                  borderRadius: "10px",
                  padding: "1.25rem",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.75rem",
                  }}
                >
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#b08d57" }}>
                    Branch #{idx + 2}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveOutlet(idx)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#e57373",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      fontSize: "0.75rem",
                    }}
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                </div>

                <div className="form-grid">
                  <div className="col-4 form-field">
                    <label className="field-label">Branch Display Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., Velvet Oak - Kilimani"
                      value={outlet.outletDisplayName}
                      onChange={(e) =>
                        handleOutletChange(idx, "outletDisplayName", e.target.value)
                      }
                    />
                  </div>

                  <div className="col-4 form-field">
                    <label className="field-label">
                      {data.country === "Kenya" ? "County" : "State / Province / Region"}
                    </label>
                    {data.country === "Kenya" ? (
                      <select
                        className="form-select"
                        value={outlet.county}
                        onChange={(e) => handleOutletChange(idx, "county", e.target.value)}
                      >
                        {KENYA_COUNTIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        className="form-input"
                        placeholder="State / Region"
                        value={outlet.county}
                        onChange={(e) => handleOutletChange(idx, "county", e.target.value)}
                      />
                    )}
                  </div>

                  <div className="col-4 form-field">
                    <label className="field-label">Town / Street Address</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Lenana Road, Arcade"
                      value={outlet.streetAddress}
                      onChange={(e) =>
                        handleOutletChange(idx, "streetAddress", e.target.value)
                      }
                    />
                  </div>

                  <div className="col-6 form-field">
                    <label className="field-label">Branch Manager Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Manager full name"
                      value={outlet.managerName}
                      onChange={(e) =>
                        handleOutletChange(idx, "managerName", e.target.value)
                      }
                    />
                  </div>

                  <div className="col-6 form-field">
                    <label className="field-label">Manager Direct Phone</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="+254 7..."
                      value={outlet.managerPhone}
                      onChange={(e) =>
                        handleOutletChange(idx, "managerPhone", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
