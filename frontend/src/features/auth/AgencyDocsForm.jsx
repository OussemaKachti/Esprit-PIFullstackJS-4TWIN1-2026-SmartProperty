import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/agencyDocsForm.css";

const DocUploadZone = ({ label, hint, accept, file, onFile, onClear, error }) => {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  };

  return (
    <div className={`ad-zone-wrap ${error ? "has-error" : ""}`}>
      <div className="ad-zone-label-row">
        <span className="ad-zone-label">{label}</span>
        <span className="ad-zone-hint">{hint}</span>
      </div>

      {file ? (
        <div className="ad-file-preview">
          <div className="ad-file-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <div className="ad-file-info">
            <div className="ad-file-name">{file.name}</div>
            <div className="ad-file-size">{(file.size / 1024).toFixed(1)} KB</div>
          </div>
          <div className="ad-file-check">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <button className="ad-file-clear" onClick={onClear} title="Remove">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      ) : (
        <div
          className={`ad-zone ${drag ? "drag-over" : ""}`}
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={handleDrop}
        >
          <div className="ad-zone-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 16 12 12 8 16"/>
              <line x1="12" y1="12" x2="12" y2="21"/>
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
            </svg>
          </div>
          <div className="ad-zone-text">Click or drag to upload</div>
          <div className="ad-zone-format">{accept}</div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        style={{ display: "none" }}
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => onFile(e.target.files[0])}
      />

      {error && <div className="ad-error-text">{error}</div>}
    </div>
  );
};

const AgencyDocsForm = () => {
  const navigate = useNavigate();

  const [contract, setContract]       = useState(null);
  const [taxDoc, setTaxDoc]           = useState(null);
  const [license, setLicense]         = useState(null);
  const [submitting, setSubmitting]   = useState(false);
  const [errors, setErrors]           = useState({});

  const validate = () => {
    const e = {};
    if (!contract) e.contract = "Agency contract is required.";
    if (!taxDoc)   e.taxDoc   = "Tax registration document is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500)); 
    setSubmitting(false);
    navigate("/");
  };

  return (
    <div className="ad-container">
      <div className="ad-image">
        <img
          src="https://images.pexels.com/photos/9060306/pexels-photo-9060306.jpeg"
          alt="agency"
        />
      </div>

      <div className="ad-form">
        <div className="ad-header">
          <div className="ad-step-indicator">AGENCY VERIFICATION</div>
          <div className="ad-step-title">Almost there</div>
        </div>

        <div className="ad-progress">
          <div className="ad-bar active" />
          <div className="ad-bar active" />
          <div className="ad-bar active" />
          <div className="ad-bar active" />
        </div>

        <div className="ad-title">Agency Documents</div>

        <p className="ad-subtitle">
          To activate your agency account, please upload the following official documents.
          They will be reviewed within 24–48 hours.
        </p>

        <DocUploadZone
          label="AGENCY CONTRACT"
          hint="Official registration document"
          file={contract}
          onFile={(f) => { setContract(f); setErrors((p) => ({ ...p, contract: "" })); }}
          onClear={() => setContract(null)}
          error={errors.contract}
        />

        <DocUploadZone
          label="TAX REGISTRATION (MF)"
          hint="Matricule Fiscale document"
          file={taxDoc}
          onFile={(f) => { setTaxDoc(f); setErrors((p) => ({ ...p, taxDoc: "" })); }}
          onClear={() => setTaxDoc(null)}
          error={errors.taxDoc}
        />

        <DocUploadZone
          label="OPERATING LICENSE"
          hint="Optional but recommended"
          file={license}
          onFile={setLicense}
          onClear={() => setLicense(null)}
          error={null}
        />

        <div className="ad-notice">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>Accepted formats: PDF, JPG, PNG · Max 10MB per file. Your documents are encrypted and only accessible to our verification team.</span>
        </div>

        <button
          className={`ad-button ${submitting ? "loading" : ""}`}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <><span className="ad-spinner" />Submitting…</>
          ) : (
            "Submit Documents"
          )}
        </button>

        <button className="ad-skip" onClick={() => navigate("/")}>
          Skip for now — complete later
        </button>
      </div>
    </div>
  );
};

export default AgencyDocsForm;