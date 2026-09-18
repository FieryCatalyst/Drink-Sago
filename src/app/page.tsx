"use client";

import Image from "next/image";
import { ArrowRight, ChevronDown, Search } from "lucide-react";
import { MdEmail } from "react-icons/md";
import { SiInstagram, SiTiktok } from "react-icons/si";
import { useState } from "react";
import { PrismaHero } from "@/components/ui/prisma-hero";
import LogoLoop from "@/components/ui/logo-loop";
import DepthCarousel from "@/components/ui/depth-carousel";

const products = [
  { name: "Gold Reserve", type: "Premium oak whisky", details: "42.8% ABV · 750 ml", note: "Toasted oak, dark honey and a long, warm finish.", image: "/assets/5.png" },
  { name: "The Original Pour", type: "Gold reserve whisky", details: "42.8% ABV · 750 ml", note: "A bright, balanced pour made for the first conversation.", image: "/assets/7.png" },
  { name: "Oak & Spirit", type: "Limited expression", details: "42.8% ABV · 750 ml", note: "Deep grain, polished spice and a touch of dried fruit.", image: "/assets/3.png" },
];

const cocktails = [
  { name: "The Gold Standard", time: "04 min", level: "Easy", glass: "Old fashioned", image: "/assets/4.png", ingredients: "Sago Gold Reserve, demerara syrup, aromatic bitters, orange oils.", steps: "Stir over a large cube until chilled. Express orange oils over the glass and serve." },
  { name: "Oak Highball", time: "05 min", level: "Easy", glass: "Highball", image: "/assets/2.png", ingredients: "Sago Gold Reserve, chilled soda, lemon peel, a pinch of sea salt.", steps: "Build over ice, top with soda and finish with a long lemon peel." },
  { name: "Bolder Sour", time: "07 min", level: "Slow ritual", glass: "Coupe", image: "/assets/6.png", ingredients: "Sago Gold Reserve, lemon, honey, egg white, grated nutmeg.", steps: "Dry shake, shake again with ice, then strain into a chilled coupe." },
];

const retailers = [
  { name: "The Tasting Room", type: "Bar", country: "Zambia", address: "Plot 14, Kabulonga, Lusaka", hours: "Open until 23:00" },
  { name: "Manda Hill Cellar", type: "Store", country: "Zambia", address: "Manda Hill Road, Lusaka", hours: "Open until 20:00" },
  { name: "The Oak House", type: "Restaurant", country: "Zimbabwe", address: "Borrowdale, Harare", hours: "Open until 22:30" },
  { name: "Cape & Grain", type: "Hotel", country: "Botswana", address: "Central Business District, Gaborone", hours: "Open until 22:00" },
];

const footerLinks = [
  { node: <SiInstagram />, title: "Instagram", href: "https://instagram.com" },
  { node: <SiTiktok />, title: "TikTok", href: "https://tiktok.com" },
  { node: <MdEmail />, title: "Email Sago", href: "mailto:hello@sago.world" },
];

const depthItems = [
  { image: "/assets/1.png", alt: "Sago Gold Reserve campaign artwork" },
  { image: "/assets/2.png", alt: "Sago Gold Reserve with a whisky glass" },
  { image: "/assets/3.png", alt: "Sago Gold Reserve in a natural setting" },
  { image: "/assets/4.png", alt: "Sago whisky being poured over ice" },
  { image: "/assets/5.png", alt: "Sago Gold Reserve bottle and box" },
  { image: "/assets/6.png", alt: "Sago Gold Reserve among oak and stone" },
  { image: "/assets/7.png", alt: "Sago Gold Reserve collection gallery" },
  { image: "/assets/8.png", alt: "Sago Gold Reserve in a warm study" },
];

function Button({ children, outline = false, href = "#collection" }: { children: React.ReactNode; outline?: boolean; href?: string }) {
  return <a className={`button ${outline ? "button-outline" : ""}`} href={href}>{children}<ArrowRight size={15} /></a>;
}

