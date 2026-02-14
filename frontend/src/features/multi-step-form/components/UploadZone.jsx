const UploadZone = ({ images, fileInputRef, onDragOver, onDrop, onUploadClick, onFileChange, children }) => {
  return (
    <div
      className={`ss-upload-zone ${images.length > 0 ? "has-images" : ""}`}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onUploadClick}
    >
      <input
        type="file"
        multiple
        hidden
        ref={fileInputRef}
        accept="image/*"
        onChange={onFileChange}
      />
      {children}
    </div>
  );
};

export default UploadZone;