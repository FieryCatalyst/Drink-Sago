"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileCheck,
  FileText,
  AlertCircle,
  Trash2,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { PartnerFormData, DocumentUploadRecord } from "@/lib/partner-types";

interface Step4Props {
  data: PartnerFormData;
  errors: Record<string, string>;
  onChange: <K extends keyof PartnerFormData>(field: K, value: PartnerFormData[K]) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const REG_CERT_TYPE = "Certificate of Incorporation / Registration";
const KRA_PIN_TYPE = "KRA PIN Certificate";

export default function Step4BusinessDocuments({
  data,
  errors,
  onChange,
  onSubmit,
  isSubmitting,
}: Step4Props) {
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const regCertInputRef = useRef<HTMLInputElement>(null);
  const kraPinInputRef = useRef<HTMLInputElement>(null);

  const docs = data.documents || [];
  const regCertDoc = docs.find((d) =>
    d.documentType?.toLowerCase().includes("registration") ||
    d.documentType?.toLowerCase().includes("incorporation")
  );
  const kraPinDoc = docs.find((d) =>
    d.documentType?.toLowerCase().includes("kra") ||
    d.documentType?.toLowerCase().includes("pin")
  );

  const handleFileUpload = async (file: File, docType: string) => {
    setUploadError(null);
    setUploadingDoc(docType);

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File exceeds the 10MB limit. Please upload a smaller document.");
      setUploadingDoc(null);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("docType", docType);

      const res = await fetch("/api/partners/upload", {
        method: "POST",
        body: formData,
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error || "Upload failed. Please try again.");
      }

      const newRecord: DocumentUploadRecord = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        documentType: docType,
        documentNumber: "",
        issuingAuthority: docType === KRA_PIN_TYPE ? "Kenya Revenue Authority" : "Business Registration Service",
        issueDate: new Date().toISOString().split("T")[0],
        fileName: resData.fileName || file.name,
        fileSize: resData.fileSize || file.size,
        fileUrl: resData.fileUrl || "",
        mimeType: resData.mimeType || file.type,
        storagePath: resData.storagePath || "",
        verificationStatus: "verified",
      };

      // Filter out previous version of this docType
      const nextDocs = docs.filter((d) => {
        if (docType === REG_CERT_TYPE) {
          return !d.documentType?.toLowerCase().includes("registration") && !d.documentType?.toLowerCase().includes("incorporation");
        }
        return !d.documentType?.toLowerCase().includes("kra") && !d.documentType?.toLowerCase().includes("pin");
      });

      nextDocs.push(newRecord);
      onChange("documents", nextDocs);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Document upload failed.";
      setUploadError(msg);
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleRemoveDoc = (docType: string) => {
    const nextDocs = docs.filter((d) => {
      if (docType === REG_CERT_TYPE) {
        return !d.documentType?.toLowerCase().includes("registration") && !d.documentType?.toLowerCase().includes("incorporation");
      }
      return !d.documentType?.toLowerCase().includes("kra") && !d.documentType?.toLowerCase().includes("pin");
    });
    onChange("documents", nextDocs);
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 KB";
    const k = 1024;
    const dm = 1;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  return (
    <div className="step-content">
      <div className="step-header">
        <span className="step-header__eyebrow">Section D · Questions 24 & 25</span>
        <h2 className="step-header__title">Business Documents & Submission</h2>
        <p className="step-header__desc">
          Upload official business compliance certificates to complete your SAGO Partner verification.
        </p>
      </div>

      {uploadError && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            borderRadius: "8px",
            padding: "0.85rem 1.1rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            color: "#f87171",
            fontSize: "0.85rem",
          }}
        >
          <AlertCircle size={18} />
          <span>{uploadError}</span>
        </div>
      )}

      <div className="form-grid">
        {/* 24. Please upload your Certificate of Business Registration or Incorporation */}
        <div className="col-12 form-field">
          <label className="field-label">
            <span>
              24. Please upload your Certificate of Business Registration or Incorporation. <span className="required-star">*</span>
            </span>
          </label>

