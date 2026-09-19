"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa6";
import LogoLoop, { type LogoItem } from "@/components/ui/logo-loop";

const socialLinks: LogoItem[] = [
  { href: "https://www.instagram.com/sago.world", ariaLabel: "Sago on Instagram", node: <FaInstagram aria-hidden="true" /> },
  { href: "https://www.tiktok.com/@sago.world", ariaLabel: "Sago on TikTok", node: <FaTiktok aria-hidden="true" /> },
  { href: "https://www.facebook.com/sago.world", ariaLabel: "Sago on Facebook", node: <FaFacebookF aria-hidden="true" /> },
];

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
          <Link className="brand display" href="/" aria-label="Sago home">
            <Image className="sago-logo sago-logo--footer" src="/assets/LOGO.png" alt="Sago" width={64} height={64} />
          </Link>
          <p>Oak whisky<br />for bolder conversations.</p>
          <div className="footer-links">
            <Link href="/collection">Collection</Link>
            <Link href="/cocktails">Cocktails</Link>
            <Link href="/about">Our story</Link>
            <Link href="/#shop">Find Sago</Link>
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
        <span>© 2026 Sago Gold Reserve Whisky</span>
        <span>Drink responsibly. Please enjoy Sago in moderation.</span>
        <span><Link href="/privacy">Privacy</Link> · <Link href="/cookies">Cookies</Link> · <Link href="/terms">Terms</Link> · <Link href="/refunds">Refunds</Link> · <Link href="/accessibility">Accessibility</Link></span>
      </div>
    </footer>
  );
}
