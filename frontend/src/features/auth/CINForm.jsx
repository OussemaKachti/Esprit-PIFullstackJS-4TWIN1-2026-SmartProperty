import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ScanZone from "./ScanZone";
import CINPreview from "./CINPreview";
import "../../styles/fourthStepForm.css";

const CINForm = () => {
  const navigate = useNavigate();

  const [frontFile, setFrontFile]       = useState(null);
  const [backFile, setBackFile]         = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview]   = useState(null);
  const [errors, setErrors]             = useState({});
  const [submitting, setSubmitting]     = useState(false);

  const handleFile = (side, file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (side === "front") {
      setFrontFile(file); setFrontPreview(url);
      setErrors((p) => ({ ...p, front: "" }));
    } else {
      setBackFile(file); setBackPreview(url);
      setErrors((p) => ({ ...p, back: "" }));
    }
  };

  const validate = () => {
    const e = {};
    if (!frontFile) e.front = "Front side of CIN is required.";
    if (!backFile)  e.back  = "Back side of CIN is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500)); // TODO: upload to API
    setSubmitting(false);
    navigate("/");
  };

  return (
    <div className="fs-container">
      <div className="fs-image">
        <img
          src="https://images.pexels.com/photos/9060306/pexels-photo-9060306.jpeg"
          alt="property"
        />
      </div>

      <div className="fs-form">
        <div className="fs-header">
          <div className="fs-step-indicator">AGENT VERIFICATION</div>
          <div className="fs-step-title">Identity Check</div>
        </div>

        <div className="fs-progress">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="fs-bar active" />
          ))}
        </div>

        <div className="fs-title">Scan your CIN</div>

        <p className="fs-subtitle">
          Upload both sides of your Tunisian National Identity Card (CIN).
          Your information is encrypted and used only for verification.
        </p>

        <div className="fs-cin-row">
          <ScanZone
            side="front"
            preview={frontPreview}
            error={errors.front}
            onFile={(f) => handleFile("front", f)}
            onClear={() => { setFrontFile(null); setFrontPreview(null); }}
          />
          <ScanZone
            side="back"
            preview={backPreview}
            error={errors.back}
            onFile={(f) => handleFile("back", f)}
            onClear={() => { setBackFile(null); setBackPreview(null); }}
          />
        </div>

        {(frontPreview || backPreview) && (
          <CINPreview
            frontPreview={frontPreview}
            backPreview={backPreview}
            frontFile={frontFile}
            backFile={backFile}
          />
        )}

        <div className="fs-notice">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>Make sure the card is well-lit, flat, and all four corners are visible.</span>
        </div>

        <button
          className={`fs-button ${submitting ? "loading" : ""}`}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <><span className="fs-spinner" />Verifying…</>
          ) : (
            "Submit & Finish"
          )}
        </button>

        <button
          style={{ maxWidth: "var(--container-width)", width: "100%", margin: "0 auto 20px auto", display: "flex", justifyContent: "center", background: "none", border: "none", fontSize: "13px", color: "var(--color-gray-600)", cursor: "pointer", textDecoration: "underline" }}
          onClick={() => navigate("/")}
        >
          Skip for now — complete later
        </button>
      </div>
    </div>
  );
};

export default CINForm;