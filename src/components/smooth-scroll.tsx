"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Honor user accessibility preference for reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.2,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Global in-page smooth anchor scrolling
    const handleAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (href && href.startsWith("#") && href.length > 1) {
        const id = href.slice(1);
        let targetEl: HTMLElement | null = null;
        let decodedId = id;
        try {
          decodedId = decodeURIComponent(id);
          targetEl = document.getElementById(decodedId);
          if (!targetEl && typeof CSS !== "undefined" && typeof CSS.escape === "function") {
            targetEl = document.querySelector<HTMLElement>(`#${CSS.escape(decodedId)}`);
          }
        } catch {
          targetEl = document.getElementById(id);
        }
        if (targetEl) {
          e.preventDefault();
          // Keep the fragment in the URL so it can be copied and restored via history
          window.history.pushState(null, "", `#${encodeURIComponent(decodedId)}`);
          lenis.scrollTo(targetEl, { offset: -60, duration: 1.2 });
        }
      }
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("click", handleAnchorClick, { capture: true });
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
