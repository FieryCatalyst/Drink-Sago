import type { Metadata } from "next";
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";
import PartnerWizard from "@/components/partner-form/partner-wizard";

export const metadata: Metadata = {
  title: "Become a SAGO Business Partner | Partner Registration",
  description:
    "Register your bar, restaurant, lounge, or hotel across Africa as an official SAGO Whisky promotional partner. Access marketing support, promotional campaigns, and QR coupon redemption.",
  alternates: { canonical: "/partners/register" },
};

export default function PartnerRegisterPage() {
  return (
    <div className="partner-registration-route">
      <SiteNav />
      <main id="main-content">
        <PartnerWizard />
      </main>
      <SiteFooter />
    </div>
  );
}
