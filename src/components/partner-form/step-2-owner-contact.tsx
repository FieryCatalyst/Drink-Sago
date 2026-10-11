"use client";

import React from "react";
import { UserCheck, ShieldCheck, Users, Plus, Trash2 } from "lucide-react";
import { PartnerFormData, DirectorPartner } from "@/lib/partner-types";
import { OWNERSHIP_STRUCTURES } from "@/lib/kenya-data";

interface Step2Props {
  data: PartnerFormData;
  errors: Record<string, string>;
  onChange: <K extends keyof PartnerFormData>(field: K, value: PartnerFormData[K]) => void;
}

export default function Step2OwnerContact({ data, errors, onChange }: Step2Props) {
  const handleAddDirector = () => {
    const newDir: DirectorPartner = {
      id: crypto.randomUUID(),
      fullName: "",
      nationality: "Kenyan",
      idNumber: "",
      ownershipPercentage: 0,
      role: "Director",
    };
    onChange("directors", [...(data.directors || []), newDir]);
  };

  const handleUpdateDirector = (index: number, field: keyof DirectorPartner, value: any) => {
    const updated = [...(data.directors || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange("directors", updated);
  };

  const handleRemoveDirector = (index: number) => {
    const updated = [...(data.directors || [])];
    updated.splice(index, 1);
    onChange("directors", updated);
  };

  return (
    <div className="step-content">
      <div className="step-header">
        <span className="step-header__eyebrow">Step 2 of 10</span>
        <h2 className="step-header__title">Owner & Authorized Representative</h2>
        <p className="step-header__desc">
          Identify the legal proprietors, designated signing authority, and governance structure of the business.
        </p>
      </div>

      {/* ── Section A: Business Owner Details ── */}
      <div className="section-subcard" style={{ marginTop: 0 }}>
        <h3 className="section-subcard__title">
          <UserCheck size={18} /> Primary Business Owner / Principal
        </h3>
        <p className="section-subcard__desc">
          Details of the primary business owner, major shareholder, or managing proprietor.
        </p>

        <div className="form-grid">
          <div className="col-6 form-field">
            <label className="field-label" htmlFor="ownerFullName">
              <span>Full Legal Name <span className="required-star">*</span></span>
            </label>
            <input
              id="ownerFullName"
              type="text"
              className={`form-input ${errors.ownerFullName ? "has-error" : ""}`}
              placeholder="e.g., Peter Kamau Kariuki"
              value={data.ownerFullName}
              onChange={(e) => onChange("ownerFullName", e.target.value)}
            />
            {errors.ownerFullName && (
              <span className="field-error-msg">{errors.ownerFullName}</span>
            )}
          </div>

          <div className="col-3 form-field">
            <label className="field-label" htmlFor="ownerPosition">
              <span>Position / Title <span className="required-star">*</span></span>
            </label>
            <input
              id="ownerPosition"
              type="text"
              className={`form-input ${errors.ownerPosition ? "has-error" : ""}`}
              placeholder="e.g., Managing Director / Owner"
              value={data.ownerPosition}
              onChange={(e) => onChange("ownerPosition", e.target.value)}
            />
            {errors.ownerPosition && (
              <span className="field-error-msg">{errors.ownerPosition}</span>
            )}
          </div>

          <div className="col-3 form-field">
            <label className="field-label" htmlFor="ownerNationality">
              <span>Nationality</span>
            </label>
            <input
              id="ownerNationality"
              type="text"
              className="form-input"
              value={data.ownerNationality || "Kenyan"}
              onChange={(e) => onChange("ownerNationality", e.target.value)}
            />
          </div>

          <div className="col-4 form-field">
            <label className="field-label" htmlFor="ownerEmail">
              <span>Owner Email Address <span className="required-star">*</span></span>
            </label>
            <input
              id="ownerEmail"
              type="email"
              className={`form-input ${errors.ownerEmail ? "has-error" : ""}`}
              placeholder="peter@velvetoak.co.ke"
              value={data.ownerEmail}
              onChange={(e) => onChange("ownerEmail", e.target.value)}
            />
            {errors.ownerEmail && (
              <span className="field-error-msg">{errors.ownerEmail}</span>
            )}
          </div>

          <div className="col-4 form-field">
            <label className="field-label" htmlFor="ownerPhone">
              <span>Owner Primary Phone <span className="required-star">*</span></span>
            </label>
            <input
              id="ownerPhone"
              type="tel"
              className={`form-input ${errors.ownerPhone ? "has-error" : ""}`}
              placeholder="+254 722 000 000"
              value={data.ownerPhone}
              onChange={(e) => onChange("ownerPhone", e.target.value)}
            />
            {errors.ownerPhone && (
              <span className="field-error-msg">{errors.ownerPhone}</span>
            )}
          </div>

          <div className="col-4 form-field">
            <label className="field-label" htmlFor="ownerAltPhone">
              <span>Alternative Phone / WhatsApp <span className="field-hint-inline">(Optional)</span></span>
            </label>
            <input
              id="ownerAltPhone"
              type="tel"
              className="form-input"
              placeholder="+254 733 000 000"
              value={data.ownerAltPhone}
              onChange={(e) => onChange("ownerAltPhone", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Section B: Authorized Contact Person ── */}
      <div className="section-subcard">
        <h3 className="section-subcard__title">
          <ShieldCheck size={18} /> Designated Operations & Liaison Representative
        </h3>
        <p className="section-subcard__desc">
          Official contact person for operational coordination, campaign activation, and staff communication.
        </p>

        <div className="form-grid">
          <div className="col-6 form-field">
            <label className="field-label" htmlFor="authContactName">
              <span>Representative Full Name <span className="required-star">*</span></span>
            </label>
            <input
              id="authContactName"
              type="text"
              className={`form-input ${errors.authContactName ? "has-error" : ""}`}
              placeholder="e.g., Mercy Achieng Otieno"
              value={data.authContactName}
              onChange={(e) => onChange("authContactName", e.target.value)}
            />
            {errors.authContactName && (
              <span className="field-error-msg">{errors.authContactName}</span>
            )}
          </div>

          <div className="col-6 form-field">
            <label className="field-label" htmlFor="authContactTitle">
              <span>Official Job Title <span className="required-star">*</span></span>
            </label>
            <input
              id="authContactTitle"
              type="text"
              className={`form-input ${errors.authContactTitle ? "has-error" : ""}`}
              placeholder="e.g., General Manager / Beverage Director"
              value={data.authContactTitle}
              onChange={(e) => onChange("authContactTitle", e.target.value)}
            />
            {errors.authContactTitle && (
              <span className="field-error-msg">{errors.authContactTitle}</span>
            )}
          </div>

          <div className="col-6 form-field">
            <label className="field-label" htmlFor="authContactEmail">
              <span>Official Email Address <span className="required-star">*</span></span>
            </label>
            <input
              id="authContactEmail"
              type="email"
              className={`form-input ${errors.authContactEmail ? "has-error" : ""}`}
              placeholder="mercy@velvetoak.co.ke"
              value={data.authContactEmail}
              onChange={(e) => onChange("authContactEmail", e.target.value)}
            />
            {errors.authContactEmail && (
              <span className="field-error-msg">{errors.authContactEmail}</span>
            )}
          </div>

          <div className="col-6 form-field">
            <label className="field-label" htmlFor="authContactPhone">
              <span>Direct Phone / WhatsApp <span className="required-star">*</span></span>
            </label>
            <input
              id="authContactPhone"
              type="tel"
              className={`form-input ${errors.authContactPhone ? "has-error" : ""}`}
              placeholder="+254 711 000 000"
              value={data.authContactPhone}
              onChange={(e) => onChange("authContactPhone", e.target.value)}
            />
            {errors.authContactPhone && (
              <span className="field-error-msg">{errors.authContactPhone}</span>
            )}
          </div>

          <div className="col-12 form-field">
            <label className="custom-checkbox-row is-checked">
              <input
                type="checkbox"
                className="custom-checkbox-input"
                checked={data.authContactCanSign}
                onChange={(e) => onChange("authContactCanSign", e.target.checked)}
              />
              <div className="checkbox-text-content">
                <span className="checkbox-title">Authorized to Sign Partnership Agreement</span>
                <span className="checkbox-desc">
                  This representative has board or owner delegation to execute promotional agreements with SAGO.
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* ── Section C: Ownership Structure & Directors ── */}
      <div className="section-subcard">
        <h3 className="section-subcard__title">
          <Users size={18} /> Business Ownership Structure & Signatory Authority
        </h3>
        <p className="section-subcard__desc">
          State your legal structure and persons with significant control as recognized under {data.country || "national"} corporate law.
        </p>

        <div className="form-grid">
          <div className="col-6 form-field">
            <label className="field-label" htmlFor="ownershipStructure">
              <span>Ownership Structure <span className="required-star">*</span></span>
            </label>
            <select
              id="ownershipStructure"
              className="form-select"
              value={data.ownershipStructure}
              onChange={(e) => onChange("ownershipStructure", e.target.value)}
            >
              {OWNERSHIP_STRUCTURES.map((struct) => (
                <option key={struct} value={struct}>
                  {struct}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6 form-field">
            <label className="field-label" htmlFor="authAgreementPerson">
              <span>Authorized Signatory for SAGO Agreement <span className="required-star">*</span></span>
            </label>
            <input
              id="authAgreementPerson"
              type="text"
              className={`form-input ${errors.authAgreementPerson ? "has-error" : ""}`}
              placeholder="Full name of person who will sign"
              value={data.authAgreementPerson}
              onChange={(e) => onChange("authAgreementPerson", e.target.value)}
            />
            {errors.authAgreementPerson && (
              <span className="field-error-msg">{errors.authAgreementPerson}</span>
            )}
          </div>
        </div>

        {/* Directors List */}
        <div style={{ marginTop: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.75rem",
            }}
          >
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(245, 241, 232, 0.85)" }}>
              Directors / Partners / Controlling Persons ({data.directors?.length || 0})
            </span>
            <button
              type="button"
              onClick={handleAddDirector}
              className="btn-secondary"
              style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}
            >
              <Plus size={13} /> Add Director
            </button>
          </div>

          {(data.directors || []).map((dir, idx) => (
            <div
              key={dir.id}
              style={{
                background: "rgba(10, 10, 10, 0.7)",
                border: "1px solid rgba(176, 141, 87, 0.2)",
                borderRadius: "10px",
                padding: "1rem",
                marginBottom: "0.75rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.5rem",
                }}
              >
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#b08d57" }}>
                  Director #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveDirector(idx)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#e57373",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                  }}
                >
                  <Trash2 size={13} /> Remove
                </button>
              </div>

              <div className="form-grid">
                <div className="col-4 form-field">
                  <label className="field-label">Director Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Full name"
                    value={dir.fullName}
                    onChange={(e) => handleUpdateDirector(idx, "fullName", e.target.value)}
                  />
                </div>
                <div className="col-3 form-field">
                  <label className="field-label">ID / Passport No</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="National ID / PP"
                    value={dir.idNumber}
                    onChange={(e) => handleUpdateDirector(idx, "idNumber", e.target.value)}
                  />
                </div>
                <div className="col-3 form-field">
                  <label className="field-label">Role / Designation</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Director"
                    value={dir.role}
                    onChange={(e) => handleUpdateDirector(idx, "role", e.target.value)}
                  />
                </div>
                <div className="col-2 form-field">
                  <label className="field-label">Shareholding %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="form-input"
                    placeholder="%"
                    value={dir.ownershipPercentage || ""}
                    onChange={(e) =>
                      handleUpdateDirector(
                        idx,
                        "ownershipPercentage",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
