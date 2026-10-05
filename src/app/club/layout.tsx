import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The SAGO Collective",
  description: "Join the SAGO Collective for exclusive access to releases, tasting events, and culture stories.",
  alternates: { canonical: "/club" },
  openGraph: {
    title: "Join the SAGO Collective",
    description: "Exclusive access to releases, tasting events, and culture stories directly to your inbox.",
    type: "website",
  },
};

export default function ClubLayout({ children }: { children: React.ReactNode }) {
  return children;
}
