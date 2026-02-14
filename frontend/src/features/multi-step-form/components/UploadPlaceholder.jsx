const UploadPlaceholder = () => {
  return (
    <div className="ss-placeholder">
      <div className="ss-cloud-icon">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M12 21V11M12 11L9 14M12 11L15 14M7 16.8184C4.69636 16.2074 3 14.1246 3 11.6493C3 9.20008 4.8 6.9375 7.5 6.5C8.34694 4.48637 10.3514 3 12.6893 3C15.684 3 18.1317 5.32251 18.3 8.25C19.8893 8.94488 21 10.6503 21 12.4969C21 14.8148 19.25 16.7236 17 16.9725"
            stroke="#bdbdbd"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="ss-upload-text">Upload high-res images</div>
      <div className="ss-drag-text">Drag & drop or click to browse</div>
    </div>
  );
};

export default UploadPlaceholder;