"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState, useCallback, useRef } from "react";
import {
  BIG_5_SYMBOLS,
  DEMO_VENUES,
  drawOutcomeFromHierarchy,
  generateCouponCode,
  Venue,
} from "@/lib/game/demo-data";

// 5 cycles of the 5 Big 5 animals = 25 total symbols in the strip
const REEL_STRIP = [
  ...BIG_5_SYMBOLS,
  ...BIG_5_SYMBOLS,
  ...BIG_5_SYMBOLS,
  ...BIG_5_SYMBOLS,
  ...BIG_5_SYMBOLS,
];
const STRIP_COUNT = REEL_STRIP.length; // 25

// Marquee Casino Bulbs
const ARCH_BULBS = Array.from({ length: 17 });
const LOWER_BULBS = Array.from({ length: 15 });

type SpinResult = {
  result_1?: string;
  result_2?: string;
  result_3?: string;
  tier?: "HIGH" | "MID+" | "MID" | "LOW+" | "LOW";
  bottle_discount?: number;
  shot_discount?: number;
  pattern_class?: string;
  coupon?: {
    code?: string;
    eligible_product?: string;
    expires_at?: string;
    qr_url?: string;
    reward?: string;
    tier?: "HIGH" | "MID+" | "MID" | "LOW+" | "LOW";
    bottle_discount?: number;
    shot_discount?: number;
    notes?: string;
  };
  is_demo?: boolean;
};

// Subtle luxury & mechanical sound effects via Web Audio API
function playSound(type: "tick" | "chime" | "lever" | "button") {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === "lever") {
      // Authentic mechanical arm pull clunk & spring thud
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);

      // Ratchet metallic click
      setTimeout(() => {
        try {
          const rat = ctx.createOscillator();
          const ratGain = ctx.createGain();
          rat.type = "triangle";
          rat.frequency.setValueAtTime(750, ctx.currentTime);
          rat.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.05);
          ratGain.gain.setValueAtTime(0.08, ctx.currentTime);
          ratGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
          rat.connect(ratGain);
          ratGain.connect(ctx.destination);
          rat.start();
          rat.stop(ctx.currentTime + 0.05);
        } catch {}
      }, 70);
    } else if (type === "button") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(540, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(240, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } else if (type === "tick") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(380, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === "chime") {
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.65);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.65);
      });
    }
  } catch {
    // Ignore audio restrictions
  }
}

