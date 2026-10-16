"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown, Search } from "lucide-react";
import { useEffect, useState } from "react";
import SiteFooter from "@/components/site-footer";
import ClubModal from "@/components/club-modal";
import SiteNav from "@/components/site-nav";
import EditorialCocktailCarousel from "@/components/editorial-cocktail-carousel";

const products = [
  {
    name: "GOLD RESERVE WHISKY",
    image: "/assets/Sago Gold Reserve Whisky Bottle.png",
    id: "gold-reserve",
    meta: "40% ABV · 750 ml · 200 ml · 180 ml",
  },
  {
    name: "Cinnamon Whisky",
    image: "/assets/premium sago cinnamon whisky.png",
    id: "cinnamon",
    meta: "40% ABV · 750 ml · 200 ml · 180 ml",
  },
];

const comingSoonProduct = {
  name: "Agave Spirits",
  description: "A bold new expression from the SAGO house.",
};

const retailers = [
  {
    name: "Social Kitwe",
    type: "Lounge & Restaurant",
    country: "Zambia",
    address: "Shop 35, ECL Mall, Parklands, Kitwe",
    hours: "Open daily",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Social+Kitwe+ECL+Mall+Parklands+Zambia",
  },
  {
    name: "Social Munali",
    type: "Bar, Grill & Lounge",
    country: "Zambia",
    address: "Cnr Munali Rd & 12th St, near Munali Mall, Lusaka",
    hours: "Open daily",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Social+Munali+Munali+Mall+Lusaka+Zambia",
  },
  {
    name: "Zorgi's Pub & Grill",
    type: "Pub & Grill",
    country: "Zambia",
    address: "15 Kuomboka Drive, Parklands, Kitwe",
    hours: "Open daily until late",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Zorgis+Pub+and+Grill+Kuomboka+Drive+Kitwe+Zambia",
  },
  {
    name: "Lusaka Sports Club",
    type: "Sports Club & Bar",
    country: "Zambia",
    address: "Plot 4978, Los Angeles Blvd, Longacres, Lusaka",
    hours: "Open daily",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Lusaka+Club+Los+Angeles+Boulevard+Longacres+Lusaka+Zambia",
  },
  {
    name: "Classic Wines & Liquor",
    type: "Wine & Liquor Merchant",
    country: "Zambia",
    address: "Solwezi, Zambia",
    hours: "Open daily",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Classic+Wines+and+Liquor+Store+Solwezi+Zambia",
  },
];

