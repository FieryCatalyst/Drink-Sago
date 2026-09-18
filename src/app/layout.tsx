import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import AgeGate from "@/components/age-gate";
import "./globals.css";

const displayFont = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
});

const bodyFont = Montserrat({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sago | Gold Reserve Whisky",
  description: "A premium oak whisky for bolder conversations.",
  metadataBase: new URL("https://sago.world"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "Sago | Gold Reserve Whisky",
    description: "A premium oak whisky for bolder conversations.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><AgeGate>{children}</AgeGate><Analytics /></body>
    </html>
  );
}
