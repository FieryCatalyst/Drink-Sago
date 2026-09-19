"use client";

import { Analytics } from "@vercel/analytics/react";
import { useEffect, useState } from "react";

const CONSENT_KEY = "sago-analytics-consent";

type Consent = "accepted" | "rejected" | null;

export default function AnalyticsConsent() {
  const [consent, setConsent] = useState<Consent>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const storedConsent = window.localStorage.getItem(CONSENT_KEY);
      setConsent(storedConsent === "accepted" || storedConsent === "rejected" ? storedConsent : null);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const updateConsent = (value: Exclude<Consent, null>) => {
    window.localStorage.setItem(CONSENT_KEY, value);
    setConsent(value);
  };

  return (
    <>
      {consent === "accepted" && <Analytics />}
      {consent === null && (
        <aside className="consent-banner" aria-label="Analytics consent">
          <p>We use privacy-friendly analytics to understand site visits. It is optional and does not affect your access.</p>
          <div className="consent-banner__actions">
            <button type="button" className="button button-outline" onClick={() => updateConsent("rejected")}>Reject analytics</button>
            <button type="button" className="button" onClick={() => updateConsent("accepted")}>Allow analytics</button>
          </div>
        </aside>
      )}
    </>
  );
}
