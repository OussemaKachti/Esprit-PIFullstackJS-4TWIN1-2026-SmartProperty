import { useState, useRef } from "react";
import ToneSwitcher from "./components/ToneSwitcher";
import DescriptionInput from "./components/DescriptionInput";
import UploadZone from "./components/UploadZone";
import UploadPlaceholder from "./components/UploadPlaceholder";
import ImageGrid from "./components/ImageGrid";
import GenerateWithAI from "./components/GenerateWithAI";
import '../../styles/secondStepForm.css';

const SecondStepForm = () => {
  const [description, setDescription] = useState("");
  const [selectedTone, setSelectedTone] = useState("Luxury");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    addImages(files);
  };

  const addImages = (files) => {
    const newImages = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...newImages].slice(0, 20));
  };

  const onDragOver = (e) => e.preventDefault();

  const onDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    addImages(files);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    setLoading(true);
    // TODO: call your AI API here
    setLoading(false);
  };

  const handleReset = () => {
    setDescription("");
  };

  const smallCubeClass =
    images.length > 12 ? "many" : images.length > 8 ? "medium" : "few";

  return (
    <div className="ss-container">
      <div className="ss-image">
        <img
          src="https://images.pexels.com/photos/9060306/pexels-photo-9060306.jpeg"
          alt="property"
        />
      </div>

      <div className="ss-form">
        <div className="ss-indicator">STEP 2 OF 4</div>

        <div className="ss-progress">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`ss-bar ${i === 1 ? "active" : ""}`} />
          ))}
        </div>

        <div className="ss-heading">
          <div className="ss-title">Property Description</div>
          <ToneSwitcher selectedTone={selectedTone} onToneChange={setSelectedTone} />
        </div>

        <DescriptionInput value={description} onChange={setDescription} />

        <div className="ss-generate-row">
          <GenerateWithAI onClick={handleGenerate} loading={loading} />
          <button
            className="ss-reset-btn"
            onClick={handleReset}
            title="Reset description"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 50 50">
              <path d="M 20 4 C 15.054688 4 11 8.054688 11 13 L 11 35.5625 L 5.71875 30.28125 L 4.28125 31.71875 L 11.28125 38.71875 L 12 39.40625 L 12.71875 38.71875 L 19.71875 31.71875 L 18.28125 30.28125 L 13 35.5625 L 13 13 C 13 9.144531 16.144531 6 20 6 L 31 6 L 31 4 Z M 38 10.59375 L 37.28125 11.28125 L 30.28125 18.28125 L 31.71875 19.71875 L 37 14.4375 L 37 37 C 37 40.855469 33.855469 44 30 44 L 19 44 L 19 46 L 30 46 C 34.945313 46 39 41.945313 39 37 L 39 14.4375 L 44.28125 19.71875 L 45.71875 18.28125 L 38.71875 11.28125 Z"></path>
            </svg>
          </button>
        </div>

        <div className="ss-media-header">
          <div className="ss-media-title">Property Media</div>
          <div className="ss-image-count">{images.length}/20 photos</div>
        </div>

        <UploadZone
          images={images}
          fileInputRef={fileInputRef}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onUploadClick={() => fileInputRef.current.click()}
          onFileChange={handleFileChange}
        >
          {images.length === 0 ? (
            <UploadPlaceholder />
          ) : (
            <ImageGrid
              images={images}
              smallCubeClass={smallCubeClass}
              onRemoveImage={removeImage}
              onAddMore={() => fileInputRef.current.click()}
            />
          )}
        </UploadZone>

        <button className="ss-submit-btn">Continue</button>
      </div>
    </div>
  );
};

export default SecondStepForm;