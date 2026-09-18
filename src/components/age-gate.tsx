"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

const AGE_GATE_KEY = "sago-age-verified";

export default function AgeGate({ children }: { children: React.ReactNode }) {
  const [verified, setVerified] = useState<boolean | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setVerified(window.localStorage.getItem(AGE_GATE_KEY) === "true");
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const enterSite = () => {
    window.localStorage.setItem(AGE_GATE_KEY, "true");
    setVerified(true);
  };

  if (verified === null) {
    return <div className="age-gate-loading" aria-hidden="true" />;
  }

  if (verified) return <>{children}</>;

  return (
    <div className="age-gate" role="dialog" aria-modal="true" aria-labelledby="age-gate-title">
      <div className="age-gate__backdrop" />
      <div className="age-gate__panel">
        <div className="age-gate__mark"><span className="age-gate__mark-line" /><span>S</span><span className="age-gate__mark-dot">°</span><span className="age-gate__mark-line" /></div>
        <p className="eyebrow">Sago Gold Reserve Whisky</p>
        <h1 id="age-gate-title" className="display">Good things<br /><em>take time.</em></h1>
        <p className="age-gate__copy">You must be 21 or older to enter this website. Please enjoy Sago responsibly.</p>
        {denied ? <div className="age-gate__denied" role="alert">Sago is reserved for guests aged 21 and over.</div> : <div className="age-gate__actions"><button className="age-gate__enter" onClick={enterSite}>I am 21 or older <ArrowRight size={16} /></button><button className="age-gate__exit" onClick={() => setDenied(true)}>I am under 21</button></div>}
        <p className="age-gate__fine-print">By entering, you confirm that you meet the legal drinking age where you live.</p>
      </div>
    </div>
  );
}
