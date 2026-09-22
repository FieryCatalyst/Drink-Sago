"use client";

import Image from "next/image";
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useState } from "react";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa6";
import SiteFooter from "@/components/site-footer";
import DepthCarousel from "@/components/ui/depth-carousel";
import ClubModal from "@/components/club-modal";

const products = [
  { name: "Cinnamon Whisky", image: "/assets/3.png", comingSoon: false },
  { name: "GOLD RESERVE WHISKY", image: "/assets/5.png", comingSoon: false },
  { name: "Agave Spirits", image: "", comingSoon: true },
];

const cocktailImages = [
  { src: "/assets/cocktail.png", alt: "Sago cocktail" },
  { src: "/assets/cocktail2.png", alt: "Sago cocktail serve" },
  { src: "/assets/cocktail3.png", alt: "Sago warm cocktail" },
  { src: "/assets/cocktail4.png", alt: "Sago rocks serve" },
  { src: "/assets/cocktail-highball.png", alt: "Sago highball" },
  { src: "/assets/sago-blood-sour.png", alt: "Sago blood sour" },
  { src: "/assets/sago-after-dark.png", alt: "Sago after dark" },
];

const retailers = [
  { name: "The Tasting Room", type: "Bar", country: "Zambia", address: "Plot 14, Kabulonga, Lusaka", hours: "Open until 23:00", mapUrl: "https://www.google.com/maps/search/?api=1&query=The+Tasting+Room+Kabulonga+Lusaka" },
  { name: "Manda Hill Cellar", type: "Store", country: "Zambia", address: "Manda Hill Road, Lusaka", hours: "Open until 20:00", mapUrl: "https://www.google.com/maps/search/?api=1&query=Manda+Hill+Cellar+Lusaka" },
  { name: "The Oak House", type: "Restaurant", country: "Zimbabwe", address: "Borrowdale, Harare", hours: "Open until 22:30", mapUrl: "https://www.google.com/maps/search/?api=1&query=The+Oak+House+Borrowdale+Harare" },
  { name: "Cape & Grain", type: "Hotel", country: "Botswana", address: "Central Business District, Gaborone", hours: "Open until 22:00", mapUrl: "https://www.google.com/maps/search/?api=1&query=Cape+and+Grain+Gaborone" },
];

const collectionGallery = [
  { image: "/assets/1.png", alt: "Sago Gold Reserve campaign artwork" },
  { image: "/assets/2.png", alt: "Sago Gold Reserve with a whisky glass" },
  { image: "/assets/3.png", alt: "Sago Cinnamon Whisky" },
  { image: "/assets/4.png", alt: "Sago whisky poured over ice" },
  { image: "/assets/5.png", alt: "Sago Gold Reserve bottle" },
  { image: "/assets/6.png", alt: "Sago Gold Reserve among oak and stone" },
  { image: "/assets/7.png", alt: "Sago collection gallery" },
  { image: "/assets/8.png", alt: "Sago Gold Reserve in a warm study" },
];

