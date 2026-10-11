"use client";

import React from "react";
import { Calendar, Clock, DollarSign, ShieldAlert, Layers } from "lucide-react";
import { PartnerFormData } from "@/lib/partner-types";

interface Step5Props {
  data: PartnerFormData;
  errors: Record<string, string>;
  onChange: <K extends keyof PartnerFormData>(field: K, value: PartnerFormData[K]) => void;
}

export default function Step5CampaignTerms({ data, errors, onChange }: Step5Props) {
  return (
    <div className="step-content">
      <div className="step-header">
        <span className="step-header__eyebrow">Step 5 of 10</span>
        <h2 className="step-header__title">Campaign Terms & Promotional Rules</h2>
        <p className="step-header__desc">
          Specify redemption hours, minimum spend limits, campaign timeline, and promotional guidelines.
        </p>
      </div>

      <div className="section-subcard" style={{ marginTop: 0 }}>
        <h3 className="section-subcard__title">
          <Calendar size={18} /> Campaign Timeline & Schedule
        </h3>
        <p className="section-subcard__desc">
          Specify the active promotional window for coupon and voucher redemption.
        </p>

        <div className="form-grid">
          {/* Campaign Start Date */}
          <div className="col-6 form-field">
            <label className="field-label" htmlFor="campaignStartDate">
              <span>Campaign Start Date <span className="required-star">*</span></span>
            </label>
            <input
              id="campaignStartDate"
              type="date"
              className={`form-input ${errors.campaignStartDate ? "has-error" : ""}`}
              value={data.campaignStartDate}
              onChange={(e) => onChange("campaignStartDate", e.target.value)}
            />
            {errors.campaignStartDate && (
              <span className="field-error-msg">{errors.campaignStartDate}</span>
            )}
          </div>

          {/* Campaign End Date */}
          <div className="col-6 form-field">
            <label className="field-label" htmlFor="campaignEndDate">
              <span>Campaign End Date <span className="required-star">*</span></span>
            </label>
            <input
              id="campaignEndDate"
              type="date"
              className={`form-input ${errors.campaignEndDate ? "has-error" : ""}`}
              value={data.campaignEndDate}
              onChange={(e) => onChange("campaignEndDate", e.target.value)}
            />
            {errors.campaignEndDate && (
              <span className="field-error-msg">{errors.campaignEndDate}</span>
            )}
          </div>

          {/* Discount Days & Hours */}
          <div className="col-12 form-field">
            <label className="field-label" htmlFor="discountDaysHours">
              <span>Days & Hours When Discounts Apply <span className="required-star">*</span></span>
            </label>
            <input
              id="discountDaysHours"
              type="text"
              className="form-input"
              placeholder="e.g., Wednesdays to Sundays, 5:00 PM - 11:00 PM (or All Operating Hours)"
              value={data.discountDaysHours}
              onChange={(e) => onChange("discountDaysHours", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="section-subcard">
        <h3 className="section-subcard__title">
          <DollarSign size={18} /> Redemption Caps & Purchase Rules
        </h3>
        <p className="section-subcard__desc">
          Set transactional limits to prevent margin erosion and manage stock allocation.
        </p>

        <div className="form-grid">
          {/* Minimum Purchase Requirement */}
          <div className="col-4 form-field">
            <label className="field-label" htmlFor="minimumPurchaseReq">
              <span>Minimum Purchase Requirement</span>
            </label>
            <input
              id="minimumPurchaseReq"
              type="text"
              className="form-input"
              placeholder="e.g., 2 SAGO drinks or KES 1,000"
              value={data.minimumPurchaseReq}
              onChange={(e) => onChange("minimumPurchaseReq", e.target.value)}
            />
          </div>

          {/* Max Discount Per Transaction */}
          <div className="col-4 form-field">
            <label className="field-label" htmlFor="maxDiscountPerTx">
              <span>Max Discount Per Bill / Transaction</span>
            </label>
            <input
              id="maxDiscountPerTx"
              type="text"
              className="form-input"
              placeholder="e.g., KES 1,500 maximum discount"
              value={data.maxDiscountPerTx}
              onChange={(e) => onChange("maxDiscountPerTx", e.target.value)}
            />
          </div>

          {/* Daily / Monthly Redemption Limit */}
          <div className="col-4 form-field">
            <label className="field-label" htmlFor="redemptionLimit">
              <span>Daily Coupon Redemption Limit <span className="field-hint-inline">(Patrons/day)</span></span>
            </label>
            <input
              id="redemptionLimit"
              type="number"
              min={1}
              className={`form-input ${errors.redemptionLimit ? "has-error" : ""}`}
              placeholder="e.g., 30"
              value={data.redemptionLimit || ""}
              onChange={(e) =>
                onChange("redemptionLimit", parseInt(e.target.value) || 0)
              }
            />
            {errors.redemptionLimit && (
              <span className="field-error-msg">{errors.redemptionLimit}</span>
            )}
          </div>

          {/* Combinable with other offers */}
          <div className="col-12 form-field">
            <label className="custom-checkbox-row">
              <input
                type="checkbox"
                className="custom-checkbox-input"
                checked={data.combinableWithOffers}
                onChange={(e) => onChange("combinableWithOffers", e.target.checked)}
              />
              <div className="checkbox-text-content">
                <span className="checkbox-title">Can Discounts Be Combined With Other In-House Offers?</span>
                <span className="checkbox-desc">
                  Check only if patrons are permitted to stack SAGO campaign discounts on top of happy hour or loyalty discounts.
                </span>
              </div>
            </label>
          </div>

          {/* Exclusions or Additional Conditions */}
          <div className="col-12 form-field">
            <label className="field-label" htmlFor="campaignExclusions">
              <span>Exclusions or Special Operational Conditions</span>
            </label>
            <textarea
              id="campaignExclusions"
              rows={3}
              className="form-textarea"
              placeholder="e.g., Not valid on special VIP events, major public holidays, or private room bookings."
              value={data.campaignExclusions}
              onChange={(e) => onChange("campaignExclusions", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
