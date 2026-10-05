import type { Metadata, Viewport } from "next";
import { Asul, Montserrat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import AgeGate from "@/components/age-gate";
import AnalyticsConsent from "@/components/analytics-consent";
import SmoothScroll from "@/components/smooth-scroll";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "SAGO | The House of Premium Spirits",
    template: "%s | SAGO Whisky",
  },
  description: "Celebrate every moment with SAGO | The House of Premium Spirits.",
  metadataBase: new URL("https://sago.world"),
  alternates: { canonical: "/" },
  icons: {
    icon: "/assets/Sago Logo.png",
    apple: "/assets/Sago Logo.png",
  },
  openGraph: {
    title: "SAGO | The House of Premium Spirits",
    description: "Celebrate every moment with SAGO | The House of Premium Spirits.",
    type: "website",
    images: ["/assets/Sago Logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "SAGO | The House of Premium Spirits",
    description: "Celebrate every moment with SAGO | The House of Premium Spirits.",
    images: ["/assets/Sago Logo.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AgeGate>
          <SmoothScroll>
            {children}
            <AnalyticsConsent />
          </SmoothScroll>
        </AgeGate>
        <Analytics />
      </body>
    </html>
  );
}

