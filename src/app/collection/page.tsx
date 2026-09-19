"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ChevronDown, Download } from "lucide-react";
import { useState } from "react";

const products = [
  {
    name: "Gold Reserve Whisky",
    type: "Oak whisky",
    abv: "42.8% ABV",
    size: "750 ml",
    image: "/assets/5.png",
    description: "A rich, polished whisky with a warm oak finish and the depth to hold a room.",
    story: "Gold Reserve is rested patiently in oak, allowing grain, wood and time to arrive in balance. It is made for the first pour and the conversation that follows.",
    nose: "Toasted oak, dark honey and fresh orange peel.",
    palate: "Soft grain sweetness, polished spice and roasted walnut.",
    finish: "Long, warming oak with a clean touch of dried fruit.",
    serving: "Serve neat to open the grain, or over one large cube.",
    pairing: "Charred beef, aged cheddar, dark chocolate and roasted nuts.",
  },
  {
    name: "The Original Pour",
    type: "Gold reserve whisky",
    abv: "42.8% ABV",
    size: "750 ml",
    image: "/assets/7.png",
    description: "Bright, balanced and quietly confident, made for an easy opening pour.",
    story: "The Original Pour carries the Sago signature in its most open expression. It is generous enough for a shared table and precise enough for a slow, considered glass.",
    nose: "Vanilla bean, green apple and a trace of warm cedar.",
    palate: "Golden grain, soft caramel and gentle baking spice.",
    finish: "Lightly sweet, with a clean oak lift.",
    serving: "Build into an Oak Highball with chilled soda and lemon peel.",
    pairing: "Grilled chicken, citrus salads, spiced prawns and soft cheeses.",
  },
  {
    name: "Oak & Spirit",
    type: "Oak expression",
    abv: "42.8% ABV",
    size: "750 ml",
    image: "/assets/3.png",
    description: "A deeper expression with dark grain, polished spice and a sense of place.",
    story: "Oak & Spirit leans into the darker side of the Sago palette, with a pronounced relationship with the barrel.",
    nose: "Cocoa nib, dried fig and cedar smoke.",
    palate: "Dark honey, toasted grain and black pepper.",
    finish: "Deep, dry and persistent with a gentle mineral note.",
    serving: "Enjoy neat after dinner, or use as the base of a Bolder Sour.",
    pairing: "Slow-cooked lamb, mushroom dishes, blue cheese and espresso desserts.",
  },
];

const cocktails = [
  { name: "The Gold Standard", detail: "Sago Gold Reserve · Demerara · Bitters", image: "/assets/4.png" },
  { name: "Oak Highball", detail: "Sago Gold Reserve · Soda · Lemon", image: "/assets/2.png" },
  { name: "Bolder Sour", detail: "Sago Gold Reserve · Lemon · Honey", image: "/assets/6.png" },
];

export default function CollectionPage() {
  const [openProduct, setOpenProduct] = useState(0);

  return (
    <main className="collection-page">
      <header className="collection-header">
        <Link className="brand display" href="/" aria-label="Sago home"><Image className="sago-logo" src="/assets/LOGO.png" alt="Sago" width={48} height={48} /></Link>
        <nav aria-label="Collection navigation"><Link href="/">Home</Link><a className="active" href="#range">Collection</a><Link href="/cocktails">Cocktails</Link><Link href="/#shop">Find Sago</Link></nav>
        <Link className="collection-header__cta" href="/#shop">Shop nearby <ArrowRight size={14} /></Link>
      </header>

      <section className="collection-hero">
        <Image src="/assets/1.png" alt="Sago Gold Reserve bottle range" fill priority sizes="100vw" className="collection-hero__image" />
        <div className="collection-hero__shade" />
        <div className="collection-hero__copy"><p className="eyebrow">Our collection · Gold Reserve Whisky</p><h1 className="display">The bottle<br /><em>behind the bold.</em></h1><div className="section-rule" /><p>One spirit, shaped by grain, oak and time. Meet the Sago collection.</p><a className="collection-hero__scroll" href="#range">Explore the range <ArrowDown size={16} /></a></div>
      </section>

      <section className="collection-intro section-pad" id="range"><div><p className="eyebrow">Craftsmanship, considered</p><h2 className="display">Quality you can<br /><em>taste.</em></h2></div><div><p className="body-copy">Sago begins with quality ingredients and a belief that patience should be felt in every pour. Our flavour philosophy is simple: keep the grain expressive, let the oak bring depth, and leave enough room for the spirit to speak.</p><p className="body-copy">Every bottle is made for discovery, whether it is opened neat, shared over ice, or used to start a bolder cocktail.</p></div></section>

      <section className="collection-products section-pad"><div className="section-heading"><div><p className="eyebrow">The range</p><h2 className="display">Find your<br /><em>expression.</em></h2></div><p className="heading-note">Bottle by bottle, the Sago character stays clear: generous, grounded and made for good company.</p></div><div className="collection-product-grid">{products.map((product, index) => <article className={`collection-product ${openProduct === index ? "is-open" : ""}`} key={product.name}><button className="collection-product__top" onClick={() => setOpenProduct(openProduct === index ? -1 : index)} aria-expanded={openProduct === index}><div className="collection-product__image"><Image src={product.image} alt={product.name} fill sizes="(max-width: 800px) 100vw, 33vw" /></div><div className="collection-product__summary"><p className="eyebrow">{product.type}</p><h3 className="display">{product.name}</h3><p>{product.description}</p><span className="collection-product__meta">{product.abv} · {product.size}</span><span className="collection-product__toggle">{openProduct === index ? "Close details" : "View details"}<ChevronDown size={16} /></span></div></button>{openProduct === index && <div className="collection-product__details"><p className="product-story">{product.story}</p><div className="tasting-notes"><div><span>Nose</span><p>{product.nose}</p></div><div><span>Palate</span><p>{product.palate}</p></div><div><span>Finish</span><p>{product.finish}</p></div></div><div className="product-guidance"><div><span>Serve it</span><p>{product.serving}</p></div><div><span>Pair it</span><p>{product.pairing}</p></div></div><a className="media-link" href={product.image} download><Download size={15} /> Download bottle media</a></div>}</article>)}</div></section>

      <section className="collection-cocktails section-pad"><div className="section-heading"><div><p className="eyebrow">Suggested serves</p><h2 className="display">Start with a<br /><em>good pour.</em></h2></div><p className="heading-note">Each expression has a cocktail waiting for it. Keep it classic, or make the moment yours.</p></div><div className="collection-cocktail-grid">{cocktails.map((cocktail) => <Link className="collection-cocktail" href="/cocktails" key={cocktail.name}><div><Image src={cocktail.image} alt={cocktail.name} fill sizes="(max-width: 800px) 100vw, 33vw" /></div><p className="eyebrow">{cocktail.detail}</p><h3 className="display">{cocktail.name}</h3><span className="text-link">View recipe <ArrowRight size={15} /></span></Link>)}</div></section>
    </main>
  );
}
