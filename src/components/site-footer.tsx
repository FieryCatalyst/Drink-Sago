"use client";

import { useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail, Check } from "lucide-react";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa6";
import LogoLoop, { type LogoItem } from "@/components/ui/logo-loop";

const socialLinks: LogoItem[] = [
  { href: "https://www.instagram.com/sagowhisky?stkn=MXNiZWszb3kyZWJ4cw==", ariaLabel: "Sago on Instagram", node: <FaInstagram aria-hidden="true" /> },
  { href: "#", ariaLabel: "Sago on TikTok (coming soon)", node: <FaTiktok aria-hidden="true" /> },
  { href: "#", ariaLabel: "Sago on Facebook (coming soon)", node: <FaFacebookF aria-hidden="true" /> },
];

const AGE_GATE_KEY = "sago-age-verified";

function resetAgeGate() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AGE_GATE_KEY);
    window.location.reload();
  }
}

export default function SiteFooter() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmed || !emailRegex.test(trimmed)) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!consent) {
      setStatus("error");
      setErrorMessage("Please accept the terms to continue.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/club", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, consent: true }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Subscription failed. Please try again.");
      }

      setStatus("success");
      setEmail("");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
          <Link className="brand display" href="/" aria-label="Sago home">
            <Image className="sago-logo sago-logo--footer" src="/assets/Sago Logo.png" alt="Sago" width={64} height={64} />
          </Link>
          <p className="footer-tagline">The House of Premium Spirits</p>
          <div className="footer-links">
            <Link href="/">Home</Link>
            <Link href="/about">Our Story</Link>
            <Link href="/collection">SAGO Products</Link>
            <Link href="/cocktails">Cocktail Recipes</Link>
            <Link href="/promotions">Promotions</Link>
            <Link href="/club">The SAGO Collective</Link>
          </div>
          <Link className="button footer-collective" href="/club">
            Join the SAGO Collective <ArrowRight size={15} />
          </Link>
        </div>
        <div className="footer-social">
          <p className="eyebrow">CONTACT SAGO</p>
          <div className="footer-contact-list">
            <a className="footer-contact" href="mailto:Info@drinksago.com">
              <Mail size={16} /> INFO@DRINKSAGO.COM
            </a>
            <a className="footer-contact" href="mailto:partnerships@drinksago.com">
              <Mail size={16} /> PARTNERSHIPS@DRINKSAGO.COM
            </a>
          </div>
          <p className="footer-contact-desc">
            FOR RETAILER INFORMATION, PRODUCT QUESTIONS, PARTNERSHIPS AND PRIVACY REQUESTS.
          </p>
          <LogoLoop logos={socialLinks} speed={28} gap={24} logoHeight={24} pauseOnHover ariaLabel="Sago social links" />
        </div>
        <form className="newsletter" onSubmit={handleNewsletterSubmit} noValidate>
          <label htmlFor="footer-email">Stay in the spirit</label>
          {status === "success" ? (
            <div className="flex items-center gap-2 py-3 text-emerald-400 text-xs font-semibold tracking-wide">
              <Check size={16} /> Welcome to the SAGO Collective!
            </div>
          ) : (
            <div>
              <input
                id="footer-email"
                name="email"
                type="email"
                placeholder="Your email address"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                disabled={status === "submitting"}
                required
                aria-describedby="newsletter-consent"
              />
              <button
                type="submit"
                disabled={status === "submitting" || !email}
                aria-label="Join the Sago newsletter"
              >
                <span className="sr-only">Join the Sago newsletter</span>
                <Mail size={17} />
              </button>
            </div>
          )}
          <label className="consent-check" htmlFor="newsletter-consent">
            <input
              id="newsletter-consent"
              name="newsletter-consent"
              type="checkbox"
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked);
                if (status === "error") setStatus("idle");
              }}
              required
            />
            <span>I agree to receive Sago emails and understand I can unsubscribe at any time. See the <Link href="/privacy">Privacy Policy</Link>.</span>
          </label>
          {status === "error" && errorMessage && (
            <p className="form-note text-red-400 font-medium">{errorMessage}</p>
          )}
        </form>
      </div>

      <div className="footer-bottom">
        <span>© 2026 SAGO | The House of Premium Spirits</span>
        <span>Drink responsibly. Please enjoy Sago in moderation.</span>
        <span>
          <Link href="/privacy">Privacy</Link> · <Link href="/cookies">Cookies</Link> · <Link href="/terms">Terms</Link> · <Link href="/refunds">Refunds</Link> · <Link href="/accessibility">Accessibility</Link>
        </span>
      </div>
      {/* Age-gate preview — allows client to review and request edits for the age gate page */}
      <div className="footer-age-preview">
        <button
          type="button"
          onClick={resetAgeGate}
          aria-label="Reset age verification to preview age gate"
          title="Clears your age verification so you can review and edit the age gate page"
        >
          Preview age gate →
        </button>
      </div>
    </footer>
  );
}
