"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  Users,
  FileText,
  Wine,
  Calendar,
  QrCode,
  CreditCard,
  Megaphone,
  CheckSquare,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";

import "./partner-form.css";
import { PartnerFormData } from "@/lib/partner-types";
import { DEFAULT_SAGO_PRODUCTS, REDEMPTION_RULES, DECLARATION_STATEMENTS } from "@/lib/kenya-data";
import {
  validateStep1,
  validateStep2,
  validateStep3,
  validateStep4,
  validateStep5,
  validateStep6,
  validateStep7,
  validateStep8,
  validateStep9,
  validateFullApplication,
} from "@/lib/partner-validation";

import Step1BusinessInfo from "./step-1-business-info";
import Step2OwnerContact from "./step-2-owner-contact";
import Step3Documents from "./step-3-documents";
import Step4PartnershipProducts from "./step-4-partnership-products";
import Step5CampaignTerms from "./step-5-campaign-terms";
import Step6RedemptionSetup from "./step-6-redemption-setup";
import Step7PaymentSettlement from "./step-7-payment-settlement";
import Step8MarketingPermissions from "./step-8-marketing-permissions";
import Step9DeclarationsSignature from "./step-9-declarations-signature";
import Step10ReviewSubmit from "./step-10-review-submit";
import SubmissionSuccess from "./submission-success";

const STEP_DEFINITIONS = [
  { number: 1, label: "Business Info", icon: Building2 },
  { number: 2, label: "Owner & Rep", icon: Users },
  { number: 3, label: "Documents", icon: FileText },
  { number: 4, label: "Products", icon: Wine },
  { number: 5, label: "Campaign Terms", icon: Calendar },
  { number: 6, label: "Redemption Setup", icon: QrCode },
  { number: 7, label: "Settlement", icon: CreditCard },
  { number: 8, label: "Marketing", icon: Megaphone },
  { number: 9, label: "Declarations", icon: CheckSquare },
  { number: 10, label: "Review & Submit", icon: FileCheck },
];

