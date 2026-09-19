"use client";

import { useEffect, useState } from "react";
import { X, Mail, Check } from "lucide-react";
import Image from "next/image";

interface ClubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ClubModal({ isOpen, onClose }: ClubModalProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="club-modal-overlay"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="club-modal-title"
    >
      <div className="club-modal" onClick={(e) => e.stopPropagation()}>
        <button className="club-modal__close" onClick={onClose} aria-label="Close modal">
          <X size={24} />
        </button>

        <div className="club-modal__content">
          <div className="club-modal__image">
            <Image
              src="/assets/Join the sago club.png"
              alt="Join the SAGO Club"
              fill
              sizes="100%"
              className="club-modal__image-img"
            />
          </div>

          <div className="club-modal__form">
            <h2 id="club-modal-title" className="club-modal__title">Join the SAGO Club</h2>
            <p className="club-modal__description">
              Get exclusive access to new releases, cocktail recipes, event invites, and more.
            </p>

            {status === "success" ? (
              <div className="club-modal__success">
                <Check size={24} className="club-modal__success-icon" />
                <p>You&apos;re in! Welcome to the SAGO Club.</p>
                <p className="club-modal__success-note">We&apos;ll keep you posted on what&apos;s coming next.</p>
                <button className="club-modal__done" onClick={onClose}>Done</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="club-modal__form-inner">
                <label htmlFor="club-email" className="club-modal__label">
                  <Mail size={18} className="club-modal__icon" aria-hidden="true" />
                  <input
                    id="club-email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    disabled={status === "submitting"}
                    className="club-modal__input"
                    aria-describedby={status === "error" ? "club-error" : undefined}
                  />
                </label>

                {status === "error" && (
                  <p id="club-error" className="club-modal__error">Something went wrong. Please try again.</p>
                )}

                <button
                  type="submit"
                  className="club-modal__submit"
                  disabled={status === "submitting" || !email}
                >
                  {status === "submitting" ? "Joining..." : "Join the Club"}
                </button>

                <p className="club-modal__consent">
                  By joining, you agree to receive Sago emails and understand you can unsubscribe at any time.
                  <a href="/privacy">Privacy Policy</a>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}