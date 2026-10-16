"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Honor user accessibility preference for reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1,
      syncTouch: false, // Prevents mobile touch scroll hijacking / glitching
      prevent: (node) => {
        // Prevent Lenis from intercepting scroll within modals, dialogs, dropdowns, or admin portals
        if (!node || typeof node.closest !== "function") return false;
        return Boolean(
          node.closest(
            "[data-lenis-prevent], [role='dialog'], [role='menu'], .modal-backdrop, .admin-wrapper, .admin-gate-overlay"
          )
        );
      },
    });

    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Auto-update Lenis bounds when images or dynamic content load
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && document.body) {
      resizeObserver = new ResizeObserver(() => {
        lenis.resize();
      });
      resizeObserver.observe(document.body);
    }

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
          window.history.pushState(null, "", `#${encodeURIComponent(decodedId)}`);
          lenis.scrollTo(targetEl, { offset: -60, duration: 1.0 });
        }
      }
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      document.removeEventListener("click", handleAnchorClick, { capture: true });
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Reset scroll and recalculate boundaries on route navigation
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
      lenisRef.current.resize();
    }
  }, [pathname]);

  return <>{children}</>;
}
