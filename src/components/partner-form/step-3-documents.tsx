"use client";

import React, { useState } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, Trash2, Eye, ShieldCheck, Loader2 } from "lucide-react";
import { PartnerFormData, DocumentUploadRecord } from "@/lib/partner-types";
import { DOCUMENT_TYPES } from "@/lib/kenya-data";

interface Step3Props {
  data: PartnerFormData;
  errors: Record<string, string>;
  onChange: <K extends keyof PartnerFormData>(field: K, value: PartnerFormData[K]) => void;
}

export default function Step3Documents({ data, errors, onChange }: Step3Props) {
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const getDoc = (type: string): DocumentUploadRecord | undefined => {
    return (data.documents || []).find((d) => d.documentType === type);
  };

  const updateDoc = (type: string, updates: Partial<DocumentUploadRecord>) => {
    const docs = [...(data.documents || [])];
    const index = docs.findIndex((d) => d.documentType === type);

    if (index >= 0) {
      docs[index] = { ...docs[index], ...updates };
    } else {
      docs.push({
        id: crypto.randomUUID(),
        documentType: type,
        documentNumber: "",
        issuingAuthority: "",
        issueDate: "",
        fileName: "",
        fileSize: 0,
        fileUrl: "",
        mimeType: "",
        verificationStatus: "pending",
        ...updates,
      });
    }

    onChange("documents", docs);
  };

  const handleFileUpload = async (type: string, file: File) => {
    setUploadingType(type);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("docType", type);

    try {
      const res = await fetch("/api/partners/upload", {
        method: "POST",
        body: formData,
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error || "Upload failed. Please check the file.");
      }

      updateDoc(type, {
        fileName: resData.file.fileName,
        fileSize: resData.file.fileSize,
        fileUrl: resData.file.fileUrl,
        storagePath: resData.file.storagePath || resData.file.fileUrl,
        mimeType: resData.file.mimeType,
        verificationStatus: "pending",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload document.";
      setUploadError(msg);
    } finally {
      setUploadingType(null);
    }
  };

  const handleRemoveFile = (type: string) => {
    const docs = (data.documents || []).filter((d) => d.documentType !== type);
    onChange("documents", docs);
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return "0 KB";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="step-content">
      <div className="step-header">
        <span className="step-header__eyebrow">Step 3 of 10</span>
        <h2 className="step-header__title">Business Registration & Compliance Documents</h2>
        <p className="step-header__desc">
          Upload statutory permits, regional liquor licences, and identity documents required for verification in {data.country || "your country"}.
        </p>
      </div>

      {uploadError && (
        <div
          style={{
            background: "rgba(111, 20, 30, 0.4)",
            border: "1px solid #e57373",
            color: "#ffcdd2",
            padding: "0.85rem 1.25rem",
            borderRadius: "10px",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.85rem",
          }}
        >
          <AlertCircle size={16} />
          <span>{uploadError}</span>
        </div>
      )}

      <div
        style={{
          background: "rgba(176, 141, 87, 0.08)",
          border: "1px solid rgba(176, 141, 87, 0.25)",
          borderRadius: "12px",
          padding: "1rem 1.25rem",
          marginBottom: "2rem",
          fontSize: "0.82rem",
          color: "rgba(245, 241, 232, 0.8)",
          lineHeight: 1.5,
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <ShieldCheck size={24} color="#b08d57" style={{ flexShrink: 0 }} />
        <div>
          <strong>Document Integrity & Privacy:</strong> All uploaded files are stored in restricted SAGO compliance vaults. Accepted formats: PDF, JPG, PNG, and WebP (up to 10MB per document). Status is set to <em>Pending Verification</em> upon receipt.
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {DOCUMENT_TYPES.map((docDef) => {
          const doc = getDoc(docDef.type);
          const hasFile = Boolean(doc?.fileUrl);
          const isUploading = uploadingType === docDef.type;
          const errorMsg = errors[`doc_${docDef.type}`];

          return (
            <div
              key={docDef.type}
              className={`doc-upload-card ${hasFile ? "has-file" : ""}`}
              style={{
                borderColor: errorMsg ? "#ef5350" : undefined,
                background: errorMsg ? "rgba(111, 20, 30, 0.15)" : undefined,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "1rem",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                <div>
                  <h4
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      color: hasFile ? "#d4af37" : "#f5f1e8",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <FileText size={16} /> {docDef.type}
                    {docDef.required && <span className="required-star">*</span>}
                  </h4>
                  <p style={{ fontSize: "0.76rem", color: "rgba(245, 241, 232, 0.55)" }}>
                    {docDef.description}
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      padding: "0.25rem 0.6rem",
                      borderRadius: "6px",
                      background: hasFile ? "rgba(129, 199, 132, 0.2)" : "rgba(255, 255, 255, 0.08)",
                      color: hasFile ? "#81c784" : "rgba(245, 241, 232, 0.5)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                  >
                    {hasFile ? (
                      <>
                        <CheckCircle2 size={12} /> Ready for Review
                      </>
                    ) : (
                      "Not Uploaded"
                    )}
                  </span>
                </div>
              </div>

              {/* Document details (Number, Issuer, Dates) */}
              <div className="form-grid" style={{ marginBottom: "1rem" }}>
                <div className="col-3 form-field">
                  <label className="field-label">Document / Licence Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., SBP-2026-9812"
                    value={doc?.documentNumber || ""}
                    onChange={(e) =>
                      updateDoc(docDef.type, { documentNumber: e.target.value })
                    }
                  />
                </div>

                <div className="col-3 form-field">
                  <label className="field-label">Issuing Authority</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Nairobi City County"
                    value={doc?.issuingAuthority || ""}
                    onChange={(e) =>
                      updateDoc(docDef.type, { issuingAuthority: e.target.value })
                    }
                  />
                </div>

                <div className="col-3 form-field">
                  <label className="field-label">Issue Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={doc?.issueDate || ""}
                    onChange={(e) =>
                      updateDoc(docDef.type, { issueDate: e.target.value })
                    }
                  />
                </div>

                <div className="col-3 form-field">
                  <label className="field-label">Expiry Date (If applicable)</label>
                  <input
                    type="date"
                    className="form-input"
                    value={doc?.expiryDate || ""}
                    onChange={(e) =>
                      updateDoc(docDef.type, { expiryDate: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Upload Dropzone / Attached file */}
              {hasFile ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.85rem 1rem",
                    background: "rgba(10, 10, 10, 0.9)",
                    border: "1px solid rgba(176, 141, 87, 0.3)",
                    borderRadius: "8px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <FileText size={20} color="#b08d57" />
                    <div>
                      <span
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          color: "#f5f1e8",
                          display: "block",
                        }}
                      >
                        {doc?.fileName}
                      </span>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          color: "rgba(245, 241, 232, 0.5)",
                        }}
                      >
                        {formatFileSize(doc?.fileSize || 0)} · Status: Pending Verification
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {doc?.fileUrl && (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary"
                        style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}
                      >
                        <Eye size={12} /> View File
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(docDef.type)}
                      style={{
                        background: "none",
                        border: "1px solid rgba(229, 115, 115, 0.4)",
                        color: "#ef5350",
                        borderRadius: "8px",
                        padding: "0.35rem 0.65rem",
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
                </div>
              ) : (
                <div>
                  <label
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      padding: "1.5rem 1rem",
                      background: "rgba(10, 10, 10, 0.5)",
                      border: "1.5px dashed rgba(245, 241, 232, 0.15)",
                      borderRadius: "10px",
                      cursor: isUploading ? "wait" : "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.webp"
                      style={{ display: "none" }}
                      disabled={isUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(docDef.type, file);
                      }}
                    />
                    {isUploading ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          color: "#b08d57",
                        }}
                      >
                        <Loader2 size={18} className="animate-spin" />
                        <span style={{ fontSize: "0.85rem" }}>Uploading & securing file...</span>
                      </div>
                    ) : (
                      <>
                        <Upload size={22} color="#b08d57" />
                        <span style={{ fontSize: "0.85rem", color: "#f5f1e8", fontWeight: 500 }}>
                          Click to select or drag and drop document
                        </span>
                        <span
                          style={{
                            fontSize: "0.72rem",
                            color: "rgba(245, 241, 232, 0.45)",
                          }}
                        >
                          PDF, PNG, JPG, WebP up to 10MB
                        </span>
                      </>
                    )}
                  </label>

                  {errorMsg && (
                    <span
                      className="field-error-msg"
                      style={{ marginTop: "0.5rem", display: "inline-block" }}
                    >
                      {errorMsg}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
