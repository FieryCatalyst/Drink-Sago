import type { Metadata } from "next";
import { Asul, Montserrat } from "next/font/google";
import AgeGate from "@/components/age-gate";
import AnalyticsConsent from "@/components/analytics-consent";
import "./globals.css";

// Primary font: Asul (normal + bold) — per client brief
const bodyFont = Asul({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "700"],
});

// Complementary bold font: Montserrat — used for eyebrows, labels, accents
const displayFont = Montserrat({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SAGO | The House of Premium Spirits",
  description: "Celebrate every moment with SAGO — The House of Premium Spirits.",
  metadataBase: new URL("https://sago.world"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "SAGO | The House of Premium Spirits",
    description: "Celebrate every moment with SAGO — The House of Premium Spirits.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="min-h-full flex flex-col">
        <AgeGate>
          {children}
          <AnalyticsConsent />
        </AgeGate>
      </body>
    </html>
  );
}
