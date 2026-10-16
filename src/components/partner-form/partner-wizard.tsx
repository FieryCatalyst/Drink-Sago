"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Building2,
  MapPin,
  Clock,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2,
} from "lucide-react";

import "./partner-form.css";
import { PartnerFormData } from "@/lib/partner-types";
import {
  validateSectionA,
  validateSectionB,
  validateSectionC,
  validateSectionD,
  validateFullApplication,
} from "@/lib/partner-validation";

import Step1BusinessInfo from "./step-1-business-info";
import Step2BusinessAddress from "./step-2-business-address";
import Step3BusinessOperations from "./step-3-business-operations";
import Step4BusinessDocuments from "./step-4-business-documents";
import SubmissionSuccess from "./submission-success";

const STEP_DEFINITIONS = [
  { number: 1, label: "A. Basic Details", icon: Building2 },
  { number: 2, label: "B. Business Address", icon: MapPin },
  { number: 3, label: "C. Operations", icon: Clock },
  { number: 4, label: "D. Documents & Submit", icon: FileCheck },
];

const INITIAL_FORM_DATA: PartnerFormData = {
  // Section A: Basic Business Details (Q1 - Q12)
  registeredBusinessName: "",
  businessRegistrationNumber: "",
  businessWebsite: "",
  businessPhone: "",
  managerFullName: "",
  managerPhone: "",
  businessType: "Bar / Pub",
  businessTypeOther: "",
  tradingName: "",
  dateOfEstablishment: "",
  businessEmail: "",
  numberOfOutlets: 1,
  monthlySalesVolume: "",

  // Section B: Business Address (Q13 - Q18)
  country: "",
  county: "",
  townCity: "",
  estateArea: "",
  streetBuilding: "",
  postalAddress: "",

  // Section C: Business Operations (Q19 - Q23)
  openingHours: "12:00 PM - 02:00 AM",
  operatingDays: ["Thursday", "Friday", "Saturday", "Sunday"],
  outletCategory: "Restaurant with Bar",
  sellsAlcohol: true,
  hasBarManager: true,

  // Section D: Business Documents (Q24 - Q25)
  documents: [],

  // Legacy compatibility fields to ensure clean database storage
  ownerFullName: "",
  ownerPosition: "Business Manager",
  ownerNationality: "",
  ownerEmail: "",
  ownerPhone: "",
  ownerAltPhone: "",
  authContactName: "",
  authContactTitle: "Business Manager",
  authContactEmail: "",
  authContactPhone: "",
  authContactCanSign: true,
  ownershipStructure: "Private Company",
  directors: [],
  authAgreementPerson: "",
  partnershipType: "Official Promotional Partner",
  partnershipTypeOther: "",
  preferredStartDate: "",
  agreementDuration: "12 Months (Annual Partner)",
  outletsJoiningCount: 1,
  products: [],
  campaignDiscountType: "Percentage",
  proposedDiscountRates: "15% - 20%",
  minimumPurchaseReq: "1 Drink or Bottle",
  maxDiscountPerTx: "",
  eligibleProductsTerms: "All SAGO products",
  discountDaysHours: "Regular Hours",
  campaignStartDate: "",
  campaignEndDate: "",
  redemptionLimit: 25,
  combinableWithOffers: false,
  campaignExclusions: "",
  outletDisplayName: "",
  redemptionMethod: "Digital Portal",
  staffAccessCount: 2,
  designatedOutletManager: "",
  staffTrainingStatus: "Pending",
  hasSmartphoneTablet: true,
  hasReliableInternet: true,
  hasComputerDevice: true,
  preferredRedemptionDevice: "Smartphone",
  requiresOnboardingAssistance: true,
  acknowledgedRedemptionRules: [true],
  requiresSettlement: false,
  settlementArrangement: "Direct Payment",
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
  declarations: [true, true, true],
  privacyNoticeAcknowledged: true,
  marketingCommsConsent: true,
  signatoryFullName: "",
  signatoryDesignation: "Business Manager",
  signatoryBusinessName: "",
  signatureData: "Authorized Registration",
  signatureDate: new Date().toISOString().split("T")[0],
  gpsCoordinates: "",
  googleMapsLink: "",
  dailyCustomerFootfall: "",
  additionalOutlets: [],
};

