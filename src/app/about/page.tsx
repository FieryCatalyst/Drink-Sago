"use client";

import Image from "next/image";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import { useRef, useState } from "react";
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";

const values = [
  { number: "01", title: "Craftsmanship", copy: "We give grain, oak and time the attention they deserve." },
  { number: "02", title: "Quality", copy: "We choose ingredients for character, clarity and balance." },
  { number: "03", title: "Community", copy: "We make a spirit that belongs wherever good people meet." },
];

const manifesto = [
  "SAGO was created for the moments that deserve to be remembered.",
  "The unexpected nights. The quiet wins. The stories that start with “one more.” The celebrations we plan for, and the ones we never saw coming.",
  "Behind every bottle is a balance of craft and character. Thoughtfully selected ingredients, considered blending, and a dedication to creating spirits that are smooth, distinctive, and made to be shared.",
];

const stages = [
  { number: "01", title: "Select", copy: "The right grain, chosen for a generous first note." },
  { number: "02", title: "Rest", copy: "Oak gives the spirit warmth, depth and a longer story." },
  { number: "03", title: "Blend", copy: "Every element is brought into balance with intention." },
  { number: "04", title: "Bottle", copy: "A considered finish for the moment it finally arrives." },
];

const markets = [
  { name: "Zambia", x: 48, y: 48 },
  { name: "Zimbabwe", x: 49, y: 57 },
  { name: "Mozambique", x: 59, y: 55 },
  { name: "Botswana", x: 40, y: 60 },
  { name: "Namibia", x: 31, y: 60 },
  { name: "Angola", x: 33, y: 40 },
  { name: "Tanzania", x: 57, y: 32 },
  { name: "Kenya", x: 67, y: 27 },
];

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-12%" });
  const reduceMotion = useReducedMotion();
  return <motion.div ref={ref} className={className} initial={reduceMotion ? false : { opacity: 0, y: 28 }} animate={reduceMotion || isInView ? { opacity: 1, y: 0 } : {}} transition={reduceMotion ? { duration: 0 } : { duration: .8, ease: [0.16, 1, 0.3, 1] }}>{children}</motion.div>;
}

export default function AboutPage() {
  const [activeMarket, setActiveMarket] = useState("Zambia");
  const activeMarketData = markets.find((market) => market.name === activeMarket) ?? markets[0];

  return (
    <main className="about-page">
      <SiteNav />

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

      <section className="about-manifesto section-pad" id="story"><div className="about-manifesto__statement"><Reveal><p className="eyebrow">Our story</p><h2 className="display">Every moment is worth<br /><em>celebrating with SAGO</em></h2></Reveal></div><div className="about-manifesto__body">{manifesto.map((line, index) => <Reveal key={line}><p className={index === 0 ? "about-manifesto__lead body-copy" : "body-copy"}>{line}</p></Reveal>)}</div></section>

      <section className="about-values section-pad"><Reveal><div className="section-heading"><div><p className="eyebrow">What we stand for</p><h2 className="display">Three things<br /><em>worth keeping</em></h2></div></div></Reveal><div className="about-values__grid">{values.map((value) => <Reveal className="about-value" key={value.title}><span className="about-value__number">{value.number}</span><h3 className="display">{value.title}</h3><p>{value.copy}</p></Reveal>)}</div></section>

      <section className="about-process section-pad"><Reveal><div className="section-heading"><div><p className="eyebrow">From grain to glass</p><h2 className="display">Patience is<br /><em>part of the craft</em></h2></div></div></Reveal><div className="about-timeline">{stages.map((stage, index) => <Reveal className="about-timeline__stage" key={stage.number}><div className="about-timeline__marker"><span>{stage.number}</span><i /></div><div><p className="eyebrow">Stage {stage.number}</p><h3 className="display">{stage.title}</h3><p>{stage.copy}</p></div><Image src={`/assets/${index + 3}.png`} alt={`${stage.title} stage of Sago production`} width={120} height={150} /></Reveal>)}</div></section>

      <section className="about-lifestyle">
        <div className="about-lifestyle__inner">
          <div className="about-lifestyle__primary">
            <div className="about-lifestyle__image about-lifestyle__image--one">
              <Image
                src="/assets/Golden Oak Whisky Still Life.png"
                alt="SAGO Gold Reserve Whisky Still Life"
                fill
                sizes="(max-width: 800px) 90vw, 45vw"
                priority
              />
            </div>
          </div>
          <div className="about-lifestyle__content">
            <div className="about-lifestyle__header">
              <p className="eyebrow">The Sago life</p>
              <h2 className="display">
                Make it<br />
                <em>SAGO</em>
              </h2>
            </div>
            <div className="about-lifestyle__details">
              <div className="about-lifestyle__copy">
                <p>
                  We believe life isn’t measured only by the big occasions. It’s the
                  moments we share and cherish that make a life. So don’t let them pass
                  unnoticed.
                </p>
                <p className="about-lifestyle__signoff">
                  Celebrate the moment. Raise a glass to it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-markets section-pad"><Reveal><div className="section-heading"><div><p className="eyebrow">Growing together</p><h2 className="display">A spirit<br /><em>in motion</em></h2></div></div></Reveal><div className="about-markets__layout"><div className="about-map" aria-label="Sago market map"><div className="about-map__land" />{markets.map((market) => <button key={market.name} className={`about-map__marker ${activeMarket === market.name ? "is-active" : ""}`} style={{ left: `${market.x}%`, top: `${market.y}%` }} onClick={() => setActiveMarket(market.name)} aria-label={`Show ${market.name}`}><span /></button>)}<div className="about-map__label"><MapPin size={14} /> {activeMarketData.name}</div></div><div className="about-markets__list"><p className="eyebrow">Current markets</p>{markets.map((market) => <button className={activeMarket === market.name ? "is-active" : ""} key={market.name} onClick={() => setActiveMarket(market.name)}>{market.name}<ArrowRight size={15} /></button>)}</div></div></section>

      <SiteFooter />
    </main>
  );
}
