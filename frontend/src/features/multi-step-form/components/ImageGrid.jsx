const ImageGrid = ({ images, smallCubeClass, onRemoveImage, onAddMore }) => {
  return (
    <div className="ss-image-grid">
      {images[0] && (
        <div className="ss-grid-main">
          <img src={images[0]} alt="featured" />
          <button
            className="ss-remove-btn"
            onClick={(e) => { e.stopPropagation(); onRemoveImage(0); }}
          >
            ×
          </button>
          <span className="ss-featured-badge">Featured</span>
        </div>
      )}

      {images.slice(1, 3).map((src, i) => (
        <div key={i + 1} className="ss-grid-secondary">
          <img src={src} alt={`upload-${i + 1}`} />
          <button
            className="ss-remove-btn"
            onClick={(e) => { e.stopPropagation(); onRemoveImage(i + 1); }}
          >
            ×
          </button>
        </div>
      ))}

      <div className={`ss-small-cubes ${smallCubeClass}`}>
        {images.slice(3).map((src, i) => (
          <div key={i + 3} className="ss-small-cube">
            <img src={src} alt={`upload-${i + 3}`} />
            <button
              className="ss-remove-btn"
              onClick={(e) => { e.stopPropagation(); onRemoveImage(i + 3); }}
            >
              ×
            </button>
          </div>
        ))}
        {images.length < 20 && (
          <div
            className="ss-add-more"
            onClick={(e) => { e.stopPropagation(); onAddMore(); }}
          >
            +
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGrid;