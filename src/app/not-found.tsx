import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0b0b0b] text-[#f5f1e8] flex flex-col justify-between">
      <SiteNav />

      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 max-w-xl mx-auto">
        <p className="text-[#b08d57] font-semibold text-xs tracking-[0.2em] uppercase mb-4">
          404 · Page Not Found
        </p>
        <h1 className="text-4xl md:text-5xl font-serif tracking-tight mb-6">
          This Pour Doesn’t Exist
        </h1>
        <p className="text-sm md:text-base text-stone-400 mb-10 leading-relaxed">
          The bottle or page you are looking for may have been moved, renamed, or is no longer in circulation.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#b08d57] text-[#0b0b0b] px-6 py-3 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-[#c5a26c] transition-colors"
          >
            Return Home <ArrowRight size={15} />
          </Link>
          <Link
            href="/collection"
            className="inline-flex items-center gap-2 border border-[#b08d57]/40 text-[#f5f1e8] px-6 py-3 rounded-full text-xs font-bold tracking-widest uppercase hover:border-[#b08d57] hover:text-[#b08d57] transition-colors"
          >
            Explore Collection
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
