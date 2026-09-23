"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import SiteNav from "@/components/site-nav";

type Product = {
  name: string;
  type: string;
  abv?: string;
  size?: string;
  image: string;
  nose?: string;
  taste?: string;
  finish?: string;
};

const products: Product[] = [
  {
    name: "CINNAMON WHISKY",
    type: "Sago Spirits",
    abv: "—",
    size: "750 ml",
    image: "/assets/3.png",
    nose: "SPICY CINNAMON, SYRUPY BROWN SUGAR AND DELICATE OAK WOOD NOTES",
    taste: "EXCEPTIONALLY SMOOTH, SWEET SHOT OF RED-HOT CINNAMON CANDY.",
    finish: "HINTS OF SOFT OAK BLENDED WITH A WARMING AND SPICY KICK.",
  },
  {
    name: "GOLD RESERVE WHISKY",
    type: "Premium Oak Whisky",
    abv: "42.8% ABV",
    size: "750 ml",
    image: "/assets/5.png",
    nose: "TOASTED OAK WITH DELICATE VANILLA",
    taste: "SMOOTH, RICH, AND FRESH FLORALS",
    finish: "HINTS OF PLEASANT NUTTINESS, TOASTED WOOD AND SWEET VANILLA BEAN.",
  },
];

const comingSoonProduct = {
  name: "Agave Spirits",
  type: "Agave Expression",
  description: "A bold new expression from the SAGO house.",
  finish: "FRESH AGAVE, CITRUS FRUIT WITH A PEPPERY FINISH",
};

const cocktailLinks = [
  { name: "The Sago Highball",  detail: "Sago Oak Whisky · Soda · Lemon",       image: "/assets/cocktail-highball.png" },
  { name: "Sago-Blood Sour",   detail: "Sago Oak Whisky · Hibiscus · Honey",    image: "/assets/sago-blood-sour.png" },
  { name: "Sago After Dark",   detail: "Sago Oak Whisky · Coffee · Vermouth",   image: "/assets/sago-after-dark.png" },
];

export default function CollectionPage() {
  return (
    <main className="collection-page">
      <SiteNav />

      {/* HERO */}
      <section className="collection-hero">
        <Image
          src="/assets/1.png"
          alt="SAGO Products — The House of Premium Spirits"
          fill
          priority
          sizes="100vw"
          className="collection-hero__image"
        />
        <div className="collection-hero__shade" />
        <div className="collection-hero__copy">
          <p className="eyebrow">OUR PRODUCTS</p>
          <h1 className="display">Many Occasions.<br /><em>One Bottle.</em></h1>
          <div className="section-rule" />
          <a className="collection-hero__scroll" href="#range">
            Explore the range <ArrowDown size={16} />
          </a>
        </div>
      </section>

      {/* PRODUCT GRID */}
      <section className="collection-products section-pad" id="range">
        <div className="section-heading">
          <div>
            <p className="eyebrow">OUR PRODUCTS</p>
            <h2 className="display">Find your<br /><em>expression.</em></h2>
          </div>
        </div>

        {/* The Two Main Bottle Details */}
        <div className="collection-product-grid">
          {products.map((product) => (
            <article className="collection-product" key={product.name}>
              <div className="collection-product__top">
                <div className="collection-product__image">
                  <Image src={product.image} alt={product.name} fill sizes="(max-width: 800px) 100vw, 50vw" />
                </div>
                <div className="collection-product__summary">
                  <h3 className="display">{product.name}</h3>
                  {product.abv && product.abv !== "—" && (
                    <span className="collection-product__meta">{product.abv} · {product.size}</span>
                  )}
                  <div className="collection-product__details">
                    <div className="tasting-notes-vertical">
                      {product.nose && (
                        <div className="tasting-note-row">
                          <span>Nose</span>
                          <p>{product.nose}</p>
                        </div>
                      )}
                      {product.taste && (
                        <div className="tasting-note-row">
                          <span>Taste</span>
                          <p>{product.taste}</p>
                        </div>
                      )}
                      {product.finish && (
                        <div className="tasting-note-row">
                          <span>Finish</span>
                          <p>{product.finish}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Coming Soon: Agave Spirits moved below the two bottle details */}
        <div className="collection-coming-soon">
          <div className="collection-coming-soon__left">
            <span className="collection-coming-soon__badge">Coming Soon</span>
            <div>
              <h3 className="collection-coming-soon__title">{comingSoonProduct.name}</h3>
              <p className="collection-coming-soon__desc">{comingSoonProduct.description}</p>
            </div>
          </div>
          {comingSoonProduct.finish && (
            <div className="collection-coming-soon__notes">
              <span>Finish</span>
              <p>{comingSoonProduct.finish}</p>
            </div>
          )}
        </div>
      </section>

      {/* COCKTAIL LINKS */}
      <section className="collection-cocktails section-pad">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Cocktail Recipes</p>
            <h2 className="display">Find Your Next<br /><em>Favourite Cocktail.</em></h2>
          </div>
        </div>
        <div className="collection-cocktail-grid">
          {cocktailLinks.map((cocktail) => (
            <Link className="collection-cocktail" href="/cocktails" key={cocktail.name}>
              <div>
                <Image src={cocktail.image} alt={cocktail.name} fill sizes="(max-width: 800px) 100vw, 33vw" />
              </div>
              <p className="eyebrow">{cocktail.detail}</p>
              <h3 className="display">{cocktail.name}</h3>
              <span className="text-link">View recipe <ArrowRight size={15} /></span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