export default function Home() {
  const [activeCocktail, setActiveCocktail] = useState(0);
  const [country, setCountry] = useState("All markets");
  const [query, setQuery] = useState("");
  const selectedCocktail = cocktails[activeCocktail];
  const filteredRetailers = retailers.filter((retailer) => (country === "All markets" || retailer.country === country) && `${retailer.name} ${retailer.type} ${retailer.address}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <PrismaHero />

      <main id="top">

        <section className="intro section-pad" id="intro"><div className="intro-image"><Image src="/assets/7.png" alt="Sago Gold Reserve shared over a whisky glass" fill sizes="(max-width: 800px) 100vw, 40vw" /></div><div><p className="eyebrow">The Sago spirit</p><h2 className="display">Aged by nature.<br /><em>Crafted for you.</em></h2><p className="body-copy">Sago Gold Reserve is a premium oak whisky for people who move with intention. Every pour carries the warmth of the barrel, the richness of the grain and a point of view all its own.</p><a className="text-link" href="#story">Discover our story <ArrowRight size={15} /></a></div></section>

        <section className="collection section-pad" id="collection"><div className="section-heading"><div><p className="eyebrow">The collection</p><h2 className="display">A considered<br /><em>pour.</em></h2></div><p className="heading-note">One expression, made to hold its own neat, over ice or in good company.</p></div><div className="depth-gallery"><DepthCarousel items={depthItems} cardWidth={310} cardHeight={430} depth={190} spread={78} tilt={18} perspective={1400} visibleCards={4} falloff={0.2} blur={5} autoplay autoplayDelay={3600} loop tint="#163320" /></div><div className="product-grid">{products.map((product, index) => <article className={`product-card ${index === 1 ? "featured" : ""}`} key={product.name}><div className="product-image"><Image src={product.image} alt={`${product.name} Sago bottle`} fill sizes="(max-width: 800px) 100vw, 33vw" /></div><div className="product-info"><p className="eyebrow">{product.type}</p><h3 className="display">{product.name}</h3><p className="product-details">{product.details}</p><p className="product-note">{product.note}</p><a className="text-link" href="#shop">Explore bottle <ArrowRight size={15} /></a></div></article>)}</div></section>

        <section className="statement"><Image src="/assets/6.png" alt="Sago bottle resting in its natural surroundings" fill sizes="100vw" /><div className="statement-overlay" /><div className="statement-copy"><p className="eyebrow">Good spirits. Brighter tomorrows.</p><h2 className="display">Same spirit.<br /><em>New horizons.</em></h2><Button href="#cocktails">Make a pour</Button></div></section>

        <section className="cocktails section-pad" id="cocktails"><div className="section-heading"><div><p className="eyebrow">Serve it your way</p><h2 className="display">Cocktails for<br /><em>good company.</em></h2></div><p className="heading-note">Three ways to let the oak speak. Choose a ritual, then make it your own.</p></div><div className="cocktail-layout"><div className="cocktail-tabs">{cocktails.map((cocktail, index) => <button className={index === activeCocktail ? "active" : ""} key={cocktail.name} onClick={() => setActiveCocktail(index)}><span>0{index + 1}</span>{cocktail.name}<ChevronDown size={15} /></button>)}</div><div className="recipe-panel"><div className="recipe-image"><Image src={selectedCocktail.image} alt={selectedCocktail.name} fill sizes="(max-width: 800px) 100vw, 45vw" /></div><div className="recipe-copy"><p className="eyebrow">{selectedCocktail.time} · {selectedCocktail.level}</p><h3 className="display">{selectedCocktail.name}</h3><p className="recipe-meta">{selectedCocktail.glass} · Made with Sago Gold Reserve</p><div className="recipe-rule" /><p><strong>Ingredients</strong><br />{selectedCocktail.ingredients}</p><p><strong>The method</strong><br />{selectedCocktail.steps}</p><a className="text-link" href="#shop">Add it to your evening <ArrowRight size={15} /></a></div></div></div></section>

        <section className="story section-pad" id="story"><div className="story-image"><Image src="/assets/8.png" alt="Sago bottle and whisky glass in a warm study" fill sizes="(max-width: 800px) 100vw, 50vw" /></div><div className="story-copy"><p className="eyebrow">Our story</p><h2 className="display">The details<br /><em>make legends.</em></h2><p className="body-copy">From the grain we choose to the oak we rest it in, Sago is made with a respect for patience and a taste for progress. It is a spirit that belongs at the table, in the glass and in the stories that follow.</p><div className="timeline"><div><span>01</span><p>Good grain<br /><small>Where it begins</small></p></div><div><span>02</span><p>Deep oak<br /><small>Where it grows</small></p></div><div><span>03</span><p>Bold spirit<br /><small>Where it arrives</small></p></div></div><a className="text-link" href="#shop">Meet Sago <ArrowRight size={15} /></a></div></section>

        <section className="shop section-pad" id="shop"><div className="section-heading"><div><p className="eyebrow">Find your pour</p><h2 className="display">Sago is<br /><em>closer than you think.</em></h2></div><p className="heading-note">Available across Southern and East Africa. Search by city, venue or country.</p></div><div className="shop-tools"><label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search retailers" aria-label="Search retailers" /></label><label className="select-field"><select value={country} onChange={(event) => setCountry(event.target.value)} aria-label="Filter by country"><option>All markets</option><option>Zambia</option><option>Zimbabwe</option><option>Botswana</option><option>Namibia</option><option>Angola</option><option>Tanzania</option><option>Kenya</option><option>Mozambique</option></select><ChevronDown size={16} /></label></div><div className="retailer-grid">{filteredRetailers.map((retailer) => <article className="retailer" key={retailer.name}><div><span className="retailer-type">{retailer.type} · {retailer.country}</span><h3 className="display">{retailer.name}</h3><p>{retailer.address}</p><p>{retailer.hours}</p></div><a href="#shop" aria-label={`Get directions to ${retailer.name}`}><ArrowRight size={17} /></a></article>)}{filteredRetailers.length === 0 && <p className="empty-state">No retailers match that search yet. Try another country or city.</p>}</div></section>
        <section className="store-cta"><Image src="/assets/4.png" alt="Sago whisky poured over ice" fill sizes="100vw" /><div className="store-cta__shade" /><div className="store-cta__copy"><p className="eyebrow">Make the next moment count</p><h2 className="display">Find Sago<br /><em>near you.</em></h2><Button href="#shop">Find a retailer</Button></div></section>
      </main>

      <footer className="footer"><div className="footer-top"><div><a className="brand display" href="#top" aria-label="Sago home"><Image className="sago-logo sago-logo--footer" src="/assets/sago-logo.svg" alt="Sago" width={64} height={64} /></a><p>Gold reserve whisky<br />for bolder conversations.</p><div className="footer-links"><a href="#collection">Collection</a><a href="/cocktails">Cocktails</a><a href="#story">Our story</a><a href="#shop">Find Sago</a></div></div><div className="footer-social"><p className="eyebrow">Stay connected</p><LogoLoop logos={footerLinks} speed={28} logoHeight={30} gap={38} hoverSpeed={0} scaleOnHover fadeOut fadeOutColor="#171717" ariaLabel="Sago social and email links" /></div><form className="newsletter" onSubmit={(event) => event.preventDefault()}><label htmlFor="email">Stay in the spirit</label><div><input id="email" type="email" placeholder="Your email address" required /><button aria-label="Subscribe"><ArrowRight size={17} /></button></div></form></div><div className="footer-bottom"><span>© 2026 Sago Gold Reserve Whisky</span><span>Drink responsibly · Please enjoy Sago in moderation</span><span>Instagram · TikTok · Email</span></div></footer>
    </div>
  );
}
