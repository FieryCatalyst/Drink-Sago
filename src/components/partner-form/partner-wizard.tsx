"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  Wine,
  CreditCard,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Save,
  CheckCircle2,
  AlertCircle,
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
  validateFullApplication,
} from "@/lib/partner-validation";

import Step1BusinessInfo from "./step-1-business-info";
import Step2OwnerContact from "./step-2-owner-contact";
import Step3PartnershipProducts from "./step-3-partnership-products";
import Step4OperationsSettlement from "./step-4-operations-settlement";
import Step5ReviewSubmit from "./step-5-review-submit";
import SubmissionSuccess from "./submission-success";

const STEP_DEFINITIONS = [
  { number: 1, label: "Business Details", icon: Building2 },
  { number: 2, label: "Contact Person", icon: Users },
  { number: 3, label: "Partnership & Products", icon: Wine },
  { number: 4, label: "Operations & Settlement", icon: CreditCard },
  { number: 5, label: "Review & Submit", icon: FileCheck },
];

const INITIAL_FORM_DATA: PartnerFormData = {
  // Step 1: Business Details
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

  // Step 2: Contact Person
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

  // Documents (Optional)
  documents: [],

  // Step 3: Partnership & Products
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

  // Campaign Settings
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

  // Step 4: Operations & Settlement
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

  permListPartner: true,
  permDisplayNameAddress: true,
  permUsePhotos: true,
  permDisplayPromoMaterials: true,
  permSocialChannels: true,
  marketingSocialHandles: "",
  marketingContactPerson: "",
  marketingContactEmail: "",
  marketingContactPhone: "",

  // Step 5: Review & Declarations
  declarations: new Array(DECLARATION_STATEMENTS.length).fill(false),
  privacyNoticeAcknowledged: false,
  marketingCommsConsent: false,
  signatoryFullName: "",
  signatoryDesignation: "",
  signatoryBusinessName: "",
  signatureData: "",
  signatureDate: new Date().toISOString().split("T")[0],
};

