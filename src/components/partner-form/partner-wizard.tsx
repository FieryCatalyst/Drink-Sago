"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
  const [savedReference, setSavedReference] = useState<string | null>(null);
  const [cameFromReview, setCameFromReview] = useState(false);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [incompleteModalData, setIncompleteModalData] = useState<{
    step: number;
    errors: Record<string, string>;
    targetStep: number;
  } | null>(null);
  const [isModalSaving, setIsModalSaving] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

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
            setFormData(data.formData);
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

  const getStepValidation = (stepNum: number) => {
    switch (stepNum) {
      case 1:
        return validateStep1(formData);
      case 2:
        return validateStep2(formData);
      case 3:
        return validateStep3(formData.documents);
      case 4:
        return validateStep4(formData);
      case 5:
        return validateStep5(formData);
      case 6:
        return validateStep6(formData);
      case 7:
        return validateStep7(formData);
      case 8:
        return validateStep8(formData);
      case 9:
        return validateStep9(formData);
      default:
        return { isValid: true, errors: {} as Record<string, string> };
    }
  };

  const validateCurrentStep = (): boolean => {
    const result = getStepValidation(currentStep);
    setStepErrors(result.errors);
    return result.isValid;
  };

  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleNext = () => {
    const valResult = getStepValidation(currentStep);
    if (!valResult.isValid) {
      setStepErrors(valResult.errors);
      setIncompleteModalData({
        step: currentStep,
        errors: valResult.errors,
        targetStep: currentStep + 1,
      });
      setShowIncompleteModal(true);
      return;
    }

    const next = currentStep + 1;
    setCurrentStep(next);
    setMaxStepVisited((prev) => Math.max(prev, next));
    setStepErrors({});
    scrollToTop();
  };

  const handleModalSaveAndProceed = async () => {
    setIsModalSaving(true);
    try {
      const saved = await handleSaveDraft();
      if (saved && incompleteModalData) {
        const next = incompleteModalData.targetStep;
        setCurrentStep(next);
        setMaxStepVisited((prev) => Math.max(prev, next));
        setStepErrors({});
        setShowIncompleteModal(false);
        setIncompleteModalData(null);
        scrollToTop();
        showToast("Draft saved. Remember to complete all required fields before final submission.");
      }
    } finally {
      setIsModalSaving(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setStepErrors({});
      scrollToTop();
    }
  };

  const handleStepJump = (step: number) => {
    if (currentStep === 10 && step < 10) {
      setCameFromReview(true);
    } else if (step === 10) {
      setCameFromReview(false);
    }

    setCurrentStep(step);
    setMaxStepVisited((prev) => Math.max(prev, step));
    setStepErrors({});
    scrollToTop();
  };

  const handleSaveAndReturnToReview = async () => {
    setIsModalSaving(true);
    try {
      const saved = await handleSaveDraft();
      if (saved) {
        setCurrentStep(10);
        setCameFromReview(false);
        setStepErrors({});
        scrollToTop();
        showToast("Saved updates! Returned to Step 10 Review.");
      }
    } finally {
      setIsModalSaving(false);
    }
  };

  const handleSaveDraft = async (): Promise<boolean> => {
    try {
      // Persist to server draft registry
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
          // Store the record ID for ownership token
          if (d.recordId) {
            localStorage.setItem("sago_partner_draft_id", d.recordId);
          }
        }
        showToast(`Draft saved successfully (Ref: ${d.reference})`);
        return true;
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || "Failed to save draft to server.");
        return false;
      }
    } catch {
      showToast("Failed to save draft to server.");
      return false;
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
      // Include ownership token from sago_partner_draft_id for final submission
      const ownershipToken = localStorage.getItem("sago_partner_draft_id");
      const res = await fetch("/api/partners/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: formData, isDraft: false, existingReference: savedReference, ownershipToken }),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error || "Submission could not be completed.");
      }

      // Clear draft and ownership token on successful submission
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

        {/* Form Panel */}
        <div className="partner-form-card">
          {cameFromReview && currentStep < 10 && (
            <div className="review-return-banner">
              <div className="review-return-banner__info">
                <span className="review-return-banner__tag">Review Mode</span>
                <span>
                  Editing <strong>Step {currentStep}: {STEP_DEFINITIONS[currentStep - 1]?.label}</strong> from Review section.
                </span>
              </div>
              <button
                type="button"
                onClick={handleSaveAndReturnToReview}
                className="btn-return-to-review"
              >
                <Save size={14} /> Save & Return to Review (Step 10) ➔
              </button>
            </div>
          )}
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
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
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

              {cameFromReview && currentStep < 10 && (
                <button
                  type="button"
                  onClick={handleSaveAndReturnToReview}
                  className="btn-return-to-review"
                  disabled={isSubmitting}
                >
                  <Save size={14} /> Save & Return to Review (Step 10)
                </button>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
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

      {/* Incomplete Required Fields Warning Modal */}
      {showIncompleteModal && incompleteModalData && (
        <div
          className="incomplete-modal-backdrop"
          onClick={() => setShowIncompleteModal(false)}
        >
          <div
            className="incomplete-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="incomplete-modal-title"
          >
            <div className="incomplete-modal__header">
              <div className="incomplete-modal__icon">
                <AlertCircle size={22} color="#ef5350" />
              </div>
              <div>
                <h3 className="incomplete-modal__title" id="incomplete-modal-title">
                  Incomplete Required Fields
                </h3>
                <p className="incomplete-modal__sub">
                  Step {incompleteModalData.step}: {STEP_DEFINITIONS[incompleteModalData.step - 1]?.label}
                </p>
              </div>
            </div>

            <div className="incomplete-modal__caution-box">
              <p>
                Required fields on this page are incomplete, save before proceeding.
              </p>
              <span className="caution-strong">
                Caution: Form will not be submitted unless all required fields are filled.
              </span>
            </div>

            <div className="incomplete-modal__missing-section">
              <span className="incomplete-modal__missing-label">
                Required items remaining on this page ({Object.keys(incompleteModalData.errors).length}):
              </span>
              <ul className="incomplete-modal__missing-list">
                {Object.entries(incompleteModalData.errors).slice(0, 6).map(([key, msg]) => (
                  <li key={key}>
                    <span className="dot">•</span>
                    <span>{msg}</span>
                  </li>
                ))}
                {Object.keys(incompleteModalData.errors).length > 6 && (
                  <li style={{ color: "rgba(245, 241, 232, 0.5)", fontStyle: "italic" }}>
                    + {Object.keys(incompleteModalData.errors).length - 6} more required field(s)
                  </li>
                )}
              </ul>
            </div>

            <div className="incomplete-modal__actions">
              <button
                type="button"
                onClick={() => {
                  setShowIncompleteModal(false);
                  setStepErrors(incompleteModalData.errors);
                }}
                className="btn-secondary"
                disabled={isModalSaving}
              >
                Stay on this Page
              </button>

              <button
                type="button"
                onClick={handleModalSaveAndProceed}
                className="btn-primary"
                disabled={isModalSaving}
              >
                <Save size={15} /> Save Draft & Proceed <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
