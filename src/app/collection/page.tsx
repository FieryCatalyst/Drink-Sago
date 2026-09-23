"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import SiteNav from "@/components/site-nav";

type Product = {
  name: string;
  type: string;
  abv?: string;
  size?: string;
  image: string;
  description: string;
  nose?: string;
  taste?: string;
  finish?: string;
  comingSoon?: boolean;
};

const products: Product[] = [
  {
    name: "Cinnamon Whisky",
    type: "Sago Spirits",
    abv: "—",
    size: "750 ml",
    image: "/assets/3.png",
    description: "A warming, spice-forward expression crafted with Toasted Cinnamon Bark.",
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
    description: "A refined, wood-forward expression designed for the purist.",
    nose: "TOASTED OAK WITH DELICATE VANILLA",
    taste: "SMOOTH, RICH, AND FRESH FLORALS",
    finish: "HINTS OF PLEASANT NUTTINESS, TOASTED WOOD AND SWEET VANILLA BEAN.",
  },
  {
    name: "Agave Spirits",
    type: "Agave Expression",
    abv: "—",
    size: "750 ml",
    image: "",
    description: "A bold new expression from the SAGO house.",
    finish: "FRESH AGAVE, CITRUS FRUIT WITH A PEPPERY FINISH",
    comingSoon: true,
  },
];

const cocktailLinks = [
  { name: "The Sago Highball",  detail: "Sago Oak Whisky · Soda · Lemon",       image: "/assets/cocktail-highball.png" },
  { name: "Sago-Blood Sour",   detail: "Sago Oak Whisky · Hibiscus · Honey",    image: "/assets/sago-blood-sour.png" },
  { name: "Sago After Dark",   detail: "Sago Oak Whisky · Coffee · Vermouth",   image: "/assets/sago-after-dark.png" },
];

export default function CollectionPage() {
  const [openProduct, setOpenProduct] = useState(0);

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

        <div className="collection-product-grid">
          {products.map((product, index) => (
            <article
              className={`collection-product ${openProduct === index ? "is-open" : ""} ${product.comingSoon ? "collection-product--coming-soon" : ""}`}
              key={product.name}
            >
              <button
                className="collection-product__top"
                onClick={() => setOpenProduct(openProduct === index ? -1 : index)}
                aria-expanded={openProduct === index}
                disabled={product.comingSoon}
              >
                <div className="collection-product__image">
                  {product.image ? (
                    <Image src={product.image} alt={product.name} fill sizes="(max-width: 800px) 100vw, 33vw" />
                  ) : (
                    <div className="collection-product__blank" />
                  )}
                  {product.comingSoon && (
                    <span className="collection-product__soon">Coming Soon</span>
                  )}
                </div>
                <div className="collection-product__summary">
                  <h3 className="display">{product.name}</h3>
                  <p>{product.description}</p>
                  {product.abv && product.abv !== "—" && (
                    <span className="collection-product__meta">{product.abv} · {product.size}</span>
                  )}
                  {!product.comingSoon && (
                    <span className="collection-product__toggle">
                      {openProduct === index ? "Close details" : "View tasting notes"}
                      <ChevronDown size={16} />
                    </span>
                  )}
                </div>
              </button>

              {openProduct === index && !product.comingSoon && (
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
              )}
            </article>
          ))}
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
