import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Collection | Sago Gold Reserve Whisky",
  description: "Explore Sago Gold Reserve Whisky, tasting notes, serving suggestions, pairings and suggested cocktails.",
  alternates: { canonical: "/collection" },
  openGraph: {
    title: "Our Collection | Sago Gold Reserve Whisky",
    description: "A considered pour, shaped by grain, oak and time.",
    type: "website",
  },
};

export default function CollectionLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
