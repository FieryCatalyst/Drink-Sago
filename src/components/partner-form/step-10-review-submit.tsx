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
  Sparkles,
} from "lucide-react";
import { PartnerFormData } from "@/lib/partner-types";
import { validateFullApplication, getSlotRewardRange } from "@/lib/partner-validation";

interface Step10Props {
  data: PartnerFormData;
  onGoToStep: (stepNumber: number) => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
}

const STEP_TITLES: Record<number, string> = {
  1: "1. Business Identity & Location",
  2: "2. Owner & Authorized Representative",
  3: "3. Verification Documents & Licences",
  4: "4. Participating Products & Pricing",
  5: "5. Campaign Timeline & Terms",
  6: "6. Venue Redemption Setup & SOPs",
  7: "7. Payment Details & Settlement",
  8: "8. Marketing & POS Collateral",
  9: "9. Declarations & Electronic Signature",
};

export default function Step10ReviewSubmit({
  data,
  onGoToStep,
  onSubmit,
  isSubmitting,
}: Step10Props) {
  const [confirmedAccuracy, setConfirmedAccuracy] = useState(false);
  const validation = validateFullApplication(data);
  const selectedProducts = (data.products || []).filter((p) => p.selected);

  const incompleteStepNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(
    (n) => validation.stepErrors[n] && Object.keys(validation.stepErrors[n]).length > 0
  );
  const completedStepsCount = 9 - incompleteStepNumbers.length;
  const progressPercent = Math.round((completedStepsCount / 9) * 100);

  return (
    <div className="step-content">
      <div className="step-header">
        <span className="step-header__eyebrow">Step 10 of 10</span>
        <h2 className="step-header__title">Review Application & Final Submission</h2>
        <p className="step-header__desc">
          Verify all information, attached licences, and proposed campaign terms before transmitting your official application to SAGO.
        </p>
      </div>

      {/* ── Interactive Readiness & Missing Requirements Tracker ── */}
      {!validation.isValid ? (
        <div className="readiness-dashboard is-incomplete">
          <div className="readiness-dashboard__header">
            <div>
              <div className="readiness-dashboard__title-wrap">
                <AlertTriangle size={22} color="#ef5350" />
                <h3 className="readiness-dashboard__title" style={{ color: "#ffcdd2" }}>
                  Application Incomplete · {completedStepsCount} of 9 Sections Complete ({progressPercent}%)
                </h3>
              </div>
              <p className="readiness-dashboard__desc">
                <strong>Caution:</strong> The application will not be submitted unless all required fields and documents are filled.
                Review what is missing below. You can jump directly into each page, complete or upload items, save your edits, and return here to verify the next section.
              </p>
            </div>
            <span className="readiness-chip is-incomplete">
              {incompleteStepNumbers.length} Section{incompleteStepNumbers.length > 1 ? "s" : ""} Remaining
            </span>
          </div>

          <div className="readiness-progress-bar">
            <div
              className="readiness-progress-fill fill-incomplete"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="readiness-steps-grid">
            {incompleteStepNumbers.map((stepNum) => {
              const errs = validation.stepErrors[stepNum] || {};
              const errCount = Object.keys(errs).length;
              return (
                <div key={stepNum} className="readiness-step-card is-incomplete">
                  <div>
                    <div className="readiness-step-card__top">
                      <span className="readiness-step-card__name">
                        {STEP_TITLES[stepNum]}
                      </span>
                      <span className="readiness-chip is-incomplete">
                        {errCount} Missing
                      </span>
                    </div>

                    <ul className="readiness-missing-list" style={{ marginTop: "0.75rem" }}>
                      {Object.entries(errs).map(([key, msg]) => (
                        <li key={key}>
                          <span className="dot">•</span>
                          <span>{msg}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => onGoToStep(stepNum)}
                    className="btn-jump-fix"
                  >
                    <Edit3 size={13} /> Jump to Step {stepNum} to Complete ➔
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="readiness-dashboard is-complete">
          <div className="readiness-dashboard__header">
            <div>
              <div className="readiness-dashboard__title-wrap">
                <CheckCircle2 size={24} color="#81c784" />
                <h3 className="readiness-dashboard__title" style={{ color: "#c8e6c9" }}>
                  All 9 Sections Complete (100% Ready)
                </h3>
              </div>
              <p className="readiness-dashboard__desc" style={{ color: "rgba(245, 241, 232, 0.85)" }}>
                Every required detail and verification document has been filled and confirmed. You may now certify the submission below to transmit your official SAGO partner application.
              </p>
            </div>
            <span className="readiness-chip is-complete">Ready to Submit</span>
          </div>
          <div className="readiness-progress-bar">
            <div
              className="readiness-progress-fill fill-complete"
              style={{ width: "100%" }}
            />
          </div>
        </div>
      )}

      {/* ── Summary Accordions / Sections ── */}

      {/* 1. Business Info */}
      {(() => {
        const stepErrs = validation.stepErrors[1] ? Object.values(validation.stepErrors[1]) : [];
        const isComplete = stepErrs.length === 0;
        return (
          <div className="section-subcard" style={{ marginTop: 0 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.75rem",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <h3 className="section-subcard__title" style={{ margin: 0 }}>
                <Building size={16} /> 1. Business Identity & Location
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span className={`readiness-chip ${isComplete ? "is-complete" : "is-incomplete"}`}>
                  {isComplete ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                  {isComplete ? "Complete" : `${stepErrs.length} Missing`}
                </span>
                <button
                  type="button"
                  onClick={() => onGoToStep(1)}
                  className="btn-secondary"
                  style={{ padding: "0.3rem 0.65rem", fontSize: "0.72rem" }}
                >
                  <Edit3 size={11} /> {isComplete ? "Edit Step 1" : "Complete Step 1 ➔"}
                </button>
              </div>
            </div>

            {!isComplete && (
              <div className="section-missing-alert">
                <div className="section-missing-alert__title">
                  <AlertTriangle size={13} color="#ef5350" />
                  <span>Missing required fields in Step 1:</span>
                </div>
                <ul className="section-missing-alert__list">
                  {stepErrs.map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              </div>
            )}

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
                  {data.townCity ? `${data.townCity}, ` : ""}{data.county ? `${data.county} ` : ""}({data.country || "Kenya"})
                </div>
              </div>
              <div className="col-4">
                <span style={{ color: "rgba(245, 241, 232, 0.5)" }}>Outlets Count:</span>
                <div style={{ fontWeight: 600 }}>{data.numberOfOutlets || 1} Outlet(s)</div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 2. Owner & Contact */}
      {(() => {
        const stepErrs = validation.stepErrors[2] ? Object.values(validation.stepErrors[2]) : [];
        const isComplete = stepErrs.length === 0;
        return (
          <div className="section-subcard">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.75rem",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <h3 className="section-subcard__title" style={{ margin: 0 }}>
                <User size={16} /> 2. Owner & Authorized Representative
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span className={`readiness-chip ${isComplete ? "is-complete" : "is-incomplete"}`}>
                  {isComplete ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                  {isComplete ? "Complete" : `${stepErrs.length} Missing`}
                </span>
                <button
                  type="button"
                  onClick={() => onGoToStep(2)}
                  className="btn-secondary"
                  style={{ padding: "0.3rem 0.65rem", fontSize: "0.72rem" }}
                >
                  <Edit3 size={11} /> {isComplete ? "Edit Step 2" : "Complete Step 2 ➔"}
                </button>
              </div>
            </div>

            {!isComplete && (
              <div className="section-missing-alert">
                <div className="section-missing-alert__title">
                  <AlertTriangle size={13} color="#ef5350" />
                  <span>Missing required fields in Step 2:</span>
                </div>
                <ul className="section-missing-alert__list">
                  {stepErrs.map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="form-grid" style={{ fontSize: "0.82rem" }}>
              <div className="col-6">
                <span style={{ color: "rgba(245, 241, 232, 0.5)" }}>Business Owner:</span>
                <div style={{ fontWeight: 600 }}>
                  {data.ownerFullName || "—"} {data.ownerPosition ? `(${data.ownerPosition})` : ""}
                </div>
                <div style={{ color: "rgba(245, 241, 232, 0.7)", fontSize: "0.78rem" }}>
                  {data.ownerEmail || "No email"} · {data.ownerPhone || "No phone"}
                </div>
              </div>
              <div className="col-6">
                <span style={{ color: "rgba(245, 241, 232, 0.5)" }}>Authorized Representative:</span>
                <div style={{ fontWeight: 600 }}>
                  {data.authContactName || "Same as owner"} {data.authContactTitle ? `(${data.authContactTitle})` : ""}
                </div>
                <div style={{ color: "rgba(245, 241, 232, 0.7)", fontSize: "0.78rem" }}>
                  {data.authContactEmail || "—"} · {data.authContactPhone || "—"}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 3. Verification Documents */}
      {(() => {
        const stepErrs = validation.stepErrors[3] ? Object.values(validation.stepErrors[3]) : [];
        const isComplete = stepErrs.length === 0;
        return (
          <div className="section-subcard">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.75rem",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <h3 className="section-subcard__title" style={{ margin: 0 }}>
                <FileText size={16} /> 3. Verification Documents & Licences ({(data.documents || []).length})
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span className={`readiness-chip ${isComplete ? "is-complete" : "is-incomplete"}`}>
                  {isComplete ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                  {isComplete ? "Complete" : `${stepErrs.length} Missing`}
                </span>
                <button
                  type="button"
                  onClick={() => onGoToStep(3)}
                  className="btn-secondary"
                  style={{ padding: "0.3rem 0.65rem", fontSize: "0.72rem" }}
                >
                  <Edit3 size={11} /> {isComplete ? "Edit Step 3" : "Upload Documents ➔"}
                </button>
              </div>
            </div>

            {!isComplete && (
              <div className="section-missing-alert">
                <div className="section-missing-alert__title">
                  <AlertTriangle size={13} color="#ef5350" />
                  <span>Mandatory licences or verification documents to attach:</span>
                </div>
                <ul className="section-missing-alert__list">
                  {stepErrs.map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {(data.documents || []).length === 0 ? (
                <span style={{ color: "rgba(245, 241, 232, 0.5)", fontSize: "0.82rem" }}>
                  No documents attached yet. Click above to upload mandatory certificates.
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
        );
      })()}

      {/* 4. Products & Offers */}
      {(() => {
        const stepErrs = validation.stepErrors[4] ? Object.values(validation.stepErrors[4]) : [];
        const isComplete = stepErrs.length === 0;
        return (
          <div className="section-subcard">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.75rem",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <h3 className="section-subcard__title" style={{ margin: 0 }}>
                <Wine size={16} /> 4. Participating Products & Pricing ({selectedProducts.length})
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span className={`readiness-chip ${isComplete ? "is-complete" : "is-incomplete"}`}>
                  {isComplete ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                  {isComplete ? "Complete" : `${stepErrs.length} Missing`}
                </span>
                <button
                  type="button"
                  onClick={() => onGoToStep(4)}
                  className="btn-secondary"
                  style={{ padding: "0.3rem 0.65rem", fontSize: "0.72rem" }}
                >
                  <Edit3 size={11} /> {isComplete ? "Edit Step 4" : "Configure Products ➔"}
                </button>
              </div>
            </div>

            {!isComplete && (
              <div className="section-missing-alert">
                <div className="section-missing-alert__title">
                  <AlertTriangle size={13} color="#ef5350" />
                  <span>Missing required product selections:</span>
                </div>
                <ul className="section-missing-alert__list">
                  {stepErrs.map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {selectedProducts.length === 0 ? (
                <span style={{ color: "rgba(245, 241, 232, 0.5)", fontSize: "0.82rem" }}>
                  No participating SAGO bottles or pours selected.
                </span>
              ) : (
                selectedProducts.map((p) => (
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
                ))
              )}
            </div>
          </div>
        );
      })()}

      {/* 5. Campaign Terms */}
      {(() => {
        const stepErrs = validation.stepErrors[5] ? Object.values(validation.stepErrors[5]) : [];
        const isComplete = stepErrs.length === 0;
        return (
          <div className="section-subcard">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.75rem",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <h3 className="section-subcard__title" style={{ margin: 0 }}>
                <Calendar size={16} /> 5. Campaign Timeline & Terms
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span className={`readiness-chip ${isComplete ? "is-complete" : "is-incomplete"}`}>
                  {isComplete ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                  {isComplete ? "Complete" : `${stepErrs.length} Missing`}
                </span>
                <button
                  type="button"
                  onClick={() => onGoToStep(5)}
                  className="btn-secondary"
                  style={{ padding: "0.3rem 0.65rem", fontSize: "0.72rem" }}
                >
                  <Edit3 size={11} /> {isComplete ? "Edit Step 5" : "Complete Step 5 ➔"}
                </button>
              </div>
            </div>

            {!isComplete && (
              <div className="section-missing-alert">
                <div className="section-missing-alert__title">
                  <AlertTriangle size={13} color="#ef5350" />
                  <span>Missing required campaign dates:</span>
                </div>
                <ul className="section-missing-alert__list">
                  {stepErrs.map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              </div>
            )}

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
        );
      })()}

      {/* 6. Venue Redemption Setup */}
      {(() => {
        const stepErrs = validation.stepErrors[6] ? Object.values(validation.stepErrors[6]) : [];
        const isComplete = stepErrs.length === 0;
        return (
          <div className="section-subcard">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.75rem",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <h3 className="section-subcard__title" style={{ margin: 0 }}>
                <QrCode size={16} /> 6. Venue Redemption Setup & SOPs
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span className={`readiness-chip ${isComplete ? "is-complete" : "is-incomplete"}`}>
                  {isComplete ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                  {isComplete ? "Complete" : `${stepErrs.length} Missing`}
                </span>
                <button
                  type="button"
                  onClick={() => onGoToStep(6)}
                  className="btn-secondary"
                  style={{ padding: "0.3rem 0.65rem", fontSize: "0.72rem" }}
                >
                  <Edit3 size={11} /> {isComplete ? "Edit Step 6" : "Complete Step 6 ➔"}
                </button>
              </div>
            </div>

            {!isComplete && (
              <div className="section-missing-alert">
                <div className="section-missing-alert__title">
                  <AlertTriangle size={13} color="#ef5350" />
                  <span>Missing redemption setup requirements:</span>
                </div>
                <ul className="section-missing-alert__list">
                  {stepErrs.map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="form-grid" style={{ fontSize: "0.82rem" }}>
              <div className="col-4">
                <span style={{ color: "rgba(245, 241, 232, 0.5)" }}>Outlet Display Name:</span>
                <div style={{ fontWeight: 600 }}>{data.outletDisplayName || data.tradingName || "—"}</div>
              </div>
              <div className="col-4">
                <span style={{ color: "rgba(245, 241, 232, 0.5)" }}>Redemption Method:</span>
                <div style={{ fontWeight: 600 }}>{data.redemptionMethod || "—"}</div>
              </div>
              <div className="col-4">
                <span style={{ color: "rgba(245, 241, 232, 0.5)" }}>Staff Access Count:</span>
                <div style={{ fontWeight: 600 }}>{data.staffAccessCount || 1} staff member(s)</div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 7. Payment Settlement */}
      {(() => {
        const stepErrs = validation.stepErrors[7] ? Object.values(validation.stepErrors[7]) : [];
        const isComplete = stepErrs.length === 0;
        return (
          <div className="section-subcard">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.75rem",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <h3 className="section-subcard__title" style={{ margin: 0 }}>
                <CreditCard size={16} /> 7. Payment Details & Settlement
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span className={`readiness-chip ${isComplete ? "is-complete" : "is-incomplete"}`}>
                  {isComplete ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                  {isComplete ? "Complete" : `${stepErrs.length} Missing`}
                </span>
                <button
                  type="button"
                  onClick={() => onGoToStep(7)}
                  className="btn-secondary"
                  style={{ padding: "0.3rem 0.65rem", fontSize: "0.72rem" }}
                >
                  <Edit3 size={11} /> {isComplete ? "Edit Step 7" : "Complete Step 7 ➔"}
                </button>
              </div>
            </div>

            {!isComplete && (
              <div className="section-missing-alert">
                <div className="section-missing-alert__title">
                  <AlertTriangle size={13} color="#ef5350" />
                  <span>Missing payment settlement fields:</span>
                </div>
                <ul className="section-missing-alert__list">
                  {stepErrs.map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="form-grid" style={{ fontSize: "0.82rem" }}>
              <div className="col-4">
                <span style={{ color: "rgba(245, 241, 232, 0.5)" }}>Weekly Reimbursement:</span>
                <div style={{ fontWeight: 600 }}>{data.requiresSettlement ? "Yes (Requested)" : "Direct Commercial Reconciliation"}</div>
              </div>
              <div className="col-4">
                <span style={{ color: "rgba(245, 241, 232, 0.5)" }}>Bank / Provider:</span>
                <div style={{ fontWeight: 600 }}>{data.settlementBankName || "—"}</div>
              </div>
              <div className="col-4">
                <span style={{ color: "rgba(245, 241, 232, 0.5)" }}>Account / Paybill:</span>
                <div style={{ fontWeight: 600 }}>{data.settlementAccountNumber || "—"}</div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 8. Marketing Permissions */}
      {(() => {
        const stepErrs = validation.stepErrors[8] ? Object.values(validation.stepErrors[8]) : [];
        const isComplete = stepErrs.length === 0;
        return (
          <div className="section-subcard">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.75rem",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <h3 className="section-subcard__title" style={{ margin: 0 }}>
                <Megaphone size={16} /> 8. Marketing & POS Collateral
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span className={`readiness-chip ${isComplete ? "is-complete" : "is-incomplete"}`}>
                  {isComplete ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                  {isComplete ? "Complete" : `${stepErrs.length} Missing`}
                </span>
                <button
                  type="button"
                  onClick={() => onGoToStep(8)}
                  className="btn-secondary"
                  style={{ padding: "0.3rem 0.65rem", fontSize: "0.72rem" }}
                >
                  <Edit3 size={11} /> {isComplete ? "Edit Step 8" : "Complete Step 8 ➔"}
                </button>
              </div>
            </div>

            {!isComplete && (
              <div className="section-missing-alert">
                <div className="section-missing-alert__title">
                  <AlertTriangle size={13} color="#ef5350" />
                  <span>Missing required marketing permissions:</span>
                </div>
                <ul className="section-missing-alert__list">
                  {stepErrs.map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="form-grid" style={{ fontSize: "0.82rem" }}>
              <div className="col-6">
                <span style={{ color: "rgba(245, 241, 232, 0.5)" }}>In-Venue POS Materials:</span>
                <div style={{ fontWeight: 600 }}>
                  {data.permDisplayPromoMaterials ? "Approved for In-Venue Display" : "Self-Supplied / On-Request"}
                </div>
              </div>
              <div className="col-6">
                <span style={{ color: "rgba(245, 241, 232, 0.5)" }}>Social & Digital Promotion:</span>
                <div style={{ fontWeight: 600 }}>
                  {data.permSocialChannels ? `Permitted ${data.marketingSocialHandles ? `(${data.marketingSocialHandles})` : ""}` : "Internal App Only"}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 9. Signatory & Execution Status */}
      {(() => {
        const stepErrs = validation.stepErrors[9] ? Object.values(validation.stepErrors[9]) : [];
        const isComplete = stepErrs.length === 0;
        return (
          <div className="section-subcard">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.75rem",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <h3 className="section-subcard__title" style={{ margin: 0 }}>
                <CheckSquare size={16} /> 9. Declarations & Electronic Signature
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span className={`readiness-chip ${isComplete ? "is-complete" : "is-incomplete"}`}>
                  {isComplete ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                  {isComplete ? "Complete" : `${stepErrs.length} Missing`}
                </span>
                <button
                  type="button"
                  onClick={() => onGoToStep(9)}
                  className="btn-secondary"
                  style={{ padding: "0.3rem 0.65rem", fontSize: "0.72rem" }}
                >
                  <Edit3 size={11} /> {isComplete ? "Edit Step 9" : "Sign & Complete ➔"}
                </button>
              </div>
            </div>

            {!isComplete && (
              <div className="section-missing-alert">
                <div className="section-missing-alert__title">
                  <AlertTriangle size={13} color="#ef5350" />
                  <span>Missing declarations or authorized signature:</span>
                </div>
                <ul className="section-missing-alert__list">
                  {stepErrs.map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
              <div>
                <span style={{ color: "rgba(245, 241, 232, 0.5)", fontSize: "0.75rem" }}>
                  Signatory Name:
                </span>
                <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{data.signatoryFullName || "—"}</div>
                <div style={{ color: "rgba(245, 241, 232, 0.6)", fontSize: "0.75rem" }}>
                  {data.signatoryDesignation || "—"} · {data.signatoryBusinessName || data.registeredBusinessName || "—"}
                </div>
              </div>
              {data.signatureData ? (
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
              ) : (
                <span style={{ color: "rgba(245, 241, 232, 0.45)", fontSize: "0.78rem" }}>
                  (Signature pending execution)
                </span>
              )}
            </div>
          </div>
        );
      })()}

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

        {!validation.isValid && (
          <div
            style={{
              marginTop: "1.25rem",
              padding: "0.85rem 1rem",
              background: "rgba(111, 20, 30, 0.25)",
              border: "1px solid rgba(239, 83, 80, 0.35)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              fontSize: "0.82rem",
              color: "#ffcdd2",
            }}
          >
            <AlertTriangle size={16} color="#ef5350" style={{ flexShrink: 0 }} />
            <span>
              <strong>Submission Locked:</strong> All required fields across the 9 sections must be completed before transmission. Please use the checklist above to resolve missing items.
            </span>
          </div>
        )}

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
