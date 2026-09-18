import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Sago | Good Spirits, Brighter Tomorrows",
  description: "Discover the craftsmanship, values, production story and growing markets behind Sago Gold Reserve Whisky.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Sago | Good Spirits, Brighter Tomorrows",
    description: "The spirit behind Sago Gold Reserve Whisky.",
    type: "website",
  },
};

export default function AboutLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
