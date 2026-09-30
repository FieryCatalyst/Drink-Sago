"use client";

import Image from "next/image";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight, MapPin } from "lucide-react";
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

const chapters = [
  { number: "01", eyebrow: "The bottle", title: "Strength and\nsoftness, together.", copy: "Our bottle embodies that spirit. Its bold, grenade-inspired silhouette speaks to character, confidence, and impact, while its delicate floral detailing brings a softer, more expressive side to the design.", image: "/assets/3.png" },
  { number: "02", eyebrow: "The mark", title: "It commands\nthe attention.", copy: "At its heart is our lion paw, a mark of confidence, sophistication, and majesty. Not a symbol that demands attention, but one that commands it.", image: "/assets/8.png" },
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

      <section className="about-hero"><Image src="/assets/8.png" alt="Sago bottle in a warm, considered setting" fill priority sizes="100vw" className="about-hero__image" /><div className="about-hero__shade" /><motion.div className="about-hero__glow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} /><div className="about-hero__copy"><motion.p className="eyebrow" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .3 }}>About Sago · Good spirits, brighter tomorrows</motion.p><motion.h1 className="display" initial={{ opacity: 0, y: 38 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: .45, ease: [0.16, 1, 0.3, 1] }}>A spirit with<br /><em>somewhere to go.</em></motion.h1><motion.p className="about-hero__lede" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: .9 }}>Rooted in nature. Crafted for the conversations that move us forward.</motion.p><a className="about-hero__scroll" href="#story">Begin the story <ArrowDown size={16} /></a></div></section>

      <section className="about-manifesto section-pad"><div className="about-manifesto__statement"><Reveal><p className="eyebrow">Our story</p><h2 className="display">Every moment is worth<br /><em>celebrating with SAGO.</em></h2></Reveal></div><div className="about-manifesto__body">{manifesto.map((line, index) => <Reveal key={line}><p className={index === 0 ? "about-manifesto__lead body-copy" : "body-copy"}>{line}</p></Reveal>)}</div></section>

      <section className="about-chapters section-pad" id="story"><div className="about-chapters__intro"><p className="eyebrow">Our point of view</p><h2 className="display">The spirit is<br /><em>the story.</em></h2></div><div className="about-chapter-list">{chapters.map((chapter) => <Reveal className="about-chapter" key={chapter.number}><div className="about-chapter__image"><Image src={chapter.image} alt={chapter.title.replace("\n", " ")} fill sizes="(max-width: 800px) 100vw, 42vw" /></div><div className="about-chapter__copy"><span>{chapter.number}</span><p className="eyebrow">{chapter.eyebrow}</p><h3 className="display">{chapter.title.split("\n").map((line) => <span key={line}>{line}<br /></span>)}</h3><p className="body-copy">{chapter.copy}</p></div></Reveal>)}</div></section>

      <section className="about-values section-pad"><Reveal><div className="section-heading"><div><p className="eyebrow">What we stand for</p><h2 className="display">Three things<br /><em>worth keeping.</em></h2></div><p className="heading-note">The principles behind every bottle, every table and every next chapter.</p></div></Reveal><div className="about-values__grid">{values.map((value, index) => <Reveal className="about-value" key={value.title}><span className="about-value__number">{value.number}</span><motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: .8, delay: index * .12 }} className="about-value__rule" /><h3 className="display">{value.title}</h3><p>{value.copy}</p></Reveal>)}</div></section>

      <section className="about-process section-pad"><Reveal><div className="section-heading"><div><p className="eyebrow">From grain to glass</p><h2 className="display">Patience is<br /><em>part of the craft.</em></h2></div><p className="heading-note">A four-stage process with no shortcuts, only the right amount of time.</p></div></Reveal><div className="about-timeline">{stages.map((stage, index) => <Reveal className="about-timeline__stage" key={stage.number}><div className="about-timeline__marker"><span>{stage.number}</span><i /></div><div><p className="eyebrow">Stage {stage.number}</p><h3 className="display">{stage.title}</h3><p>{stage.copy}</p></div><Image src={`/assets/${index + 3}.png`} alt={`${stage.title} stage of Sago production`} width={120} height={150} /></Reveal>)}</div></section>

      <section className="about-lifestyle">
        <div className="about-lifestyle__inner">
          <div className="about-lifestyle__primary">
            <div className="about-lifestyle__image about-lifestyle__image--one">
              <Image
                src="/assets/6.png"
                alt="Sago bottle against oak and stone"
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
                <em>SAGO.</em>
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
              <div className="about-lifestyle__image about-lifestyle__image--two">
                <Image
                  src="/assets/4.png"
                  alt="Sago being poured into a glass"
                  fill
                  sizes="(max-width: 800px) 90vw, 25vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-markets section-pad"><Reveal><div className="section-heading"><div><p className="eyebrow">Growing together</p><h2 className="display">A spirit<br /><em>in motion.</em></h2></div><p className="heading-note">Sago is finding its way across eight markets, one shared moment at a time.</p></div></Reveal><div className="about-markets__layout"><div className="about-map" aria-label="Sago market map"><div className="about-map__land" />{markets.map((market) => <button key={market.name} className={`about-map__marker ${activeMarket === market.name ? "is-active" : ""}`} style={{ left: `${market.x}%`, top: `${market.y}%` }} onClick={() => setActiveMarket(market.name)} aria-label={`Show ${market.name}`}><span /></button>)}<div className="about-map__label"><MapPin size={14} /> {activeMarketData.name}</div></div><div className="about-markets__list"><p className="eyebrow">Current markets</p>{markets.map((market) => <button className={activeMarket === market.name ? "is-active" : ""} key={market.name} onClick={() => setActiveMarket(market.name)}>{market.name}<ArrowRight size={15} /></button>)}</div></div></section>

      <SiteFooter />
    </main>
  );
}