export default function Home() {
  const [country, setCountry] = useState("All markets");
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [clubModalOpen, setClubModalOpen] = useState(false);
  const [cocktailSlide, setCocktailSlide] = useState(0);

  const filteredRetailers = retailers.filter(
    (r) =>
      (country === "All markets" || r.country === country) &&
      `${r.name} ${r.type} ${r.address}`.toLowerCase().includes(query.toLowerCase())
  );

  const openClubModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setClubModalOpen(true);
    setMenuOpen(false);
  };

  const prevSlide = () =>
    setCocktailSlide((p) => (p - 1 + cocktailImages.length) % cocktailImages.length);
  const nextSlide = () =>
    setCocktailSlide((p) => (p + 1) % cocktailImages.length);

  return (
    <div className="sago-home">

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header className="home-nav" role="banner">
        <div className="nav-container">
          <nav className="nav-capsule" aria-label="Main navigation">
            <a className="nav-capsule__logo" href="#top" aria-label="Sago home">
              <Image src="/assets/Sago Logo.png" alt="" width={48} height={48} priority />
            </a>

            <button
              className="nav-capsule__hamburger"
              type="button"
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
              aria-controls="nav-drawer"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span className="nav-capsule__hamburger-line" aria-hidden="true" />
              <span className="nav-capsule__hamburger-line" aria-hidden="true" />
              <span className="nav-capsule__hamburger-line" aria-hidden="true" />
            </button>
          </nav>

          <div
            id="nav-drawer"
            className={`home-nav__drawer${menuOpen ? " is-open" : ""}`}
            aria-hidden={!menuOpen}
          >
          <a href="/" style={{ '--itemIndex': 0 } as React.CSSProperties} tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)}>Home                  <span>01</span></a>
          <a href="/about" style={{ '--itemIndex': 1 } as React.CSSProperties} tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)}>Our Philosophy        <span>02</span></a>
          <a href="/collection" style={{ '--itemIndex': 2 } as React.CSSProperties} tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)}>SAGO Products         <span>03</span></a>
          <a href="/cocktails" style={{ '--itemIndex': 3 } as React.CSSProperties} tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)}>Cocktail Recipes      <span>04</span></a>
          <a href="/promotions" style={{ '--itemIndex': 4 } as React.CSSProperties} tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)}>Promotions            <span>05</span></a>
          <a href="#" style={{ '--itemIndex': 5 } as React.CSSProperties} tabIndex={menuOpen ? 0 : -1} onClick={openClubModal}           >The SAGO Collective   <span>06</span></a>

          <div className="home-nav__drawer-social">
            <a
              href="https://www.instagram.com/sagowhisky?stkn=MXNiZWszb3kyZWJ4cw=="
              target="_blank"
              rel="noreferrer"
              tabIndex={menuOpen ? 0 : -1}
              aria-label="SAGO on Instagram"
            >
              <FaInstagram aria-hidden="true" />
            </a>
            <a href="#" tabIndex={menuOpen ? 0 : -1} aria-label="SAGO on Facebook (coming soon)" title="Coming soon">
              <FaFacebookF aria-hidden="true" />
            </a>
            <a href="#" tabIndex={menuOpen ? 0 : -1} aria-label="SAGO on TikTok (coming soon)" title="Coming soon">
              <FaTiktok aria-hidden="true" />
            </a>
          </div>
        </div>
        </div>
      </header>

      <main id="top">

        {/* ── HERO ───────────────────────────────────────────────── */}
        <section className="home-hero">
          <Image
            src="/assets/2.png"
            alt="SAGO — The House of Premium Spirits"
            fill
            priority
            sizes="100vw"
            className="home-hero__image"
          />
          <div className="home-hero__shade" />
          <div className="home-hero__grain" />
          <div className="home-hero__content">
            <h1 className="home-hero__wordmark">SAGO</h1>
            <p className="home-hero__tagline">The House of Premium Spirits</p>
            <a className="home-button home-button--centered" href="#collection">
              EXPLORE OUR COLLECTION <ArrowRight size={16} />
            </a>
          </div>
        </section>

        {/* ── PHILOSOPHY ─────────────────────────────────────────── */}
        <section className="home-intro" id="intro">
          <div className="home-intro__statement">
            <h2 className="display">The SAGO Philosophy</h2>
            <p className="home-intro__lead">CELEBRATE THE MOMENT</p>
            <p className="body-copy">
              Life is made up of wins, celebrations, and multiple small moments.
              Sago is designed to raise a glass to every occasion.
            </p>
            <p className="body-copy">
              Our journey begins with our Premium Oak Whisky, a refined, wood-forward
              expression designed for the purist, alongside elevated culinary matings of
              Toasted Cinnamon Bark and Sweet Vanilla infusions designed to challenge the
              boundaries of dark spirits.
            </p>
            <p className="body-copy">
              We honour the craftsmanship of heritage distillation but are not afraid to
              use modern innovation to create exceptionally smooth spirits.
            </p>
            <p className="home-intro__closing">CELEBRATE THE MOMENT WITH SAGO.</p>
            <button className="home-button" onClick={openClubModal}>
              Join the SAGO Collective <ArrowRight size={16} />
            </button>
          </div>
          <div className="home-intro__image">
            <Image
              src="/assets/7.png"
              alt="Sago Premium Spirits lifestyle"
              fill
              sizes="(max-width: 800px) 90vw, 43vw"
            />
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

          <div className="home-collection__carousel">
            <DepthCarousel
              items={collectionGallery}
              cardWidth={300}
              cardHeight={420}
              depth={190}
              spread={78}
              tilt={18}
              perspective={1400}
              visibleCards={4}
              falloff={0.2}
              blur={5}
              autoplay
              autoplayDelay={3600}
              loop
              tint="var(--green)"
            />
          </div>

          <div className="home-product-rail">
            {products.map((product) => (
              <article className="home-product" key={product.name}>
                <div className="home-product__image">
                  {product.image && (
                    <Image
                      src={product.image}
                      alt={`${product.name} — Sago`}
                      fill
                      sizes="(max-width: 800px) 86vw, 30vw"
                    />
                  )}
                </div>
                {product.comingSoon && (
                  <span className="home-product__badge">Coming Soon</span>
                )}
                <h3 className="display">{product.name}</h3>
              </article>
            ))}
          </div>
        </section>

        {/* ── INTERSTITIAL FEATURE ───────────────────────────────── */}
        <section className="home-feature">
          <Image
            src="/assets/6.png"
            alt="Sago bottle resting in its natural surroundings"
            fill
            sizes="100vw"
            className="home-feature__image"
          />
          <div className="home-feature__shade" />
          <div className="home-feature::after" />
          <div className="home-feature__copy">
            <p className="eyebrow">The long finish</p>
            <h2 className="display">
              Let the night<br /><em>take its time.</em>
            </h2>
            <a className="home-button home-button--light" href="/cocktails">
              Build a ritual <ArrowRight size={16} />
            </a>
          </div>
        </section>

        {/* ── COCKTAIL RECIPES ───────────────────────────────────── */}
        <section className="home-cocktails" id="cocktails">
          <div className="home-section-head">
            <div>
              <p className="eyebrow">COCKTAILS</p>
              <h2 className="display">
                Find Your Next<br /><em>Favourite Cocktail</em>
              </h2>
            </div>
          </div>

          <div className="cocktail-slider">
            <div
              className="cocktail-slider__track"
              style={{ transform: `translateX(-${cocktailSlide * 100}%)` }}
            >
              {cocktailImages.map((img, i) => (
                <div className="cocktail-slider__slide" key={i}>
                  <Image src={img.src} alt={img.alt} fill sizes="100vw" />
                </div>
              ))}
            </div>

            <button
              className="cocktail-slider__prev"
              onClick={prevSlide}
              aria-label="Previous cocktail"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              className="cocktail-slider__next"
              onClick={nextSlide}
              aria-label="Next cocktail"
            >
              <ChevronRight size={22} />
            </button>

            <div className="cocktail-slider__dots" role="tablist" aria-label="Cocktail slides">
              {cocktailImages.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === cocktailSlide}
                  className={`cocktail-slider__dot${i === cocktailSlide ? " active" : ""}`}
                  onClick={() => setCocktailSlide(i)}
                  aria-label={`Go to cocktail ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="home-cocktails__cta">
            <a className="home-button" href="/cocktails">
              VIEW ALL RECIPES <ArrowRight size={16} />
            </a>
          </div>
        </section>

        {/* ── STORY ──────────────────────────────────────────────── */}
        <section className="home-story" id="story">
          <div className="home-story__image">
            <Image
              src="/assets/8.png"
              alt="Sago bottle and whisky glass in a warm study"
              fill
              sizes="(max-width: 800px) 100vw, 48vw"
            />
          </div>
          <div className="home-story__copy">
            <p className="eyebrow">Our story</p>
            <h2 className="display">
              Made slowly.<br /><em>Shared freely.</em>
            </h2>
            <p className="body-copy">
              From good grain to deep oak, Sago is a whisky shaped by patience and
              finished for the present moment.
            </p>
            <div className="home-story__steps">
              <span>Good grain</span>
              <span>Deep oak</span>
              <span>Bold spirit</span>
            </div>
            <a className="home-text-link" href="/about">
              Read the story <ArrowRight size={15} />
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
                  onChange={(e) => setQuery(e.target.value)}
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
                  <option>All markets</option>
                  <option>Zambia</option>
                  <option>Zimbabwe</option>
                  <option>Botswana</option>
                  <option>Namibia</option>
                </select>
                <ChevronDown size={15} />
              </label>
            </div>
            <div className="home-retailers">
              {filteredRetailers.length > 0
                ? filteredRetailers.slice(0, 2).map((retailer) =>
                    retailer.mapUrl ? (
                      <a href={retailer.mapUrl} target="_blank" rel="noreferrer" key={retailer.name}>
                        <span>{retailer.name}</span>
                        <small>{retailer.country} · {retailer.type}</small>
                        <ArrowRight size={16} />
                      </a>
                    ) : (
                      <div className="home-retailers__item" key={retailer.name}>
                        <span>{retailer.name}</span>
                        <small>{retailer.country} · {retailer.type}</small>
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
