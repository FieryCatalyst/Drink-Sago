"use client";

import { motion, useInView } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";

interface WordsPullUpProps {
  text: string;
  className?: string;
  showAsterisk?: boolean;
  style?: React.CSSProperties;
}

export const WordsPullUp = ({ text, className = "", showAsterisk = false, style }: WordsPullUpProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const words = text.split(" ");

  return (
    <div ref={ref} className={`inline-flex flex-wrap ${className}`} style={style}>
      {words.map((word, index) => {
        const isLast = index === words.length - 1;
        return (
          <motion.span
            key={`${word}-${index}`}
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="relative inline-block"
            style={{ marginRight: isLast ? 0 : "0.25em" }}
          >
            {word}
            {showAsterisk && isLast && <span className="absolute -right-[0.3em] top-[0.65em] text-[0.31em]">°</span>}
          </motion.span>
        );
      })}
    </div>
  );
};

interface Segment {
  text: string;
  className?: string;
}

interface WordsPullUpMultiStyleProps {
  segments: Segment[];
  className?: string;
  style?: React.CSSProperties;
}

export const WordsPullUpMultiStyle = ({ segments, className = "", style }: WordsPullUpMultiStyleProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const words: { word: string; className?: string }[] = [];

  segments.forEach((segment) => {
    segment.text.split(" ").forEach((word) => {
      if (word) words.push({ word, className: segment.className });
    });
  });

  return (
    <div ref={ref} className={`inline-flex flex-wrap justify-center ${className}`} style={style}>
      {words.map((word, index) => (
        <motion.span
          key={`${word.word}-${index}`}
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
          className={`inline-block ${word.className ?? ""}`}
          style={{ marginRight: "0.25em" }}
        >
          {word.word}
        </motion.span>
      ))}
    </div>
  );
};

const navItems = [
  { label: "Our Products", href: "/collection" },
  { label: "Cocktails", href: "/cocktails" },
  { label: "Our Story", href: "/about" },
  { label: "Promotions", href: "/promotions" },
  { label: "Join the SAGO Club", href: "/club" },
];

const PrismaHero = () => {
  return (
    <section className="sago-prisma-hero">
      <Image
        src="/assets/2.png"
        alt="Sago Gold Reserve Whisky with a glass of whisky"
        fill
        priority
        sizes="100vw"
        className="sago-prisma-hero__image"
      />
      <div className="sago-prisma-hero__shade" />
      <div className="sago-prisma-hero__texture" />

      <nav className="sago-prisma-hero__nav" aria-label="Primary navigation">
        <a href="#top" className="sago-prisma-hero__brand display" aria-label="Sago home"><Image className="sago-logo sago-logo--hero" src="/assets/Sago Logo.png" alt="Sago" width={48} height={48} /></a>
        <div className="sago-prisma-hero__links">
          {navItems.map((item) => (
            <a key={item.label} href={item.href}>{item.label}</a>
          ))}
        </div>
        <a href="#shop" className="sago-prisma-hero__shop-link">Shop nearby <ArrowRight size={14} /></a>
      </nav>

      <div className="sago-prisma-hero__content">
        <div className="sago-prisma-hero__wordmark display" aria-label="Sago">
          <WordsPullUp text="Sago" />
        </div>
        <div className="sago-prisma-hero__aside">
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            Gold Reserve is an oak whisky for people who move with intention. Made for bolder conversations.
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="sago-prisma-hero__actions"
          >
            <a href="#collection" className="sago-prisma-hero__button">
              Explore collection <ArrowRight size={15} />
            </a>
            <span>42.8% ABV · 750 ml</span>
          </motion.div>
        </div>
      </div>

      <a href="#intro" className="sago-prisma-hero__scroll"><span>Scroll to explore</span><ArrowDown size={16} /></a>
    </section>
  );
};

export { PrismaHero };
