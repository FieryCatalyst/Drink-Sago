"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { CSSProperties, Key, ReactNode } from "react";
import "./logo-loop.css";

export type LogoItem = {
  node?: ReactNode;
  title?: string;
  ariaLabel?: string;
  href?: string;
  src?: string;
  alt?: string;
};

type LogoLoopProps = {
  logos: LogoItem[];
  speed?: number;
  direction?: "left" | "right" | "up" | "down";
  width?: number | string;
  logoHeight?: number;
  gap?: number;
  pauseOnHover?: boolean;
  hoverSpeed?: number;
  fadeOut?: boolean;
  fadeOutColor?: string;
  scaleOnHover?: boolean;
  renderItem?: (item: LogoItem, key: Key) => ReactNode;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
};

const CONFIG = { smoothTau: 0.25, minCopies: 2, copyHeadroom: 2 };

function cssLength(value: number | string | undefined) {
  return typeof value === "number" ? `${value}px` : value;
}

const LogoLoop = memo(function LogoLoop({
  logos,
  speed = 120,
  direction = "left",
  width = "100%",
  logoHeight = 28,
  gap = 32,
  pauseOnHover,
  hoverSpeed,
  fadeOut = false,
  fadeOutColor,
  scaleOnHover = false,
  renderItem,
  ariaLabel = "Partner logos",
  className,
  style,
}: LogoLoopProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const sequenceRef = useRef<HTMLUListElement>(null);
  const frameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);
  const [sequenceWidth, setSequenceWidth] = useState(0);
  const [sequenceHeight, setSequenceHeight] = useState(0);
  const [copyCount, setCopyCount] = useState(CONFIG.minCopies);
  const [isHovered, setIsHovered] = useState(false);
  const isVertical = direction === "up" || direction === "down";

  const effectiveHoverSpeed = useMemo(() => {
    if (hoverSpeed !== undefined) return hoverSpeed;
    if (pauseOnHover === true) return 0;
    if (pauseOnHover === false) return undefined;
    return 0;
  }, [hoverSpeed, pauseOnHover]);

  const targetVelocity = useMemo(() => {
    const multiplier = direction === "left" || direction === "up" ? 1 : -1;
    return Math.abs(speed) * multiplier * (speed < 0 ? -1 : 1);
  }, [direction, speed]);

  const updateDimensions = useCallback(() => {
    const container = containerRef.current;
    const sequence = sequenceRef.current;
    if (!container || !sequence) return;
    const widthValue = sequence.getBoundingClientRect().width;
    const heightValue = sequence.getBoundingClientRect().height;
    setSequenceWidth(Math.ceil(widthValue));
    setSequenceHeight(Math.ceil(heightValue));
    if (isVertical) {
      const parentHeight = container.parentElement?.clientHeight ?? 0;
      if (parentHeight > 0) container.style.height = `${Math.ceil(parentHeight)}px`;
      if (heightValue > 0) setCopyCount(Math.max(CONFIG.minCopies, Math.ceil((container.clientHeight || parentHeight) / heightValue) + CONFIG.copyHeadroom));
    } else if (widthValue > 0) {
      setCopyCount(Math.max(CONFIG.minCopies, Math.ceil(container.clientWidth / widthValue) + CONFIG.copyHeadroom));
    }
  }, [isVertical]);

  useEffect(() => {
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateDimensions) : null;
    if (containerRef.current) observer?.observe(containerRef.current);
    if (sequenceRef.current) observer?.observe(sequenceRef.current);
    updateDimensions();
    return () => observer?.disconnect();
  }, [updateDimensions, logos, gap, logoHeight]);

  useEffect(() => {
    const images = sequenceRef.current?.querySelectorAll("img") ?? [];
    const onImageLoad = () => updateDimensions();
    images.forEach((image) => image.addEventListener("load", onImageLoad, { once: true }));
    updateDimensions();
    return () => images.forEach((image) => image.removeEventListener("load", onImageLoad));
  }, [logos, updateDimensions]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const sequenceSize = isVertical ? sequenceHeight : sequenceWidth;
    const animate = (timestamp: number) => {
      if (lastTimestampRef.current === null) lastTimestampRef.current = timestamp;
      const delta = Math.max(0, timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;
      const target = isHovered && effectiveHoverSpeed !== undefined ? effectiveHoverSpeed : targetVelocity;
      const easing = 1 - Math.exp(-delta / CONFIG.smoothTau);
      velocityRef.current += (target - velocityRef.current) * easing;
      if (sequenceSize > 0) {
        offsetRef.current = ((offsetRef.current + velocityRef.current * delta) % sequenceSize + sequenceSize) % sequenceSize;
        track.style.transform = isVertical ? `translate3d(0, ${-offsetRef.current}px, 0)` : `translate3d(${-offsetRef.current}px, 0, 0)`;
      }
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      lastTimestampRef.current = null;
    };
  }, [effectiveHoverSpeed, isHovered, isVertical, sequenceHeight, sequenceWidth, targetVelocity]);

  const renderLogo = useCallback((item: LogoItem, key: Key) => {
    if (renderItem) return <li className="logoloop__item" key={key}>{renderItem(item, key)}</li>;
    const content = item.node ? <span className="logoloop__node" aria-hidden={Boolean(item.href && !item.ariaLabel)}>{item.node}</span> : item.src ? <Image src={item.src} alt={item.alt ?? ""} title={item.title} width={logoHeight} height={logoHeight} loading="lazy" draggable={false} /> : null;
    return <li className="logoloop__item" key={key}>{item.href ? <a className="logoloop__link" href={item.href} aria-label={item.ariaLabel ?? item.title ?? item.alt ?? "Logo link"}>{content}</a> : content}</li>;
  }, [logoHeight, renderItem]);

  const rootClass = ["logoloop", isVertical ? "logoloop--vertical" : "logoloop--horizontal", fadeOut && "logoloop--fade", scaleOnHover && "logoloop--scale-hover", className].filter(Boolean).join(" ");
  const variables = { "--logoloop-gap": `${gap}px`, "--logoloop-logoHeight": `${logoHeight}px`, ...(fadeOutColor ? { "--logoloop-fadeColor": fadeOutColor } : {}), ...style } as CSSProperties;

  return <div ref={containerRef} className={rootClass} style={{ width: isVertical && width === "100%" ? undefined : cssLength(width), ...variables }} role="region" aria-label={ariaLabel} onMouseEnter={() => effectiveHoverSpeed !== undefined && setIsHovered(true)} onMouseLeave={() => effectiveHoverSpeed !== undefined && setIsHovered(false)}>
    <div className="logoloop__track" ref={trackRef}>
      {Array.from({ length: copyCount }, (_, copyIndex) => <ul className="logoloop__list" key={`copy-${copyIndex}`} ref={copyIndex === 0 ? sequenceRef : undefined} aria-hidden={copyIndex > 0}>{logos.map((logo, index) => renderLogo(logo, `${copyIndex}-${index}`))}</ul>)}
    </div>
  </div>;
});

LogoLoop.displayName = "LogoLoop";
export default LogoLoop;
