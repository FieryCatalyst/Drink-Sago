"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Camera,
  Keyboard,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  LogOut,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldCheck,
  Building2,
  Clock,
  Ticket,
  ChevronRight,
  Sparkles,
  Upload,
  SwitchCamera,
} from "lucide-react";

type StaffProfile = {
  id: string;
  email: string;
  displayName: string;
  role: string;
};

type BarProfile = {
  id: string;
  name: string;
  outletCode: string;
  location: string;
  address: string;
  city: string;
  country: string;
};

type CouponVerification = {
  isValid: boolean;
  error?: string;
  couponCode?: string;
  tier?: string;
  bottleDiscount?: number;
  shotDiscount?: number;
  combination?: string[];
  reward?: string;
  customerMaskedName?: string;
  venueName?: string;
  venueAddress?: string;
  venueCity?: string;
  expiresAt?: string;
  issuedAt?: string;
  status?: string;
  redeemedAt?: string;
};

type RedemptionResult = {
  success: boolean;
  error?: string;
  confirmationRef?: string;
  couponCode?: string;
  tier?: string;
  bottleDiscount?: number;
  shotDiscount?: number;
  redeemedAt?: string;
  barName?: string;
  message?: string;
  idempotentReplay?: boolean;
};

type ActivityLog = {
  id: string;
  couponCode: string;
  barId: string;
  barName: string;
  staffEmail: string;
  action: "verification_success" | "verification_failed" | "redeemed" | "redemption_rejected";
  result: string;
  requestId?: string;
  discountApplied?: string;
  createdAt: string;
};

