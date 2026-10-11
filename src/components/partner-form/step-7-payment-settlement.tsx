"use client";

import React from "react";
import { CreditCard, Landmark, ShieldCheck, HelpCircle } from "lucide-react";
import { PartnerFormData } from "@/lib/partner-types";
import { KENYA_BANKS, SETTLEMENT_ARRANGEMENTS, AFRICAN_CURRENCIES } from "@/lib/kenya-data";

interface Step7Props {
  data: PartnerFormData;
  errors: Record<string, string>;
  onChange: <K extends keyof PartnerFormData>(field: K, value: PartnerFormData[K]) => void;
}

export default function Step7PaymentSettlement({ data, errors, onChange }: Step7Props) {
  const requiresSettlement =
    data.requiresSettlement ||
    (data.settlementArrangement &&
      data.settlementArrangement !== "No Payment or Reimbursement Required");

  return (
    <div className="step-content">
      <div className="step-header">
        <span className="step-header__eyebrow">Step 7 of 10</span>
        <h2 className="step-header__title">Payment & Financial Settlement Details</h2>
        <p className="step-header__desc">
          Configure financial settlement details if your partnership includes promotional discount reimbursements or commission rebates.
        </p>
      </div>

      <div className="section-subcard" style={{ marginTop: 0 }}>
        <h3 className="section-subcard__title">
          <CreditCard size={18} /> Settlement Model Selection
        </h3>
        <p className="section-subcard__desc">
          Select whether your partnership requires monetary transfers between SAGO and your business.
        </p>

        <div className="form-grid">
          <div className="col-12 form-field">
            <label className="field-label" htmlFor="settlementArrangement">
              <span>Settlement Arrangement Structure</span>
            </label>
            <select
              id="settlementArrangement"
              className="form-select"
              value={data.settlementArrangement}
              onChange={(e) => {
                const val = e.target.value;
                onChange("settlementArrangement", val);
                onChange(
                  "requiresSettlement",
                  val !== "No Payment or Reimbursement Required"
                );
              }}
            >
              {SETTLEMENT_ARRANGEMENTS.map((arr) => (
                <option key={arr} value={arr}>
                  {arr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Conditional Financial Fields */}
      {requiresSettlement ? (
        <div className="section-subcard">
          <div
            style={{
              background: "rgba(176, 141, 87, 0.08)",
              border: "1px solid rgba(176, 141, 87, 0.25)",
              borderRadius: "10px",
              padding: "0.85rem 1rem",
              marginBottom: "1.5rem",
              fontSize: "0.8rem",
              color: "rgba(245, 241, 232, 0.8)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <ShieldCheck size={20} color="#b08d57" style={{ flexShrink: 0 }} />
            <span>
              <strong>Confidentiality Protection:</strong> Settlement information is encrypted and accessible only to authorized SAGO finance officers. It will never be displayed in public profiles or promotional listings.
            </span>
          </div>

          <h3 className="section-subcard__title">
            <Landmark size={18} /> Banking & Payment Details (Pan-African)
          </h3>
          <p className="section-subcard__desc">
            Provide the commercial bank account or business mobile money registered under your business name.
          </p>

          <div className="form-grid">
            {/* Account Holder Name */}
            <div className="col-6 form-field">
              <label className="field-label" htmlFor="settlementAccountName">
                <span>Account Holder / Beneficiary Name <span className="required-star">*</span></span>
              </label>
              <input
                id="settlementAccountName"
                type="text"
                className={`form-input ${errors.settlementAccountName ? "has-error" : ""}`}
                placeholder="Exact name as appears on bank statement"
                value={data.settlementAccountName}
                onChange={(e) => onChange("settlementAccountName", e.target.value)}
              />
              {errors.settlementAccountName && (
                <span className="field-error-msg">{errors.settlementAccountName}</span>
              )}
            </div>

            {/* Bank Name */}
            <div className="col-6 form-field">
              <label className="field-label" htmlFor="settlementBankName">
                <span>Bank / Payment Institution <span className="required-star">*</span></span>
              </label>
              <select
                id="settlementBankName"
                className={`form-select ${errors.settlementBankName ? "has-error" : ""}`}
                value={data.settlementBankName}
                onChange={(e) => onChange("settlementBankName", e.target.value)}
              >
                <option value="">Select Commercial Bank / Provider</option>
                {KENYA_BANKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              {errors.settlementBankName && (
                <span className="field-error-msg">{errors.settlementBankName}</span>
              )}
            </div>

            {/* Branch */}
            <div className="col-4 form-field">
              <label className="field-label" htmlFor="settlementBranch">
                <span>Bank Branch</span>
              </label>
              <input
                id="settlementBranch"
                type="text"
                className="form-input"
                placeholder="e.g., Central / Main Branch"
                value={data.settlementBranch}
                onChange={(e) => onChange("settlementBranch", e.target.value)}
              />
            </div>

            {/* Account Number */}
            <div className="col-4 form-field">
              <label className="field-label" htmlFor="settlementAccountNumber">
                <span>Account Number <span className="required-star">*</span></span>
              </label>
              <input
                id="settlementAccountNumber"
                type="text"
                className={`form-input ${errors.settlementAccountNumber ? "has-error" : ""}`}
                placeholder="Bank Account Number"
                value={data.settlementAccountNumber}
                onChange={(e) => onChange("settlementAccountNumber", e.target.value)}
              />
              {errors.settlementAccountNumber && (
                <span className="field-error-msg">{errors.settlementAccountNumber}</span>
              )}
            </div>

            {/* Currency */}
            <div className="col-4 form-field">
              <label className="field-label" htmlFor="settlementCurrency">
                <span>Settlement Currency</span>
              </label>
              <select
                id="settlementCurrency"
                className="form-select"
                value={data.settlementCurrency || "KES"}
                onChange={(e) => onChange("settlementCurrency", e.target.value)}
              >
                {AFRICAN_CURRENCIES.map((cur) => (
                  <option key={cur} value={cur}>
                    {cur}
                  </option>
                ))}
              </select>
            </div>

            {/* Alternative payment method / M-PESA Till */}
            <div className="col-12 form-field">
              <label className="field-label" htmlFor="settlementAltMethod">
                <span>Alternative Payment Details <span className="field-hint-inline">(e.g., Safaricom M-PESA Buy Goods Till / Paybill)</span></span>
              </label>
              <input
                id="settlementAltMethod"
                type="text"
                className="form-input"
                placeholder="Till No: 123456 or Paybill: 654321, Account: VelvetOak"
                value={data.settlementAltMethod}
                onChange={(e) => onChange("settlementAltMethod", e.target.value)}
              />
            </div>

            {/* Settlement Frequency */}
            <div className="col-4 form-field">
              <label className="field-label" htmlFor="settlementFrequency">
                <span>Settlement Frequency</span>
              </label>
              <select
                id="settlementFrequency"
                className="form-select"
                value={data.settlementFrequency || "Monthly"}
                onChange={(e) => onChange("settlementFrequency", e.target.value)}
              >
                <option value="Weekly">Weekly Cycle</option>
                <option value="Bi-Weekly">Bi-Weekly Cycle</option>
                <option value="Monthly">Monthly Cycle</option>
              </select>
            </div>

            {/* Settlement Contact Person */}
            <div className="col-4 form-field">
              <label className="field-label" htmlFor="settlementContactName">
                <span>Finance / Accounts Contact <span className="required-star">*</span></span>
              </label>
              <input
                id="settlementContactName"
                type="text"
                className={`form-input ${errors.settlementContactName ? "has-error" : ""}`}
                placeholder="Finance Manager Name"
                value={data.settlementContactName}
                onChange={(e) => onChange("settlementContactName", e.target.value)}
              />
              {errors.settlementContactName && (
                <span className="field-error-msg">{errors.settlementContactName}</span>
              )}
            </div>

            {/* Settlement Contact Email */}
            <div className="col-4 form-field">
              <label className="field-label" htmlFor="settlementContactEmail">
                <span>Finance Email <span className="required-star">*</span></span>
              </label>
              <input
                id="settlementContactEmail"
                type="email"
                className={`form-input ${errors.settlementContactEmail ? "has-error" : ""}`}
                placeholder="accounts@velvetoak.co.ke"
                value={data.settlementContactEmail}
                onChange={(e) => onChange("settlementContactEmail", e.target.value)}
              />
              {errors.settlementContactEmail && (
                <span className="field-error-msg">{errors.settlementContactEmail}</span>
              )}
            </div>

            {/* Settlement Contact Phone */}
            <div className="col-4 form-field">
              <label className="field-label" htmlFor="settlementContactPhone">
                <span>Finance Phone <span className="required-star">*</span></span>
              </label>
              <input
                id="settlementContactPhone"
                type="tel"
                className={`form-input ${errors.settlementContactPhone ? "has-error" : ""}`}
                placeholder="+254 712 345 678"
                value={data.settlementContactPhone}
                onChange={(e) => onChange("settlementContactPhone", e.target.value)}
              />
              {errors.settlementContactPhone && (
                <span className="field-error-msg">{errors.settlementContactPhone}</span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            background: "rgba(10, 10, 10, 0.6)",
            border: "1px dashed rgba(176, 141, 87, 0.25)",
            borderRadius: "12px",
            padding: "2rem",
            textAlign: "center",
            marginTop: "1.5rem",
          }}
        >
          <p style={{ color: "#d4af37", fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.35rem" }}>
            No Financial Settlement Required
          </p>
          <p style={{ color: "rgba(245, 241, 232, 0.6)", fontSize: "0.82rem", maxWidth: "480px", margin: "0 auto" }}>
            You have selected a direct promotional discount structure. No bank account information is required for this partnership model.
          </p>
        </div>
      )}
    </div>
  );
}
