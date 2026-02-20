import { useRef, useState } from "react";

const SIDES = {
  front: {
    label: "FRONT SIDE",
    hint: "Shows your photo & full name",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"/>
        <circle cx="8" cy="11" r="2"/>
        <line x1="13" y1="9" x2="19" y2="9"/>
        <line x1="13" y1="12" x2="19" y2="12"/>
        <line x1="13" y1="15" x2="17" y2="15"/>
      </svg>
    ),
  },
  back: {
    label: "BACK SIDE",
    hint: "Shows address & CIN number",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"/>
        <line x1="6" y1="10" x2="18" y2="10"/>
        <line x1="6" y1="13" x2="18" y2="13"/>
        <line x1="6" y1="16" x2="12" y2="16"/>
      </svg>
    ),
  },
};

const ScanZone = ({ side, preview, error, onFile, onClear }) => {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const { label, hint, icon } = SIDES[side];

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) onFile(file);
  };

  return (
    <div className={`sz-wrap ${error ? "has-error" : ""}`}>
      <div className="sz-label-row">
        <span className="sz-label">{label}</span>
        <span className="sz-hint">{hint}</span>
      </div>

      {preview ? (
        <div className="sz-preview">
          <img src={preview} alt={`CIN ${side}`} />
          <button className="sz-clear" onClick={onClear} title="Remove">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <div className="sz-ready-badge">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Ready
          </div>
        </div>
      ) : (
        <div
          className={`sz-zone ${drag ? "drag-over" : ""}`}
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={handleDrop}
        >
          <div className="sz-icon">{icon}</div>
          <div className="sz-upload-text">Click or drag to upload</div>
          <div className="sz-format">JPG, PNG, WEBP · Max 10MB</div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={(e) => onFile(e.target.files[0])}
      />

      {error && <div className="sz-error">{error}</div>}
    </div>
  );
};

export default ScanZone;