export default function PartnerWizard() {
  const [currentStep, setCurrentStep] = useState(1);
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
        const res = await fetch(
          `/api/partners/register?reference=${reference}&ownershipToken=${ownershipToken}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.formData) {
            setFormData((prev) => ({
              ...prev,
              ...data.formData,
            }));
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

  const handleFieldChange = <K extends keyof PartnerFormData>(
    field: K,
    value: PartnerFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for that field if it exists
    if (stepErrors[field as string]) {
      setStepErrors((prev) => {
        const copy = { ...prev };
        delete copy[field as string];
        return copy;
      });
    }
  };

  const scrollToTop = () => {
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleNext = () => {
    setStepErrors({});
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
      scrollToTop();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setStepErrors({});
      scrollToTop();
    }
  };

  const handleStepJump = (targetStep: number) => {
    setStepErrors({});
    setCurrentStep(targetStep);
    scrollToTop();
  };

  const handleSaveDraft = async (): Promise<boolean> => {
    try {
      const ownershipToken = savedReference ? localStorage.getItem("sago_partner_draft_id") : undefined;
      const res = await fetch("/api/partners/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: formData,
          isDraft: true,
          existingReference: savedReference,
          ownershipToken,
        }),
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
    const fullValidation = validateFullApplication(formData);
    if (!fullValidation.isValid) {
      const firstErrorStep = Object.keys(fullValidation.stepErrors).map(Number)[0] || 1;
      const errorsForStep = fullValidation.stepErrors[firstErrorStep] || {};
      const firstErrorMessage = Object.values(errorsForStep)[0] || "Please complete required questions.";

      setStepErrors(errorsForStep);
      setCurrentStep(firstErrorStep);
      showToast(`Missing required info in Section ${STEP_DEFINITIONS[firstErrorStep - 1]?.label}: ${firstErrorMessage}`);
      scrollToTop();
      return;
    }

    setIsSubmitting(true);

    try {
      const ownershipToken = localStorage.getItem("sago_partner_draft_id");
      const submitData = {
        ...formData,
        ownerFullName: formData.managerFullName || formData.ownerFullName,
        ownerPhone: formData.managerPhone || formData.ownerPhone,
        outletDisplayName: formData.tradingName || formData.registeredBusinessName,
        signatoryFullName: formData.managerFullName || formData.ownerFullName,
        signatoryBusinessName: formData.registeredBusinessName,
      };

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
        submittedAt: resData.submittedAt || new Date().toISOString(),
      });
      scrollToTop();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission error occurred.";
      showToast(msg);
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
      <div
        className="partner-wizard-page"
        ref={containerRef}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}
      >
        <div style={{ textAlign: "center", color: "rgba(245, 241, 232, 0.6)" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid rgba(176, 141, 87, 0.3)",
              borderTopColor: "#b08d57",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem",
            }}
          />
          <p style={{ fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Loading Partner Form…
          </p>
        </div>
      </div>
    );
  }

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
          <h1 className="partner-hero__title">
            1. Business <em>Information.</em>
          </h1>
          <p className="partner-hero__subtitle">
            Partner with SAGO Whisky. Complete the required questions below to register your venue for official distribution and promotional partnership.
          </p>
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
            <Step2BusinessAddress
              data={formData}
              errors={stepErrors}
              onChange={handleFieldChange}
            />
          )}

          {currentStep === 3 && (
            <Step3BusinessOperations
              data={formData}
              errors={stepErrors}
              onChange={handleFieldChange}
            />
          )}

          {currentStep === 4 && (
            <Step4BusinessDocuments
              data={formData}
              errors={stepErrors}
              onChange={handleFieldChange}
              onSubmit={handleSubmitFinal}
              isSubmitting={isSubmitting}
            />
          )}

          {/* Bottom Actions Bar */}
          <div className="form-actions-bar">
            <div className="form-actions-bar__left">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn-secondary"
                >
                  <ChevronLeft size={16} />
                  <span>Previous Section</span>
                </button>
              )}
            </div>

            <div className="form-actions-bar__right">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="btn-ghost"
                title="Save current progress"
              >
                <Save size={15} />
                <span>Save Draft</span>
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-primary"
                >
                  <span>Continue to Next Section</span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitFinal}
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Partner Application</span>
                      <Sparkles size={16} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
