"use client";

import React from "react";
import { Wine, Tag, Coins, Info, Check, Plus, Trash2 } from "lucide-react";
import { PartnerFormData, ParticipatingProductItem } from "@/lib/partner-types";
import { PARTNERSHIP_TYPES, AFRICAN_CURRENCIES } from "@/lib/kenya-data";

interface Step4Props {
  data: PartnerFormData;
  errors: Record<string, string>;
  onChange: <K extends keyof PartnerFormData>(field: K, value: PartnerFormData[K]) => void;
}

export default function Step4PartnershipProducts({ data, errors, onChange }: Step4Props) {
  const handleProductToggle = (id: string) => {
    const products = (data.products || []).map((p) => {
      if (p.id === id) {
        return { ...p, selected: !p.selected };
      }
      return p;
    });
    onChange("products", products);
  };

  const handleProductChange = (
    id: string,
    field: keyof ParticipatingProductItem,
    value: any
  ) => {
    const products = (data.products || []).map((p) => {
      if (p.id === id) {
        const updated = { ...p, [field]: value };
        if (field === "standardPrice") {
          const standard = Number(value) || 0;
          updated.proposedPromotionalPrice = Math.round(standard * 0.85);
        }
        return updated;
      }
      return p;
    });
    onChange("products", products);
  };

  const handleAddCustomProduct = () => {
    const newProd: ParticipatingProductItem = {
      id: `custom_${crypto.randomUUID().slice(0, 6)}`,
      productName: "SAGO Custom Cocktail / Serving",
      servingType: "Cocktail",
      standardPrice: 600,
      currency: data.products?.[0]?.currency || "KES",
      discountType: "Percentage",
      proposedDiscount: 15,
      proposedPromotionalPrice: 510,
      selected: true,
    };
    onChange("products", [...(data.products || []), newProd]);
  };

  const handleRemoveCustomProduct = (id: string) => {
    const products = (data.products || []).filter((p) => p.id !== id);
    onChange("products", products);
  };

  return (
    <div className="step-content">
      <div className="step-header">
        <span className="step-header__eyebrow">Step 4 of 10</span>
        <h2 className="step-header__title">SAGO Partnership Details & Product Offers</h2>
        <p className="step-header__desc">
          Select participating SAGO Whisky products, serving formats, and proposed discount pricing for promotional campaigns.
        </p>
      </div>

      {/* ── Section A: Partnership Agreement Preferences ── */}
      <div className="section-subcard" style={{ marginTop: 0 }}>
        <h3 className="section-subcard__title">
          <Tag size={18} /> Partnership Scope & Duration
        </h3>
        <p className="section-subcard__desc">
          Define the partnership category and proposed operational timeline.
        </p>

        <div className="form-grid">
          {/* Partnership Type */}
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

          {/* Conditional Other Type */}
          {data.partnershipType === "Other" && (
            <div className="col-6 form-field">
              <label className="field-label" htmlFor="partnershipTypeOther">
                <span>Specify Partnership Type <span className="required-star">*</span></span>
              </label>
              <input
                id="partnershipTypeOther"
                type="text"
                className={`form-input ${errors.partnershipTypeOther ? "has-error" : ""}`}
                placeholder="Specify your preferred collaboration model"
                value={data.partnershipTypeOther}
                onChange={(e) => onChange("partnershipTypeOther", e.target.value)}
              />
              {errors.partnershipTypeOther && (
                <span className="field-error-msg">{errors.partnershipTypeOther}</span>
              )}
            </div>
          )}

          {/* Agreement Duration */}
          <div className="col-6 form-field">
            <label className="field-label" htmlFor="agreementDuration">
              <span>Proposed Agreement Duration</span>
            </label>
            <select
              id="agreementDuration"
              className="form-select"
              value={data.agreementDuration}
              onChange={(e) => onChange("agreementDuration", e.target.value)}
            >
              <option value="3 Months (Trial Campaign)">3 Months (Trial Campaign)</option>
              <option value="6 Months (Seasonal Campaign)">6 Months (Seasonal Campaign)</option>
              <option value="12 Months (Annual Partner)">12 Months (Annual Partner)</option>
              <option value="Ongoing / Renewable Partnership">Ongoing / Renewable Partnership</option>
            </select>
          </div>

          {/* Preferred Start Date */}
          <div className="col-6 form-field">
            <label className="field-label" htmlFor="preferredStartDate">
              <span>Preferred Start Date</span>
            </label>
            <input
              id="preferredStartDate"
              type="date"
              className="form-input"
              value={data.preferredStartDate}
              onChange={(e) => onChange("preferredStartDate", e.target.value)}
            />
          </div>

          {/* Outlets Joining Count */}
          <div className="col-6 form-field">
            <label className="field-label" htmlFor="outletsJoiningCount">
              <span>Outlets Joining Campaign <span className="required-star">*</span></span>
            </label>
            <input
              id="outletsJoiningCount"
              type="number"
              min={1}
              max={data.numberOfOutlets || 1}
              className={`form-input ${errors.outletsJoiningCount ? "has-error" : ""}`}
              value={data.outletsJoiningCount}
              onChange={(e) =>
                onChange("outletsJoiningCount", Math.max(1, parseInt(e.target.value) || 1))
              }
            />
            {errors.outletsJoiningCount && (
              <span className="field-error-msg">{errors.outletsJoiningCount}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Section B: Participating Products & Discount Calculation ── */}
      <div className="section-subcard">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.5rem",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <h3 className="section-subcard__title" style={{ margin: 0 }}>
            <Wine size={18} /> Participating SAGO Products & Standard Bar Pricing
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <span style={{ fontSize: "0.75rem", color: "rgba(245, 241, 232, 0.6)" }}>
                Currency:
              </span>
              <select
                className="form-select"
                style={{ width: "auto", padding: "0.35rem 0.6rem", fontSize: "0.75rem" }}
                value={data.products?.[0]?.currency || "KES"}
                onChange={(e) => {
                  const newCur = e.target.value;
                  const updated = (data.products || []).map((p) => ({
                    ...p,
                    currency: newCur,
                  }));
                  onChange("products", updated);
                  onChange("settlementCurrency", newCur);
                }}
              >
                {AFRICAN_CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleAddCustomProduct}
              className="btn-secondary"
              style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}
            >
              <Plus size={13} /> Add Custom Product
            </button>
          </div>
        </div>
        <p className="section-subcard__desc">
          Select each product your venue will carry and set your standard bar / menu price.
        </p>

        {errors.products && (
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
            {errors.products}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {(data.products || []).map((product, idx) => {
            const isSelected = product.selected;
            const isCustom = product.id.startsWith("custom_");

            return (
              <div
                key={product.id}
                className={`product-card ${isSelected ? "is-selected" : ""}`}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: isSelected ? "1rem" : 0,
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      cursor: "pointer",
                      flex: 1,
                    }}
                  >
                    <input
                      type="checkbox"
                      className="custom-checkbox-input"
                      checked={isSelected}
                      onChange={() => handleProductToggle(product.id)}
                    />
                    <div>
                      <span
                        style={{
                          fontSize: "0.95rem",
                          fontWeight: 600,
                          color: isSelected ? "#d4af37" : "#f5f1e8",
                        }}
                      >
                        {product.productName}
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "rgba(245, 241, 232, 0.5)",
                          display: "block",
                        }}
                      >
                        Serving format: {product.servingType}
                      </span>
                    </div>
                  </label>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    {isCustom && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomProduct(product.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ef5350",
                          cursor: "pointer",
                        }}
                        title="Delete custom product"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <div
                    style={{
                      paddingTop: "1rem",
                      borderTop: "1px solid rgba(176, 141, 87, 0.15)",
                    }}
                  >
                    <div className="form-grid">
                      {isCustom && (
                        <div className="col-12 form-field">
                          <label className="field-label">Custom Product Name</label>
                          <input
                            type="text"
                            className="form-input"
                            value={product.productName}
                            onChange={(e) =>
                              handleProductChange(product.id, "productName", e.target.value)
                            }
                          />
                        </div>
                      )}

                      <div className="col-6 form-field">
                        <label className="field-label">
                          <span>Standard Bar / Retail Price ({product.currency}) <span className="required-star">*</span></span>
                        </label>
                        <input
                          type="number"
                          min={1}
                          className={`form-input ${errors[`prod_${idx}_standardPrice`] ? "has-error" : ""}`}
                          placeholder={`e.g. ${product.standardPrice || 3500}`}
                          value={product.standardPrice || ""}
                          onChange={(e) =>
                            handleProductChange(
                              product.id,
                              "standardPrice",
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                        {errors[`prod_${idx}_standardPrice`] && (
                          <span className="field-error-msg">{errors[`prod_${idx}_standardPrice`]}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="slot-campaign-banner">
          <Coins size={22} className="slot-icon-gold" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <strong>Dynamic SAGO Slot Machine Discount Model</strong>
            <p>
              Partner venues register standard menu pricing. Discounts are not static—patrons spin the interactive 3D SAGO Slot Machine on their phones to win official promotional codes (5%–25% off bottles / 10%–50% off pours). When redeemed at your bar, staff verify the code and apply the percentage discount against your registered standard bar price.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
