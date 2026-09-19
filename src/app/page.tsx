"use client";

import Image from "next/image";
import { ArrowRight, ChevronDown, Menu, Search, X } from "lucide-react";
import { useState } from "react";
import SiteFooter from "@/components/site-footer";
import DepthCarousel from "@/components/ui/depth-carousel";

const products = [
  { name: "Gold Reserve", type: "Oak whisky", details: "42.8% ABV · 750 ml", note: "Toasted oak, dark honey and a long, warm finish.", image: "/assets/5.png" },
  { name: "The Original Pour", type: "Gold reserve whisky", details: "42.8% ABV · 750 ml", note: "A bright, balanced pour made for the first conversation.", image: "/assets/7.png" },
  { name: "Oak & Spirit", type: "Oak expression", details: "42.8% ABV · 750 ml", note: "Deep grain, polished spice and a touch of dried fruit.", image: "/assets/3.png" },
];

const cocktails = [
  { name: "The Gold Standard", time: "04 min", level: "Easy", glass: "Old fashioned", image: "/assets/4.png", ingredients: "Sago Gold Reserve, demerara syrup, aromatic bitters, orange oils.", steps: "Stir over a large cube until chilled. Express orange oils over the glass and serve." },
  { name: "Oak Highball", time: "05 min", level: "Easy", glass: "Highball", image: "/assets/2.png", ingredients: "Sago Gold Reserve, chilled soda, lemon peel, a pinch of sea salt.", steps: "Build over ice, top with soda and finish with a long lemon peel." },
  { name: "Bolder Sour", time: "07 min", level: "Slow ritual", glass: "Coupe", image: "/assets/6.png", ingredients: "Sago Gold Reserve, lemon, honey, egg white, grated nutmeg.", steps: "Dry shake, shake again with ice, then strain into a chilled coupe." },
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
  { image: "/assets/3.png", alt: "Sago Gold Reserve in a natural setting" },
  { image: "/assets/4.png", alt: "Sago whisky poured over ice" },
  { image: "/assets/5.png", alt: "Sago Gold Reserve bottle and box" },
  { image: "/assets/6.png", alt: "Sago Gold Reserve among oak and stone" },
  { image: "/assets/7.png", alt: "Sago Gold Reserve collection gallery" },
  { image: "/assets/8.png", alt: "Sago Gold Reserve in a warm study" },
];