export default function SagoSlotMachine() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [venues, setVenues] = useState<Venue[]>(DEMO_VENUES);
  const [venueId, setVenueId] = useState(DEMO_VENUES[0].id);
  const [selectedVenueName, setSelectedVenueName] = useState(
    `${DEMO_VENUES[0].name} · ${DEMO_VENUES[0].city}`
  );
  const [marketingConsent, setMarketingConsent] = useState(false);
  // Default to registered = true so user immediately sees and experiences the golden slot machine
  const [registered, setRegistered] = useState(true);
  const [sessionId, setSessionId] = useState("demo-session-init");
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState("");

  // Reels represent strip item indices (0..24). Initial positions display Lion, Leopard, Elephant.
  const [reels, setReels] = useState<[number, number, number]>([0, 1, 2]);
  const [displayedSymbols, setDisplayedSymbols] = useState<[string, string, string]>([
    BIG_5_SYMBOLS[0].name,
    BIG_5_SYMBOLS[1].name,
    BIG_5_SYMBOLS[2].name,
  ]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinAnimationActive, setSpinAnimationActive] = useState(false);
  const [isLeverPulled, setIsLeverPulled] = useState(false);
  const [message, setMessage] = useState("Pull the golden lever or press SPIN to reveal your spirit.");
  const [result, setResult] = useState<SpinResult | null>(null);
  const [copied, setCopied] = useState(false);
  const spinTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch real campaign venues if available; silently maintain fallback demo venues if database isn't ready
  useEffect(() => {
    fetch("/api/game/venues")
      .then(async (response) => {
        if (!response.ok) return;
        const data = (await response.json()) as { venues?: Venue[] };
        if (data.venues && data.venues.length > 0) {
          setVenues(data.venues);
          setVenueId((prev) => prev || data.venues![0].id);
          setSelectedVenueName(`${data.venues[0].name} · ${data.venues[0].city}`);
        }
      })
      .catch(() => {
        // Fallback is already present in state
      });
  }, []);

  const handleVenueChange = (id: string) => {
    setVenueId(id);
    const found = venues.find((v) => v.id === id);
    if (found) {
      setSelectedVenueName(`${found.name} · ${found.city}`);
    }
  };

  const register = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsRegistering(true);
    setRegistrationError("");

    try {
      const response = await fetch("/api/game/session", {
        body: JSON.stringify({ email, marketing_consent: marketingConsent, name, venue_id: venueId }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      const session = (await response.json()) as { error?: string; session_id?: string; venue?: Venue };
      if (session.session_id) {
        setSessionId(session.session_id);
        if (session.venue) {
          setSelectedVenueName(`${session.venue.name} · ${session.venue.city}`);
        }
      } else {
        setSessionId(`demo-session-${Date.now()}`);
      }
      setRegistered(true);
      setMessage("Venue locked. Pull the golden lever to spin!");
    } catch {
      setSessionId(`demo-session-${Date.now()}`);
      setRegistered(true);
      setMessage("Venue locked. Pull the golden lever to spin!");
    } finally {
      setIsRegistering(false);
    }
  };

  const openInstantPlay = () => {
    setSessionId(`instant-${Date.now()}`);
    setRegistered(true);
    setMessage("Golden reels primed. Pull the lever to spin!");
    playSound("button");
  };

  const spin = useCallback(async () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setMessage("The wild spirits are in motion...");
    playSound("tick");

    // Reset reels to top cycle before transitioning to give a continuous downward spin
    setSpinAnimationActive(false);
    setReels(([r0, r1, r2]) => [r0 % 5, r1 % 5, r2 % 5]);

    try {
      const response = await fetch("/api/game/spin", {
        body: JSON.stringify({ session_id: sessionId || `demo-${Date.now()}` }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      let serverResult: SpinResult;
      if (response.ok) {
        serverResult = (await response.json()) as SpinResult;
      } else {
        // Fallback drawing strictly from the SAGO reward hierarchy
        const outcome = drawOutcomeFromHierarchy();
        const code = generateCouponCode();
        serverResult = {
          result_1: outcome.combo[0],
          result_2: outcome.combo[1],
          result_3: outcome.combo[2],
          tier: outcome.tierInfo.tier,
          bottle_discount: outcome.tierInfo.bottleDiscount,
          shot_discount: outcome.tierInfo.shotDiscount,
          pattern_class: outcome.patternClass,
          coupon: {
            code,
            tier: outcome.tierInfo.tier,
            reward:
              outcome.tierInfo.tier === "HIGH"
                ? `PREMIUM JACKPOT · ${outcome.tierInfo.bottleDiscount}% OFF BOTTLE / ${outcome.tierInfo.shotDiscount}% OFF POUR`
                : `${outcome.tierInfo.rewardReveal.toUpperCase()} · ${outcome.tierInfo.bottleDiscount}% OFF BOTTLE / ${outcome.tierInfo.shotDiscount}% OFF POUR`,
            bottle_discount: outcome.tierInfo.bottleDiscount,
            shot_discount: outcome.tierInfo.shotDiscount,
            eligible_product: "SAGO Bottles & Signature Pours",
            expires_at: "Valid for 24 hours at selected venue",
            notes: outcome.tierInfo.notes,
          },
          is_demo: true,
        };
      }

      const s1 = serverResult.result_1 || "Lion";
      const s2 = serverResult.result_2 || "Leopard";
      const s3 = serverResult.result_3 || "Elephant";

      const idx1 = Math.max(0, BIG_5_SYMBOLS.findIndex((s) => s.name === s1));
      const idx2 = Math.max(0, BIG_5_SYMBOLS.findIndex((s) => s.name === s2));
      const idx3 = Math.max(0, BIG_5_SYMBOLS.findIndex((s) => s.name === s3));

      // Calculate safe stopping positions in the 25-item strip:
      // Reel 0 stops in cycle 3 (index 10..14)
      // Reel 1 stops in cycle 4 (index 15..19)
      // Reel 2 stops in cycle 5 (index 20..24)
      const stop1 = 10 + idx1;
      const stop2 = 15 + idx2;
      const stop3 = 20 + idx3;

      // Small delay to allow the reset to register before triggering smooth transition
      setTimeout(() => {
        setSpinAnimationActive(true);
        setReels([stop1, stop2, stop3]);
      }, 40);

      // Play click sounds as each reel decelerates and locks in
      setTimeout(() => playSound("tick"), 1800);
      setTimeout(() => playSound("tick"), 2200);
      setTimeout(() => playSound("chime"), 2600);

      spinTimerRef.current = setTimeout(() => {
        setIsSpinning(false);
        setDisplayedSymbols([s1, s2, s3]);
        setResult(serverResult);

        const tier = serverResult.tier ?? serverResult.coupon?.tier;
        if (tier === "HIGH") {
          setMessage(`★ PREMIUM JACKPOT! Triple ${s1}. The highest honor of the wild! ★`);
        } else if (tier === "MID+") {
          setMessage(`NEAR-JACKPOT! Strong fortune aligned with ${s1}.`);
        } else if (tier === "MID") {
          setMessage("Strong spirit combination! Enjoy your exclusive pour.");
        } else if (tier === "LOW+") {
          setMessage("Twin spirits aligned! Your SAGO night has spoken.");
        } else {
          setMessage("Wild spirit revealed. Enjoy your welcome discount.");
        }
      }, 2700);
    } catch {
      spinTimerRef.current = setTimeout(() => {
        setIsSpinning(false);
        setMessage("Your spirit is waiting. Spin again.");
      }, 2000);
    }
  }, [isSpinning, sessionId]);

  const handleLeverPull = () => {
    if (isSpinning) return;
    setIsLeverPulled(true);
    playSound("lever");
    setTimeout(() => {
      setIsLeverPulled(false);
    }, 450);
    spin();
  };

  const copyCode = () => {
    if (!result?.coupon?.code) return;
    navigator.clipboard.writeText(result.coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <section className="slot-game" id="sago-slot-game" aria-labelledby="slot-game-title">
      <div className="slot-game__topline">
        <p className="eyebrow">SAGO Wild Card</p>
        <span className="slot-game__round">
          {registered ? `Active Session · ${selectedVenueName.split("·")[0].trim()}` : "Demo Round / 001"}
        </span>
      </div>

      {!registered ? (
        <form className="slot-registration" onSubmit={register}>
          <div className="slot-registration__header-row">
            <div>
              <p className="slot-registration__kicker">Enter the night</p>
              <h2>Make it<br /><em>your night.</em></h2>
            </div>
            <button
              type="button"
              className="slot-registration__quick-btn"
              onClick={openInstantPlay}
              title="Skip form and test the golden machine immediately"
            >
              <span>✦ Instant Demo Play</span>
            </button>
          </div>

          <p className="slot-registration__copy">
            Select your venue to tie your complimentary SAGO reward to that location.
          </p>

          <label>
            Name
            <input
              required
              value={name}
              placeholder="Your name"
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
            />
          </label>

          <label>
            Email
            <input
              required
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </label>

          <label>
            Venue
            <select
              value={venueId}
              onChange={(event) => handleVenueChange(event.target.value)}
            >
              {venues.map((venueOption) => (
                <option key={venueOption.id} value={venueOption.id}>
                  {venueOption.name} · {venueOption.city} ({venueOption.country})
                </option>
              ))}
            </select>
          </label>

          <label className="slot-registration__consent">
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={(event) => setMarketingConsent(event.target.checked)}
            />
            <span>Keep me close to SAGO nights and offers</span>
          </label>

          <div className="slot-registration__actions">
            <button className="slot-machine__spin" type="submit" disabled={isRegistering}>
              <span>{isRegistering ? "Entering..." : "Lock Venue & Enter"}</span>
              <span aria-hidden="true">↗</span>
            </button>
            <button
              type="button"
              className="slot-registration__secondary-action"
              onClick={openInstantPlay}
            >
              Or Spin Without Registering (Demo Mode) →
            </button>
          </div>

          {registrationError && (
            <p className="slot-registration__error" role="alert">
              {registrationError}
            </p>
          )}

          <p className="slot-registration__legal">
            Participation is separate from marketing consent. See our <a href="/privacy">Privacy Policy</a>.
          </p>
        </form>
      ) : (
        <div className="slot-gold-assembly">
          {/* Active venue ribbon with change action */}
          <div className="slot-machine__venue-ribbon">
            <span>Locked to <strong>{selectedVenueName}</strong></span>
            <button
              type="button"
              className="slot-machine__change-venue"
              onClick={() => setRegistered(false)}
            >
              Change Venue ✎
            </button>
          </div>

          {/* Cabinet + Mechanical Lever Assembly */}
          <div className="slot-cabinet-wrap">
            {/* Main 3D Golden Machine Cabinet */}
            <div className="slot-cabinet" id="slot-cabinet">
              
              {/* Top Arched Crown with Stepped Gold Molding */}
              <div className="slot-cabinet__crown">
                <div className="slot-crown__crest-top" aria-hidden="true" />
                <div className="slot-crown__arch-frame">
                  
                  {/* Glowing Marquee Chasing Bulbs (Top Arch) */}
                  <div className={`slot-marquee__arch-bulbs${isSpinning ? " is-chasing" : ""}`} aria-hidden="true">
                    {ARCH_BULBS.map((_, i) => (
                      <span
                        key={i}
                        className="slot-bulb"
                        style={{ "--bulb-idx": i } as React.CSSProperties}
                      />
                    ))}
                  </div>

                  {/* Central JACKPOT Illuminated Marquee Sign */}
                  <div className="slot-marquee__signboard">
                    <div className="slot-marquee__sign-bezel">
                      <div className="slot-marquee__sign-core">
                        <span className="slot-marquee__jackpot-text" id="slot-game-title">JACKPOT</span>
                        <span className="slot-marquee__sub-text">✦ SAGO WILD SPIRITS ✦</span>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Lower Marquee Bulb Strip */}
                  <div className={`slot-marquee__lower-bulbs${isSpinning ? " is-chasing" : ""}`} aria-hidden="true">
                    {LOWER_BULBS.map((_, i) => (
                      <span
                        key={i}
                        className="slot-bulb"
                        style={{ "--bulb-idx": i + 17 } as React.CSSProperties}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Reel Window Chamber with Golden Bevel & Side Pillars */}
              <div className="slot-cabinet__chamber">
                {/* Left Fluted Golden Pillar */}
                <div className="slot-pillar slot-pillar--left" aria-hidden="true">
                  <div className="slot-pillar__cap" />
                  <div className="slot-pillar__shaft" />
                  <div className="slot-pillar__base" />
                </div>

                {/* 3D Cylindrical Reel Viewport */}
                <div className="slot-reel-viewport" aria-live="polite">
                  {/* Glass Glare & Cylinder Lighting Overlays */}
                  <div className="slot-reel-glass-glare" aria-hidden="true" />
                  <div className="slot-reel-spotlight" aria-hidden="true" />
                  
                  {/* Left & Right Payline Guide Arrows */}
                  <div className="slot-payline-arrow slot-payline-arrow--left" aria-hidden="true">▶</div>
                  <div className="slot-payline-arrow slot-payline-arrow--right" aria-hidden="true">◀</div>

                  {/* 3 Cylindrical Reels with Chrome Dividers */}
                  <div className="slot-reels-container">
                    {reels.map((reelStopIndex, reelIndex) => {
                      const offsetPercent = (reelStopIndex / STRIP_COUNT) * 100;
                      const transitionDuration = reelIndex === 0 ? "1.8s" : reelIndex === 1 ? "2.2s" : "2.6s";

                      return (
                        <div className="slot-cylinder-reel" key={reelIndex}>
                          <div
                            className={`slot-reel__strip${spinAnimationActive ? " is-spinning" : ""}`}
                            style={{
                              transform: `translateY(-${offsetPercent}%)`,
                              transition: spinAnimationActive
                                ? `transform ${transitionDuration} cubic-bezier(0.18, 0.85, 0.22, 1)`
                                : "none",
                            }}
                          >
                            {REEL_STRIP.map((symbol, symbolIndex) => (
                              <div
                                className="slot-cylinder-symbol"
                                key={`${reelIndex}-${symbolIndex}`}
                                title={symbol.name}
                              >
                                {/* Classic Lucky 7 Watermark Accent */}
                                <span className="slot-symbol__seven-watermark" aria-hidden="true">7</span>
                                
                                {/* Big 5 Animal Graphic */}
                                <div className="slot-symbol__art-box">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={symbol.image}
                                    alt={symbol.name}
                                    className="slot-reel__img"
                                    loading="eager"
                                    draggable={false}
                                  />
                                </div>
                                
                                <span className="slot-symbol__name-tag">{symbol.name}</span>
                              </div>
                            ))}
                          </div>
                          {/* Chrome separator rib between reels */}
                          {reelIndex < 2 && <div className="slot-reel-divider" aria-hidden="true" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Fluted Golden Pillar */}
                <div className="slot-pillar slot-pillar--right" aria-hidden="true">
                  <div className="slot-pillar__cap" />
                  <div className="slot-pillar__shaft" />
                  <div className="slot-pillar__base" />
                </div>
              </div>

              {/* Landed Spirit Animals Indicator Pills */}
              <div className="slot-cabinet__spirits-shelf">
                {displayedSymbols.map((sym, i) => (
                  <span key={i} className="slot-cabinet__spirit-pill">
                    <span className="slot-spirit-star">✦</span> {sym}
                  </span>
                ))}
              </div>

              {/* Lower Golden Dashboard & Control Deck */}
              <div className="slot-cabinet__dashboard">
                <div className="slot-dashboard__deck-bevel" />

                {/* Status Readout Row: Coin Insert, WIN LED screen, Audio/Ready */}
                <div className="slot-dashboard__readout-row">
                  {/* Left: Coin Slot */}
                  <div className="slot-coin-insert" title="Insert 25¢ Token">
                    <div className="slot-coin-bezel">
                      <div className="slot-coin-slit" />
                    </div>
                    <span className="slot-coin-label">25¢ IN</span>
                  </div>

                  {/* Center: Glowing "WIN" LED Display Panel */}
                  <div className="slot-win-display">
                    <span className="slot-win-lamp slot-win-lamp--left" aria-hidden="true">●</span>
                    <div className="slot-win-screen">
                      <span className="slot-win-text">
                        {isSpinning
                          ? "SPINNING"
                          : result?.tier === "HIGH"
                          ? "777 JACKPOT!"
                          : result
                          ? "WINNER!"
                          : "WIN"}
                      </span>
                    </div>
                    <span className="slot-win-lamp slot-win-lamp--right" aria-hidden="true">●</span>
                  </div>

                  {/* Right: Round Bevel Accent / Payout status */}
                  <div className="slot-dashboard__meter" title="Active SAGO Multiplier">
                    <span className="slot-meter-label">{isSpinning ? "READY" : "PLAY"}</span>
                  </div>
                </div>

                {/* 3 Golden Push Buttons Row */}
                <div className="slot-dashboard__buttons-row">
                  <button
                    type="button"
                    className="slot-gold-btn slot-gold-btn--sub"
                    onClick={() => {
                      playSound("button");
                      setRegistered(false);
                    }}
                    title="Change Active Venue"
                    disabled={isSpinning}
                  >
                    <span className="slot-gold-btn__face">VENUE</span>
                  </button>

                  {/* Primary Center Golden SPIN Button */}
                  <button
                    type="button"
                    className="slot-gold-btn slot-gold-btn--primary"
                    onClick={handleLeverPull}
                    disabled={isSpinning}
                    title="Spin the Golden Reels"
                  >
                    <span className="slot-gold-btn__face">
                      {isSpinning ? "..." : "SPIN"}
                    </span>
                  </button>

                  <button
                    type="button"
                    className="slot-gold-btn slot-gold-btn--sub"
                    onClick={() => {
                      setMessage("Big 5 Spirit Tiers: Lions & Leopards unlock up to 50% discount!");
                      playSound("button");
                    }}
                    title="Big 5 Paytable & Tiers"
                    disabled={isSpinning}
                  >
                    <span className="slot-gold-btn__face">TIERS</span>
                  </button>
                </div>

                {/* Message ticker */}
                <p className="slot-dashboard__ticker">{message}</p>
              </div>

              {/* Bottom Coin Return & Payout Tray */}
              <div className="slot-cabinet__tray">
                <div className="slot-tray__bezel">
                  <div className="slot-tray__chute">
                    <span className="slot-tray__crest">✦ SAGO SPIRIT RESERVE ✦</span>
                  </div>
                </div>
              </div>

              {/* Machine Stand / Base Pedestal */}
              <div className="slot-cabinet__base-feet">
                <div className="slot-foot slot-foot--left" aria-hidden="true" />
                <div className="slot-foot slot-foot--center" aria-hidden="true" />
                <div className="slot-foot slot-foot--right" aria-hidden="true" />
              </div>
            </div>

            {/* Interactive Mechanical Slot Machine Lever on Right Flank */}
            <div
              className={`slot-lever${isLeverPulled ? " is-pulled" : ""}${isSpinning ? " is-disabled" : ""}`}
              onClick={handleLeverPull}
              title="Click or pull to spin the golden reels!"
              role="button"
              tabIndex={0}
              aria-label="Pull mechanical slot machine handle"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleLeverPull();
                }
              }}
            >
              <div className="slot-lever__socket">
                <div className="slot-lever__socket-plate" />
                <div className="slot-lever__pivot">
                  <div className="slot-lever__arm">
                    <div className="slot-lever__rod" />
                    <div className="slot-lever__knob">
                      <div className="slot-lever__knob-specular" />
                    </div>
                  </div>
                </div>
              </div>
              <span className="slot-lever__tooltip" aria-hidden="true">PULL</span>
            </div>
          </div>

          <p className="slot-machine__note">
            Every spin resolves through the SAGO Big 5 Reward Hierarchy to create a unique venue-bound reward
          </p>

          {/* Winning Digital Pass & Coupon Result */}
          {result?.coupon && (
            <div className="slot-result" aria-live="polite">
              <div className="slot-result__ornament-top">✦ ✦ ✦</div>
              
              {/* Hierarchy Tier Badge */}
              <div className="slot-result__tier-badge">
                <span className="slot-result__tier-name">TIER {result.coupon.tier ?? result.tier ?? "LOW"}</span>
                <span className="slot-result__tier-dot">·</span>
                <span className="slot-result__tier-notes">
                  {result.coupon.notes ?? "SAGO Reward Hierarchy"}
                </span>
              </div>

              <p className="eyebrow">Your SAGO Invitation Pass</p>
              <h3>Your night<br /><em>has spoken.</em></h3>

              {/* Dual Discounts according to SAGO Reward Hierarchy */}
              <div className="slot-result__discount-grid">
                <div className="slot-result__discount-card">
                  <span className="slot-result__discount-title">BOTTLE DISCOUNT</span>
                  <strong className="slot-result__discount-amount">
                    {result.coupon.bottle_discount ?? result.bottle_discount ?? 5}% OFF
                  </strong>
                </div>
                <div className="slot-result__discount-card">
                  <span className="slot-result__discount-title">SHOT / POUR DISCOUNT</span>
                  <strong className="slot-result__discount-amount">
                    {result.coupon.shot_discount ?? result.shot_discount ?? 10}% OFF
                  </strong>
                </div>
              </div>

              <div className="slot-result__code-wrapper">
                <strong className="slot-result__code">
                  {result.coupon.code ?? "Code pending"}
                </strong>
                <button
                  type="button"
                  className="slot-result__copy-btn"
                  onClick={copyCode}
                  aria-label="Copy SAGO voucher code"
                >
                  {copied ? "Copied! ✓" : "Copy Code"}
                </button>
              </div>

              <div className="slot-result__details">
                <span>
                  Valid at
                  <strong>{selectedVenueName}</strong>
                </span>
                <span>
                  Terms
                  <strong>{result.coupon.expires_at ?? "Valid for 24 hours"}</strong>
                </span>
              </div>

              {result.coupon.qr_url ? (
                <div className="slot-result__qr-box">
                  <Image
                    className="slot-result__qr"
                    src={result.coupon.qr_url}
                    alt="Your unique SAGO coupon QR code"
                    width={130}
                    height={130}
                    unoptimized
                  />
                  <span className="slot-result__qr-caption">Scan at venue bar</span>
                </div>
              ) : (
                <div className="slot-result__qr-box">
                  <div className="slot-result__qr-mock" aria-hidden="true">
                    <span>✦ SCAN PASS ✦</span>
                  </div>
                  <span className="slot-result__qr-caption">Show code to bartender</span>
                </div>
              )}

              <p className="slot-result__product">
                {result.coupon.eligible_product ?? "Eligible across all SAGO pours & bottles"}
              </p>

              <button
                type="button"
                className="slot-result__play-again"
                onClick={handleLeverPull}
                disabled={isSpinning}
              >
                Spin for another spirit ↻
              </button>
            </div>
          )}
        </div>
      )}

      <div className="slot-game__footer">
        <span>Five spirits · One bold moment</span>
      </div>
    </section>
  );
}