export default function VerificationPortalPage() {
  // Auth state
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [staff, setStaff] = useState<StaffProfile | null>(null);
  const [bar, setBar] = useState<BarProfile | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Dashboard active view
  const [activeTab, setActiveTab] = useState<"scan" | "manual">("scan");
  const [manualCode, setManualCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<CouponVerification | null>(null);

  // Redemption state
  const [redeeming, setRedeeming] = useState(false);
  const [redemptionReceipt, setRedemptionReceipt] = useState<RedemptionResult | null>(null);

  // Bar activity & stats
  const [todayRedeemedCount, setTodayRedeemedCount] = useState(0);
  const [todayRejectedCount, setTodayRejectedCount] = useState(0);
  const [recentLogs, setRecentLogs] = useState<ActivityLog[]>([]);
  const [refreshingActivity, setRefreshingActivity] = useState(false);

  // QR Scanner refs & state
  type CameraStatus = "idle" | "starting" | "active" | "blocked" | "error";
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("idle");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanFrameIdRef = useRef<number | null>(null);
  const scanCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isScanningRef = useRef<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraFacingMode, setCameraFacingMode] = useState<"environment" | "user">("environment");

  // Ref for handleVerifyCode to avoid stale closure in camera scanner callback
  const handleVerifyCodeRef = useRef<((code: string) => Promise<void>) | null>(null);

  // Redemption request ID state
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);

  // Clock
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) +
          " · " +
          now.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper to get auth headers (supports both token and cookies)
  const getAuthHeaders = useCallback(
    (extraHeaders: Record<string, string> = {}) => {
      const token = authToken || (typeof window !== "undefined" ? localStorage.getItem("sago_verify_token") : null);
      const headers: Record<string, string> = { ...extraHeaders };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      return headers;
    },
    [authToken]
  );

  // Check existing session on load
  const checkSession = useCallback(async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("sago_verify_token") : null;
      if (token) {
        setAuthToken(token);
      }
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch("/api/verify/auth/me", { method: "GET", headers });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setStaff(data.staff);
          setBar(data.bar);
        }
      }
    } catch (err) {
      console.error("Session check failed", err);
    } finally {
      setLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Load bar activity history
  const loadBarActivity = useCallback(async () => {
    if (!staff || !bar) return;
    setRefreshingActivity(true);
    try {
      const res = await fetch("/api/verify/activity", {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setTodayRedeemedCount(data.todaySuccessfulCount || 0);
        setTodayRejectedCount(data.todayRejectedCount || 0);
        setRecentLogs(data.recentActivity || []);
      }
    } catch (err) {
      console.error("Failed to fetch activity", err);
    } finally {
      setRefreshingActivity(false);
    }
  }, [staff, bar, getAuthHeaders]);

  useEffect(() => {
    if (staff && bar) {
      loadBarActivity();
    }
  }, [staff, bar, loadBarActivity]);

  // Clean up camera on tab change or unmount
  const stopCamera = useCallback(() => {
    isScanningRef.current = false;
    if (scanFrameIdRef.current) {
      cancelAnimationFrame(scanFrameIdRef.current);
      scanFrameIdRef.current = null;
    }
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {
        console.warn("Error stopping media tracks", e);
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      } catch (e) {
        console.warn("Error clearing video srcObject", e);
      }
    }
    setCameraStatus("idle");
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Start QR Scanner using direct native getUserMedia stream + robust continuous frame decoding
  const startCameraScanner = useCallback(
    async (facing: "environment" | "user" = cameraFacingMode) => {
      stopCamera();
      setCameraError(null);
      setCameraStatus("starting");

      // Check secure context first (iOS Safari & Android Chrome strictly require HTTPS or localhost for getUserMedia)
      const isLocalhost =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1" ||
          window.location.hostname.endsWith(".localhost"));
      const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
      const hasMediaDevices =
        typeof navigator !== "undefined" && !!navigator.mediaDevices && !!navigator.mediaDevices.getUserMedia;

      if (!hasMediaDevices || (!isHttps && !isLocalhost)) {
        setCameraStatus("blocked");
        setCameraError(
          "Mobile browsers require HTTPS to stream live camera. Tap 'Snap Photo of QR' below to scan instantly with your phone camera."
        );
        return;
      }

      try {
        // Direct media stream request with rear camera priority
        let stream: MediaStream;
        try {
          const constraints: MediaStreamConstraints = {
            video: {
              facingMode: { ideal: facing },
              width: { ideal: 1280, max: 1920 },
              height: { ideal: 720, max: 1080 },
            },
            audio: false,
          };
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (constraintErr) {
          console.warn("Retrying with general video constraint:", constraintErr);
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }

        streamRef.current = stream;

        const videoEl = videoRef.current;
        if (!videoEl) {
          setCameraStatus("idle");
          return;
        }

        videoEl.srcObject = stream;
        videoEl.setAttribute("playsinline", "true");
        videoEl.setAttribute("webkit-playsinline", "true");
        videoEl.muted = true;
        videoEl.defaultMuted = true;

        // Start playback
        await videoEl.play();
        setCameraStatus("active");
        isScanningRef.current = true;

        // Import ZXing dynamically for browser
        const { BrowserQRCodeReader } = await import("@zxing/browser");
        const codeReader = new BrowserQRCodeReader();

        // Process frames continuously
        const processFrame = async () => {
          if (!isScanningRef.current || !videoRef.current) return;
          const currentVideo = videoRef.current;

          if (currentVideo.readyState >= 2 && currentVideo.videoWidth > 0) {
            let foundCode: string | null = null;

            // 1. Try native BarcodeDetector API (hardware accelerated in Android Chrome & Safari 17+)
            if (typeof window !== "undefined" && "BarcodeDetector" in window) {
              try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
                const results = await detector.detect(currentVideo);
                if (results && results.length > 0 && results[0].rawValue) {
                  foundCode = results[0].rawValue;
                }
              } catch {
                // Ignore detector failure and fallback to canvas
              }
            }

            // 2. Fallback to ZXing canvas decoding
            if (!foundCode) {
              if (!scanCanvasRef.current) {
                scanCanvasRef.current = document.createElement("canvas");
              }
              const canvas = scanCanvasRef.current;
              canvas.width = Math.min(640, currentVideo.videoWidth);
              canvas.height = Math.min(640, currentVideo.videoHeight);
              const ctx = canvas.getContext("2d", { willReadFrequently: true });
              if (ctx) {
                ctx.drawImage(currentVideo, 0, 0, canvas.width, canvas.height);
                try {
                  const zxingResult = codeReader.decodeFromCanvas(canvas);
                  if (zxingResult && zxingResult.getText()) {
                    foundCode = zxingResult.getText();
                  }
                } catch {
                  // Frame had no readable QR code; continue scanning
                }
              }
            }

            // If a valid QR code was detected
            if (foundCode) {
              if (typeof navigator !== "undefined" && navigator.vibrate) {
                try {
                  navigator.vibrate(60);
                } catch {
                  // ignore
                }
              }
              stopCamera();
              handleVerifyCodeRef.current?.(foundCode);
              return;
            }
          }

          if (isScanningRef.current) {
            scanFrameIdRef.current = requestAnimationFrame(processFrame);
          }
        };

        scanFrameIdRef.current = requestAnimationFrame(processFrame);
      } catch (err: unknown) {
        console.error("Camera access error:", err);
        stopCamera();
        const errMsg = err instanceof Error ? err.message : String(err);
        if (errMsg.includes("NotAllowedError") || errMsg.includes("Permission denied")) {
          setCameraStatus("blocked");
          setCameraError(
            "Camera permission denied. Please allow camera permissions in browser settings or tap 'Snap Photo of QR' below."
          );
        } else {
          setCameraStatus("error");
          setCameraError("Camera feed could not be started. Tap 'Snap Photo of QR' below to scan using phone camera.");
        }
      }
    },
    [cameraFacingMode, stopCamera]
  );

  // Flip camera between front and back
  const handleToggleCamera = () => {
    const nextFacing = cameraFacingMode === "environment" ? "user" : "environment";
    setCameraFacingMode(nextFacing);
    startCameraScanner(nextFacing);
  };

  // Attempt auto-start when switching to scan tab
  useEffect(() => {
    if (staff && activeTab === "scan" && !verificationResult && !redemptionReceipt) {
      const timer = setTimeout(() => {
        startCameraScanner();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      stopCamera();
    }
  }, [staff, activeTab, verificationResult, redemptionReceipt, startCameraScanner, stopCamera]);

  // Decode QR from uploaded photo or camera snapshot (works on ANY mobile browser even over plain HTTP!)
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVerifying(true);
    setCameraError(null);

    try {
      const { BrowserQRCodeReader } = await import("@zxing/browser");
      const codeReader = new BrowserQRCodeReader();
      const imageUrl = URL.createObjectURL(file);

      try {
        const result = await codeReader.decodeFromImageUrl(imageUrl);
        URL.revokeObjectURL(imageUrl);
        if (result && result.getText()) {
          handleVerifyCode(result.getText());
        } else {
          setCameraError("No QR code detected in that image. Please ensure the QR is well-lit and in focus.");
        }
      } catch {
        URL.revokeObjectURL(imageUrl);
        setCameraError("Could not read QR code from image. Please try taking a closer photo or enter the code manually.");
      }
    } catch (err) {
      console.error("Image decode error", err);
      setCameraError("Failed to process QR image.");
    } finally {
      setVerifying(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError("Please provide both email and password.");
      return;
    }

    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await fetch("/api/verify/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setLoginError(data.error || "Login failed. Please check your credentials.");
      } else {
        if (data.token) {
          localStorage.setItem("sago_verify_token", data.token);
          setAuthToken(data.token);
        }
        setStaff(data.staff);
        setBar(data.bar);
        setLoginPassword("");
      }
    } catch {
      setLoginError("Unable to connect to verification server. Please check your network connection.");
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    stopCamera();
    try {
      await fetch("/api/verify/auth/logout", {
        method: "POST",
        headers: getAuthHeaders(),
      });
    } finally {
      localStorage.removeItem("sago_verify_token");
      setAuthToken(null);
      setStaff(null);
      setBar(null);
      setVerificationResult(null);
      setRedemptionReceipt(null);
    }
  };

  // Handle Code Verification (Read-only Step 3)
  const handleVerifyCode = async (codeToVerify: string) => {
    if (!codeToVerify.trim()) return;

    setVerifying(true);
    setVerificationResult(null);
    setRedemptionReceipt(null);
    setCurrentRequestId(null);

    try {
      const res = await fetch("/api/verify/coupon/check", {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ couponCode: codeToVerify.trim() }),
      });

      const data = (await res.json()) as CouponVerification;
      setVerificationResult(data);
      if (data.isValid) {
        const newRequestId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        setCurrentRequestId(newRequestId);
      }
    } catch (err) {
      console.error("Verification failed", err);
      setVerificationResult({
        isValid: false,
        error: "Network error during verification. Please try again.",
      });
    } finally {
      setVerifying(false);
      loadBarActivity();
    }
  };

  // Keep handleVerifyCodeRef synchronized
  useEffect(() => {
    handleVerifyCodeRef.current = handleVerifyCode;
  }, [handleVerifyCode]);

  // Handle Redemption Confirmation (Atomic Step 4)
  const handleConfirmRedeem = async () => {
    if (!verificationResult?.couponCode) return;

    setRedeeming(true);

    try {
      const requestId = currentRequestId || `req-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const res = await fetch("/api/verify/coupon/redeem", {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          couponCode: verificationResult.couponCode,
          requestId,
        }),
      });

      const data = (await res.json()) as RedemptionResult;
      if (res.ok && data.success) {
        setRedemptionReceipt(data);
        setVerificationResult(null);
        setManualCode("");
        setCurrentRequestId(null);
      } else {
        setVerificationResult({
          isValid: false,
          error: data.error || "Redemption could not be completed.",
          couponCode: verificationResult.couponCode,
        });
      }
    } catch (err) {
      console.error("Redemption error", err);
      setVerificationResult({
        isValid: false,
        error: "Failed to confirm redemption. Please check network connection.",
        couponCode: verificationResult?.couponCode,
      });
    } finally {
      setRedeeming(false);
      loadBarActivity();
    }
  };

  // Reset view to scan next customer
  const handleReset = () => {
    setVerificationResult(null);
    setRedemptionReceipt(null);
    setManualCode("");
    setCurrentRequestId(null);
    if (activeTab === "scan") {
      startCameraScanner();
    }
  };

  // Loading Splash
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#070707] text-[#f5f1e8] flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 relative animate-pulse mb-4">
          <Image src="/assets/Sago Logo.png" alt="SAGO" fill className="object-contain" priority />
        </div>
        <p className="text-xs uppercase tracking-[0.25em] text-[#b08d57]">Authenticating Portal...</p>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 1: LOGIN PAGE
  // -------------------------------------------------------------
  if (!staff || !bar) {
    return (
      <div className="min-h-screen bg-[#070707] text-[#f5f1e8] flex flex-col justify-between p-4 sm:p-8">
        <div className="max-w-md w-full mx-auto my-auto py-8">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto relative mb-4">
              <Image src="/assets/Sago Logo.png" alt="SAGO Logo" fill className="object-contain" priority />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1b1712] border border-[#b08d57]/30 text-[#b08d57] text-[11px] font-semibold tracking-[0.2em] uppercase mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Staff Verification Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f5f1e8] mt-2">
              Promotion Verification
            </h1>
            <p className="text-xs sm:text-sm text-[#f5f1e8]/60 mt-1">
              Authorized partner venues and bartender redemption terminal
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#f5f1e8]/70 mb-1.5">
                  Bar Staff Email
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Enter assigned bar email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 bg-[#181818] border border-white/10 rounded-xl text-sm text-[#f5f1e8] placeholder-white/30 focus:outline-none focus:border-[#b08d57] focus:ring-1 focus:ring-[#b08d57] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#f5f1e8]/70 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter assigned password"
                    autoComplete="current-password"
                    required
                    className="w-full px-4 py-3 pr-12 bg-[#181818] border border-white/10 rounded-xl text-sm text-[#f5f1e8] placeholder-white/30 focus:outline-none focus:border-[#b08d57] focus:ring-1 focus:ring-[#b08d57] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full mt-4 py-3.5 px-6 rounded-xl font-semibold text-sm uppercase tracking-wider bg-gradient-to-r from-[#b08d57] to-[#d4af37] text-black shadow-lg shadow-[#b08d57]/20 hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {loginLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Access...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Verification Portal</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-white/40 py-4 border-t border-white/5">
          SAGO Spirits Official Verification Terminal · Protected by Row-Level Security
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: AUTHENTICATED BARTENDER DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#070707] text-[#f5f1e8] flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0d0d0d]/90 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 relative shrink-0">
              <Image src="/assets/Sago Logo.png" alt="SAGO" fill className="object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-wide text-[#f5f1e8]">{bar.name}</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-semibold bg-[#b08d57]/20 text-[#d4af37] border border-[#b08d57]/40">
                  {bar.city}
                </span>
              </div>
              <div className="text-[11px] text-white/50 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-[#b08d57]" />
                <span className="truncate max-w-[180px] sm:max-w-xs">{bar.location} · {staff.displayName}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log Out"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-950/40 border border-white/10 hover:border-red-500/40 text-xs text-white/70 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 space-y-4">
        {/* Live Status & Clock */}
        <div className="flex items-center justify-between text-xs text-white/50 bg-[#121212] px-4 py-2.5 rounded-xl border border-white/5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-white/80 font-medium">Outlet Active · Zambia</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <Clock className="w-3 h-3 text-[#b08d57]" />
            <span>{currentTime || "Live"}</span>
          </div>
        </div>

        {/* Today's KPI Counters for this Bar */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#121212] border border-emerald-500/20 rounded-xl p-3.5">
            <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold mb-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Today&apos;s Redemptions
            </div>
            <div className="text-2xl font-bold text-white font-mono">{todayRedeemedCount}</div>
            <div className="text-[10px] text-white/40 mt-0.5">Approved at this outlet</div>
          </div>
          <div className="bg-[#121212] border border-amber-500/20 rounded-xl p-3.5">
            <div className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Unsuccessful Scans
            </div>
            <div className="text-2xl font-bold text-white font-mono">{todayRejectedCount}</div>
            <div className="text-[10px] text-white/40 mt-0.5">Invalid or duplicate</div>
          </div>
        </div>

        {/* -------------------------------------------------------- */}
        {/* SUCCESS RECEIPT MODAL / CARD */}
        {/* -------------------------------------------------------- */}
        {redemptionReceipt && (
          <div className="bg-gradient-to-b from-[#112417] to-[#0c160e] border border-emerald-500/50 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold uppercase tracking-widest border border-emerald-500/30">
                  Transaction Verified
                </span>
                <h2 className="text-xl font-bold text-white mt-2">
                  Coupon Successfully Redeemed!
                </h2>
                <p className="text-xs text-emerald-200/70">
                  The discount has been verified and permanently retired.
                </p>
              </div>

              {/* Receipt Box */}
              <div className="bg-black/40 border border-emerald-500/30 rounded-xl p-4 text-left space-y-2.5 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                  <span className="text-white/60">Coupon Code:</span>
                  <span className="font-mono font-bold text-[#b08d57] text-sm">
                    {redemptionReceipt.couponCode}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                  <span className="text-white/60">Discount Applied:</span>
                  <span className="font-semibold text-emerald-400">
                    {redemptionReceipt.bottleDiscount}% Bottle / {redemptionReceipt.shotDiscount}% Pour
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                  <span className="text-white/60">Confirmation Ref:</span>
                  <span className="font-mono font-semibold text-white/90">
                    {redemptionReceipt.confirmationRef}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Outlet:</span>
                  <span className="text-white/90">{bar.name}</span>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm uppercase tracking-wider bg-gradient-to-r from-[#b08d57] to-[#d4af37] text-black shadow-lg hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Verify Next Customer</span>
              </button>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------- */}
        {/* VERIFICATION RESULT CARD (Valid or Invalid) */}
        {/* -------------------------------------------------------- */}
        {!redemptionReceipt && verificationResult && (
          <div
            className={`border rounded-2xl p-6 shadow-2xl transition-all ${
              verificationResult.isValid
                ? "bg-[#131313] border-[#b08d57]/60"
                : "bg-red-950/40 border-red-500/50"
            }`}
          >
            {verificationResult.isValid ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-1 rounded bg-[#b08d57]/20 border border-[#b08d57]/40 text-[#d4af37] text-[10px] uppercase font-bold tracking-wider">
                      {verificationResult.tier || "PROMOTIONAL WINNER"}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-1.5">
                      Valid SAGO Coupon
                    </h3>
                  </div>
                  <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
                </div>

                {/* Discount Highlights */}
                <div className="grid grid-cols-2 gap-2 bg-black/50 p-3 rounded-xl border border-white/10 text-center">
                  <div className="p-2 rounded bg-white/5">
                    <div className="text-[10px] uppercase tracking-wider text-white/50">Bottle Discount</div>
                    <div className="text-xl font-bold text-[#d4af37] font-mono">
                      {verificationResult.bottleDiscount}% OFF
                    </div>
                  </div>
                  <div className="p-2 rounded bg-white/5">
                    <div className="text-[10px] uppercase tracking-wider text-white/50">Single Pour Discount</div>
                    <div className="text-xl font-bold text-[#d4af37] font-mono">
                      {verificationResult.shotDiscount}% OFF
                    </div>
                  </div>
                </div>

                {/* Details Breakdown */}
                <div className="space-y-2 text-xs text-white/70 bg-white/5 p-3 rounded-xl">
                  <div className="flex justify-between">
                    <span>Coupon Code:</span>
                    <span className="font-mono font-bold text-white">{verificationResult.couponCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span className="font-medium text-white">{verificationResult.customerMaskedName}</span>
                  </div>
                  {verificationResult.expiresAt && (
                    <div className="flex justify-between">
                      <span>Expires:</span>
                      <span className="text-white">
                        {new Date(verificationResult.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleConfirmRedeem}
                    disabled={redeeming}
                    className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-900/40 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {redeeming ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Locking &amp; Redeeming...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm &amp; Apply Discount</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={redeeming}
                    className="w-full py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    Cancel / Scan Another
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Coupon Verification Failed</h3>
                  <p className="text-xs text-red-300 mt-1">
                    {verificationResult.error || "The supplied code is invalid, expired, or already redeemed."}
                  </p>
                  {verificationResult.couponCode && (
                    <p className="text-[11px] font-mono text-white/50 mt-1">
                      Code scanned: {verificationResult.couponCode}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleReset}
                  className="w-full py-3 px-6 rounded-xl text-xs font-semibold uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  Try Again / Scan Another
                </button>
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------- */}
        {/* PRIMARY ACTION SECTION (QR SCANNER & MANUAL ENTRY TABS) */}
        {/* -------------------------------------------------------- */}
        {!redemptionReceipt && !verificationResult && (
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl">
            {/* Tab Selector */}
            <div className="flex bg-[#1a1a1a] p-1 rounded-xl mb-4 border border-white/5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("scan");
                  setCameraError(null);
                }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  activeTab === "scan"
                    ? "bg-[#b08d57] text-black shadow-md"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Scan QR Code</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("manual");
                  stopCamera();
                }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  activeTab === "manual"
                    ? "bg-[#b08d57] text-black shadow-md"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Keyboard className="w-4 h-4" />
                <span>Enter Code</span>
              </button>
            </div>

            {/* TAB 1: QR CAMERA SCANNER */}
            {activeTab === "scan" && (
              <div className="space-y-4">
                {/* Live Video Camera Box */}
                <div className="relative aspect-square max-w-[340px] mx-auto rounded-2xl overflow-hidden bg-black border-2 border-[#b08d57]/40 shadow-inner">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    autoPlay
                    muted
                    style={{ display: cameraStatus === "active" ? "block" : "none" }}
                  />

                  {/* 1. ACTIVE SCANNING VIEW */}
                  {cameraStatus === "active" && (
                    <>
                      {/* Reticle Overlay */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="relative w-56 h-56 border-2 border-[#d4af37] rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.4)] z-10 flex flex-col justify-between p-2">
                          <div className="flex justify-between">
                            <div className="w-4 h-4 border-t-2 border-l-2 border-white rounded-tl" />
                            <div className="w-4 h-4 border-t-2 border-r-2 border-white rounded-tr" />
                          </div>
                          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent animate-pulse" />
                          <div className="flex justify-between">
                            <div className="w-4 h-4 border-b-2 border-l-2 border-white rounded-bl" />
                            <div className="w-4 h-4 border-b-2 border-r-2 border-white rounded-br" />
                          </div>
                        </div>
                      </div>

                      {/* Flip camera button */}
                      <button
                        type="button"
                        onClick={handleToggleCamera}
                        title="Flip Camera (Front/Back)"
                        className="absolute top-3 right-3 z-30 p-2.5 rounded-full bg-black/80 border border-[#b08d57]/60 text-[#d4af37] hover:text-white hover:bg-black transition-all shadow-lg"
                      >
                        <SwitchCamera className="w-5 h-5" />
                      </button>

                      {/* Status Indicator */}
                      <div className="absolute bottom-3 inset-x-0 flex justify-center z-20">
                        <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-[11px] text-white/90 border border-emerald-500/30 flex items-center gap-1.5 font-medium">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          Scanning for QR code...
                        </span>
                      </div>
                    </>
                  )}

                  {/* 2. STARTING / INITIALIZING */}
                  {cameraStatus === "starting" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#0a0a0a] z-20 space-y-3">
                      <RefreshCw className="w-8 h-8 text-[#d4af37] animate-spin" />
                      <div>
                        <p className="text-xs font-semibold text-white/90">Starting Camera Feed...</p>
                        <p className="text-[11px] text-white/50 mt-1">Requesting camera permissions</p>
                      </div>
                    </div>
                  )}

                  {/* 3. IDLE: TAP TO ACTIVATE */}
                  {cameraStatus === "idle" && (
                    <div
                      onClick={() => startCameraScanner()}
                      role="button"
                      tabIndex={0}
                      className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#0d0d0d] hover:bg-[#141414] cursor-pointer z-20 space-y-3 transition-colors"
                    >
                      <div className="w-14 h-14 rounded-full bg-[#b08d57]/20 border border-[#b08d57]/40 flex items-center justify-center text-[#d4af37] shadow-lg">
                        <Camera className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-white">Tap to Start Live Camera</p>
                        <p className="text-[11px] text-white/50 mt-1 max-w-[220px]">
                          Tap here to grant camera access and activate the live QR viewfinder.
                        </p>
                      </div>
                      <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#b08d57] to-[#d4af37] text-black font-semibold text-xs tracking-wider uppercase shadow-md mt-1">
                        Activate Camera
                      </span>
                    </div>
                  )}

                  {/* 4. BLOCKED: HTTP ON MOBILE OR PERMISSION DENIED */}
                  {cameraStatus === "blocked" && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      role="button"
                      tabIndex={0}
                      className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center bg-[#130d07] hover:bg-[#1a120a] cursor-pointer z-20 space-y-3 transition-colors border-2 border-amber-500/40"
                    >
                      <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg animate-pulse">
                        <Camera className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-amber-200">Snap Photo of Customer QR</p>
                        <p className="text-[11px] text-white/60 mt-1 max-w-[230px]">
                          Live stream requires HTTPS on mobile. Tap to open phone camera and scan instantly.
                        </p>
                      </div>
                      <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#b08d57] to-[#d4af37] text-black font-semibold text-xs tracking-wider uppercase shadow-md flex items-center gap-1.5 mt-1">
                        <Upload className="w-3.5 h-3.5" />
                        Snap Photo Now
                      </span>
                    </div>
                  )}

                  {/* 5. ERROR: CAMERA HARDWARE OR PLAY ERROR */}
                  {cameraStatus === "error" && (
                    <div
                      onClick={() => startCameraScanner()}
                      role="button"
                      tabIndex={0}
                      className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#150a0a] hover:bg-[#1f0e0e] cursor-pointer z-20 space-y-3 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-white">Camera Connection Failed</p>
                        <p className="text-[10px] text-white/50 mt-0.5">Tap to retry camera, or use photo upload below.</p>
                      </div>
                      <span className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-[11px] font-semibold uppercase tracking-wider">
                        Retry Camera
                      </span>
                    </div>
                  )}
                </div>

                {/* Error Banner if direct stream fails */}
                {cameraError && (
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-center space-y-1">
                    <p className="text-xs text-amber-200">{cameraError}</p>
                  </div>
                )}

                {/* Mobile Camera Photo Upload / Instant Snapshot Fallback */}
                <div className="pt-2 text-center space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="qr-file-capture"
                  />
                  <label
                    htmlFor="qr-file-capture"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold uppercase tracking-wider text-[#d4af37] cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Take Photo / Upload QR</span>
                  </label>
                  <p className="text-[11px] text-white/40">
                    Point camera at customer QR code, or take a quick snapshot above.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: MANUAL COUPON ENTRY */}
            {activeTab === "manual" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleVerifyCode(manualCode);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#f5f1e8]/70 mb-1.5">
                    Enter SAGO Coupon Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                      placeholder="e.g. SAGO-ZM-XXXX-XXXX"
                      required
                      className="w-full px-4 py-3.5 bg-[#181818] border border-white/10 rounded-xl text-base font-mono uppercase tracking-widest text-[#f5f1e8] placeholder-white/20 focus:outline-none focus:border-[#b08d57] focus:ring-1 focus:ring-[#b08d57] transition-all"
                    />
                    <Ticket className="w-5 h-5 text-white/30 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-white/40 mt-1">
                    Accepts printed or displayed alphanumeric coupon codes.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={verifying || !manualCode.trim()}
                  className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm uppercase tracking-wider bg-gradient-to-r from-[#b08d57] to-[#d4af37] text-black shadow-lg shadow-[#b08d57]/20 hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {verifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Coupon...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Coupon Code</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* -------------------------------------------------------- */}
        {/* BAR ACTIVITY HISTORY (ISOLATED TO THIS BAR) */}
        {/* -------------------------------------------------------- */}
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/80">
                Recent Outlet Activity
              </h4>
              <span className="text-[10px] text-white/40">({bar.name} only)</span>
            </div>
            <button
              onClick={loadBarActivity}
              disabled={refreshingActivity}
              title="Refresh Activity"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshingActivity ? "animate-spin" : ""}`} />
            </button>
          </div>

          {recentLogs.length === 0 ? (
            <div className="text-center py-6 text-white/40 text-xs">
              No verification attempts recorded today at this outlet yet.
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    {log.action === "redeemed" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : log.action === "verification_success" ? (
                      <Ticket className="w-4 h-4 text-[#d4af37] shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    <div>
                      <div className="font-mono font-semibold text-white/90">
                        {log.couponCode}
                      </div>
                      <div className="text-[10px] text-white/40">
                        {log.result}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[9px] uppercase font-semibold ${
                        log.action === "redeemed"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                          : log.action === "verification_success"
                          ? "bg-[#b08d57]/20 text-[#d4af37] border border-[#b08d57]/30"
                          : "bg-red-950 text-red-300 border border-red-500/30"
                      }`}
                    >
                      {log.action.replace("_", " ")}
                    </span>
                    <div className="text-[10px] text-white/30 mt-0.5">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Subtle Mobile Bottom Nav Branding */}
      <footer className="text-center py-3 text-[10px] text-white/30 border-t border-white/5">
        SAGO Official Partner Network · Confidential Outlet System
      </footer>
    </div>
  );
}
