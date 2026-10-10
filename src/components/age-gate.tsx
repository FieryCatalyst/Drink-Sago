"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

import { COUNTRIES, getLegalDrinkingAge } from "@/lib/countries";

const AGE_GATE_KEY = "sago-age-verified";

function setAgeVerificationCookie() {
  document.cookie = "sago-age-verified=true; path=/; max-age=31536000; samesite=lax";
}

export default function AgeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = Boolean(pathname?.startsWith("/admin"));

  const [verified, setVerified] = useState<boolean | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [birthYear, setBirthYear] = useState("");
  const [country, setCountry] = useState("Zambia");
  const [submitted, setSubmitted] = useState(false);


  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const isVerified = window.localStorage.getItem(AGE_GATE_KEY) === "true";
      if (isVerified) setAgeVerificationCookie();
      setVerified(isVerified);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const currentYear = new Date().getFullYear();
  const requiredAge = getLegalDrinkingAge(country);
  const yearNumber = Number(birthYear);
  const isLegalAge = birthYear.length === 4 && yearNumber >= 1900 && currentYear - yearNumber >= requiredAge;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLegalAge) {
      setSubmitted(true);
      return;
    }
    window.localStorage.setItem(AGE_GATE_KEY, "true");
    setAgeVerificationCookie();
    setIsExiting(true);
    setTimeout(() => {
      setVerified(true);
      setIsExiting(false);
    }, 650);
  };

  if (isAdminRoute) {
    return <>{children}</>;
  }

  if (verified === null) {
    return <div className="age-gate-loading" aria-hidden="true" />;
  }


  return (
    <>
      <div className={`age-gate-content-wrap ${!verified && !isExiting ? "is-under-gate" : ""}`}>
        {children}
      </div>

      {!verified && (
        <div
          className={`age-gate ${isExiting ? "is-exiting" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="age-gate-title"
        >
      <div className="age-gate__bg">
        <Image
          src="/assets/8.png"
          alt=""
          fill
          sizes="100vw"
          className="age-gate__bg-image"
          priority
        />
        <div className="age-gate__bg-shade" />
      </div>
      <div className="age-gate__panel">
        <Image
          src="/assets/Sago Logo.png"
          alt="Sago"
          width={58}
          height={58}
          className="age-gate__logo"
          priority
        />
        <h1 id="age-gate-title" className="display">
          <span className="age-gate__title-line">Are you of legal</span>
          <span className="age-gate__title-line"><em>drinking age?</em></span>
        </h1>
        <p className="age-gate__copy">
          You must meet the legal drinking age where you live to enter this website.
          <br />
          Please enjoy Sago responsibly.
        </p>
        <form onSubmit={handleSubmit} className="age-gate__form" noValidate>
          <div className="age-gate__fields">
            <div className="age-gate__field">
              <label htmlFor="birth-year" className="age-gate__label">Birth year*</label>
              <input
                id="birth-year"
                type="number"
                className={`age-gate__input ${submitted && !isLegalAge ? "age-gate__input--error" : ""}`}
                placeholder="YYYY"
                value={birthYear}
                onChange={(e) => {
                  setBirthYear(e.target.value.slice(0, 4));
                  if (submitted) setSubmitted(false);
                }}
                max={currentYear}
                min={1900}
                required
                autoComplete="off"
                aria-describedby="birth-year-hint"
              />
              <span id="birth-year-hint" className="age-gate__hint">Must meet the selected location age requirement</span>
            </div>
            <div className="age-gate__field">
              <label htmlFor="country" className="age-gate__label">Location*</label>
              <div className="age-gate__select-wrapper">
                <select
                  id="country"
                  className="age-gate__select"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ArrowRight size={16} className="age-gate__select-arrow" />
              </div>
            </div>
          </div>
          <p className="age-gate__hint">You must meet the legal drinking age for your selected location.</p>
          <button type="submit" className="age-gate__enter" disabled={!isLegalAge}>
            <span>Enter</span>
          </button>
        </form>
        <p className="age-gate__fine-print">
          By entering, you confirm that you meet the legal drinking age where you live and agree to our{" "}
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="age-gate__link">Terms & Conditions</a> and{" "}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="age-gate__link">Privacy Policy</a>.
        </p>

        <p className="age-gate__responsible">Please drink Sago responsibly.</p>
      </div>
    </div>
      )}
    </>
  );
}