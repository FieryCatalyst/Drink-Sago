"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Building,
  User,
  FileText,
  Wine,
  Calendar,
  QrCode,
  CreditCard,
  Megaphone,
  CheckSquare,
  Lock,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { PartnerFormData } from "@/lib/partner-types";
import { validateFullApplication, getSlotRewardRange } from "@/lib/partner-validation";

interface Step10Props {
  data: PartnerFormData;
  onGoToStep: (stepNumber: number) => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
}

export default function Step10ReviewSubmit({
  data,
  onGoToStep,
  onSubmit,
  isSubmitting,
}: Step10Props) {
  const [confirmedAccuracy, setConfirmedAccuracy] = useState(false);
  const validation = validateFullApplication(data);
  const selectedProducts = (data.products || []).filter((p) => p.selected);

  return (
    <div className="step-content">
      <div className="step-header">
        <span className="step-header__eyebrow">Step 10 of 10</span>
        <h2 className="step-header__title">Review Application & Final Submission</h2>
        <p className="step-header__desc">
          Verify all information, attached licences, and proposed campaign terms before transmitting your official application to SAGO.
        </p>
      </div>

      {/* Validation Health Banner */}
      {!validation.isValid ? (
        <div
          style={{
            background: "rgba(111, 20, 30, 0.35)",
            border: "1px solid #ef5350",
            borderRadius: "12px",
            padding: "1.25rem 1.5rem",
            marginBottom: "2rem",
            display: "flex",
            alignItems: "flex-start",
            gap: "1rem",
          }}
        >
          <AlertTriangle size={24} color="#ef5350" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <h4 style={{ color: "#ffcdd2", fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.35rem" }}>
              Incomplete Information Detected
            </h4>
            <p style={{ color: "rgba(245, 241, 232, 0.8)", fontSize: "0.82rem", lineHeight: 1.5, marginBottom: "0.75rem" }}>
              Some mandatory items are missing or require attention before submission. Click on any section below to complete the details:
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {Object.entries(validation.stepErrors).map(([stepNum, errs]) => (
                <button
                  key={stepNum}
                  type="button"
                  onClick={() => onGoToStep(parseInt(stepNum))}
                  className="btn-secondary"
                  style={{
                    padding: "0.35rem 0.75rem",
                    fontSize: "0.75rem",
                    borderColor: "#ef5350",
                    color: "#ffcdd2",
                  }}
                >
                  <Edit3 size={12} /> Step {stepNum}: {Object.keys(errs).length} item(s) to fix
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            background: "rgba(129, 199, 132, 0.12)",
            border: "1px solid rgba(129, 199, 132, 0.4)",
            borderRadius: "12px",
            padding: "1rem 1.25rem",
            marginBottom: "2rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            color: "#a5d6a7",
            fontSize: "0.85rem",
          }}
        >
          <CheckCircle2 size={20} />
          <span>All required sections have been completed and validated successfully.</span>
        </div>
      )}

      {/* ── Summary Accordions / Sections ── */}

      {/* 1. Business Info */}
      <div className="section-subcard" style={{ marginTop: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.75rem",
          }}
        >
          <h3 className="section-subcard__title" style={{ margin: 0 }}>
            <Building size={16} /> 1. Business Identity & Location
          </h3>
          <button
            type="button"
            onClick={() => onGoToStep(1)}
            className="btn-secondary"
            style={{ padding: "0.3rem 0.65rem", fontSize: "0.72rem" }}
          >
            <Edit3 size={11} /> Edit Step 1
          </button>
        </div>
        <div className="form-grid" style={{ fontSize: "0.82rem" }}>
          <div className="col-4">
            <span style={{ color: "rgba(245, 241, 232, 0.5)" }}>Registered Entity:</span>
            <div style={{ fontWeight: 600 }}>{data.registeredBusinessName || "—"}</div>
          </div>
          <div className="col-4">
            <span style={{ color: "rgba(245, 241, 232, 0.5)" }}>Trading / Bar Name:</span>
            <div style={{ fontWeight: 600 }}>{data.tradingName || "—"}</div>
          </div>
          <div className="col-4">
            <span style={{ color: "rgba(245, 241, 232, 0.5)" }}>Category:</span>
            <div style={{ fontWeight: 600 }}>{data.businessType || "—"}</div>
          </div>
          <div className="col-4">
            <span style={{ color: "rgba(245, 241, 232, 0.5)" }}>BRS Registration:</span>
            <div style={{ fontWeight: 600 }}>{data.businessRegistrationNumber || "—"}</div>
          </div>
          <div className="col-4">
            <span style={{ color: "rgba(245, 241, 232, 0.5)" }}>Location & Country:</span>
            <div style={{ fontWeight: 600 }}>
              {data.townCity}, {data.county} ({data.country})
            </div>
          </div>
          <div className="col-4">
            <span style={{ color: "rgba(245, 241, 232, 0.5)" }}>Outlets Count:</span>
            <div style={{ fontWeight: 600 }}>{data.numberOfOutlets} Outlet(s)</div>
          </div>
        </div>
      </div>

      {/* 2. Owner & Contact */}
      <div className="section-subcard">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.75rem",
          }}
        >
          <h3 className="section-subcard__title" style={{ margin: 0 }}>
            <User size={16} /> 2. Owner & Authorized Representative
          </h3>
          <button
            type="button"
            onClick={() => onGoToStep(2)}
            className="btn-secondary"
            style={{ padding: "0.3rem 0.65rem", fontSize: "0.72rem" }}
          >
            <Edit3 size={11} /> Edit Step 2
          </button>
        </div>
        <div className="form-grid" style={{ fontSize: "0.82rem" }}>
          <div className="col-6">
            <span style={{ color: "rgba(245, 241, 232, 0.5)" }}>Business Owner:</span>
            <div style={{ fontWeight: 600 }}>
              {data.ownerFullName} ({data.ownerPosition})
            </div>
            <div style={{ color: "rgba(245, 241, 232, 0.7)", fontSize: "0.78rem" }}>
              {data.ownerEmail} · {data.ownerPhone}
            </div>
          </div>
          <div className="col-6">
            <span style={{ color: "rgba(245, 241, 232, 0.5)" }}>Authorized Representative:</span>
            <div style={{ fontWeight: 600 }}>
              {data.authContactName} ({data.authContactTitle})
            </div>
            <div style={{ color: "rgba(245, 241, 232, 0.7)", fontSize: "0.78rem" }}>
              {data.authContactEmail} · {data.authContactPhone}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Uploaded Documents */}
      <div className="section-subcard">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.75rem",
          }}
        >
          <h3 className="section-subcard__title" style={{ margin: 0 }}>
            <FileText size={16} /> 3. Verification Documents ({(data.documents || []).length})
          </h3>
          <button
            type="button"
            onClick={() => onGoToStep(3)}
            className="btn-secondary"
            style={{ padding: "0.3rem 0.65rem", fontSize: "0.72rem" }}
          >
            <Edit3 size={11} /> Edit Step 3
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {(data.documents || []).length === 0 ? (
            <span style={{ color: "rgba(245, 241, 232, 0.5)", fontSize: "0.82rem" }}>
              No documents attached yet.
            </span>
          ) : (
            (data.documents || []).map((doc, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.5rem 0.75rem",
                  background: "rgba(10, 10, 10, 0.6)",
                  borderRadius: "6px",
                  fontSize: "0.8rem",
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, color: "#d4af37" }}>
                    {doc.documentType}
                  </span>
                  {doc.documentNumber && (
                    <span style={{ color: "rgba(245, 241, 232, 0.5)", marginLeft: "0.4rem" }}>
                      (No: {doc.documentNumber})
                    </span>
                  )}
                </div>
                <span style={{ color: "#81c784", fontSize: "0.74rem" }}>
                  Attached: {doc.fileName}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. Products & Offers */}
      <div className="section-subcard">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.75rem",
          }}
        >
          <h3 className="section-subcard__title" style={{ margin: 0 }}>
            <Wine size={16} /> 4. Participating Products & Proposed Pricing ({selectedProducts.length})
          </h3>
          <button
            type="button"
            onClick={() => onGoToStep(4)}
            className="btn-secondary"
            style={{ padding: "0.3rem 0.65rem", fontSize: "0.72rem" }}
          >
            <Edit3 size={11} /> Edit Step 4
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {selectedProducts.map((p) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.5rem 0.75rem",
                background: "rgba(10, 10, 10, 0.6)",
                borderRadius: "6px",
                fontSize: "0.82rem",
              }}
            >
              <div>
                <span style={{ fontWeight: 600, color: "#f5f1e8" }}>{p.productName}</span>
                <span style={{ color: "rgba(245, 241, 232, 0.5)", marginLeft: "0.5rem" }}>
                  Standard: {p.currency} {p.standardPrice.toLocaleString()}
                </span>
              </div>
              <div style={{ color: "#d4af37", fontWeight: 600, fontSize: "0.82rem" }}>
                🎰 SAGO Slot Promo: {getSlotRewardRange(p.servingType).label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Campaign Terms */}
      <div className="section-subcard">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.75rem",
          }}
        >
          <h3 className="section-subcard__title" style={{ margin: 0 }}>
            <Calendar size={16} /> 5. Campaign Timeline & Terms
          </h3>
          <button
            type="button"
            onClick={() => onGoToStep(5)}
            className="btn-secondary"
            style={{ padding: "0.3rem 0.65rem", fontSize: "0.72rem" }}
          >
            <Edit3 size={11} /> Edit Step 5
          </button>
        </div>
        <div className="form-grid" style={{ fontSize: "0.82rem" }}>
          <div className="col-4">
            <span style={{ color: "rgba(245, 241, 232, 0.5)" }}>Campaign Start:</span>
            <div style={{ fontWeight: 600 }}>{data.campaignStartDate || "—"}</div>
          </div>
          <div className="col-4">
            <span style={{ color: "rgba(245, 241, 232, 0.5)" }}>Campaign End:</span>
            <div style={{ fontWeight: 600 }}>{data.campaignEndDate || "—"}</div>
          </div>
          <div className="col-4">
            <span style={{ color: "rgba(245, 241, 232, 0.5)" }}>Daily Redemption Cap:</span>
            <div style={{ fontWeight: 600 }}>
              {data.redemptionLimit ? `${data.redemptionLimit} redemptions/day` : "No cap"}
            </div>
          </div>
          <div className="col-12">
            <span style={{ color: "rgba(245, 241, 232, 0.5)" }}>Redemption Days & Hours:</span>
            <div style={{ fontWeight: 600 }}>{data.discountDaysHours || "All Operating Hours"}</div>
          </div>
        </div>
      </div>

      {/* 6. Signature Review */}
      <div className="section-subcard">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.75rem",
          }}
        >
          <h3 className="section-subcard__title" style={{ margin: 0 }}>
            <CheckSquare size={16} /> 9. Signatory & Execution Status
          </h3>
          <button
            type="button"
            onClick={() => onGoToStep(9)}
            className="btn-secondary"
            style={{ padding: "0.3rem 0.65rem", fontSize: "0.72rem" }}
          >
            <Edit3 size={11} /> Edit Step 9
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
          <div>
            <span style={{ color: "rgba(245, 241, 232, 0.5)", fontSize: "0.75rem" }}>
              Signatory Name:
            </span>
            <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{data.signatoryFullName}</div>
            <div style={{ color: "rgba(245, 241, 232, 0.6)", fontSize: "0.75rem" }}>
              {data.signatoryDesignation} · {data.signatoryBusinessName}
            </div>
          </div>
          {data.signatureData && (
            <div
              style={{
                background: "#080808",
                border: "1px solid rgba(176, 141, 87, 0.3)",
                borderRadius: "8px",
                padding: "0.5rem 1rem",
              }}
            >
              <img
                src={data.signatureData}
                alt="Electronic Signature"
                style={{ maxHeight: "40px", objectFit: "contain" }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Final Confirmation Lock & Submission */}
      <div
        style={{
          marginTop: "2.5rem",
          padding: "1.75rem",
          background: "rgba(18, 18, 18, 0.95)",
          border: "1.5px solid rgba(176, 141, 87, 0.35)",
          borderRadius: "14px",
        }}
      >
        <label className={`custom-checkbox-row ${confirmedAccuracy ? "is-checked" : ""}`}>
          <input
            type="checkbox"
            className="custom-checkbox-input"
            checked={confirmedAccuracy}
            onChange={(e) => setConfirmedAccuracy(e.target.checked)}
          />
          <div className="checkbox-text-content">
            <span className="checkbox-title">
              Final Submission Confirmation <span className="required-star">*</span>
            </span>
            <span className="checkbox-desc">
              I certify that I have reviewed the completed form and that all entered details and documents represent an accurate application for official SAGO Business Partnership.
            </span>
          </div>
        </label>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "1rem",
            marginTop: "1.5rem",
          }}
        >
          <button
            type="button"
            onClick={onSubmit}
            disabled={!confirmedAccuracy || !validation.isValid || isSubmitting}
            className="btn-primary"
            style={{
              padding: "0.9rem 2.2rem",
              fontSize: "0.92rem",
              boxShadow: "0 6px 25px rgba(176, 141, 87, 0.45)",
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Transmitting Application...
              </>
            ) : (
              <>
                <Lock size={16} /> Submit Official Application <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
