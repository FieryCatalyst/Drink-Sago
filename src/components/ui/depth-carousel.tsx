"use client";

import gsap from "gsap";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./depth-carousel.css";

type CarouselItem = string | { image: string; alt?: string };

type DepthCarouselProps = {
  items: CarouselItem[];
  cardWidth?: number;
  cardHeight?: number;
  radius?: number;
  tint?: string;
  depth?: number;
  spread?: number;
  tilt?: number;
  tiltDirection?: "left" | "right";
  perspective?: number;
  visibleCards?: number;
  falloff?: number;
  blur?: number;
  duration?: number;
  ease?: string;
  autoplay?: boolean;
  autoplayDelay?: number;
  loop?: boolean;
  showControls?: boolean;
  showIndicators?: boolean;
  onChange?: (index: number, item: CarouselItem) => void;
  onItemClick?: (index: number, item: CarouselItem) => void;
  className?: string;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const normalize = (item: CarouselItem) => typeof item === "string" ? { image: item, alt: "" } : item;

export default function DepthCarousel({
  items,
  cardWidth = 300,
  cardHeight = 380,
  radius = 18,
  tint = "#0B0B0B",
  depth = 220,
  spread = 90,
  tilt = 22,
  tiltDirection = "right",
  perspective = 1400,
  visibleCards = 4,
  falloff = 0.14,
  blur = 3,
  duration = 760,
  ease = "power3.out",
  autoplay = false,
  autoplayDelay = 3200,
  loop = true,
  showControls = true,
  showIndicators = true,
  onChange,
  onItemClick,
  className = "",
}: DepthCarouselProps) {
  const data = useMemo(() => items.map(normalize), [items]);
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const overlayRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const positionRef = useRef(0);
  const focusRef = useRef(0);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const dragRef = useRef<{ startX: number; startPosition: number; moved: boolean } | null>(null);
  const wasDraggedRef = useRef(false);
  const [active, setActive] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const reducedMotion = useRef(false);
  const isVisible = useRef(true);

  const layout = useCallback((position: number) => {
    const direction = tiltDirection === "left" ? -1 : 1;
    const activeDepth = isMobile ? depth * 0.6 : depth;
    const activeSpread = isMobile ? spread * 0.72 : spread;
    const activeVisibleCards = isMobile ? Math.min(2, visibleCards) : visibleCards;
    const activeBlur = isMobile ? 0 : blur;
    data.forEach((_, index) => {
      const card = cardRefs.current[index];
      if (!card) return;
      let distance = index - position;
      if (loop && data.length > 1) {
        distance = ((distance % data.length) + data.length) % data.length;
        if (distance > data.length / 2) distance -= data.length;
      }
      const behind = Math.max(0, distance);
      const visible = Math.abs(distance) <= activeVisibleCards + 0.5;
      const opacity = visible ? (distance < 0 ? Math.max(0, 1 + distance) : 1) : 0;
      const brightness = Math.max(0.15, 1 - behind * falloff);
      const blurAmount = visible ? Math.min(activeBlur, (behind / Math.max(1, activeVisibleCards)) * activeBlur) : 0;
      const x = direction * activeSpread * distance;
      const z = -activeDepth * distance;
      const rotateY = direction * tilt * clamp(distance, 0, 1);
      card.style.transform = `translate3d(calc(-50% + ${x.toFixed(2)}px), -50%, ${z.toFixed(2)}px) rotateY(${rotateY.toFixed(2)}deg)`;
      card.style.opacity = opacity.toFixed(3);
      card.style.filter = `brightness(${brightness.toFixed(3)}) blur(${blurAmount.toFixed(2)}px)`;
      card.style.zIndex = String(Math.round(2000 - distance * 20));
      card.style.pointerEvents = visible && opacity > 0.05 ? "auto" : "none";
      if (overlayRefs.current[index]) overlayRefs.current[index]!.style.opacity = clamp(behind * falloff * 1.25, 0, 0.86).toFixed(3);
    });
  }, [blur, data, depth, falloff, isMobile, loop, spread, tilt, tiltDirection, visibleCards]);

  const focus = useCallback((rawIndex: number, animate = true) => {
    if (!data.length) return;
    const nextIndex = loop ? ((rawIndex % data.length) + data.length) % data.length : clamp(rawIndex, 0, data.length - 1);
    let delta = nextIndex - positionRef.current;
    if (loop && data.length > 1) {
      delta = ((delta % data.length) + data.length) % data.length;
      if (delta > data.length / 2) delta -= data.length;
    }
    tweenRef.current?.kill();
    const proxy = { position: positionRef.current };
    tweenRef.current = gsap.to(proxy, {
      position: positionRef.current + delta,
      duration: animate && !reducedMotion.current ? duration / 1000 : 0,
      ease,
      onUpdate: () => { positionRef.current = proxy.position; layout(proxy.position); },
      onComplete: () => { positionRef.current = ((proxy.position % data.length) + data.length) % data.length; layout(positionRef.current); },
    });
    if (nextIndex !== focusRef.current) {
      focusRef.current = nextIndex;
      setActive(nextIndex);
      onChange?.(nextIndex, items[nextIndex]);
    }
  }, [data.length, duration, ease, items, layout, loop, onChange]);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 800px)");
    const updateViewport = () => {
      reducedMotion.current = motionQuery.matches;
      setIsMobile(mobileQuery.matches);
    };
    updateViewport();
    motionQuery.addEventListener("change", updateViewport);
    mobileQuery.addEventListener("change", updateViewport);
    layout(positionRef.current);
    const observer = new ResizeObserver(() => layout(positionRef.current));
    if (rootRef.current) observer.observe(rootRef.current);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible.current = entry.isIntersecting;
      if (!entry.isIntersecting) tweenRef.current?.kill();
    }, { rootMargin: "120px" });
    if (rootRef.current) visibilityObserver.observe(rootRef.current);
    return () => {
      observer.disconnect();
      visibilityObserver.disconnect();
      motionQuery.removeEventListener("change", updateViewport);
      mobileQuery.removeEventListener("change", updateViewport);
      tweenRef.current?.kill();
    };
  }, [layout]);

  useEffect(() => {
    if (!autoplay || reducedMotion.current || isMobile || data.length < 2) return;
    const timer = window.setInterval(() => {
      if (isVisible.current) focus(focusRef.current + 1);
    }, Math.max(autoplayDelay, 600));
    return () => window.clearInterval(timer);
  }, [autoplay, autoplayDelay, data.length, focus, isMobile]);

  const moveBy = (step: number) => focus(focusRef.current + step);
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    tweenRef.current?.kill();
    dragRef.current = { startX: event.clientX, startPosition: positionRef.current, moved: false };
    wasDraggedRef.current = false;
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const distance = event.clientX - drag.startX;
    if (Math.abs(distance) > 5) {
      drag.moved = true;
      wasDraggedRef.current = true;
    }
    if (drag.moved) {
      positionRef.current = drag.startPosition - distance / Math.max(cardWidth * 0.55, 40);
      layout(positionRef.current);
    }
  };
  const onPointerUp = () => {
    if (!dragRef.current) return;
    const moved = dragRef.current.moved;
    dragRef.current = null;
    if (moved) {
      focus(Math.round(positionRef.current));
      setTimeout(() => { wasDraggedRef.current = false; }, 60);
    } else {
      wasDraggedRef.current = false;
    }
  };

  return <div ref={rootRef} className={`depth-carousel${isMobile ? " depth-carousel--mobile" : ""} ${className}`.trim()} style={{ "--dc-perspective": `${perspective}px` } as React.CSSProperties} role="group" aria-roledescription="carousel" aria-label="Sago collection gallery" tabIndex={0} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onKeyDown={(event) => { if (event.key === "ArrowLeft") moveBy(-1); if (event.key === "ArrowRight") moveBy(1); }}>
    <div className="depth-carousel__stage">
      {data.map((item, index) => <div key={`${item.image}-${index}`} className="depth-carousel__card" ref={(element) => { cardRefs.current[index] = element; }} style={{ width: cardWidth, height: cardHeight, borderRadius: radius }} aria-label={`${item.alt || `${index + 1} of ${data.length}`}`} aria-hidden={active !== index} onClick={() => { if (!wasDraggedRef.current) { focus(index); onItemClick?.(index, items[index]); } }}><Image className="depth-carousel__img" src={item.image} alt={item.alt ?? ""} width={cardWidth} height={cardHeight} draggable={false} /><span className="depth-carousel__tint" ref={(element) => { overlayRefs.current[index] = element; }} style={{ background: tint }} /></div>)}
    </div>
    {showControls && data.length > 1 && <><button type="button" className="depth-carousel__arrow depth-carousel__arrow--prev" aria-label="Previous collection image" onClick={() => moveBy(-1)}>‹</button><button type="button" className="depth-carousel__arrow depth-carousel__arrow--next" aria-label="Next collection image" onClick={() => moveBy(1)}>›</button></>}
    {showIndicators && data.length > 1 && <div className="depth-carousel__dots" role="tablist" aria-label="Collection images">{data.map((_, index) => <button key={index} type="button" role="tab" aria-selected={active === index} aria-label={`Go to collection image ${index + 1}`} className={`depth-carousel__dot${active === index ? " is-active" : ""}`} onClick={() => focus(index)} />)}</div>}
  </div>;
}