const INITIAL_FORM_DATA: PartnerFormData = {
  // Step 1
  registeredBusinessName: "",
  tradingName: "",
  businessType: "",
  businessTypeOther: "",
  businessRegistrationNumber: "",
  dateOfEstablishment: "",
  businessWebsite: "",
  businessEmail: "",
  businessPhone: "",
  country: "Kenya",
  county: "",
  townCity: "",
  estateArea: "",
  streetBuilding: "",
  postalAddress: "",
  gpsCoordinates: "",
  googleMapsLink: "",
  numberOfOutlets: 1,
  dailyCustomerFootfall: "",
  operatingDays: ["Thursday", "Friday", "Saturday", "Sunday"],
  openingHours: "12:00 PM - 02:00 AM",
  monthlySalesVolume: "",
  sellsAlcohol: true,
  hasBarManager: true,
  additionalOutlets: [],

  // Step 2
  ownerFullName: "",
  ownerPosition: "",
  ownerNationality: "Kenyan",
  ownerEmail: "",
  ownerPhone: "",
  ownerAltPhone: "",
  authContactName: "",
  authContactTitle: "",
  authContactEmail: "",
  authContactPhone: "",
  authContactCanSign: true,
  ownershipStructure: "Individually Owned",
  directors: [],
  authAgreementPerson: "",

  // Step 3
  documents: [],

  // Step 4
  partnershipType: "Promotional Discount Partner",
  partnershipTypeOther: "",
  preferredStartDate: "",
  agreementDuration: "12 Months (Annual Partner)",
  outletsJoiningCount: 1,
  products: DEFAULT_SAGO_PRODUCTS.map((p) => ({
    id: p.id,
    productName: p.name,
    servingType: p.servingType as "Bottle" | "Glass" | "Cocktail",
    standardPrice: p.standardPrice,
    currency: "KES",
    discountType: p.discountType as "Percentage" | "Fixed Amount",
    proposedDiscount: p.proposedDiscount,
    proposedPromotionalPrice: Math.round(
      p.discountType === "Percentage"
        ? p.standardPrice * (1 - p.proposedDiscount / 100)
        : p.standardPrice - p.proposedDiscount
    ),
    selected: true,
  })),

  // Step 5
  campaignDiscountType: "Percentage",
  proposedDiscountRates: "15% - 20% on selected SAGO products",
  minimumPurchaseReq: "1 Drink or Bottle",
  maxDiscountPerTx: "",
  eligibleProductsTerms: "All participating SAGO Whisky bottles and signature cocktails",
  discountDaysHours: "Wednesdays to Sundays, 5:00 PM to Close",
  campaignStartDate: "",
  campaignEndDate: "",
  redemptionLimit: 25,
  combinableWithOffers: false,
  campaignExclusions: "",

  // Step 6
  outletDisplayName: "",
  redemptionMethod: "Both Methods",
  staffAccessCount: 2,
  designatedOutletManager: "",
  staffTrainingStatus: "Pending",
  hasSmartphoneTablet: true,
  hasReliableInternet: true,
  hasComputerDevice: true,
  preferredRedemptionDevice: "Smartphone / Tablet",
  requiresOnboardingAssistance: true,
  acknowledgedRedemptionRules: new Array(REDEMPTION_RULES.length).fill(false),

  // Step 7
  requiresSettlement: false,
  settlementArrangement: "No Payment or Reimbursement Required",
  settlementBankName: "",
  settlementAccountName: "",
  settlementAccountNumber: "",
  settlementBranch: "",
  settlementCurrency: "KES",
  settlementAltMethod: "",
  settlementContactName: "",
  settlementContactEmail: "",
  settlementContactPhone: "",
  settlementAgreedTerms: "",
  settlementFrequency: "Monthly",
  settlementInvoiceReq: "",

  // Step 8
  permListPartner: true,
  permDisplayNameAddress: true,
  permUsePhotos: true,
  permDisplayPromoMaterials: true,
  permSocialChannels: true,
  marketingSocialHandles: "",
  marketingContactPerson: "",
  marketingContactEmail: "",
  marketingContactPhone: "",

  // Step 9
  declarations: new Array(DECLARATION_STATEMENTS.length).fill(false),
  privacyNoticeAcknowledged: false,
  marketingCommsConsent: false,
  signatoryFullName: "",
  signatoryDesignation: "",
  signatoryBusinessName: "",
  signatureData: "",
  signatureDate: new Date().toISOString().split("T")[0],
};

const LOCAL_STORAGE_KEY = "sago_partner_onboarding_draft_v1";