export default function Home() {
  const [country, setCountry] = useState("All markets");
  const [query, setQuery] = useState("");
  const [clubModalOpen, setClubModalOpen] = useState(false);

  useEffect(() => {
    const handleHash = () => {
      if (typeof window !== "undefined" && window.location.hash === "#club") {
        setClubModalOpen(true);
        const url = window.location.pathname + window.location.search;
        window.history.replaceState(null, "", url);
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);

    return () => {
      window.removeEventListener("hashchange", handleHash);
    };
  }, []);

  const filteredRetailers = retailers.filter(
    (r) =>
      (country === "All markets" || r.country === country) &&
      `${r.name} ${r.type} ${r.address} ${r.country}`.toLowerCase().includes(query.toLowerCase())
  );


  return (
    <div className="sago-home">

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <SiteNav />

      <main id="top">

        {/* ── HERO ───────────────────────────────────────────────── */}
        <section className="home-hero">
          <Image
            src="/assets/Sago Gold Reserve in a Luxe Lounge.png"
            alt="SAGO Gold Reserve Whisky | The House of Premium Spirits"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 100vw"
            className="home-hero__image"
          />
          <div className="home-hero__shade" />
          <div className="home-hero__grain" />
          <div className="home-hero__content">
            <h1 className="home-hero__wordmark">SAGO</h1>
            <p className="home-hero__tagline">The House of Premium Spirits</p>
            <div className="home-hero__actions">
              <a className="home-button" href="#collection">
                EXPLORE OUR COLLECTION
              </a>
              <a className="home-button" href="/promotions">
                PROMOTIONS
              </a>
            </div>
          </div>
        </section>

        {/* ── PHILOSOPHY ─────────────────────────────────────────── */}
        <section className="home-intro" id="intro">
          <div className="home-intro__statement">
            <h2 className="display">The SAGO Philosophy</h2>
            <p className="body-copy">
              Life is made up of wins, celebrations, and multiple small moments.
              Sago is designed to{" "}
              <strong>raise a glass to every occasion</strong>.
            </p>
            <p className="body-copy">
              Our journey begins with our Premium Oak Whisky, a refined,{" "}
              <strong>wood-forward</strong> expression designed
              for the purist, alongside elevated culinary matings of{" "}
              <strong>Toasted Cinnamon Bark</strong> and{" "}
              <strong>Sweet Vanilla</strong> infusions designed to
              challenge the boundaries of dark spirits.
            </p>
            <p className="body-copy">
              We honour the <strong>craftsmanship</strong> of
              heritage distillation but are not afraid to use{" "}
              <strong>modern innovation</strong> to create{" "}
              <strong>exceptionally smooth spirits</strong>.
            </p>
            <p className="home-intro__closing">CELEBRATE THE MOMENT WITH SAGO.</p>
            <Link className="home-button" href="/club">
              Join the SAGO Collective
            </Link>
          </div>
        </section>

        {/* ── OUR PRODUCTS ───────────────────────────────────────── */}
        <section className="home-collection" id="collection">
          <div className="home-section-head">
            <div>
              <p className="eyebrow">OUR PRODUCTS</p>
              <h2 className="display">
                Many Occasions.<br /><em>One Bottle.</em>
              </h2>
            </div>
          </div>

          <div className="home-product-rail">
            {products.map((product) => (
              <article className="home-product" key={product.name}>
                <div className={`home-product__image home-product__image--${product.id}`}>
                  <Image
                    src={product.image}
                    alt={`${product.name} | Sago`}
                    fill
                    sizes="(max-width: 800px) 86vw, 45vw"
                  />
                </div>
                <h3 className="display">{product.name}</h3>
                <span className="home-product__meta">{product.meta}</span>
              </article>
            ))}
          </div>

          {/* Coming Soon: Agave Spirits — same panel treatment as /collection */}
          <div className="home-coming-soon">
            <div className="home-coming-soon__left">
              <span className="home-coming-soon__badge">Coming Soon</span>
              <div>
                <h3 className="home-coming-soon__title">{comingSoonProduct.name}</h3>
                <p className="home-coming-soon__desc">{comingSoonProduct.description}</p>
              </div>
            </div>
          </div>
        </section>


        {/* ── COCKTAIL RECIPES (EDITORIAL HORIZONTAL CAROUSEL) ── */}
        <section className="home-cocktails" id="cocktails">
          <div className="home-section-head">
            <div>
              <p className="eyebrow">COCKTAILS</p>
              <h2 className="display">
                Find Your Next<br /><em>Favourite Cocktail</em>
              </h2>
            </div>
          </div>

          <EditorialCocktailCarousel />

          <div className="home-cocktails__cta">
            <a className="home-button" href="/cocktails">
              VIEW ALL RECIPES
            </a>
          </div>
        </section>


        {/* ── FIND YOUR POUR ─────────────────────────────────────── */}
        <section className="home-find" id="shop">
          <Image src="/assets/4.png" alt="Sago whisky poured over ice" fill sizes="100vw" />
          <div className="home-find__shade" />
          <div className="home-find__content">
            <p className="eyebrow">Find your pour</p>
            <h2 className="display">
              The next round<br /><em>is closer.</em>
            </h2>
            <div className="home-find__tools">
              <label className="home-search">
                <Search size={16} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value.slice(0, 100))}
                  maxLength={100}
                  placeholder="Search city or venue"
                  aria-label="Search retailers"
                />
              </label>
              <label className="home-select">
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  aria-label="Filter by country"
                >
                  <option value="All markets">All markets</option>
                  {Array.from(new Set(retailers.map((r) => r.country)))
                    .sort()
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
                <ChevronDown size={15} />
              </label>
            </div>
            <div className="home-retailers">
              {filteredRetailers.length > 0
                ? filteredRetailers.map((retailer) =>
                    retailer.mapUrl ? (
                      <a href={retailer.mapUrl} target="_blank" rel="noreferrer" key={retailer.name}>
                        <span>{retailer.name}</span>
                        <small>{retailer.country} · {retailer.type} · {retailer.address}</small>
                        <ArrowRight size={16} />
                      </a>
                    ) : (
                      <div className="home-retailers__item" key={retailer.name}>
                        <span>{retailer.name}</span>
                        <small>{retailer.country} · {retailer.type} · {retailer.address}</small>
                      </div>
                    )
                  )
                : (
                  <p className="home-retailers__empty">
                    No pours match that search. Try another city or venue.
                  </p>
                )}
            </div>
          </div>
        </section>

      </main>

      <SiteFooter />
      <ClubModal isOpen={clubModalOpen} onClose={() => setClubModalOpen(false)} />
    </div>
  );
}
