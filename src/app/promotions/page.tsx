"use client";

import Image from "next/image";
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";
import SagoSlotMachine from "@/components/sago-slot-machine";

export default function PromotionsPage() {
  return (
    <div className="promotions-page">
      <SiteNav />

      <main id="top">
        <section className="promotions-hero promotions-hero--slot">
          <Image
            src="/assets/2.png"
            alt="Sago Whisky Bottle"
            fill
            priority
            sizes="100vw"
            className="promotions-hero__image"
          />
          <div className="promotions-hero__shade" />
          <div className="promotions-hero__container">
            <div className="promotions-hero__content">
              <p className="eyebrow">The SAGO Wild Card</p>
              <h1 className="display">
                Play bold.<br /><em>Live wilder.</em>
              </h1>
              <p className="promotions-hero__lead">
                Step into the spirit of the wild. Spin the SAGO machine and discover which animal is calling your next pour.
              </p>
              <a className="button promotions-hero__cta" href="#wild-spirits">
                <span>Enter the game</span>
                <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
        </section>

        <section className="promotions-slot-band" id="wild-spirits">
          <div className="promotions-slot-band__container">
            <div className="promotions-slot-band__intro">
              <p className="eyebrow">A little luck · A lot of spirit</p>
              <h2 className="display">Find your<br /><em>wild side.</em></h2>
              <p>Every animal carries its own kind of bold. Take a spin to meet yours and unlock your venue reward pass.</p>
            </div>
            <div className="promotions-slot-band__game-wrap">
              <SagoSlotMachine />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
