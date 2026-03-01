import { useRef, useState } from "react";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"];

const PanoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="12" rx="10" ry="5" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2C10 6 10 18 12 22" />
    <path d="M12 2C14 6 14 18 12 22" />
  </svg>
);

const FileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const formatBytes = (b) =>
  b < 1024 ? `${b} B`
  : b < 1048576 ? `${(b / 1024).toFixed(1)} KB`
  : `${(b / 1048576).toFixed(1)} MB`;

const TourUpload = ({ tourFiles, setTourFiles }) => {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const addFiles = (files) => {
    const valid = files.filter((f) => ACCEPTED.includes(f.type));
    setTourFiles((prev) => [...prev, ...valid].slice(0, 10));
  };

  const remove = (i) => setTourFiles((prev) => prev.filter((_, j) => j !== i));

  return (
    <>
      <div className="ts-section-title">360° Virtual Tour</div>

      <div
        className={`ts-tour-zone ${dragOver ? "drag-over" : ""}`}
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(Array.from(e.dataTransfer.files));
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED.join(",")}
          style={{ display: "none" }}
          onChange={(e) => addFiles(Array.from(e.target.files))}
        />
        <div className="ts-tour-icon"><PanoIcon /></div>
        <div className="ts-tour-upload-text">
          {tourFiles.length > 0
            ? `Add more files (${tourFiles.length}/10)`
            : "Upload 360° photos or videos"}
        </div>
        <div className="ts-tour-sub">Drag & drop or click · JPG, PNG, WEBP, MP4, WEBM</div>
        <div className="ts-tour-badge">Coming soon · Optional</div>
      </div>

      {tourFiles.length > 0 && (
        <div className="ts-tour-list">
          {tourFiles.map((file, i) => (
            <div className="ts-tour-item" key={i}>
              <div className="ts-tour-file-icon"><FileIcon /></div>
              <div className="ts-tour-file-name">{file.name}</div>
              <div className="ts-tour-file-size">{formatBytes(file.size)}</div>
              <button className="ts-tour-remove" onClick={() => remove(i)}><XIcon /></button>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default TourUpload;