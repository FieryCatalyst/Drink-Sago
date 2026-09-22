"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

const AGE_GATE_KEY = "sago-age-verified";

const COUNTRIES = [
  "Zambia", "Zimbabwe", "Botswana", "Namibia", "Angola", "Tanzania", "Kenya", "Mozambique",
  "South Africa", "Nigeria", "Ghana", "Ethiopia", "Uganda", "Ivory Coast", "Senegal",
  "United Kingdom", "United States", "Canada", "Australia", "Germany", "France", "Netherlands",
  "Belgium", "Switzerland", "Austria", "Ireland", "Italy", "Spain", "Portugal", "Sweden",
  "Norway", "Denmark", "Finland", "Poland", "Czech Republic", "Hungary", "Romania", "Bulgaria",
  "Croatia", "Slovenia", "Slovakia", "Estonia", "Latvia", "Lithuania", "Greece", "Cyprus",
  "Malta", "Luxembourg", "Singapore", "Hong Kong", "Japan", "South Korea", "Taiwan", "Thailand",
  "Vietnam", "Malaysia", "Indonesia", "Philippines", "India", "China", "UAE", "Saudi Arabia",
  "Qatar", "Bahrain", "Oman", "Kuwait", "Israel", "Turkey", "Brazil", "Argentina", "Chile",
  "Colombia", "Peru", "Mexico", "New Zealand", "Other"
];

const LEGAL_AGE_BY_COUNTRY: Record<string, number> = {
  Zambia: 18, Zimbabwe: 18, Botswana: 18, Namibia: 18, Angola: 18, Tanzania: 18, Kenya: 18, Mozambique: 18,
  "South Africa": 18, Nigeria: 18, Ghana: 18, Ethiopia: 18, Uganda: 18, "Ivory Coast": 18, Senegal: 18,
  "United Kingdom": 18, "United States": 21, Canada: 18, Australia: 18, Germany: 18, France: 18, Netherlands: 18,
  Belgium: 18, Switzerland: 18, Austria: 18, Ireland: 18, Italy: 18, Spain: 18, Portugal: 18, Sweden: 18,
  Norway: 18, Denmark: 18, Finland: 18, Poland: 18, "Czech Republic": 18, Hungary: 18, Romania: 18, Bulgaria: 18,
  Croatia: 18, Slovenia: 18, Slovakia: 18, Estonia: 18, Latvia: 18, Lithuania: 18, Greece: 18, Cyprus: 18,
  Malta: 18, Luxembourg: 18, Singapore: 18, "Hong Kong": 18, Japan: 20, "South Korea": 19, Taiwan: 18,
  Thailand: 20, Vietnam: 18, Malaysia: 18, Indonesia: 21, Philippines: 18, India: 21, China: 18, UAE: 21,
  "Saudi Arabia": 21, Qatar: 21, Bahrain: 21, Oman: 21, Kuwait: 21, Israel: 18, Turkey: 18, Brazil: 18,
  Argentina: 18, Chile: 18, Colombia: 18, Peru: 18, Mexico: 18, "New Zealand": 18, Other: 18,
};

export default function AgeGate({ children }: { children: React.ReactNode }) {
  const [verified, setVerified] = useState<boolean | null>(null);
  const [birthYear, setBirthYear] = useState("");
  const [country, setCountry] = useState("Zambia");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setVerified(window.localStorage.getItem(AGE_GATE_KEY) === "true");
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const currentYear = new Date().getFullYear();
  const requiredAge = LEGAL_AGE_BY_COUNTRY[country];
  const yearNumber = Number(birthYear);
  const isLegalAge = requiredAge !== undefined && birthYear.length === 4 && yearNumber >= 1900 && currentYear - yearNumber >= requiredAge;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLegalAge) {
      setSubmitted(true);
      return;
    }
    window.localStorage.setItem(AGE_GATE_KEY, "true");
    setVerified(true);
  };

  if (verified === null) {
    return <div className="age-gate-loading" aria-hidden="true" />;
  }

  if (verified) return <>{children}</>;

  return (
    <div className="age-gate" role="dialog" aria-modal="true" aria-labelledby="age-gate-title">
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
        <h1 id="age-gate-title" className="display">Are you of legal<br /><em>drinking age?</em></h1>
        <p className="age-gate__copy">You must meet the legal drinking age where you live to enter this website. Please enjoy Sago responsibly.</p>
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
            <ArrowRight size={16} />
          </button>
        </form>
        <p className="age-gate__fine-print">
          By entering, you confirm that you meet the legal drinking age where you live and agree to our
          <a href="/terms" className="age-gate__link">Terms & Conditions</a> and
          <a href="/privacy" className="age-gate__link">Privacy Policy</a>.
        </p>
        <p className="age-gate__responsible">Please drink Sago responsibly.</p>
      </div>
    </div>
  );
}