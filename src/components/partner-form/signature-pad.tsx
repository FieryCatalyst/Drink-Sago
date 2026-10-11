"use client";

import React, { useRef, useState, useEffect } from "react";
import { Pen, RotateCcw, Type, Check } from "lucide-react";

interface SignaturePadProps {
  value: string;
  onChange: (dataUrl: string) => void;
  signerName: string;
}

export default function SignaturePad({
  value,
  onChange,
  signerName,
}: SignaturePadProps) {
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [typedName, setTypedName] = useState(signerName || "");
  const [fontFamily, setFontFamily] = useState<"serif" | "cursive" | "sans">(
    "cursive"
  );
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);

  // Sync typed name if signerName prop changes and typedName is empty
  useEffect(() => {
    if (signerName && !typedName) {
      setTypedName(signerName);
    }
  }, [signerName, typedName]);

  // Set up canvas context
  useEffect(() => {
    if (mode !== "draw") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // If existing value is an image data URL, load it
    if (value && value.startsWith("data:image")) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = value;
    }
  }, [mode, value]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    isDrawing.current = true;
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const canvas = canvasRef.current;
    if (canvas) {
      onChange(canvas.toDataURL("image/png"));
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setTypedName("");
    onChange("");
  };

  const handleTypedConfirm = () => {
    if (!typedName.trim()) return;
    const canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 160;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#121212";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font =
      fontFamily === "cursive"
        ? "italic 36px 'Brush Script MT', 'Great Vibes', cursive"
        : fontFamily === "serif"
        ? "italic 32px 'Georgia', serif"
        : "30px sans-serif";

    ctx.fillStyle = "#d4af37";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);

    // Decorative baseline
    ctx.strokeStyle = "rgba(176, 141, 87, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, 120);
    ctx.lineTo(450, 120);
    ctx.stroke();

    onChange(canvas.toDataURL("image/png"));
  };

  return (
    <div className="signature-container" style={{ width: "100%" }}>
      {/* Tab toggle */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "0.75rem",
          alignItems: "center",
        }}
      >
        <button
          type="button"
          onClick={() => setMode("draw")}
          className={`btn-secondary ${mode === "draw" ? "active" : ""}`}
          style={{
            padding: "0.45rem 0.9rem",
            fontSize: "0.78rem",
            borderColor: mode === "draw" ? "#b08d57" : undefined,
            color: mode === "draw" ? "#b08d57" : undefined,
          }}
        >
          <Pen size={13} /> Draw Signature
        </button>
        <button
          type="button"
          onClick={() => setMode("type")}
          className={`btn-secondary ${mode === "type" ? "active" : ""}`}
          style={{
            padding: "0.45rem 0.9rem",
            fontSize: "0.78rem",
            borderColor: mode === "type" ? "#b08d57" : undefined,
            color: mode === "type" ? "#b08d57" : undefined,
          }}
        >
          <Type size={13} /> Type Signature
        </button>

        {value && (
          <span
            style={{
              marginLeft: "auto",
              color: "#81c784",
              fontSize: "0.75rem",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            <Check size={14} /> Signature Recorded
          </span>
        )}
      </div>

      {mode === "draw" ? (
        <div style={{ position: "relative" }}>
          <canvas
            ref={canvasRef}
            width={520}
            height={160}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{
              width: "100%",
              maxWidth: "520px",
              height: "160px",
              background: "rgba(12, 12, 12, 0.95)",
              border: "1.5px dashed rgba(176, 141, 87, 0.4)",
              borderRadius: "10px",
              cursor: "crosshair",
              touchAction: "none",
              display: "block",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "0.5rem",
              maxWidth: "520px",
            }}
          >
            <span
              style={{
                fontSize: "0.72rem",
                color: "rgba(245, 241, 232, 0.5)",
              }}
            >
              Sign using mouse, finger, or digital pen.
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="btn-secondary"
              style={{
                padding: "0.35rem 0.75rem",
                fontSize: "0.72rem",
              }}
            >
              <RotateCcw size={12} /> Clear
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            maxWidth: "520px",
            background: "rgba(12, 12, 12, 0.95)",
            border: "1.5px solid rgba(176, 141, 87, 0.3)",
            borderRadius: "10px",
            padding: "1.25rem",
          }}
        >
          <div className="form-field" style={{ marginBottom: "0.75rem" }}>
            <label className="field-label" htmlFor="type-signature-input">
              <span>Full Name for Digital Signature</span>
            </label>
            <input
              id="type-signature-input"
              type="text"
              className="form-input"
              value={typedName}
              placeholder="e.g., Jane Wanjiku Mwangi"
              onChange={(e) => setTypedName(e.target.value)}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              marginBottom: "1rem",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "0.72rem",
                color: "rgba(245, 241, 232, 0.6)",
              }}
            >
              Style:
            </span>
            {(["cursive", "serif", "sans"] as const).map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => setFontFamily(style)}
                className={`btn-secondary ${
                  fontFamily === style ? "active" : ""
                }`}
                style={{
                  padding: "0.25rem 0.6rem",
                  fontSize: "0.72rem",
                  borderColor:
                    fontFamily === style ? "#b08d57" : "rgba(255,255,255,0.1)",
                }}
              >
                {style}
              </button>
            ))}
          </div>

          {typedName && (
            <div
              style={{
                padding: "1rem",
                background: "#080808",
                borderRadius: "8px",
                border: "1px solid rgba(176, 141, 87, 0.2)",
                textAlign: "center",
                fontFamily:
                  fontFamily === "cursive"
                    ? "Brush Script MT, cursive"
                    : fontFamily === "serif"
                    ? "Georgia, serif"
                    : "sans-serif",
                fontSize: "1.6rem",
                fontStyle: "italic",
                color: "#d4af37",
                marginBottom: "0.75rem",
              }}
            >
              {typedName}
            </div>
          )}

          <button
            type="button"
            onClick={handleTypedConfirm}
            disabled={!typedName.trim()}
            className="btn-primary"
            style={{ padding: "0.5rem 1rem", fontSize: "0.78rem" }}
          >
            Apply Electronic Signature
          </button>
        </div>
      )}
    </div>
  );
}
