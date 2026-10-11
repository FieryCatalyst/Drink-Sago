"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Building2,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  PauseCircle,
  Eye,
  FileText,
  ShieldCheck,
  CheckSquare,
  Save,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Wine,
  User,
  CreditCard,
  Calendar,
  History,
  QrCode,
  Tag,
  Loader2,
  Download,
} from "lucide-react";
import {
  PartnerApplicationRecord,
  PartnerApplicationStatus,
  VerificationChecklist,
} from "@/lib/partner-types";

interface PartnerAdminDashboardProps {
  authToken: string;
  adminEmail: string;
}

const CHECKLIST_ITEMS: Array<{ key: keyof VerificationChecklist; label: string }> = [
  { key: "business_registration_verified", label: "Business Registration Verified" },
  { key: "business_address_verified", label: "Business Address & Premises Verified" },
  { key: "owner_rep_verified", label: "Owner / Authorized Representative Verified" },
  { key: "licences_verified", label: "County Liquor Licence & SBP Verified" },
  { key: "tax_docs_reviewed", label: "Tax & KRA PIN Documentation Reviewed" },
  { key: "terms_reviewed", label: "Product & Proposed Discount Terms Reviewed" },
  { key: "agreement_signed", label: "Official SAGO Partnership Agreement Signed" },
  { key: "outlet_access_configured", label: "Outlet Redemption Access Configured" },
  { key: "staff_accounts_configured", label: "Staff Accounts Configured" },
  { key: "training_completed", label: "Redemption Protocol Training Completed" },
  { key: "test_coupon_redeemed", label: "Test Coupon Successfully Redeemed" },
  { key: "final_approval_granted", label: "Final Executive Approval Granted" },
];

