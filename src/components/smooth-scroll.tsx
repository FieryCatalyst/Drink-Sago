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

    // Detect touch / mobile devices (phones, tablets, touchscreens)
    // On touch devices, native momentum scrolling provides 60/120fps hardware acceleration
    // without touch interception lag, fluttering, or sticking.
    const isTouch =
      window.matchMedia("(pointer: coarse)").matches ||
      "ontouchstart" in window ||
      window.innerWidth <= 800;

    if (isTouch) {
      // Use native smooth scrolling for in-page anchors on touch devices
      const handleNativeAnchor = (e: MouseEvent) => {
        const anchor = (e.target as HTMLElement)?.closest?.("a");
        if (!anchor) return;
        const href = anchor.getAttribute("href");
        if (href && href.startsWith("#") && href.length > 1) {
          const id = href.slice(1);
          let targetEl: HTMLElement | null = null;
          try {
            const decodedId = decodeURIComponent(id);
            targetEl = document.getElementById(decodedId);
          } catch {
            targetEl = document.getElementById(id);
          }
          if (targetEl) {
            e.preventDefault();
            targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      };

      document.addEventListener("click", handleNativeAnchor, { capture: true });
      return () => {
        document.removeEventListener("click", handleNativeAnchor, { capture: true });
      };
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 0,
      syncTouch: false,
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

    // Debounced bounds update to avoid forced synchronous layout reflows during active scroll
    let resizeTimer: NodeJS.Timeout | null = null;
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && document.body) {
      resizeObserver = new ResizeObserver(() => {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          if (!lenis.isScrolling) {
            lenis.resize();
          }
        }, 300);
      });
      resizeObserver.observe(document.body);
    }

    // Global in-page smooth anchor scrolling for desktop
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
      if (resizeTimer) clearTimeout(resizeTimer);
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
