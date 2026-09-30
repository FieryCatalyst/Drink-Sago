"use client";

import Image from "next/image";
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";

export default function PromotionsPage() {
  return (
    <div className="promotions-page">
      <SiteNav />

      <main id="top">
        <section className="promotions-hero promotions-hero--empty">
          <Image
            src="/assets/5.png"
            alt="SAGO Promotions"
            fill
            priority
            sizes="100vw"
            className="promotions-hero__image"
          />
          <div className="promotions-hero__shade" />
          <div className="promotions-hero__content">
            <p className="eyebrow">SAGO Promotions</p>
            <h1 className="display">
              Promotions<br /><em>Coming Soon</em>
            </h1>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
