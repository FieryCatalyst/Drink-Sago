import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cocktail Recipes",
  description: "Discover handcrafted cocktail recipes shaped by Sago Gold Reserve and Cinnamon Whisky.",
  alternates: { canonical: "/cocktails" },
  openGraph: {
    title: "SAGO Cocktail Recipes",
    description: "Discover handcrafted cocktail recipes shaped by Sago Gold Reserve and Cinnamon Whisky.",
    type: "website",
  },
};

export default function CocktailsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
