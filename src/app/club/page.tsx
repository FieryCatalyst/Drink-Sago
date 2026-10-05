"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";

import { COUNTRIES, getLegalDrinkingAge } from "@/lib/countries";

export default function SagoClubPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    birthYear: "",
    country: "Zambia",
    isBartender: "no",
    consent: false,
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (status === "error") {
      setStatus("idle");
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();
    const email = formData.email.trim();
    const birthYear = Number(formData.birthYear.trim());
    const country = formData.country;
    const currentYear = new Date().getFullYear();
    const requiredAge = getLegalDrinkingAge(country);

    // Validation
    if (!firstName) {
      setStatus("error");
      setErrorMessage("Please enter your first name.");
      return;
    }

    if (!lastName) {
      setStatus("error");
      setErrorMessage("Please enter your last name.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setStatus("error");
      setErrorMessage("Please provide a valid email address.");
      return;
    }

    if (!formData.birthYear || isNaN(birthYear) || birthYear < 1900 || birthYear > currentYear) {
      setStatus("error");
      setErrorMessage("Please enter a valid 4-digit birth year (e.g. 1996).");
      return;
    }

    if (currentYear - birthYear < requiredAge) {
      setStatus("error");
      setErrorMessage(
        `You must be of legal drinking age (${requiredAge}+ in ${country}) to join the SAGO Club.`
      );
      return;
    }

    if (!formData.consent) {
      setStatus("error");
      setErrorMessage("Please check the box to confirm you agree to the terms and privacy policy.");
      return;
    }

    setStatus("submitting");

    try {
      const res = await fetch("/api/club", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          birthYear,
          country,
          isBartender: formData.isBartender === "yes",
          consent: formData.consent,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Registration failed. Please try again.");
      }

      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Something went wrong. Please check your connection and try again.");
      }
    }
  };

  return (
    <main className="club-page">
      {/* Existing SAGO Navigation Header */}
      <SiteNav />

      {/* Main Two-Part Split Layout */}
      <section className="club-layout" aria-label="Sago Club Membership">
        {/* LEFT / FORM PANEL */}
        <div className="club-form-panel">
          <div className="club-form-inner">
            <p className="club-eyebrow">The Sago Collective</p>
            <h1 className="club-title">
              JOIN THE
              <span>SAGO CLUB</span>
            </h1>
            <p className="club-subtitle">
              BE THE FIRST TO KNOW ABOUT SAGO, NEW EXPERIENCES, COCKTAILS, EVENTS, AND WHAT’S HAPPENING NEXT.
            </p>


            {status === "success" ? (
              <div className="club-success-card" role="status" aria-live="polite">
                <div className="club-success-badge" aria-hidden="true">
                  <Check size={32} />
                </div>
                <h2 className="club-success-title">WELCOME TO THE SAGO CLUB</h2>
                <p className="club-success-desc">
                  You are now on the guestlist. We look forward to sharing our latest blends, secret tasting events, and culture stories directly to your inbox.
                </p>
                <div className="club-success-actions">
                  <Link href="/collection" className="club-success-btn">
                    Explore Collection <ArrowRight size={15} />
                  </Link>
                  <Link href="/cocktails" className="club-success-btn-outline">
                    Cocktail Recipes
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="club-form" noValidate>
                {/* First Name */}
                <div className="club-field-row">
                  <label htmlFor="firstName" className="club-field-label">
                    FIRST NAME<span className="req">*</span>
                  </label>
                  <div className="club-input-wrap">
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="FIRST NAME"
                      value={formData.firstName}
                      onChange={handleChange}
                      autoComplete="given-name"
                      disabled={status === "submitting"}
                      className="club-input"
                      required
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div className="club-field-row">
                  <label htmlFor="lastName" className="club-field-label">
                    LAST NAME<span className="req">*</span>
                  </label>
                  <div className="club-input-wrap">
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="LAST NAME"
                      value={formData.lastName}
                      onChange={handleChange}
                      autoComplete="family-name"
                      disabled={status === "submitting"}
                      className="club-input"
                      required
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="club-field-row">
                  <label htmlFor="email" className="club-field-label">
                    EMAIL ADDRESS<span className="req">*</span>
                  </label>
                  <div className="club-input-wrap">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="NAME@EMAIL.COM"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                      disabled={status === "submitting"}
                      className="club-input"
                      required
                    />
                  </div>
                </div>

                {/* Birth Year */}
                <div className="club-field-row">
                  <label htmlFor="birthYear" className="club-field-label">
                    BIRTH YEAR<span className="req">*</span>
                  </label>
                  <div className="club-input-wrap">
                    <input
                      id="birthYear"
                      name="birthYear"
                      type="text"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="YYYY"
                      value={formData.birthYear}
                      onChange={handleChange}
                      disabled={status === "submitting"}
                      className="club-input"
                      required
                    />
                  </div>
                </div>

                {/* Optional Location / Country */}
                <div className="club-field-row">
                  <label htmlFor="country" className="club-field-label">
                    LOCATION
                  </label>
                  <div className="club-select-wrap">
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      disabled={status === "submitting"}
                      className="club-select"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Are you a bartender? */}
                <div className="club-radio-section" role="group" aria-labelledby="bartender-legend">
                  <span id="bartender-legend" className="club-radio-legend">
                    ARE YOU A BARTENDER?
                  </span>
                  <div className="club-radio-options">
                    <label className="club-radio-label">
                      <input
                        type="radio"
                        name="isBartender"
                        value="no"
                        checked={formData.isBartender === "no"}
                        onChange={handleChange}
                        disabled={status === "submitting"}
                        className="club-radio-input"
                      />
                      <span>NO</span>
                    </label>
                    <label className="club-radio-label">
                      <input
                        type="radio"
                        name="isBartender"
                        value="yes"
                        checked={formData.isBartender === "yes"}
                        onChange={handleChange}
                        disabled={status === "submitting"}
                        className="club-radio-input"
                      />
                      <span>YES</span>
                    </label>
                  </div>
                </div>

                {/* Opt-out & Compliance Notice */}
                <p className="club-legal-notice">
                  OPT-OUT AT ANY TIME BY USING THE UNSUBSCRIPTION MECHANISM PROVIDED IN RELEVANT COMMUNICATIONS.
                </p>

                {/* Consent Checkbox */}
                <label className="club-consent-wrap" htmlFor="consent">
                  <input
                    id="consent"
                    name="consent"
                    type="checkbox"
                    checked={formData.consent}
                    onChange={handleChange}
                    disabled={status === "submitting"}
                    required
                  />
                  <span>
                    I confirm that I am of legal drinking age in my country of residence and agree to receive SAGO Whisky news, cocktail releases, and invitations. Read our{" "}
                    <Link href="/privacy" target="_blank" rel="noopener noreferrer">
                      Privacy Policy
                    </Link>.
                  </span>
                </label>

                {/* Error message */}
                {status === "error" && errorMessage && (
                  <div className="club-feedback-error" role="alert">
                    {errorMessage}
                  </div>
                )}

                {/* Primary CTA */}
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="club-cta-btn"
                  id="sago-club-submit"
                >
                  {status === "submitting" ? (
                    "JOINING THE CLUB..."
                  ) : (
                    <>
                      JOIN THE CLUB
                      <ArrowRight size={17} aria-hidden="true" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* RIGHT / VISUAL PANEL */}
        <div className="club-visual-panel">
          <div className="club-visual-sticky">
            <div className="club-visual-frame">
              <Image
                src="/assets/Join the sago club.png"
                alt="SAGO Whisky evening gathering with friends enjoying cocktails"
                width={1671}
                height={941}
                priority
                sizes="(max-width: 820px) 100vw, (max-width: 1200px) 50vw, 54vw"
                className="club-visual-image"
              />
            </div>

            {/* Editorial Caption */}
            <div className="club-visual-meta">
              <span className="club-visual-tag">THE SAGO COLLECTIVE</span>
            </div>
          </div>
        </div>
      </section>

      {/* Existing SAGO Site Footer */}
      <SiteFooter />
    </main>
  );
}
