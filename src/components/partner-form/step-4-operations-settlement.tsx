"use client";

import React, { useState } from "react";
import { QrCode, CreditCard, Upload, CheckCircle2, FileText, Trash2, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { PartnerFormData, DocumentUploadRecord } from "@/lib/partner-types";
import { REDEMPTION_METHODS, PAN_AFRICAN_BANKS } from "@/lib/kenya-data";

interface Step4Props {
  data: PartnerFormData;
  errors: Record<string, string>;
  onChange: <K extends keyof PartnerFormData>(field: K, value: PartnerFormData[K]) => void;
}

export default function Step4OperationsSettlement({ data, errors, onChange }: Step4Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("docType", "Optional Venue Menu or Licence");

    try {
      const res = await fetch("/api/partners/upload", {
        method: "POST",
        body: formData,
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Upload failed.");
      }

      const newDoc: DocumentUploadRecord = {
        id: crypto.randomUUID(),
        documentType: "Optional Venue Document",
        documentNumber: "",
        issuingAuthority: "",
        issueDate: new Date().toISOString().split("T")[0],
        fileName: resData.file.fileName,
        fileSize: resData.file.fileSize,
        fileUrl: resData.file.fileUrl,
        storagePath: resData.file.storagePath || resData.file.fileUrl,
        mimeType: resData.file.mimeType,
        verificationStatus: "pending",
      };

      onChange("documents", [...(data.documents || []), newDoc]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload document.";
      setUploadError(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveDoc = (id: string) => {
    const updated = (data.documents || []).filter((d) => d.id !== id);
    onChange("documents", updated);
  };

  return (
    <div className="step-content">
      <div className="step-header">
        <span className="step-header__eyebrow">Step 4 of 5</span>
        <h2 className="step-header__title">Venue Operations & Payout Setup</h2>
        <p className="step-header__desc">
          Configure how your bar staff will redeem customer promotional vouchers, choose your payout arrangement, and optionally attach a menu or licence.
        </p>
      </div>

      {/* ── Section A: Voucher Redemption Preference ── */}
      <div className="section-subcard" style={{ marginTop: 0 }}>
        <h3 className="section-subcard__title">
          <QrCode size={18} /> Digital Coupon Redemption
        </h3>
        <p className="section-subcard__desc">
          How will your bartenders and staff validate customer SAGO coupons at the table or counter?
        </p>

        <div className="form-grid">
          <div className="col-6 form-field">
            <label className="field-label" htmlFor="redemptionMethod">
              <span>Preferred Redemption Method</span>
            </label>
            <select
              id="redemptionMethod"
              className="form-select"
              value={data.redemptionMethod || "Both Methods"}
              onChange={(e) => onChange("redemptionMethod", e.target.value)}
            >
              {REDEMPTION_METHODS.map((rm) => (
                <option key={rm} value={rm}>
                  {rm}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6 form-field">
            <label className="field-label" htmlFor="outletDisplayName">
              <span>Portal Display Name</span>
            </label>
            <input
              id="outletDisplayName"
              type="text"
              className="form-input"
              placeholder="e.g., The Velvet Oak Lounge - Main Bar"
              value={data.outletDisplayName || data.tradingName || ""}
              onChange={(e) => onChange("outletDisplayName", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Section B: Settlement & Payout Model ── */}
      <div className="section-subcard">
        <h3 className="section-subcard__title">
          <CreditCard size={18} /> Settlement & Payout Arrangement
        </h3>
        <p className="section-subcard__desc">
          Most promotional partners do not require cash reimbursements because customers pay the discounted bill directly at your venue.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginBottom: "1.25rem" }}>
          {/* Option 1: Standard Promotional */}
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.85rem",
              padding: "1rem",
              borderRadius: "10px",
              border: `1.5px solid ${!data.requiresSettlement ? "#b08d57" : "rgba(255, 255, 255, 0.1)"}`,
              background: !data.requiresSettlement ? "rgba(176, 141, 87, 0.08)" : "transparent",
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="requiresSettlement"
              checked={!data.requiresSettlement}
              onChange={() => {
                onChange("requiresSettlement", false);
                onChange("settlementArrangement", "No Payment or Reimbursement Required");
              }}
              style={{ marginTop: "0.2rem", accentColor: "#b08d57" }}
            />
            <div>
              <strong style={{ color: "#f5f1e8", display: "block", marginBottom: "0.2rem" }}>
                Standard Promotional Partner (Recommended)
              </strong>
              <span style={{ fontSize: "0.82rem", color: "rgba(245, 241, 232, 0.7)", lineHeight: 1.5, display: "block" }}>
                No bank reimbursement required. Customers receive the promotional price on their bill, driving higher footfall and bottle orders to your venue.
              </span>
            </div>
          </label>

          {/* Option 2: Reimbursement Required */}
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.85rem",
              padding: "1rem",
              borderRadius: "10px",
              border: `1.5px solid ${data.requiresSettlement ? "#b08d57" : "rgba(255, 255, 255, 0.1)"}`,
              background: data.requiresSettlement ? "rgba(176, 141, 87, 0.08)" : "transparent",
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="requiresSettlement"
              checked={data.requiresSettlement === true}
              onChange={() => {
                onChange("requiresSettlement", true);
                onChange("settlementArrangement", "Discount Reimbursement Arrangement");
              }}
              style={{ marginTop: "0.2rem", accentColor: "#b08d57" }}
            />
            <div>
              <strong style={{ color: "#f5f1e8", display: "block", marginBottom: "0.2rem" }}>
                Reimbursement / Commission Arrangement
              </strong>
              <span style={{ fontSize: "0.82rem", color: "rgba(245, 241, 232, 0.7)", lineHeight: 1.5, display: "block" }}>
                Provide bank account or Mobile Money (M-Pesa) details for agreed settlement disbursements.
              </span>
            </div>
          </label>
        </div>

        {/* If Reimbursement is chosen, show account details */}
        {data.requiresSettlement && (
          <div className="form-grid" style={{ paddingTop: "0.5rem" }}>
            <div className="col-6 form-field">
              <label className="field-label" htmlFor="settlementBankName">
                <span>Bank or Mobile Money Provider <span className="required-star">*</span></span>
              </label>
              <select
                id="settlementBankName"
                className={`form-select ${errors.settlementBankName ? "has-error" : ""}`}
                value={data.settlementBankName}
                onChange={(e) => onChange("settlementBankName", e.target.value)}
              >
                <option value="">-- Select Bank or Network --</option>
                {PAN_AFRICAN_BANKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              {errors.settlementBankName && (
                <span className="field-error-msg">{errors.settlementBankName}</span>
              )}
            </div>

            <div className="col-6 form-field">
              <label className="field-label" htmlFor="settlementAccountName">
                <span>Account Name / Business Name <span className="required-star">*</span></span>
              </label>
              <input
                id="settlementAccountName"
                type="text"
                className={`form-input ${errors.settlementAccountName ? "has-error" : ""}`}
                placeholder="e.g., The Velvet Oak Lounge Ltd"
                value={data.settlementAccountName}
                onChange={(e) => onChange("settlementAccountName", e.target.value)}
              />
              {errors.settlementAccountName && (
                <span className="field-error-msg">{errors.settlementAccountName}</span>
              )}
            </div>

            <div className="col-6 form-field">
              <label className="field-label" htmlFor="settlementAccountNumber">
                <span>Account Number / Paybill / Till Number <span className="required-star">*</span></span>
              </label>
              <input
                id="settlementAccountNumber"
                type="text"
                className={`form-input ${errors.settlementAccountNumber ? "has-error" : ""}`}
                placeholder="e.g., 011092837465 or Till 987654"
                value={data.settlementAccountNumber}
                onChange={(e) => onChange("settlementAccountNumber", e.target.value)}
              />
              {errors.settlementAccountNumber && (
                <span className="field-error-msg">{errors.settlementAccountNumber}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Section C: Optional Attachments (NOT COMPULSORY) ── */}
      <div className="section-subcard">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <h3 className="section-subcard__title">
              <Upload size={18} /> Supporting Documents & Photos
            </h3>
            <p className="section-subcard__desc">
              Have a cocktail menu, bar photo, liquor licence, or registration certificate handy? Attach it here, or skip completely.
            </p>
          </div>
          <span
            style={{
              background: "rgba(176, 141, 87, 0.15)",
              border: "1px solid rgba(176, 141, 87, 0.35)",
              color: "#d4af37",
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              padding: "0.3rem 0.75rem",
              borderRadius: "999px",
              textTransform: "uppercase",
            }}
          >
            100% Optional
          </span>
        </div>

        {uploadError && (
          <div style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "1rem" }}>
            {uploadError}
          </div>
        )}

        {/* Upload Drop Zone */}
        <div
          style={{
            border: "2px dashed rgba(176, 141, 87, 0.3)",
            borderRadius: "12px",
            padding: "1.75rem 1rem",
            textAlign: "center",
            background: "rgba(0, 0, 0, 0.2)",
            marginTop: "1rem",
          }}
        >
          <input
            type="file"
            id="optional-file-upload"
            style={{ display: "none" }}
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />
          <label
            htmlFor="optional-file-upload"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(176, 141, 87, 0.2)",
              border: "1px solid rgba(176, 141, 87, 0.4)",
              color: "#f5f1e8",
              padding: "0.6rem 1.25rem",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="spin" /> Uploading file...
              </>
            ) : (
              <>
                <Upload size={16} /> Choose File (PDF, PNG, JPG)
              </>
            )}
          </label>
          <p style={{ margin: "0.6rem 0 0", fontSize: "0.78rem", color: "rgba(245, 241, 232, 0.55)" }}>
            Max file size: 10MB. You can also skip this and provide documents during official verification.
          </p>
        </div>

        {/* Attached Files List */}
        {(data.documents || []).length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1rem" }}>
            {data.documents.map((doc) => (
              <div
                key={doc.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(176, 141, 87, 0.2)",
                  borderRadius: "8px",
                  padding: "0.6rem 1rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <FileText size={16} color="#b08d57" />
                  <span style={{ fontSize: "0.85rem", color: "#f5f1e8" }}>{doc.fileName || doc.documentType}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveDoc(doc.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(245, 241, 232, 0.5)",
                    cursor: "pointer",
                    padding: "0.2rem",
                  }}
                  title="Remove document"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
