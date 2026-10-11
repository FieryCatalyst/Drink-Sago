"use client";

import React from "react";
import { Megaphone, Share2, Camera, ShieldCheck } from "lucide-react";
import { PartnerFormData } from "@/lib/partner-types";

interface Step8Props {
  data: PartnerFormData;
  errors: Record<string, string>;
  onChange: <K extends keyof PartnerFormData>(field: K, value: PartnerFormData[K]) => void;
}

export default function Step8MarketingPermissions({ data, errors, onChange }: Step8Props) {
  return (
    <div className="step-content">
      <div className="step-header">
        <span className="step-header__eyebrow">Step 8 of 10</span>
        <h2 className="step-header__title">Marketing & Promotional Permissions</h2>
        <p className="step-header__desc">
          Indicate individual promotional permissions for consumer discovery across SAGO digital channels and print materials.
        </p>
      </div>

      <div className="section-subcard" style={{ marginTop: 0 }}>
        <h3 className="section-subcard__title">
          <Megaphone size={18} /> Granular Marketing Consents
        </h3>
        <p className="section-subcard__desc">
          Each promotional activity is independently managed. Toggle your consent for each specific channel.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {/* Permission 1: Official Listing */}
          <label className={`custom-checkbox-row ${data.permListPartner ? "is-checked" : ""}`}>
            <input
              type="checkbox"
              className="custom-checkbox-input"
              checked={data.permListPartner}
              onChange={(e) => onChange("permListPartner", e.target.checked)}
            />
            <div className="checkbox-text-content">
              <span className="checkbox-title">List Outlet as an Official SAGO Promotional Partner</span>
              <span className="checkbox-desc">
                Feature your venue on SAGO&apos;s website directory and interactive promotional store locator.
              </span>
            </div>
          </label>

          {/* Permission 2: Display Name and Address */}
          <label className={`custom-checkbox-row ${data.permDisplayNameAddress ? "is-checked" : ""}`}>
            <input
              type="checkbox"
              className="custom-checkbox-input"
              checked={data.permDisplayNameAddress}
              onChange={(e) => onChange("permDisplayNameAddress", e.target.checked)}
            />
            <div className="checkbox-text-content">
              <span className="checkbox-title">Publicly Display Outlet Name, Physical Address & Google Maps Pin</span>
              <span className="checkbox-desc">
                Allow consumers to navigate directly to your venue via maps and location links.
              </span>
            </div>
          </label>

          {/* Permission 3: Photos */}
          <label className={`custom-checkbox-row ${data.permUsePhotos ? "is-checked" : ""}`}>
            <input
              type="checkbox"
              className="custom-checkbox-input"
              checked={data.permUsePhotos}
              onChange={(e) => onChange("permUsePhotos", e.target.checked)}
            />
            <div className="checkbox-text-content">
              <span className="checkbox-title">Display Approved Photographs of Your Venue</span>
              <span className="checkbox-desc">
                Feature high-resolution bar and ambiance photography on SAGO social media and promotional banners.
              </span>
            </div>
          </label>

          {/* Permission 4: Physical Promo Materials */}
          <label className={`custom-checkbox-row ${data.permDisplayPromoMaterials ? "is-checked" : ""}`}>
            <input
              type="checkbox"
              className="custom-checkbox-input"
              checked={data.permDisplayPromoMaterials}
              onChange={(e) => onChange("permDisplayPromoMaterials", e.target.checked)}
            />
            <div className="checkbox-text-content">
              <span className="checkbox-title">Display Approved SAGO Promotional POS Materials</span>
              <span className="checkbox-desc">
                Display branded table talkers, luxury brass coasters, bar runners, and campaign tent cards on-premise.
              </span>
            </div>
          </label>

          {/* Permission 5: Social Media Sharing */}
          <label className={`custom-checkbox-row ${data.permSocialChannels ? "is-checked" : ""}`}>
            <input
              type="checkbox"
              className="custom-checkbox-input"
              checked={data.permSocialChannels}
              onChange={(e) => onChange("permSocialChannels", e.target.checked)}
            />
            <div className="checkbox-text-content">
              <span className="checkbox-title">Collaborate on Social Media Campaign Announcements</span>
              <span className="checkbox-desc">
                Co-post, tag, or share SAGO promotional creative across Instagram, TikTok, and Facebook.
              </span>
            </div>
          </label>
        </div>
      </div>

      <div className="section-subcard">
        <h3 className="section-subcard__title">
          <Share2 size={18} /> Social Handles & Marketing Representative
        </h3>
        <p className="section-subcard__desc">
          Provide your social media handles and the contact person for co-marketing activations.
        </p>

        <div className="form-grid">
          <div className="col-12 form-field">
            <label className="field-label" htmlFor="marketingSocialHandles">
              <span>Outlet Social Media Handles</span>
            </label>
            <input
              id="marketingSocialHandles"
              type="text"
              className="form-input"
              placeholder="@velvetoak_nbi on Instagram, TikTok, Facebook"
              value={data.marketingSocialHandles}
              onChange={(e) => onChange("marketingSocialHandles", e.target.value)}
            />
          </div>

          <div className="col-4 form-field">
            <label className="field-label" htmlFor="marketingContactPerson">
              <span>Marketing Contact Name</span>
            </label>
            <input
              id="marketingContactPerson"
              type="text"
              className="form-input"
              placeholder="e.g., Brian Omondi"
              value={data.marketingContactPerson}
              onChange={(e) => onChange("marketingContactPerson", e.target.value)}
            />
          </div>

          <div className="col-4 form-field">
            <label className="field-label" htmlFor="marketingContactEmail">
              <span>Marketing Email</span>
            </label>
            <input
              id="marketingContactEmail"
              type="email"
              className="form-input"
              placeholder="marketing@velvetoak.co.ke"
              value={data.marketingContactEmail}
              onChange={(e) => onChange("marketingContactEmail", e.target.value)}
            />
          </div>

          <div className="col-4 form-field">
            <label className="field-label" htmlFor="marketingContactPhone">
              <span>Marketing Direct Phone</span>
            </label>
            <input
              id="marketingContactPhone"
              type="tel"
              className="form-input"
              placeholder="+254 712 000 000"
              value={data.marketingContactPhone}
              onChange={(e) => onChange("marketingContactPhone", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
