"use client";

import Image from "next/image";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";
import { MARKETS_DATA } from "@/components/market-map";

const MarketMap = dynamic(() => import("@/components/market-map"), {
  ssr: false,
  loading: () => (
    <div className="sago-market-map-loading">
      <div className="sago-market-map-loading__spinner" />
      <span>Loading SAGO Pan-African Map...</span>
    </div>
  ),
});

const values = [
  { number: "01", title: "Craftsmanship", copy: "We give grain, oak and time the attention they deserve." },
  { number: "02", title: "Quality", copy: "We choose ingredients for character, clarity and balance." },
  { number: "03", title: "Community", copy: "We make a spirit that belongs wherever good people meet." },
];

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-12%" });
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      animate={reduceMotion || isInView ? { opacity: 1, y: 0 } : {}}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function AboutPage() {
  const [activeMarket, setActiveMarket] = useState("Zambia");

  return (
    <main className="about-page">
      <SiteNav />

      {/* ── HERO BANNER ── */}
      <section className="about-hero">
        <Image
          src="/assets/Sago Gold Reserve Whisky in Nature.png"
          alt="SAGO Gold Reserve Whisky in Nature"
          fill
          priority
          unoptimized
          sizes="100vw"
          className="about-hero__image"
        />
        <div className="about-hero__shade" />
        <motion.div
          className="about-hero__glow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        />
        <div className="about-hero__copy">
          <motion.h1
            className="display"
            initial={{ opacity: 0, y: 38 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            A spirit with
            <br />
            <em>somewhere to go.</em>
          </motion.h1>
        </div>
      </section>

      {/* ── LUXURY EDITORIAL STORY STREAM (REFERENCE LAYOUT) ── */}
      <div className="story-editorial" id="story">
        {/* Story Intro Header */}
        <section className="story-intro">
          <div className="story-intro__grid">
            <div>
              <Reveal>
                <p className="story-intro__eyebrow">The SAGO Story</p>
                <h2 className="story-intro__title">
                  Every moment is worth celebrating with SAGO.
                </h2>
              </Reveal>
            </div>
            <div>
              <Reveal>
                <div className="story-intro__image-wrap">
                  <Image
                    src="/assets/Emerald Gold Reserve Whisky Showcase.png"
                    alt="SAGO Premium Whisky Still Life"
                    fill
                    sizes="(max-width: 1080px) 90vw, 42vw"
                    priority
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── CHAPTER 1: THE MOMENTS THAT MATTER (Lounge & Story) ── */}
        <section className="story-row story-row--dark">
          <div className="story-row__grid story-row__grid--duo">
            <Reveal>
              <div className="story-frame story-frame--wide">
                <Image
                  src="/assets/Cinematic Whiskey Lounge Still Life.png"
                  alt="SAGO Whiskey Lounge Gathering"
                  fill
                  sizes="(max-width: 1080px) 90vw, 42vw"
                />
              </div>
            </Reveal>

            <Reveal>
              <div>
                <p className="story-row__eyebrow">The Moments That Matter</p>
                <h3 className="story-row__title">
                  SAGO was created for the moments that deserve to be remembered.
                </h3>
                <div className="story-row__body">
                  <p>
                    The unexpected nights. The quiet victories. The stories that begin with
                    “just one more.” The celebrations we plan for, and the ones that take us by
                    surprise.
                  </p>
                  <p>
                    Because the moments that stay with us are not always the ones we see coming.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── CHAPTER 2: CRAFTED WITH CHARACTER (Bottle & Craft) ── */}
        <section className="story-row story-row--green">
          <div className="story-row__grid story-row__grid--duo">
            <Reveal>
              <div>
                <p className="story-row__eyebrow">Crafted with Character</p>
                <h3 className="story-row__title">
                  Behind every bottle is a balance of craft and character.
                </h3>
                <div className="story-row__body">
                  <p>
                    Thoughtfully selected ingredients, carefully considered blending, and an
                    unwavering commitment to creating spirits that are smooth, distinctive, and
                    made to be shared.
                  </p>
                </div>
                <div className="story-row__callouts">
                  <span className="story-row__italic">Every detail has a purpose.</span>
                  <span className="story-row__italic">Every pour has a character of its own.</span>
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div className="story-frame story-frame--tall">
                <Image
                  src="/assets/Emerald Gold Reserve Whisky Showcase.png"
                  alt="SAGO Emerald Bottle Silhouette"
                  fill
                  sizes="(max-width: 1080px) 90vw, 40vw"
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── CHAPTER 3: HERE'S TO THE MOMENT (With Glass) ── */}
        <section className="story-row story-row--dark">
          <div className="story-row__grid story-row__grid--duo">
            <Reveal>
              <div>
                <p className="story-row__eyebrow">Here&apos;s to the Moment</p>
                <h3 className="story-row__title">
                  We believe life is not measured by its milestones alone, but by the moments in
                  between.
                </h3>
                <div className="story-row__body">
                  <p>
                    The conversations that run late, the victories worth a quiet toast, the
                    people who make an ordinary evening unforgettable. These are the moments that
                    become our stories. The ones worth holding on to, long after the glass is
                    empty.
                  </p>
                </div>
                <div className="story-row__callouts">
                  <span className="story-row__italic">So don&apos;t let them pass unnoticed.</span>
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div className="story-frame story-frame--tall">
                <Image
                  src="/assets/Golden Whisky Pour in a Crystal Glass.png"
                  alt="Golden Whisky Pour in a Crystal Glass"
                  fill
                  sizes="(max-width: 1080px) 90vw, 40vw"
                />
              </div>
            </Reveal>
          </div>
        </section>
      </div>

      {/* ── WHAT WE STAND FOR (VALUES) ── */}
      <section className="about-values section-pad">
        <Reveal>
          <div className="section-heading">
            <div>
              <p className="eyebrow">What we stand for</p>
              <h2 className="display">
                Three things
                <br />
                <em>worth keeping</em>
              </h2>
            </div>
          </div>
        </Reveal>
        <div className="about-values__grid">
          {values.map((value) => (
            <Reveal className="about-value" key={value.title}>
              <span className="about-value__number">{value.number}</span>
              <h3 className="display">{value.title}</h3>
              <p>{value.copy}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── PAN-AFRICAN MARKET PRESENCE ── */}
      <section className="about-markets section-pad">
        <Reveal>
          <div className="section-heading">
            <div>
              <p className="eyebrow">Growing together</p>
              <h2 className="display">
                A spirit
                <br />
                <em>in motion</em>
              </h2>
            </div>
          </div>
        </Reveal>
        <div className="about-markets__layout">
          <MarketMap activeMarket={activeMarket} onSelectMarket={setActiveMarket} />
          <div className="about-markets__list">
            <p className="eyebrow">Current markets</p>
            {MARKETS_DATA.map((market) => (
              <button
                className={activeMarket.toLowerCase() === market.name.toLowerCase() ? "is-active" : ""}
                key={market.name}
                onClick={() => setActiveMarket(market.name)}
                type="button"
              >
                <span>{market.name}</span>
                <ArrowRight size={15} />
              </button>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
