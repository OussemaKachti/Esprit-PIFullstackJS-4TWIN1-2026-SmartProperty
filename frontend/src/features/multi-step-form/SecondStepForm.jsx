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
    // e.g. const result = await generateDescription({ tone: selectedTone });
    // setDescription(result);
    setLoading(false);
  };

  const smallCubeClass =
    images.length > 12 ? "many" : images.length > 8 ? "medium" : "few";

  return (
    <div className="ss-container">
      <div className="ss-image">
        <img
          src="https://images.pexels.com/photos/2119714/pexels-photo-2119714.jpeg"
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

        <GenerateWithAI onClick={handleGenerate} loading={loading} />

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