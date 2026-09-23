"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";

interface SiteNavProps {
  /** Optional callback for "The SAGO Collective" item (home page club modal). */
  onClub?: () => void;
}

const NAV_LINKS = [
  { label: "Home",             href: "/",           index: 0 },
  { label: "Our Philosophy",   href: "/about",       index: 1 },
  { label: "SAGO Products",    href: "/collection",  index: 2 },
  { label: "Cocktail Recipes", href: "/cocktails",   index: 3 },
  { label: "Promotions",       href: "/promotions",  index: 4 },
];

export default function SiteNav({ onClub }: SiteNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  /* Close on Escape */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && menuOpen) setMenuOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [menuOpen]);

  /* Close on outside click */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuOpen && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  /* Prevent body scroll while drawer is open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="home-nav" role="banner">
      <div className="nav-container" ref={containerRef}>
        {/* Capsule pill */}
        <nav className="nav-capsule" aria-label="Main navigation">
          <Link
            className="nav-capsule__logo"
            href="/"
            aria-label="Sago home"
            onClick={close}
          >
            <Image
              src="/assets/Sago Logo.png"
              alt="Sago"
              width={48}
              height={48}
              priority
            />
          </Link>

          <button
            className="nav-capsule__hamburger"
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="site-nav-drawer"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="nav-capsule__hamburger-line" aria-hidden="true" />
            <span className="nav-capsule__hamburger-line" aria-hidden="true" />
            <span className="nav-capsule__hamburger-line" aria-hidden="true" />
          </button>
        </nav>

        {/* Slide-down drawer */}
        <div
          id="site-nav-drawer"
          className={`home-nav__drawer${menuOpen ? " is-open" : ""}`}
          aria-hidden={!menuOpen}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{ "--itemIndex": link.index } as React.CSSProperties}
              tabIndex={menuOpen ? 0 : -1}
              className={isActive(link.href) ? "site-nav__active" : undefined}
              onClick={close}
            >
              {link.label}
              <span>0{link.index + 1}</span>
            </Link>
          ))}

          {/* The SAGO Collective / SAGO Club */}
          {onClub ? (
            <a
              href="#"
              style={{ "--itemIndex": 5 } as React.CSSProperties}
              tabIndex={menuOpen ? 0 : -1}
              onClick={(e) => { e.preventDefault(); close(); onClub(); }}
            >
              The SAGO Collective <span>06</span>
            </a>
          ) : (
            <Link
              href="/club"
              style={{ "--itemIndex": 5 } as React.CSSProperties}
              tabIndex={menuOpen ? 0 : -1}
              className={isActive("/club") ? "site-nav__active" : undefined}
              onClick={close}
            >
              The SAGO Collective <span>06</span>
            </Link>
          )}

          {/* Social icons */}
          <div className="home-nav__drawer-social">
            <a
              href="https://www.instagram.com/sagowhisky?stkn=MXNiZWszb3kyZWJ4cw=="
              target="_blank"
              rel="noreferrer"
              tabIndex={menuOpen ? 0 : -1}
              aria-label="SAGO on Instagram"
            >
              <FaInstagram aria-hidden="true" />
            </a>
            <button
              type="button"
              disabled
              aria-label="SAGO on Facebook (coming soon)"
              title="Coming soon"
            >
              <FaFacebookF aria-hidden="true" />
            </button>
            <button
              type="button"
              disabled
              aria-label="SAGO on TikTok (coming soon)"
              title="Coming soon"
            >
              <FaTiktok aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
