"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";
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
  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
          <Link className="brand display" href="/" aria-label="Sago home">
            <Image className="sago-logo sago-logo--footer" src="/assets/LOGO.png" alt="Sago" width={64} height={64} />
          </Link>
          <p>The House of<br />Premium Spirits.</p>
          <div className="footer-links">
            <Link href="/">Home</Link>
            <Link href="/about">Our Philosophy</Link>
            <Link href="/collection">SAGO Products</Link>
            <Link href="/cocktails">Cocktail Recipes</Link>
            <Link href="/promotions">Promotions</Link>
          </div>
        </div>
        <div className="footer-social">
          <p className="eyebrow">Contact Sago</p>
          <a className="footer-contact" href="mailto:hello@sago.world"><Mail size={18} /> hello@sago.world</a>
          <p>For retailer information, product questions and privacy requests.</p>
          <LogoLoop logos={socialLinks} speed={28} gap={24} logoHeight={24} pauseOnHover ariaLabel="Sago social links" />
        </div>
        <form className="newsletter" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="email">Stay in the spirit</label>
          <div>
            <input id="email" name="email" type="email" placeholder="Your email address" autoComplete="email" required aria-describedby="newsletter-consent" />
            <button type="submit" aria-label="Join the Sago newsletter"><span className="sr-only">Join the Sago newsletter</span><Mail size={17} /></button>
          </div>
          <label className="consent-check" htmlFor="newsletter-consent">
            <input id="newsletter-consent" name="newsletter-consent" type="checkbox" required />
            <span>I agree to receive Sago emails and understand I can unsubscribe at any time. See the <Link href="/privacy">Privacy Policy</Link>.</span>
          </label>
          <p className="form-note">Newsletter delivery is not currently active.</p>
        </form>
      </div>
      <div className="footer-bottom">
        <span>© 2026 SAGO — The House of Premium Spirits</span>
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