export default function Home() {
  const [activeCocktail, setActiveCocktail] = useState(0);
  const [country, setCountry] = useState("All markets");
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const selectedCocktail = cocktails[activeCocktail];
  const filteredRetailers = retailers.filter((retailer) => (country === "All markets" || retailer.country === country) && `${retailer.name} ${retailer.type} ${retailer.address}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="sago-home">
      <header className="home-nav">
        <button className="home-nav__menu" type="button" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((isOpen) => !isOpen)}>{menuOpen ? <X size={19} /> : <Menu size={19} />}</button>
        <a className="home-nav__brand" href="#top" aria-label="Sago home"><Image src="/assets/LOGO.png" alt="Sago" width={48} height={48} priority /></a>
        <nav aria-label="Primary navigation">
          <a href="#collection" onClick={() => setMenuOpen(false)}>Collection</a>
          <a href="/cocktails" onClick={() => setMenuOpen(false)}>Cocktails</a>
          <a href="#story" onClick={() => setMenuOpen(false)}>Our story</a>
        </nav>
        <a className="home-nav__shop" href="#shop">Find your pour <ArrowRight size={15} /></a>
        <div className={`home-nav__drawer${menuOpen ? " is-open" : ""}`} aria-hidden={!menuOpen}>
          <a href="#collection" tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)}>Collection <span>01</span></a>
          <a href="/cocktails" tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)}>Cocktails <span>02</span></a>
          <a href="#story" tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)}>Our story <span>03</span></a>
          <a href="#shop" tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)}>Find your pour <span>04</span></a>
        </div>
      </header>

      <main id="top">
        <section className="home-hero">
          <Image src="/assets/2.png" alt="Sago Gold Reserve Whisky with a glass of whisky" fill priority sizes="100vw" className="home-hero__image" />
          <div className="home-hero__shade" />
          <div className="home-hero__grain" />
          <div className="home-hero__content">
            <p className="eyebrow">Gold Reserve · Oak whisky · 42.8% ABV</p>
            <h1 className="display">Pour with<br /><em>presence.</em></h1>
            <p className="home-hero__lede">A patient pour for nights that deserve more than a passing thought.</p>
            <a className="home-button" href="#collection">Explore the collection <ArrowRight size={16} /></a>
          </div>
          <div className="home-hero__side-note">01 <span>/</span> 05<br /><small>Made in Southern Africa</small></div>
          <a className="home-hero__scroll" href="#intro"><span>Enter the Sago world</span><ChevronDown size={16} /></a>
        </section>

        <section className="home-intro" id="intro">
          <div className="home-intro__number">01</div>
          <div className="home-intro__statement"><p className="eyebrow">The Sago point of view</p><h2 className="display">Not made<br />to <em>disappear.</em></h2><p className="body-copy">Sago Gold Reserve holds its ground. Warm grain, toasted oak and a finish that stays long after the glass is empty.</p><a className="home-text-link" href="#story">Read the story <ArrowRight size={15} /></a></div>
          <div className="home-intro__image"><Image src="/assets/7.png" alt="Sago Gold Reserve shared over a whisky glass" fill sizes="(max-width: 800px) 90vw, 43vw" /></div>
        </section>

        <section className="home-marquee" aria-label="Sago Gold Reserve statement"><div className="home-marquee__word display">A bolder conversation <em>starts here.</em></div></section>

        <section className="home-collection" id="collection">
          <div className="home-section-head"><div><p className="eyebrow">02 · The collection</p><h2 className="display">One bottle.<br /><em>Many occasions.</em></h2></div><p>Neat, over ice or mixed with intention. Gold Reserve was made to move with the room.</p></div>
          <div className="home-collection__carousel"><DepthCarousel items={collectionGallery} cardWidth={300} cardHeight={420} depth={190} spread={78} tilt={18} perspective={1400} visibleCards={4} falloff={0.2} blur={5} autoplay autoplayDelay={3600} loop tint="var(--green)" /></div>
          <div className="home-product-rail">{products.map((product, index) => <article className={`home-product ${index === 1 ? "home-product--feature" : ""}`} key={product.name}><div className="home-product__image"><Image src={product.image} alt={`${product.name} Sago bottle`} fill sizes="(max-width: 800px) 86vw, 30vw" /></div><div className="home-product__meta"><span>0{index + 1}</span><p className="eyebrow">{product.type}</p></div><h3 className="display">{product.name}</h3><p>{product.note}</p><a className="home-text-link" href="#shop">Find this pour <ArrowRight size={15} /></a></article>)}</div>
        </section>

        <section className="home-feature">
          <Image src="/assets/6.png" alt="Sago bottle resting in its natural surroundings" fill sizes="100vw" className="home-feature__image" />
          <div className="home-feature__shade" />
          <div className="home-feature__copy"><p className="eyebrow">03 · The long finish</p><h2 className="display">Let the night<br /><em>take its time.</em></h2><a className="home-button home-button--light" href="/cocktails">Build a ritual <ArrowRight size={16} /></a></div>
        </section>

        <section className="home-cocktails" id="cocktails">
          <div className="home-section-head"><div><p className="eyebrow">04 · Serve it your way</p><h2 className="display">Make room<br /><em>for another.</em></h2></div><p>Three rituals, one steady spirit. Choose a glass and let the evening find its pace.</p></div>
          <div className="home-cocktail-layout"><div className="home-cocktail-tabs">{cocktails.map((cocktail, index) => <button className={index === activeCocktail ? "active" : ""} key={cocktail.name} onClick={() => setActiveCocktail(index)}><span>0{index + 1}</span>{cocktail.name}<ChevronDown size={16} /></button>)}</div><div className="home-cocktail-detail"><div className="home-cocktail-detail__image"><Image src={selectedCocktail.image} alt={selectedCocktail.name} fill sizes="(max-width: 800px) 100vw, 43vw" /></div><div><p className="eyebrow">{selectedCocktail.time} · {selectedCocktail.level}</p><h3 className="display">{selectedCocktail.name}</h3><p className="home-cocktail-detail__glass">{selectedCocktail.glass} · Made with Sago Gold Reserve</p><div className="home-cocktail-detail__rule" /><p><strong>Ingredients</strong><br />{selectedCocktail.ingredients}</p><p><strong>Method</strong><br />{selectedCocktail.steps}</p></div></div></div>
        </section>

        <section className="home-story" id="story"><div className="home-story__image"><Image src="/assets/8.png" alt="Sago bottle and whisky glass in a warm study" fill sizes="(max-width: 800px) 100vw, 48vw" /></div><div className="home-story__copy"><p className="eyebrow">05 · Our story</p><h2 className="display">Made slowly.<br /><em>Shared freely.</em></h2><p className="body-copy">From good grain to deep oak, Sago is a whisky shaped by patience and finished for the present moment.</p><div className="home-story__steps"><span>Good grain</span><span>Deep oak</span><span>Bold spirit</span></div><a className="home-text-link" href="#shop">Meet Sago <ArrowRight size={15} /></a></div></section>

        <section className="home-find" id="shop"><Image src="/assets/4.png" alt="Sago whisky poured over ice" fill sizes="100vw" /><div className="home-find__shade" /><div className="home-find__content"><p className="eyebrow">Find your pour</p><h2 className="display">The next round<br /><em>is closer.</em></h2><div className="home-find__tools"><label className="home-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search city or venue" aria-label="Search retailers" /></label><label className="home-select"><select value={country} onChange={(event) => setCountry(event.target.value)} aria-label="Filter by country"><option>All markets</option><option>Zambia</option><option>Zimbabwe</option><option>Botswana</option><option>Namibia</option></select><ChevronDown size={15} /></label></div><div className="home-retailers">{filteredRetailers.length > 0 ? filteredRetailers.slice(0, 2).map((retailer) => retailer.mapUrl ? <a href={retailer.mapUrl} target="_blank" rel="noreferrer" key={retailer.name}><span>{retailer.name}</span><small>{retailer.country} · {retailer.type}</small><ArrowRight size={16} /></a> : <div className="home-retailers__item" key={retailer.name}><span>{retailer.name}</span><small>{retailer.country} · {retailer.type}</small></div>) : <p className="home-retailers__empty">No pours match that search. Try another city or venue.</p>}</div></div></section>
      </main>
      <SiteFooter />
    </div>
  );
}
