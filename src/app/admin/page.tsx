"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Users,
  Building2,
  Calendar,
  Award,
  Globe,
  Search,
  RefreshCw,
  Download,
  Copy,
  Trash2,
  ArrowRight,
  Check,
  ExternalLink,
  ShieldCheck,
  LogOut,
  Eye,
  EyeOff,
  UserCheck,
} from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import PartnerAdminDashboard from "@/components/admin/partner-admin-dashboard";
import "./admin.css";

interface Member {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  email_normalized: string;
  birth_year: number | null;
  country: string | null;
  is_bartender: boolean;
  consent: boolean;
  source: string;
  created_at: string;
  updated_at: string;
}

interface Stats {
  total: number;
  newThisWeek: number;
  bartendersCount: number;
  topCountries: Array<{ country: string; count: number }>;
}

export default function AdminPage() {
  // User Credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Authenticated state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authToken, setAuthToken] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [authError, setAuthError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [adminSection, setAdminSection] = useState<"collective" | "partners">("partners");

  // Track current auth generation to invalidate stale loads
  const authGenerationRef = useRef(0);

  // Dashboard Data
  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "bartenders" | "members">("all");

  // Feedback & Dialogs
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  const loadData = useCallback(async (token: string, generation: number): Promise<boolean> => {
    setIsLoading(true);
    setLoadError("");

    try {
      const res = await fetch("/api/admin/collective", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401 && generation === authGenerationRef.current) {
          // Clear stored token on 401 only if this request matches current auth state
          if (typeof window !== "undefined") {
            localStorage.removeItem("sago_admin_token");
            localStorage.removeItem("sago_admin_email");
          }
        }
        throw new Error(data.error || "Failed to load collective data.");
      }

      // Only apply results if this is still the current auth generation
      if (generation === authGenerationRef.current) {
        setIsAuthenticated(true);
        setMembers(data.members || []);
        setStats(data.stats || null);
        return true;
      }
      return false;
    } catch (err: unknown) {
      if (generation === authGenerationRef.current) {
        const msg = err instanceof Error ? err.message : "Authentication failed";
        setAuthError(msg);
        setIsAuthenticated(false);
      }
      return false;
    } finally {
      if (generation === authGenerationRef.current) {
        setIsLoading(false);
        setIsVerifying(false);
      }
    }
  }, []);

  // Check active session on mount
  useEffect(() => {
    let isMounted = true;

    async function checkExistingSession() {
      // Check stored token first - validate with server before setting authenticated
      const storedToken = typeof window !== "undefined" ? localStorage.getItem("sago_admin_token") : null;
      const storedEmail = typeof window !== "undefined" ? localStorage.getItem("sago_admin_email") : null;
      if (storedToken && isMounted) {
        setAuthToken(storedToken);
        setUserEmail(storedEmail || "Admin");
        const gen = ++authGenerationRef.current;
        const loadSuccess = await loadData(storedToken, gen);
        // If loading succeeds or component unmounted, return
        if (loadSuccess || !isMounted) return;
        // If loading fails, clear auth error and continue to Supabase session/refresh-token paths
        setAuthError("");
      }

      try {
        const client = getBrowserSupabase();
        const { data } = await client.auth.getSession();
        if (data?.session?.access_token && isMounted) {
          setAuthToken(data.session.access_token);
          setUserEmail(data.session.user.email || "Admin");
          const gen = ++authGenerationRef.current;
          await loadData(data.session.access_token, gen);
        } else {
          // Try to restore session from stored refresh token
          const storedRefreshToken = typeof window !== "undefined" ? localStorage.getItem("sago_admin_refresh_token") : null;
          if (storedRefreshToken && isMounted) {
            try {
              const { data: refreshData, error: refreshError } = await client.auth.refreshSession({
                refresh_token: storedRefreshToken,
              });
              if (!refreshError && refreshData?.session?.access_token) {
                setAuthToken(refreshData.session.access_token);
                setUserEmail(refreshData.session.user?.email || "Admin");
                if (typeof window !== "undefined") {
                  localStorage.setItem("sago_admin_token", refreshData.session.access_token);
                  localStorage.setItem("sago_admin_refresh_token", refreshData.session.refresh_token);
                }
                const gen = ++authGenerationRef.current;
                await loadData(refreshData.session.access_token, gen);
              }
            } catch {
              // Refresh failed, will fall through to not authenticated
            }
          }
        }
      } catch {
        // Not authenticated
      } finally {
        if (isMounted) {
          setAuthError("");
        }
      }
    }

    checkExistingSession();

    return () => {
      isMounted = false;
    };
  }, [loadData]);

  // Listen for token refresh events to keep auth token in sync
  useEffect(() => {
    const client = getBrowserSupabase();
    const { data: listener } = client.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED" && session?.access_token) {
        setAuthToken(session.access_token);
        setUserEmail(session.user?.email || "Admin");
        if (typeof window !== "undefined") {
          localStorage.setItem("sago_admin_token", session.access_token);
          localStorage.setItem("sago_admin_email", session.user?.email || "Admin");
        }
        const gen = ++authGenerationRef.current;
        loadData(session.access_token, gen);
      } else if (event === "SIGNED_OUT") {
        authGenerationRef.current += 1;
        // Clear in-memory session and cached member state
        setIsAuthenticated(false);
        setAuthToken("");
        setUserEmail("");
        setMembers([]);
        setStats(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("sago_admin_token");
          localStorage.removeItem("sago_admin_refresh_token");
          localStorage.removeItem("sago_admin_email");
        }
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [loadData]);


  // User Sign In
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setAuthError("Please provide both user email and password.");
      return;
    }

    setIsVerifying(true);
    setAuthError("");

    try {
      // Try dedicated server admin login endpoint (supports both sago2026 and sago26)
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success && data.token) {
        setAuthToken(data.token);
        setUserEmail(data.email || email.trim());
        if (typeof window !== "undefined") {
          localStorage.setItem("sago_admin_token", data.token);
          localStorage.setItem("sago_admin_email", data.email || email.trim());
          if (data.refreshToken) {
            localStorage.setItem("sago_admin_refresh_token", data.refreshToken);
          }
        }
        const gen = ++authGenerationRef.current;
        const loadSuccess = await loadData(data.token, gen);
        if (loadSuccess) {
          setIsAuthenticated(true);
          showToast(`Welcome back, ${data.email || "Admin"}`);
        }
        setIsVerifying(false);
        return;
      }

      // Supabase direct fallback
      const client = getBrowserSupabase();
      const { data: sbData, error: sbError } = await client.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (sbError || !sbData.session) {
        throw new Error(data.error || sbError?.message || "Invalid administrator credentials.");
      }

      setAuthToken(sbData.session.access_token);
      setUserEmail(sbData.user?.email || email);
      if (typeof window !== "undefined") {
        localStorage.setItem("sago_admin_token", sbData.session.access_token);
        localStorage.setItem("sago_admin_email", sbData.user?.email || email);
      }
      const gen = ++authGenerationRef.current;
      const loadSuccess = await loadData(sbData.session.access_token, gen);
      if (loadSuccess) {
        setIsAuthenticated(true);
        showToast(`Welcome back, ${sbData.user?.email || "Admin"}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setAuthError(msg);
      setIsVerifying(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("sago_admin_token");
        localStorage.removeItem("sago_admin_refresh_token");
        localStorage.removeItem("sago_admin_email");
      }
      const client = getBrowserSupabase();
      await client.auth.signOut();
    } catch {
      // Ignored
    }

    authGenerationRef.current += 1;
    setIsAuthenticated(false);
    setAuthToken("");
    setUserEmail("");
    setPassword("");
    setMembers([]);
    setStats(null);
    showToast("Signed out");
  };

  const reloadData = () => {
    if (!authToken) return;
    const gen = ++authGenerationRef.current;
    loadData(authToken, gen);
    showToast("Refreshed from database");
  };

  const handleCopyEmail = (mEmail: string) => {
    navigator.clipboard.writeText(mEmail);
    showToast(`Copied ${mEmail}`);
  };

  const handleDelete = async () => {
    if (!deletingMember) return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/admin/collective", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ id: deletingMember.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete member");

      setMembers((prev) => prev.filter((m) => m.id !== deletingMember.id));
      showToast("Member removed");
      setDeletingMember(null);
      reloadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not delete";
      showToast(`Error: ${msg}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const exportCSV = () => {
    if (!members.length) {
      showToast("No members to export");
      return;
    }

    const headers = [
      "ID",
      "First Name",
      "Last Name",
      "Email",
      "Country",
      "Birth Year",
      "Is Bartender",
      "Source",
      "Registered At",
    ];

    const escapeCsvField = (value: string): string => {
      if (value === undefined || value === null) return "";
      let str = String(value);
      if (str.startsWith("=") || str.startsWith("+") || str.startsWith("-") || str.startsWith("@")) {
        str = "'" + str;
      }
      if (str.includes('"') || str.includes(",") || str.includes("\n") || str.includes("\r")) {
        str = '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const rows = members.map((m) => [
      escapeCsvField(m.id),
      escapeCsvField(m.first_name || ""),
      escapeCsvField(m.last_name || ""),
      escapeCsvField(m.email),
      escapeCsvField(m.country || ""),
      escapeCsvField(m.birth_year ? String(m.birth_year) : ""),
      escapeCsvField(m.is_bartender ? "YES" : "NO"),
      escapeCsvField(m.source),
      escapeCsvField(new Date(m.created_at).toLocaleString()),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `sago_collective_members_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV downloaded");
  };

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (roleFilter === "bartenders" && !m.is_bartender) return false;
      if (roleFilter === "members" && m.is_bartender) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const fullName = `${m.first_name || ""} ${m.last_name || ""}`.toLowerCase();
      const mEmail = m.email.toLowerCase();
      const country = (m.country || "").toLowerCase();

      return fullName.includes(q) || mEmail.includes(q) || country.includes(q);
    });
  }, [members, searchQuery, roleFilter]);

  const currentYear = new Date().getFullYear();

  // ── Render Login Gate ──────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <main className="admin-wrapper">
        <div className="admin-gate-overlay">
          <div className="admin-gate-card">
            <span className="admin-gate-badge">
              <ShieldCheck size={14} /> RESTRICTED ACCESS
            </span>
            <h1 className="admin-gate-title">COLLECTIVE PORTAL</h1>
            <p className="admin-gate-subtitle">
              Sign in with your user credentials to access real-time member records.
            </p>

            <form onSubmit={handleLogin} className="admin-gate-form">
              <div className="admin-gate-field">
                <label htmlFor="admin-email" className="admin-field-label">User Email</label>
                <input
                  id="admin-email"
                  type="email"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isVerifying}
                  className="admin-gate-input"
                  required
                  autoFocus
                />
              </div>

              <div className="admin-gate-field">
                <label htmlFor="admin-password" className="admin-field-label">Password</label>
                <div className="admin-gate-input-wrap">
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isVerifying}
                    className="admin-gate-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="admin-toggle-pwd"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {authError && <div className="admin-error-text">{authError}</div>}

              <button
                type="submit"
                disabled={isVerifying || !email || !password}
                className="admin-gate-btn"
              >
                {isVerifying ? "Signing In..." : "Sign In"}{" "}
                <ArrowRight size={15} />
              </button>
            </form>

            <p className="admin-gate-hint">
              Protected with encrypted session tokens.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ── Render Dashboard ───────────────────────────────────────
  return (
    <main className="admin-wrapper">
      {/* Top Header */}
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-brand">
            <span className="admin-logo-text">
              SAGO <span className="admin-logo-sub">COLLECTIVE ADMIN</span>
            </span>
            <div className="admin-live-badge" title="Live synchronized with database">
              <span className="admin-pulse-dot" /> Live DB Sync
            </div>

            {userEmail && (
              <div className="admin-user-pill" title="Authenticated User">
                <UserCheck size={13} /> {userEmail}
              </div>
            )}
          </div>

          <div className="admin-top-actions">
            <button
              onClick={reloadData}
              disabled={isLoading}
              className="admin-btn-secondary"
              title="Refresh database records"
            >
              <RefreshCw
                size={14}
                className={isLoading ? "animate-spin" : undefined}
              />
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>

            <button
              onClick={exportCSV}
              className="admin-btn-primary"
              title="Export all members to CSV"
            >
              <Download size={14} /> Export CSV
            </button>

            <Link
              href="/club"
              target="_blank"
              className="admin-btn-secondary"
              title="Open Public Collective Page"
            >
              <ExternalLink size={14} /> View Page
            </Link>

            <button
              onClick={handleLogout}
              className="admin-btn-secondary"
              title="Sign Out of Admin Portal"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Admin Module Switcher */}
      <div
        style={{
          background: "#0d0d0d",
          borderBottom: "1px solid rgba(176, 141, 87, 0.2)",
          padding: "0.5rem 1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            display: "flex",
            gap: "0.75rem",
          }}
        >
          <button
            type="button"
            onClick={() => setAdminSection("partners")}
            style={{
              background: adminSection === "partners" ? "rgba(176, 141, 87, 0.2)" : "transparent",
              border: "1px solid",
              borderColor: adminSection === "partners" ? "#b08d57" : "transparent",
              color: adminSection === "partners" ? "#d4af37" : "rgba(245, 241, 232, 0.6)",
              padding: "0.45rem 1rem",
              borderRadius: "8px",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
            }}
          >
            <Building2 size={15} /> Partner Applications & Verification
          </button>

          <button
            type="button"
            onClick={() => setAdminSection("collective")}
            style={{
              background: adminSection === "collective" ? "rgba(176, 141, 87, 0.2)" : "transparent",
              border: "1px solid",
              borderColor: adminSection === "collective" ? "#b08d57" : "transparent",
              color: adminSection === "collective" ? "#d4af37" : "rgba(245, 241, 232, 0.6)",
              padding: "0.45rem 1rem",
              borderRadius: "8px",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
            }}
          >
            <Users size={15} /> SAGO Collective Members
          </button>
        </div>
      </div>

      {adminSection === "partners" ? (
        <div style={{ maxWidth: "1400px", margin: "0 auto", width: "100%" }}>
          <PartnerAdminDashboard authToken={authToken} adminEmail={userEmail} />
        </div>
      ) : (
        /* Main Container */
        <div className="admin-container">
        {loadError && <div className="admin-error-text mb-4">{loadError}</div>}

        {/* KPI Metrics Grid */}
        <section className="admin-kpi-grid" aria-label="Key Performance Indicators">
          <div className="admin-kpi-card">
            <div className="admin-kpi-header">
              <span className="admin-kpi-title">Total Collective</span>
              <Users size={18} className="admin-kpi-icon" />
            </div>
            <div className="admin-kpi-val">{stats?.total ?? members.length}</div>
            <div className="admin-kpi-sub">Registered subscribers in database</div>
          </div>

          <div className="admin-kpi-card">
            <div className="admin-kpi-header">
              <span className="admin-kpi-title">New (Past 7 Days)</span>
              <Calendar size={18} className="admin-kpi-icon" />
            </div>
            <div className="admin-kpi-val">{stats?.newThisWeek ?? 0}</div>
            <div className="admin-kpi-sub">Recent registrations</div>
          </div>

          <div className="admin-kpi-card">
            <div className="admin-kpi-header">
              <span className="admin-kpi-title">Bar Industry / Bartenders</span>
              <Award size={18} className="admin-kpi-icon" />
            </div>
            <div className="admin-kpi-val">{stats?.bartendersCount ?? 0}</div>
            <div className="admin-kpi-sub">
              {stats?.total
                ? `${Math.round(((stats.bartendersCount || 0) / stats.total) * 100)}% of total members`
                : "0% of total"}
            </div>
          </div>

          <div className="admin-kpi-card">
            <div className="admin-kpi-header">
              <span className="admin-kpi-title">Top Market</span>
              <Globe size={18} className="admin-kpi-icon" />
            </div>
            <div className="admin-kpi-val" style={{ fontSize: "1.45rem", paddingTop: "0.2rem" }}>
              {stats?.topCountries?.[0]?.country || "Global"}
            </div>
            <div className="admin-kpi-sub">
              {stats?.topCountries?.[0]
                ? `${stats.topCountries[0].count} registrations`
                : "Awaiting registrations"}
            </div>
          </div>
        </section>

        {/* Search & Filter Toolbar */}
        <div className="admin-toolbar">
          <div className="admin-search-wrap">
            <Search size={15} className="admin-search-icon" />
            <input
              type="text"
              placeholder="Search by name, email, or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
          </div>

          <div className="admin-filter-group">
            <button
              onClick={() => setRoleFilter("all")}
              className={`admin-filter-btn ${roleFilter === "all" ? "active" : ""}`}
            >
              All ({members.length})
            </button>
            <button
              onClick={() => setRoleFilter("bartenders")}
              className={`admin-filter-btn ${roleFilter === "bartenders" ? "active" : ""}`}
            >
              Bartenders ({members.filter((m) => m.is_bartender).length})
            </button>
            <button
              onClick={() => setRoleFilter("members")}
              className={`admin-filter-btn ${roleFilter === "members" ? "active" : ""}`}
            >
              Enthusiasts ({members.filter((m) => !m.is_bartender).length})
            </button>
          </div>

          <div className="admin-count-pill">
            Showing {filteredMembers.length} of {members.length} members
          </div>
        </div>

        {/* Members Table */}
        <div className="admin-table-card">
          <div className="admin-table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Email</th>
                  <th>Location</th>
                  <th>Age / Year</th>
                  <th>Industry Status</th>
                  <th>Channel</th>
                  <th>Registered</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => {
                    const fullName =
                      [member.first_name, member.last_name].filter(Boolean).join(" ") ||
                      "Anonymous Member";

                    const initials =
                      (member.first_name?.[0] || "") + (member.last_name?.[0] || "") ||
                      member.email.slice(0, 2).toUpperCase();

                    const age = member.birth_year ? currentYear - member.birth_year : null;
                    const dateObj = new Date(member.created_at);

                    return (
                      <tr key={member.id}>
                        <td>
                          <div className="admin-member-cell">
                            <div className="admin-avatar-init">{initials}</div>
                            <span className="admin-member-name">{fullName}</span>
                          </div>
                        </td>

                        <td>
                          <div className="admin-email-cell">
                            <span className="admin-email-text">{member.email}</span>
                            <button
                              onClick={() => handleCopyEmail(member.email)}
                              className="admin-copy-btn"
                              title="Copy email address"
                            >
                              <Copy size={13} />
                            </button>
                          </div>
                        </td>

                        <td>{member.country || "Zambia"}</td>

                        <td>
                          {age ? (
                            <span>
                              {age} yrs{" "}
                              <span style={{ opacity: 0.45 }}>({member.birth_year})</span>
                            </span>
                          ) : (
                            <span style={{ opacity: 0.4 }}>—</span>
                          )}
                        </td>

                        <td>
                          {member.is_bartender ? (
                            <span className="admin-pill-bartender">
                              <Award size={11} /> Bartender
                            </span>
                          ) : (
                            <span className="admin-pill-member">Member</span>
                          )}
                        </td>

                        <td>
                          <span className="admin-pill-source">
                            {member.source === "club_modal"
                              ? "Quick Modal"
                              : "Collective Page"}
                          </span>
                        </td>

                        <td>
                          <span className="admin-date-text">
                            {dateObj.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="admin-relative-time">
                            {dateObj.toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </td>

                        <td style={{ textAlign: "right" }}>
                          <button
                            onClick={() => setDeletingMember(member)}
                            className="admin-delete-btn"
                            title="Delete this registration"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8}>
                      <div className="admin-empty-state">
                        <Users size={36} className="admin-empty-icon" />
                        <h3 className="admin-empty-title">
                          {searchQuery
                            ? "No matching members found"
                            : "No registrations yet"}
                        </h3>
                        <p className="admin-empty-desc">
                          {searchQuery
                            ? "Try refining your search keyword or clearing the filters."
                            : "As soon as visitors complete the SAGO Collective form on /club, their registrations will appear here automatically."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingMember && (
        <div className="admin-modal-backdrop" onClick={() => setDeletingMember(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="admin-modal-title">Remove Registration?</h3>
            <p className="admin-modal-desc">
              Are you sure you want to delete the record for{" "}
              <strong>{deletingMember.email}</strong>? This action will permanently remove
              them from the database.
            </p>
            <div className="admin-modal-actions">
              <button
                onClick={() => setDeletingMember(null)}
                className="admin-btn-secondary"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="admin-btn-danger"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Member"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="admin-toast">
          <Check size={16} color="#b08d57" />
          <span>{toastMessage}</span>
        </div>
      )}
    </main>
  );
}