          <input
            ref={regCertInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file, REG_CERT_TYPE);
              e.target.value = "";
            }}
          />

          {regCertDoc ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(18, 18, 18, 0.8)",
                border: "1.5px solid rgba(176, 141, 87, 0.4)",
                borderRadius: "10px",
                padding: "1rem 1.25rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "8px",
                    background: "rgba(176, 141, 87, 0.15)",
                    display: "grid",
                    placeItems: "center",
                    color: "#b08d57",
                  }}
                >
                  <FileCheck size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 500, color: "#f5f1e8", fontSize: "0.9rem" }}>
                    {regCertDoc.fileName}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "rgba(245, 241, 232, 0.5)", marginTop: "2px" }}>
                    {formatFileSize(regCertDoc.fileSize)} · Uploaded & Ready
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveDoc(REG_CERT_TYPE)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#ef4444",
                  cursor: "pointer",
                  padding: "6px",
                  display: "grid",
                  placeItems: "center",
                }}
                title="Remove document"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => regCertInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleFileUpload(file, REG_CERT_TYPE);
              }}
              style={{
                border: `2px dashed ${errors.regCertificate ? "#ef4444" : "rgba(176, 141, 87, 0.35)"}`,
                borderRadius: "10px",
                padding: "2rem 1.5rem",
                textAlign: "center",
                cursor: "pointer",
                background: "rgba(18, 18, 18, 0.4)",
                transition: "all 0.25s ease",
              }}
            >
              {uploadingDoc === REG_CERT_TYPE ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem" }}>
                  <Loader2 size={28} className="animate-spin" color="#b08d57" />
                  <span style={{ fontSize: "0.85rem", color: "#b08d57" }}>Uploading Certificate...</span>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                  <UploadCloud size={32} color="#b08d57" />
                  <div style={{ fontSize: "0.92rem", color: "#f5f1e8", fontWeight: 500 }}>
                    Click to browse or drag & drop Certificate
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "rgba(245, 241, 232, 0.5)" }}>
                    Supported formats: PDF, PNG, JPG (Max 10MB)
                  </div>
                </div>
              )}
            </div>
          )}
          {errors.regCertificate && (
            <span className="field-error-msg">{errors.regCertificate}</span>
          )}
        </div>

        {/* 25. Please upload your KRA PIN Certificate for the business */}
        <div className="col-12 form-field" style={{ marginTop: "1rem" }}>
          <label className="field-label">
            <span>
              25. Please upload your KRA PIN Certificate for the business. <span className="required-star">*</span>
            </span>
          </label>

          <input
            ref={kraPinInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file, KRA_PIN_TYPE);
              e.target.value = "";
            }}
          />

          {kraPinDoc ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(18, 18, 18, 0.8)",
                border: "1.5px solid rgba(176, 141, 87, 0.4)",
                borderRadius: "10px",
                padding: "1rem 1.25rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "8px",
                    background: "rgba(176, 141, 87, 0.15)",
                    display: "grid",
                    placeItems: "center",
                    color: "#b08d57",
                  }}
                >
                  <FileCheck size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 500, color: "#f5f1e8", fontSize: "0.9rem" }}>
                    {kraPinDoc.fileName}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "rgba(245, 241, 232, 0.5)", marginTop: "2px" }}>
                    {formatFileSize(kraPinDoc.fileSize)} · Uploaded & Ready
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveDoc(KRA_PIN_TYPE)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#ef4444",
                  cursor: "pointer",
                  padding: "6px",
                  display: "grid",
                  placeItems: "center",
                }}
                title="Remove document"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => kraPinInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleFileUpload(file, KRA_PIN_TYPE);
              }}
              style={{
                border: `2px dashed ${errors.kraPinCertificate ? "#ef4444" : "rgba(176, 141, 87, 0.35)"}`,
                borderRadius: "10px",
                padding: "2rem 1.5rem",
                textAlign: "center",
                cursor: "pointer",
                background: "rgba(18, 18, 18, 0.4)",
                transition: "all 0.25s ease",
              }}
            >
              {uploadingDoc === KRA_PIN_TYPE ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem" }}>
                  <Loader2 size={28} className="animate-spin" color="#b08d57" />
                  <span style={{ fontSize: "0.85rem", color: "#b08d57" }}>Uploading KRA PIN Certificate...</span>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                  <UploadCloud size={32} color="#b08d57" />
                  <div style={{ fontSize: "0.92rem", color: "#f5f1e8", fontWeight: 500 }}>
                    Click to browse or drag & drop KRA PIN Certificate
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "rgba(245, 241, 232, 0.5)" }}>
                    Supported formats: PDF, PNG, JPG (Max 10MB)
                  </div>
                </div>
              )}
            </div>
          )}
          {errors.kraPinCertificate && (
            <span className="field-error-msg">{errors.kraPinCertificate}</span>
          )}
        </div>
      </div>

      {/* Verification Notice */}
      <div
        style={{
          marginTop: "2rem",
          background: "rgba(176, 141, 87, 0.08)",
          border: "1px solid rgba(176, 141, 87, 0.25)",
          borderRadius: "10px",
          padding: "1.2rem 1.4rem",
          display: "flex",
          alignItems: "flex-start",
          gap: "0.85rem",
        }}
      >
        <ShieldCheck size={22} color="#b08d57" style={{ flexShrink: 0, marginTop: "2px" }} />
        <div style={{ fontSize: "0.82rem", color: "rgba(245, 241, 232, 0.8)", lineHeight: 1.5 }}>
          <strong style={{ color: "#f5f1e8", display: "block", marginBottom: "0.2rem" }}>
            Official SAGO Whisky Partner Verification
          </strong>
          By submitting this application, you confirm that all provided business information and uploaded compliance documents are true, accurate, and authorized by the business manager.
        </div>
      </div>

    </div>
  );
}