export default function PartnerAdminDashboard({
  authToken,
  adminEmail,
}: PartnerAdminDashboardProps) {
  const [applications, setApplications] = useState<PartnerApplicationRecord[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Inspect Modal
  const [selectedApp, setSelectedApp] = useState<PartnerApplicationRecord | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "checklist" | "decision" | "audit">("checklist");
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Editable decision state
  const [editDecision, setEditDecision] = useState<{
    status: PartnerApplicationStatus;
    partnerIdAssigned: string;
    agreementReference: string;
    activationDate: string;
    renewalDate: string;
    decisionReason: string;
    internalNotes: string;
    checklist: VerificationChecklist;
  }>({
    status: "pending_review",
    partnerIdAssigned: "",
    agreementReference: "",
    activationDate: "",
    renewalDate: "",
    decisionReason: "",
    internalNotes: "",
    checklist: {
      business_registration_verified: false,
      business_address_verified: false,
      owner_rep_verified: false,
      licences_verified: false,
      tax_docs_reviewed: false,
      terms_reviewed: false,
      agreement_signed: false,
      outlet_access_configured: false,
      staff_accounts_configured: false,
      training_completed: false,
      test_coupon_redeemed: false,
      final_approval_granted: false,
    },
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      const url = new URL("/api/admin/partners", window.location.origin);
      if (statusFilter !== "all") url.searchParams.set("status", statusFilter);
      if (searchQuery.trim()) url.searchParams.set("q", searchQuery.trim());

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load partner applications.");
      }

      setApplications(data.applications || []);
      setStats(data.stats || null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Load failed";
      setLoadError(msg);
    } finally {
      setLoading(false);
    }
  }, [authToken, statusFilter, searchQuery]);

  useEffect(() => {
    if (authToken) {
      fetchApplications();
    }
  }, [authToken, fetchApplications]);

  const handleOpenApp = (app: PartnerApplicationRecord) => {
    setSelectedApp(app);
    setActiveTab("checklist");
    setEditDecision({
      status: app.status,
      partnerIdAssigned: app.partnerIdAssigned || "",
      agreementReference: app.agreementReference || "",
      activationDate: app.activationDate || "",
      renewalDate: app.renewalDate || "",
      decisionReason: app.decisionReason || "",
      internalNotes: app.internalNotes || "",
      checklist: { ...app.checklist },
    });
  };

  const handleToggleChecklist = (key: keyof VerificationChecklist) => {
    setEditDecision((prev) => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [key]: !prev.checklist[key],
      },
    }));
  };

  const handleSaveDecision = async () => {
    if (!selectedApp) return;
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/admin/partners/${selectedApp.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          status: editDecision.status,
          partnerIdAssigned: editDecision.partnerIdAssigned || undefined,
          agreementReference: editDecision.agreementReference || undefined,
          activationDate: editDecision.activationDate || undefined,
          renewalDate: editDecision.renewalDate || undefined,
          decisionReason: editDecision.decisionReason || undefined,
          internalNotes: editDecision.internalNotes || undefined,
          checklist: editDecision.checklist,
          assignedOfficerName: adminEmail,
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error || "Failed to update application.");
      }

      showToast(`Verification updated for ${selectedApp.applicationReference}`);
      setSelectedApp(resData.application);
      fetchApplications();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Update failed";
      showToast(`Error: ${msg}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusPill = (status: PartnerApplicationStatus) => {
    switch (status) {
      case "approved":
        return { label: "Approved", color: "#81c784", bg: "rgba(129, 199, 132, 0.15)" };
      case "under_review":
        return { label: "Under Review", color: "#d4af37", bg: "rgba(176, 141, 87, 0.15)" };
      case "additional_info_required":
        return { label: "Info Needed", color: "#ffb74d", bg: "rgba(255, 183, 77, 0.15)" };
      case "rejected":
        return { label: "Rejected", color: "#e57373", bg: "rgba(229, 115, 115, 0.15)" };
      case "on_hold":
        return { label: "On Hold", color: "#90caf9", bg: "rgba(144, 202, 249, 0.15)" };
      default:
        return { label: "Pending", color: "#d4af37", bg: "rgba(176, 141, 87, 0.15)" };
    }
  };

  return (
    <div style={{ padding: "1.5rem" }}>
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            background: "rgba(18, 18, 18, 0.95)",
            border: "1px solid #b08d57",
            color: "#f5f1e8",
            padding: "0.85rem 1.4rem",
            borderRadius: "10px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.8)",
            zIndex: 2000,
            fontSize: "0.85rem",
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {[
          { label: "Total Applications", value: stats?.total || 0, color: "#f5f1e8" },
          { label: "Pending Review", value: stats?.pending || 0, color: "#d4af37" },
          { label: "Under Review", value: stats?.underReview || 0, color: "#b08d57" },
          { label: "Info Required", value: stats?.needsInfo || 0, color: "#ffb74d" },
          { label: "Approved Partners", value: stats?.approved || 0, color: "#81c784" },
          { label: "Rejected / On Hold", value: (stats?.rejected || 0) + (stats?.onHold || 0), color: "#e57373" },
        ].map((item, idx) => (
          <div
            key={idx}
            style={{
              background: "rgba(20, 20, 20, 0.8)",
              border: "1px solid rgba(176, 141, 87, 0.2)",
              borderRadius: "12px",
              padding: "1rem 1.25rem",
            }}
          >
            <span style={{ fontSize: "0.72rem", color: "rgba(245, 241, 232, 0.6)", textTransform: "uppercase" }}>
              {item.label}
            </span>
            <div style={{ fontSize: "1.8rem", fontWeight: 700, color: item.color, marginTop: "0.2rem" }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ display: "flex", gap: "0.75rem", flex: 1, maxWidth: "500px" }}>
          <div style={{ position: "relative", width: "100%" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "rgba(245, 241, 232, 0.4)",
              }}
            />
            <input
              type="text"
              placeholder="Search by reference, trading name, county..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-gate-input"
              style={{ paddingLeft: "2.75rem" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
            style={{ width: "auto", fontSize: "0.82rem" }}
          >
            <option value="all">All Statuses</option>
            <option value="pending_review">Pending Review</option>
            <option value="under_review">Under Review</option>
            <option value="additional_info_required">Info Required</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="on_hold">On Hold</option>
          </select>

          <button
            onClick={fetchApplications}
            disabled={loading}
            className="admin-btn-secondary"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : undefined} />
            Refresh
          </button>
        </div>
      </div>

      {/* Applications Table */}
      <div
        style={{
          background: "rgba(18, 18, 18, 0.9)",
          border: "1px solid rgba(176, 141, 87, 0.2)",
          borderRadius: "14px",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
          <thead>
            <tr
              style={{
                borderBottom: "1px solid rgba(176, 141, 87, 0.2)",
                background: "rgba(12, 12, 12, 0.8)",
                textAlign: "left",
                color: "#b08d57",
                fontSize: "0.75rem",
                textTransform: "uppercase",
              }}
            >
              <th style={{ padding: "0.85rem 1rem" }}>Reference</th>
              <th style={{ padding: "0.85rem 1rem" }}>Trading Name & County</th>
              <th style={{ padding: "0.85rem 1rem" }}>Category</th>
              <th style={{ padding: "0.85rem 1rem" }}>Submitted</th>
              <th style={{ padding: "0.85rem 1rem" }}>Checklist</th>
              <th style={{ padding: "0.85rem 1rem" }}>Status</th>
              <th style={{ padding: "0.85rem 1rem", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: "3rem",
                    textAlign: "center",
                    color: "rgba(245, 241, 232, 0.5)",
                  }}
                >
                  {loading ? "Loading partner records..." : "No partner applications found matching criteria."}
                </td>
              </tr>
            ) : (
              applications.map((app) => {
                const pill = getStatusPill(app.status);
                const completedCount = Object.values(app.checklist || {}).filter(Boolean).length;
                const totalCount = CHECKLIST_ITEMS.length;

                return (
                  <tr
                    key={app.id}
                    style={{
                      borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                      transition: "background 0.2s ease",
                    }}
                  >
                    <td style={{ padding: "0.85rem 1rem", fontFamily: "monospace", color: "#d4af37" }}>
                      {app.applicationReference}
                    </td>
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <strong style={{ color: "#f5f1e8" }}>{app.data.tradingName}</strong>
                      <div style={{ color: "rgba(245, 241, 232, 0.5)", fontSize: "0.75rem" }}>
                        {app.data.townCity}, {app.data.county} County
                      </div>
                    </td>
                    <td style={{ padding: "0.85rem 1rem", color: "rgba(245, 241, 232, 0.8)" }}>
                      {app.data.businessType}
                    </td>
                    <td style={{ padding: "0.85rem 1rem", color: "rgba(245, 241, 232, 0.6)", fontSize: "0.78rem" }}>
                      {new Date(app.submittedAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: completedCount === totalCount ? "#81c784" : "#d4af37",
                          fontWeight: 600,
                        }}
                      >
                        {completedCount} / {totalCount}
                      </span>
                    </td>
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "0.2rem 0.6rem",
                          borderRadius: "999px",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          background: pill.bg,
                          color: pill.color,
                        }}
                      >
                        {pill.label}
                      </span>
                    </td>
                    <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={() => handleOpenApp(app)}
                        className="btn-primary"
                        style={{ padding: "0.35rem 0.8rem", fontSize: "0.75rem" }}
                      >
                        <Eye size={12} /> Inspect & Verify
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── DETAIL & VERIFICATION MODAL ── */}
      {selectedApp && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1500,
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "960px",
              maxHeight: "90vh",
              background: "#121212",
              border: "1.5px solid rgba(176, 141, 87, 0.35)",
              borderRadius: "18px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.9)",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "1.25rem 1.75rem",
                borderBottom: "1px solid rgba(176, 141, 87, 0.2)",
                background: "rgba(10, 10, 10, 0.8)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <span style={{ fontSize: "0.75rem", color: "#b08d57", textTransform: "uppercase" }}>
                  Partner Verification Dossier
                </span>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#f5f1e8", margin: 0 }}>
                  {selectedApp.data.tradingName} ({selectedApp.applicationReference})
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="btn-secondary"
                style={{ padding: "0.35rem 0.75rem", fontSize: "0.78rem" }}
              >
                Close
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                padding: "0.75rem 1.75rem",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                background: "#0c0c0c",
              }}
            >
              {[
                { id: "checklist", label: "Verification Checklist", icon: CheckSquare },
                { id: "decision", label: "Status & Decision", icon: ShieldCheck },
                { id: "details", label: "Application Data & Files", icon: FileText },
                { id: "audit", label: "Audit Log", icon: History },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    style={{
                      background: isActive ? "rgba(176, 141, 87, 0.2)" : "transparent",
                      border: "1px solid",
                      borderColor: isActive ? "#b08d57" : "transparent",
                      color: isActive ? "#d4af37" : "rgba(245, 241, 232, 0.6)",
                      padding: "0.45rem 0.9rem",
                      borderRadius: "8px",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <Icon size={14} /> {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Modal Body */}
            <div style={{ padding: "1.75rem", overflowY: "auto", flex: 1 }}>
              {/* TAB 1: 12-POINT VERIFICATION CHECKLIST */}
              {activeTab === "checklist" && (
                <div>
                  <h4 style={{ color: "#d4af37", fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                    Official 12-Point Onboarding Verification Checklist
                  </h4>
                  <p style={{ color: "rgba(245, 241, 232, 0.6)", fontSize: "0.82rem", marginBottom: "1.5rem" }}>
                    Toggle each requirement as verification progresses. Updates are logged in the audit trail.
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "0.75rem",
                    }}
                  >
                    {CHECKLIST_ITEMS.map((item, idx) => {
                      const isChecked = editDecision.checklist[item.key];
                      return (
                        <label
                          key={item.key}
                          className={`custom-checkbox-row ${isChecked ? "is-checked" : ""}`}
                          style={{ padding: "0.75rem 1rem" }}
                        >
                          <input
                            type="checkbox"
                            className="custom-checkbox-input"
                            checked={isChecked}
                            onChange={() => handleToggleChecklist(item.key)}
                          />
                          <div className="checkbox-text-content">
                            <span className="checkbox-title" style={{ fontSize: "0.85rem" }}>
                              {idx + 1}. {item.label}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      onClick={handleSaveDecision}
                      disabled={isUpdating}
                      className="btn-primary"
                    >
                      {isUpdating ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                      Save Checklist Progress
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: STATUS, PARTNER ID, & DECISION */}
              {activeTab === "decision" && (
                <div>
                  <h4 style={{ color: "#d4af37", fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                    Application Status Decision & IDs
                  </h4>
                  <p style={{ color: "rgba(245, 241, 232, 0.6)", fontSize: "0.82rem", marginBottom: "1.5rem" }}>
                    Authorize partnership approval, assign server-generated IDs, and record formal reasons.
                  </p>

                  <div className="form-grid">
                    <div className="col-6 form-field">
                      <label className="field-label">Official Application Status</label>
                      <select
                        className="form-select"
                        value={editDecision.status}
                        onChange={(e) =>
                          setEditDecision({
                            ...editDecision,
                            status: e.target.value as PartnerApplicationStatus,
                          })
                        }
                      >
                        <option value="pending_review">Pending Review</option>
                        <option value="under_review">Under Review</option>
                        <option value="additional_info_required">Additional Information Required</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="on_hold">Temporarily On Hold</option>
                      </select>
                    </div>

                    <div className="col-6 form-field">
                      <label className="field-label">Assigned Partner ID</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Auto-generated on approval (e.g., SAGO-PRT-0001)"
                        value={editDecision.partnerIdAssigned}
                        onChange={(e) =>
                          setEditDecision({ ...editDecision, partnerIdAssigned: e.target.value })
                        }
                      />
                    </div>

                    <div className="col-6 form-field">
                      <label className="field-label">Agreement Reference</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., AGR-2026-NBI-042"
                        value={editDecision.agreementReference}
                        onChange={(e) =>
                          setEditDecision({ ...editDecision, agreementReference: e.target.value })
                        }
                      />
                    </div>

                    <div className="col-3 form-field">
                      <label className="field-label">Activation Date</label>
                      <input
                        type="date"
                        className="form-input"
                        value={editDecision.activationDate}
                        onChange={(e) =>
                          setEditDecision({ ...editDecision, activationDate: e.target.value })
                        }
                      />
                    </div>

                    <div className="col-3 form-field">
                      <label className="field-label">Review / Renewal Date</label>
                      <input
                        type="date"
                        className="form-input"
                        value={editDecision.renewalDate}
                        onChange={(e) =>
                          setEditDecision({ ...editDecision, renewalDate: e.target.value })
                        }
                      />
                    </div>

                    <div className="col-12 form-field">
                      <label className="field-label">
                        Decision Reason / Outstanding Requirements (Publicly visible to applicant)
                      </label>
                      <textarea
                        rows={3}
                        className="form-textarea"
                        placeholder="e.g., Please provide an updated 2026 County Single Business Permit."
                        value={editDecision.decisionReason}
                        onChange={(e) =>
                          setEditDecision({ ...editDecision, decisionReason: e.target.value })
                        }
                      />
                    </div>

                    <div className="col-12 form-field">
                      <label className="field-label">
                        Internal Notes & Evaluation (Restricted to SAGO Administrators)
                      </label>
                      <textarea
                        rows={3}
                        className="form-textarea"
                        placeholder="Internal officer observations regarding premises, footfall, or distributor terms."
                        value={editDecision.internalNotes}
                        onChange={(e) =>
                          setEditDecision({ ...editDecision, internalNotes: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      onClick={handleSaveDecision}
                      disabled={isUpdating}
                      className="btn-primary"
                    >
                      {isUpdating ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                      Update Status & Decision
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: APPLICATION DATA & COMPLIANCE FILES */}
              {activeTab === "details" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {/* Attached Documents */}
                  <div>
                    <h5 style={{ color: "#d4af37", fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                      Uploaded Compliance Documents ({(selectedApp.data.documents || []).length})
                    </h5>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {(selectedApp.data.documents || []).map((doc, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "0.75rem 1rem",
                            background: "rgba(10, 10, 10, 0.7)",
                            border: "1px solid rgba(176, 141, 87, 0.2)",
                            borderRadius: "8px",
                            fontSize: "0.85rem",
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: 600, color: "#f5f1e8" }}>{doc.documentType}</span>
                            <span style={{ color: "rgba(245, 241, 232, 0.5)", marginLeft: "0.5rem" }}>
                              File: {doc.fileName}
                            </span>
                          </div>
                          {doc.fileUrl && (
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-secondary"
                              style={{ padding: "0.3rem 0.75rem", fontSize: "0.72rem" }}
                            >
                              <ExternalLink size={12} /> View Document
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Business & Contacts summary */}
                  <div>
                    <h5 style={{ color: "#d4af37", fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                      Business & Executive Details
                    </h5>
                    <div className="form-grid" style={{ fontSize: "0.82rem" }}>
                      <div className="col-4">
                        <span style={{ color: "rgba(245, 241, 232, 0.5)" }}>Registered Entity:</span>
                        <div style={{ fontWeight: 600 }}>{selectedApp.data.registeredBusinessName}</div>
                      </div>
                      <div className="col-4">
                        <span style={{ color: "rgba(245, 241, 232, 0.5)" }}>Trading Name:</span>
                        <div style={{ fontWeight: 600 }}>{selectedApp.data.tradingName}</div>
                      </div>
                      <div className="col-4">
                        <span style={{ color: "rgba(245, 241, 232, 0.5)" }}>BRS Reg Number:</span>
                        <div style={{ fontWeight: 600 }}>{selectedApp.data.businessRegistrationNumber}</div>
                      </div>
                      <div className="col-4">
                        <span style={{ color: "rgba(245, 241, 232, 0.5)" }}>Owner Name:</span>
                        <div style={{ fontWeight: 600 }}>{selectedApp.data.ownerFullName}</div>
                      </div>
                      <div className="col-4">
                        <span style={{ color: "rgba(245, 241, 232, 0.5)" }}>Authorized Rep:</span>
                        <div style={{ fontWeight: 600 }}>{selectedApp.data.authContactName}</div>
                      </div>
                      <div className="col-4">
                        <span style={{ color: "rgba(245, 241, 232, 0.5)" }}>Official Email:</span>
                        <div style={{ fontWeight: 600 }}>{selectedApp.data.businessEmail}</div>
                      </div>
                    </div>
                  </div>

                  {/* Products */}
                  <div>
                    <h5 style={{ color: "#d4af37", fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                      Participating Products & Proposed Pricing
                    </h5>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {(selectedApp.data.products || []).filter((p) => p.selected).map((p) => (
                        <div
                          key={p.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "0.5rem 0.75rem",
                            background: "rgba(10, 10, 10, 0.6)",
                            borderRadius: "6px",
                            fontSize: "0.82rem",
                          }}
                        >
                          <span>{p.productName} ({p.servingType})</span>
                          <span style={{ color: "#d4af37", fontWeight: 600 }}>
                            Std: {p.currency} {p.standardPrice?.toLocaleString()} · Slot Promo: {p.servingType === "Bottle" ? "5%–25%" : p.servingType === "Glass" ? "10%–50%" : "5%–25%"} off
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial Details (Restricted) */}
                  {selectedApp.data.requiresSettlement && (
                    <div>
                      <h5 style={{ color: "#d4af37", fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                        Financial Settlement Information (Restricted)
                      </h5>
                      <div className="form-grid" style={{ fontSize: "0.82rem" }}>
                        <div className="col-4">
                          <span style={{ color: "rgba(245, 241, 232, 0.5)" }}>Bank Name:</span>
                          <div style={{ fontWeight: 600 }}>{selectedApp.data.settlementBankName}</div>
                        </div>
                        <div className="col-4">
                          <span style={{ color: "rgba(245, 241, 232, 0.5)" }}>Account Name:</span>
                          <div style={{ fontWeight: 600 }}>{selectedApp.data.settlementAccountName}</div>
                        </div>
                        <div className="col-4">
                          <span style={{ color: "rgba(245, 241, 232, 0.5)" }}>Account Number:</span>
                          <div style={{ fontWeight: 600 }}>{selectedApp.data.settlementAccountNumber}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: AUDIT LOG */}
              {activeTab === "audit" && (
                <div>
                  <h4 style={{ color: "#d4af37", fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                    Application Audit Trail & History
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {(selectedApp.auditLogs || []).map((log) => (
                      <div
                        key={log.id}
                        style={{
                          padding: "0.75rem 1rem",
                          background: "rgba(10, 10, 10, 0.6)",
                          borderLeft: "3px solid #b08d57",
                          borderRadius: "4px",
                          fontSize: "0.8rem",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <strong style={{ color: "#f5f1e8" }}>{log.action}</strong>
                          <span style={{ color: "rgba(245, 241, 232, 0.4)" }}>
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div style={{ color: "rgba(245, 241, 232, 0.7)", marginTop: "0.25rem" }}>
                          Actor: {log.actorName}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
