import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ToneSwitcher from "./components/ToneSwitcher";
import DescriptionInput from "./components/DescriptionInput";
import UploadZone from "./components/UploadZone";
import UploadPlaceholder from "./components/UploadPlaceholder";
import ImageGrid from "./components/ImageGrid";
import GenerateWithAI from "./components/GenerateWithAI";
import { changeTone } from "../../api/toneChanger";
import { generateDescriptionFromDraft } from "../../api/ai";
import "../../styles/secondStepForm.css";

const TONE_TO_API = { Modern: "modern", Luxury: "luxury", Professional: "professional" };

const SecondStepForm = ({ step1Data }) => {
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [selectedTone, setSelectedTone] = useState("Luxury");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toneLoading, setToneLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    addImages(files);
  };

  const addImages = (files) => {
    const newImages = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => {
      const updated = [...prev, ...newImages].slice(0, 20);
      if (updated.length > 0) {
        setFieldErrors((prevErrors) => ({ ...prevErrors, images: "" }));
      }
      return updated;
    });
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

  const applyToneToDescription = useCallback(
    async (text, toneLabel) => {
      const tone = TONE_TO_API[toneLabel] || "professional";
      setToneLoading(true);
      setError(null);
      try {
        const { rewrittenText } = await changeTone(text, tone);
        setDescription(rewrittenText);
      } catch (err) {
        setError(err.message || "Failed to apply tone");
      } finally {
        setToneLoading(false);
      }
    },
    []
  );

  const handleToneChange = (toneLabel) => {
    setSelectedTone(toneLabel);
    if (description.trim()) {
      applyToneToDescription(description, toneLabel);
    }
  };

  const handleGenerate = async () => {
    setError(null);
    if (step1Data) {
      setLoading(true);
      try {
        const result = await generateDescriptionFromDraft(step1Data, {
          tone: TONE_TO_API[selectedTone] || "professional",
          length: "medium",
        });
        const firstVariant = result?.variant1 ?? result?.variant2 ?? result?.variant3 ?? "";
        setDescription(firstVariant);
      } catch (err) {
        setError(err.message || "Failed to generate description");
      } finally {
        setLoading(false);
      }
    } else {
      setError("Complete step 1 first so we can generate a description from your property details.");
    }
  };

  const handleReset = () => {
    setDescription("");
    setImages([]);
    setError(null);
    setFieldErrors({});
  };

  const validate = () => {
    const errors = {};
    if (!description.trim()) {
      errors.description = "Description is required.";
    }
    if (images.length === 0) {
      errors.images = "At least one property photo is required.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
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
        <div className="ss-inner">

          <div className="ss-top-row">
            <button
              className="ss-back-btn"
              onClick={() => navigate("/form?step=1")}
              title="Go back"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="ss-indicator">STEP 2 OF 4</div>
          </div>

          <div className="ss-progress">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`ss-bar ${i <= 1 ? "active" : ""}`} />
            ))}
          </div>

          <div className="ss-heading">
            <div className="ss-title">Property Description</div>
            <ToneSwitcher selectedTone={selectedTone} onToneChange={handleToneChange} />
          </div>

          {error && (
            <div className="ss-error" role="alert">
              {error}
            </div>
          )}

          <DescriptionInput
            value={description}
            onChange={(val) => {
              setDescription(val);
              if (val.trim()) {
                setFieldErrors((prev) => ({ ...prev, description: "" }));
              }
            }}
            disabled={toneLoading}
          />

          {fieldErrors.description && (
            <div className="ss-error">{fieldErrors.description}</div>
          )}

          <div className="ss-generate-row">
            <GenerateWithAI onClick={handleGenerate} loading={loading} />
            <button
              className="ss-reset-btn"
              onClick={handleReset}
              title="Reset description"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
                <path d="M 20 4 C 15.054688 4 11 8.054688 11 13 L 11 35.5625 L 5.71875 30.28125 L 4.28125 31.71875 L 11.28125 38.71875 L 12 39.40625 L 12.71875 38.71875 L 19.71875 31.71875 L 18.28125 30.28125 L 13 35.5625 L 13 13 C 13 9.144531 16.144531 6 20 6 L 31 6 L 31 4 Z M 38 10.59375 L 37.28125 11.28125 L 30.28125 18.28125 L 31.71875 19.71875 L 37 14.4375 L 37 37 C 37 40.855469 33.855469 44 30 44 L 19 44 L 19 46 L 30 46 C 34.945313 46 39 41.945313 39 37 L 39 14.4375 L 44.28125 19.71875 L 45.71875 18.28125 L 38.71875 11.28125 Z" />
              </svg>
            </button>
          </div>

          <div className="ss-media-header">
            <div className="ss-media-title">Property Media</div>
            <div className="ss-image-count">{images.length}/20 photos</div>
          </div>

          {fieldErrors.images && (
            <div className="ss-error">{fieldErrors.images}</div>
          )}

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

          <button
            className="ss-submit-btn"
            onClick={() => {
              if (validate()) {
                navigate("/form?step=3");
              }
            }}
          >
            Continue
          </button>

        </div>
      </div>
    </div>
  );
};

export default SecondStepForm;