export default function PartnerWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [maxStepVisited, setMaxStepVisited] = useState(1);
  const [formData, setFormData] = useState<PartnerFormData>(INITIAL_FORM_DATA);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<{
    reference: string;
    status: string;
    submittedAt: string;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Load saved draft on initial render
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          setFormData((prev) => ({ ...prev, ...parsed }));
          showToast("Resumed your saved application draft");
        }
      }
    } catch {
      // LocalStorage unavailable
    }
  }, [showToast]);

  // Sync outlet display name from trading name if not filled
  useEffect(() => {
    if (formData.tradingName && !formData.outletDisplayName) {
      setFormData((prev) => ({ ...prev, outletDisplayName: prev.tradingName }));
    }
    if (formData.registeredBusinessName && !formData.signatoryBusinessName) {
      setFormData((prev) => ({
        ...prev,
        signatoryBusinessName: prev.registeredBusinessName,
      }));
    }
  }, [formData.tradingName, formData.registeredBusinessName, formData.outletDisplayName]);

  const handleFieldChange = <K extends keyof PartnerFormData>(
    field: K,
    value: PartnerFormData[K]
  ) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Save locally automatically
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignored
      }
      return updated;
    });

    // Clear error for the field if user is editing it
    if (stepErrors[field as string]) {
      setStepErrors((prev) => {
        const copy = { ...prev };
        delete copy[field as string];
        return copy;
      });
    }
  };

  const validateCurrentStep = (): boolean => {
    let result = { isValid: true, errors: {} as Record<string, string> };

    switch (currentStep) {
      case 1:
        result = validateStep1(formData);
        break;
      case 2:
        result = validateStep2(formData);
        break;
      case 3:
        result = validateStep3(formData.documents);
        break;
      case 4:
        result = validateStep4(formData);
        break;
      case 5:
        result = validateStep5(formData);
        break;
      case 6:
        result = validateStep6(formData);
        break;
      case 7:
        result = validateStep7(formData);
        break;
      case 8:
        result = validateStep8(formData);
        break;
      case 9:
        result = validateStep9(formData);
        break;
      case 10:
        result = { isValid: true, errors: {} };
        break;
    }

    setStepErrors(result.errors);
    return result.isValid;
  };

  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      showToast("Please complete the required fields in this step.");
      return;
    }

    const next = currentStep + 1;
    setCurrentStep(next);
    setMaxStepVisited((prev) => Math.max(prev, next));
    setStepErrors({});
    scrollToTop();
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setStepErrors({});
      scrollToTop();
    }
  };

  const handleStepJump = (step: number) => {
    if (step <= maxStepVisited || step === 10) {
      setCurrentStep(step);
      setStepErrors({});
      scrollToTop();
    }
  };

  const handleSaveDraft = async () => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));

      // Also persist to server draft registry
      const res = await fetch("/api/partners/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: formData, isDraft: true }),
      });

      if (res.ok) {
        const d = await res.json();
        showToast(`Draft saved successfully (Ref: ${d.reference})`);
      } else {
        showToast("Draft saved to browser storage.");
      }
    } catch {
      showToast("Draft saved locally in browser.");
    }
  };

  const handleSubmitFinal = async () => {
    const fullValidation = validateFullApplication(formData);
    if (!fullValidation.isValid) {
      showToast("Please resolve outstanding errors before final submission.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/partners/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: formData, isDraft: false }),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error || "Submission could not be completed.");
      }

      // Clear draft
      localStorage.removeItem(LOCAL_STORAGE_KEY);

      setSubmissionResult({
        reference: resData.reference,
        status: resData.status,
        submittedAt: resData.submittedAt,
      });

      scrollToTop();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission failed.";
      showToast(`Error: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If application was submitted, show confirmation screen
  if (submissionResult) {
    return (
      <div className="partner-wizard-page" ref={containerRef}>
        <div className="partner-wizard-container">
          <SubmissionSuccess
            reference={submissionResult.reference}
            status={submissionResult.status}
            submittedAt={submissionResult.submittedAt}
            data={formData}
          />
        </div>
      </div>
    );
  }

  const progressPercentage = ((currentStep - 1) / (STEP_DEFINITIONS.length - 1)) * 100;

  return (
    <div className="partner-wizard-page" ref={containerRef}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            background: "rgba(18, 18, 18, 0.95)",
            border: "1px solid #b08d57",
            color: "#f5f1e8",
            padding: "0.85rem 1.4rem",
            borderRadius: "10px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.8)",
            zIndex: 1000,
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            backdropFilter: "blur(12px)",
          }}
        >
          <Sparkles size={16} color="#d4af37" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="partner-wizard-container">
        {/* Header & Intro */}
        <div className="partner-hero">
          <span className="partner-hero__badge">
            <Building2 size={13} /> SAGO Business Partner Program · Pan-African Network
          </span>
          <h1 className="partner-hero__title">
            Become a SAGO <em>Partner.</em>
          </h1>
          <p className="partner-hero__subtitle">
            Join the premier whisky partner network across Africa. Onboard your bar, restaurant, hotel, or lounge to unlock official promotional campaigns, point-of-sale support, and digital coupon redemption.
          </p>
        </div>

        {/* Stepper Navigation */}
        <div className="stepper-nav">
          <div className="stepper-progress-track">
            <div
              className="stepper-progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="stepper-steps-wrapper">
            {STEP_DEFINITIONS.map((step) => {
              const isCurrent = currentStep === step.number;
              const isCompleted = step.number < currentStep;
              const isClickable = step.number <= maxStepVisited || step.number === 10;
              const IconComp = step.icon;

              return (
                <button
                  key={step.number}
                  type="button"
                  disabled={!isClickable}
                  onClick={() => handleStepJump(step.number)}
                  className={`step-item ${isCurrent ? "is-current" : ""} ${
                    isCompleted ? "is-completed" : ""
                  }`}
                  title={`Go to Step ${step.number}: ${step.label}`}
                >
                  <div className="step-badge">
                    {isCompleted ? <CheckCircle2 size={16} /> : step.number}
                  </div>
                  <span className="step-label">{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Panel */}
        <div className="partner-form-card">
          {currentStep === 1 && (
            <Step1BusinessInfo
              data={formData}
              errors={stepErrors}
              onChange={handleFieldChange}
            />
          )}

          {currentStep === 2 && (
            <Step2OwnerContact
              data={formData}
              errors={stepErrors}
              onChange={handleFieldChange}
            />
          )}

          {currentStep === 3 && (
            <Step3Documents
              data={formData}
              errors={stepErrors}
              onChange={handleFieldChange}
            />
          )}

          {currentStep === 4 && (
            <Step4PartnershipProducts
              data={formData}
              errors={stepErrors}
              onChange={handleFieldChange}
            />
          )}

          {currentStep === 5 && (
            <Step5CampaignTerms
              data={formData}
              errors={stepErrors}
              onChange={handleFieldChange}
            />
          )}

          {currentStep === 6 && (
            <Step6RedemptionSetup
              data={formData}
              errors={stepErrors}
              onChange={handleFieldChange}
            />
          )}

          {currentStep === 7 && (
            <Step7PaymentSettlement
              data={formData}
              errors={stepErrors}
              onChange={handleFieldChange}
            />
          )}

          {currentStep === 8 && (
            <Step8MarketingPermissions
              data={formData}
              errors={stepErrors}
              onChange={handleFieldChange}
            />
          )}

          {currentStep === 9 && (
            <Step9DeclarationsSignature
              data={formData}
              errors={stepErrors}
              onChange={handleFieldChange}
            />
          )}

          {currentStep === 10 && (
            <Step10ReviewSubmit
              data={formData}
              onGoToStep={handleStepJump}
              onSubmit={handleSubmitFinal}
              isSubmitting={isSubmitting}
            />
          )}

          {/* Wizard Bottom Controls */}
          <div className="wizard-controls">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn-secondary"
                  disabled={isSubmitting}
                >
                  <ChevronLeft size={16} /> Back
                </button>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <button
                type="button"
                onClick={handleSaveDraft}
                className="btn-save-draft"
                disabled={isSubmitting}
              >
                <Save size={14} /> Save Draft
              </button>

              {currentStep < 10 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  Continue <ChevronRight size={16} />
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Support & Privacy Footer Links */}
        <div
          style={{
            marginTop: "2.5rem",
            textAlign: "center",
            fontSize: "0.8rem",
            color: "rgba(245, 241, 232, 0.5)",
          }}
        >
          Need onboarding assistance? Contact{" "}
          <a
            href="mailto:partnerships@drinksago.com"
            style={{ color: "#d4af37", textDecoration: "underline" }}
          >
            partnerships@drinksago.com
          </a>{" "}
          · Review our{" "}
          <Link
            href="/privacy"
            style={{ color: "#d4af37", textDecoration: "underline" }}
          >
            Privacy Notice
          </Link>{" "}
          and{" "}
          <Link
            href="/terms"
            style={{ color: "#d4af37", textDecoration: "underline" }}
          >
            Terms of Service
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
