"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Building,
  Calendar,
  ArrowRight,
  Loader2,
} from "lucide-react";

function StatusContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get("ref") || "";

  const [refInput, setRefInput] = useState(initialRef);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [application, setApplication] = useState<any | null>(null);

  const fetchStatus = async (ref: string) => {
    if (!ref.trim()) return;
    setLoading(true);
    setError(null);
    setApplication(null);

    try {
      const res = await fetch(`/api/partners/status/${encodeURIComponent(ref.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Application not found for that reference.");
      }

      setApplication(data.application);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lookup failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialRef) {
      fetchStatus(initialRef);
    }
  }, [initialRef]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStatus(refInput);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return {
          label: "Approved & Active Partner",
          color: "#81c784",
          bg: "rgba(129, 199, 132, 0.15)",
          border: "rgba(129, 199, 132, 0.4)",
        };
      case "under_review":
        return {
          label: "Under Verification Review",
          color: "#d4af37",
          bg: "rgba(176, 141, 87, 0.15)",
          border: "rgba(176, 141, 87, 0.4)",
        };
      case "additional_info_required":
        return {
          label: "Action Required / Information Needed",
          color: "#ffb74d",
          bg: "rgba(255, 183, 77, 0.15)",
          border: "rgba(255, 183, 77, 0.4)",
        };
      case "rejected":
        return {
          label: "Application Not Approved",
          color: "#e57373",
          bg: "rgba(229, 115, 115, 0.15)",
          border: "rgba(229, 115, 115, 0.4)",
        };
      case "on_hold":
        return {
          label: "Temporarily On Hold",
          color: "#90caf9",
          bg: "rgba(144, 202, 249, 0.15)",
          border: "rgba(144, 202, 249, 0.4)",
        };
      default:
        return {
          label: "Pending Initial Review",
          color: "#d4af37",
          bg: "rgba(176, 141, 87, 0.15)",
          border: "rgba(176, 141, 87, 0.4)",
        };
    }
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "8.5rem 1.5rem 5rem",
        minHeight: "80vh",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            background: "rgba(176, 141, 87, 0.12)",
            border: "1px solid rgba(176, 141, 87, 0.35)",
            color: "#b08d57",
            padding: "0.35rem 0.9rem",
            borderRadius: "999px",
            fontSize: "0.75rem",
            fontWeight: 700,
            textTransform: "uppercase",
            marginBottom: "1rem",
          }}
        >
          <Clock size={13} /> SAGO Partner Application Registry
        </span>
        <h1 style={{ fontSize: "2.4rem", fontWeight: 700, color: "#f5f1e8", marginBottom: "0.5rem" }}>
          Track Application Status
        </h1>
        <p style={{ color: "rgba(245, 241, 232, 0.7)", fontSize: "0.95rem" }}>
          Enter your unique Application Reference Number to check real-time verification progress.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "2.5rem" }}>
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            background: "rgba(18, 18, 18, 0.9)",
            border: "1px solid rgba(176, 141, 87, 0.3)",
            borderRadius: "14px",
            padding: "0.5rem",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
          }}
        >
          <input
            type="text"
            placeholder="e.g., SAGO-PTR-2026-AB123"
            value={refInput}
            onChange={(e) => setRefInput(e.target.value)}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: "#f5f1e8",
              padding: "0.75rem 1rem",
              fontSize: "1rem",
              fontFamily: "monospace",
              outline: "none",
            }}
            required
          />
          <button
            type="submit"
            disabled={loading || !refInput.trim()}
            className="btn-primary"
            style={{ padding: "0.75rem 1.6rem" }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            <span>Track</span>
          </button>
        </div>
      </form>

      {/* Error state */}
      {error && (
        <div
          style={{
            background: "rgba(111, 20, 30, 0.3)",
            border: "1px solid #ef5350",
            borderRadius: "12px",
            padding: "1.25rem",
            color: "#ffcdd2",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "2rem",
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Application Result Details Card */}
      {application && (
        <div
          style={{
            background: "rgba(23, 23, 23, 0.9)",
            border: "1px solid rgba(176, 141, 87, 0.3)",
            borderRadius: "16px",
            padding: "2rem",
            boxShadow: "0 15px 40px rgba(0, 0, 0, 0.6)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <span style={{ fontSize: "0.75rem", color: "rgba(245, 241, 232, 0.5)", textTransform: "uppercase" }}>
                Application Reference
              </span>
              <h3 style={{ fontSize: "1.4rem", fontFamily: "monospace", color: "#d4af37", margin: "0.2rem 0" }}>
                {application.reference}
              </h3>
              <p style={{ fontSize: "0.9rem", color: "#f5f1e8", fontWeight: 600 }}>
                {application.tradingName} · {application.county} County
              </p>
            </div>

            {(() => {
              const badge = getStatusBadge(application.status);
              return (
                <span
                  style={{
                    background: badge.bg,
                    border: `1px solid ${badge.border}`,
                    color: badge.color,
                    padding: "0.45rem 1rem",
                    borderRadius: "999px",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                  }}
                >
                  {badge.label}
                </span>
              );
            })()}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1.25rem",
              padding: "1.25rem",
              background: "rgba(10, 10, 10, 0.7)",
              borderRadius: "10px",
              marginBottom: "1.5rem",
              fontSize: "0.85rem",
            }}
          >
            <div>
              <span style={{ color: "rgba(245, 241, 232, 0.5)", fontSize: "0.75rem" }}>Date Received:</span>
              <div style={{ fontWeight: 600 }}>
                {new Date(application.submittedAt).toLocaleDateString()}
              </div>
            </div>
            <div>
              <span style={{ color: "rgba(245, 241, 232, 0.5)", fontSize: "0.75rem" }}>Assigned Partner ID:</span>
              <div style={{ fontWeight: 600, color: application.partnerIdAssigned ? "#d4af37" : "rgba(245, 241, 232, 0.6)" }}>
                {application.partnerIdAssigned || "Pending Final Approval"}
              </div>
            </div>
            <div>
              <span style={{ color: "rgba(245, 241, 232, 0.5)", fontSize: "0.75rem" }}>Verification Milestones:</span>
              <div style={{ fontWeight: 600 }}>
                {application.checklist?.completedCount} of {application.checklist?.totalItems} Milestones Completed
              </div>
            </div>
            <div>
              <span style={{ color: "rgba(245, 241, 232, 0.5)", fontSize: "0.75rem" }}>Business Category:</span>
              <div style={{ fontWeight: 600 }}>{application.businessType}</div>
            </div>
          </div>

          {application.decisionReason && (
            <div
              style={{
                background: "rgba(176, 141, 87, 0.1)",
                border: "1px solid rgba(176, 141, 87, 0.3)",
                padding: "1rem",
                borderRadius: "8px",
                fontSize: "0.82rem",
                color: "#f5f1e8",
                marginBottom: "1.5rem",
              }}
            >
              <strong>Notes from Verification Officer:</strong> {application.decisionReason}
            </div>
          )}

          <div style={{ textAlign: "center" }}>
            <Link href="/partners/register" className="btn-secondary" style={{ fontSize: "0.8rem" }}>
              Submit New Application
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PartnerStatusPage() {
  return (
    <div className="partner-status-route">
      <SiteNav />
      <Suspense fallback={<div style={{ minHeight: "80vh" }} />}>
        <StatusContent />
      </Suspense>
      <SiteFooter />
    </div>
  );
}
