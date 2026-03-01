const formatBytes = (b) =>
  b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

const CINPreview = ({ frontPreview, backPreview, frontFile, backFile }) => (
  <div className="cp-wrap">
    <div className="cp-title">Uploaded documents</div>
    <div className="cp-list">
      {frontPreview && frontFile && (
        <div className="cp-item">
          <img src={frontPreview} alt="Front CIN" className="cp-thumb" />
          <div className="cp-info">
            <div className="cp-name">{frontFile.name}</div>
            <div className="cp-meta">Front side · {formatBytes(frontFile.size)}</div>
          </div>
          <div className="cp-check">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        </div>
      )}
      {backPreview && backFile && (
        <div className="cp-item">
          <img src={backPreview} alt="Back CIN" className="cp-thumb" />
          <div className="cp-info">
            <div className="cp-name">{backFile.name}</div>
            <div className="cp-meta">Back side · {formatBytes(backFile.size)}</div>
          </div>
          <div className="cp-check">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        </div>
      )}
    </div>
  </div>
);

export default CINPreview;