export default function PartnerWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PartnerFormData>(INITIAL_FORM_DATA);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [validationSummary, setValidationSummary] = useState<{ step: number; message: string } | null>(null);
  const [submissionResult, setSubmissionResult] = useState<{
    reference: string;
    status: string;
    submittedAt: string;
  } | null>(null);
  const [savedReference, setSavedReference] = useState<string | null>(null);
  const [isLoadingDraft, setIsLoadingDraft] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Load draft on mount
  useEffect(() => {
    const loadSavedDraft = async () => {
      const reference = localStorage.getItem("sago_partner_draft_reference");
      const ownershipToken = localStorage.getItem("sago_partner_draft_id");
      if (!reference || !ownershipToken) {
        setIsLoadingDraft(false);
        return;
      }
      try {
        const res = await fetch(`/api/partners/register?reference=${reference}&ownershipToken=${ownershipToken}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.formData) {
            // Ensure marketing permissions are disabled when consent is false
            const formData = data.formData;
            const correctedFormData = !formData.marketingCommsConsent
              ? { ...formData, permListPartner: false, permDisplayNameAddress: false }
              : formData;
            setFormData(correctedFormData);
            setSavedReference(data.reference);
          }
        }
      } catch {
      } finally {
        setIsLoadingDraft(false);
      }
    };
    loadSavedDraft();
  }, []);

  // Sync auto-fill fields
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
    // Initialize signatory fields once from owner fields (only if empty)
    if (formData.ownerFullName && !formData.signatoryFullName) {
      setFormData((prev) => ({ ...prev, signatoryFullName: prev.ownerFullName }));
    }
    if (formData.ownerPosition && !formData.signatoryDesignation) {
      setFormData((prev) => ({ ...prev, signatoryDesignation: prev.ownerPosition }));
    }
  }, [formData.tradingName, formData.registeredBusinessName, formData.outletDisplayName, formData.ownerFullName, formData.ownerPosition, formData.signatoryFullName, formData.signatoryDesignation]);

  // Sync marketing permissions with promotional visibility consent
  useEffect(() => {
    if (!formData.marketingCommsConsent) {
      setFormData((prev) => ({
        ...prev,
        permListPartner: false,
        permDisplayNameAddress: false,
      }));
    }
  }, [formData.marketingCommsConsent]);

  const handleFieldChange = <K extends keyof PartnerFormData>(
    field: K,
    value: PartnerFormData[K]
  ) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      return updated;
    });

    if (stepErrors[field as string]) {
      setStepErrors((prev) => {
        const copy = { ...prev };
        delete copy[field as string];
        return copy;
      });
    }
    if (validationSummary) {
      setValidationSummary(null);
    }
  };

  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Free navigation: any step is clickable anytime!
  const handleStepJump = (step: number) => {
    setCurrentStep(step);
    setStepErrors({});
    setValidationSummary(null);
    scrollToTop();
  };

  // Next step without blocking modals
  const handleNext = () => {
    if (currentStep < 5) {
      const next = currentStep + 1;
      setCurrentStep(next);
      setStepErrors({});
      setValidationSummary(null);
      scrollToTop();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setStepErrors({});
      setValidationSummary(null);
      scrollToTop();
    }
  };

  const handleSaveDraft = async (): Promise<boolean> => {
    try {
      const ownershipToken = savedReference ? localStorage.getItem("sago_partner_draft_id") : undefined;
      const res = await fetch("/api/partners/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: formData, isDraft: true, existingReference: savedReference, ownershipToken }),
      });

      if (res.ok) {
        const d = await res.json();
        if (d.reference) {
          setSavedReference(d.reference);
          localStorage.setItem("sago_partner_draft_reference", d.reference);
          if (d.recordId) {
            localStorage.setItem("sago_partner_draft_id", d.recordId);
          }
        }
        showToast(`Draft saved successfully (Ref: ${d.reference})`);
        return true;
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || "Failed to save draft.");
        return false;
      }
    } catch {
      showToast("Failed to save draft.");
      return false;
    }
  };

  const handleSubmitFinal = async () => {
    // Validate all 5 steps
    const fullValidation = validateFullApplication(formData);
    if (!fullValidation.isValid) {
      const firstErrorStep = Object.keys(fullValidation.stepErrors).map(Number)[0] || 1;
      const errorsForStep = fullValidation.stepErrors[firstErrorStep] || {};
      const firstErrorMessage = Object.values(errorsForStep)[0] || "Please complete required fields.";

      setStepErrors(errorsForStep);
      setValidationSummary({
        step: firstErrorStep,
        message: `Step ${firstErrorStep} (${STEP_DEFINITIONS[firstErrorStep - 1]?.label}): ${firstErrorMessage}`,
      });
      showToast(`Missing info in Step ${firstErrorStep}. Click 'Go to Step ${firstErrorStep}' to complete.`);
      scrollToTop();
      return;
    }

    // Resolve signatory name: use signatoryFullName if provided, otherwise fall back to ownerFullName
    const resolvedSignatoryName = formData.signatoryFullName?.trim() || formData.ownerFullName?.trim() || "";

    // Ensure marketing permissions are disabled when consent is false
    const submitData = !formData.marketingCommsConsent
      ? { ...formData, permListPartner: false, permDisplayNameAddress: false, signatoryFullName: resolvedSignatoryName }
      : { ...formData, signatoryFullName: resolvedSignatoryName };

    setIsSubmitting(true);

    try {
      const ownershipToken = localStorage.getItem("sago_partner_draft_id");
      const res = await fetch("/api/partners/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: submitData,
          isDraft: false,
          existingReference: savedReference,
          ownershipToken,
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error || "Submission could not be completed.");
      }

      localStorage.removeItem("sago_partner_draft_reference");
      localStorage.removeItem("sago_partner_draft_id");

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

  if (isLoadingDraft) {
    return (
      <div className="partner-wizard-page" ref={containerRef} style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center", color: "rgba(245, 241, 232, 0.6)" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid rgba(176, 141, 87, 0.3)", borderTopColor: "#b08d57", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
          <p style={{ fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Loading draft…</p>
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
            gap: "0.6rem",
          }}
        >
          <Sparkles size={16} color="#b08d57" />
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

        {/* Stepper Navigation (5 Clean Steps) */}
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
              const IconComp = step.icon;

              return (
                <button
                  key={step.number}
                  type="button"
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

        {/* Validation Notice Banner (if any required info was missing on submit) */}
{validationSummary && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                borderRadius: "12px",
                padding: "1rem 1.25rem",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "0.75rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <AlertCircle size={20} color="#ef4444" />
                <span style={{ fontSize: "0.9rem", color: "#fca5a5" }}>
                  {validationSummary.message}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(validationSummary.step);
                  setValidationSummary(null);
                  scrollToTop();
                }}
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  padding: "0.4rem 0.9rem",
                  borderRadius: "6px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Go to Step {validationSummary.step} ➔
              </button>
            </div>
          )}

        {/* Form Panel */}
        <div className="partner-form-card">
          {currentStep === 1 && (
            <Step1BusinessInfo
              data={formData}
              errors={stepErrors}
              onChange={handleFieldChange}
              onGoToStep={handleStepJump}
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
            <Step3PartnershipProducts
              data={formData}
              errors={stepErrors}
              onChange={handleFieldChange}
            />
          )}

          {currentStep === 4 && (
            <Step4OperationsSettlement
              data={formData}
              errors={stepErrors}
              onChange={handleFieldChange}
            />
          )}

          {currentStep === 5 && (
            <Step5ReviewSubmit
              data={formData}
              errors={stepErrors}
              onGoToStep={handleStepJump}
              onSubmit={handleSubmitFinal}
              onChange={handleFieldChange}
              isSubmitting={isSubmitting}
            />
          )}

          {/* Bottom Navigation Buttons */}
          <div className="wizard-bottom-actions">
            <div className="wizard-bottom-actions__left">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn-wizard-back"
                >
                  <ChevronLeft size={16} /> Back to Step {currentStep - 1}
                </button>
              )}
            </div>

            <div className="wizard-bottom-actions__right">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="btn-wizard-draft"
                title="Save application draft"
              >
                <Save size={14} /> Save Draft
              </button>

              {currentStep < 5 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-wizard-next"
                >
                  Next Step ({currentStep + 1} of 5) <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
