import Link from "next/link";
import SiteFooter from "@/components/site-footer";

type Section = { title: string; children: React.ReactNode };

export default function LegalPage({ title, intro, sections }: { title: string; intro: string; sections: Section[] }) {
  return (
    <main className="legal-page">
      <header className="legal-header">
        <Link className="brand display" href="/">Sago</Link>
        <Link className="legal-header__home" href="/">Back to Sago <span aria-hidden="true">→</span></Link>
      </header>
      <article className="legal-content">
        <p className="eyebrow">Sago Gold Reserve Whisky</p>
        <h1 className="display">{title}</h1>
        <p className="legal-intro">{intro}</p>
        <p className="legal-updated">Last updated: 18 September 2026</p>
        {sections.map((section) => <section className="legal-section" key={section.title}><h2 className="display">{section.title}</h2>{section.children}</section>)}
        <p className="legal-contact">Questions or privacy requests: <a href="mailto:Info@drinksago.com">Info@drinksago.com</a></p>
      </article>
      <SiteFooter />
    </main>
  );
}
