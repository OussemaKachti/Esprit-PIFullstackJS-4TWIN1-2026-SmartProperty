import { useState } from "react";
import '../../styles/firstStepForm.css';

const CreateProperty = () => {
  const [propertyType, setPropertyType] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [totalArea, setTotalArea] = useState("");
  const [rooms, setRooms] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!propertyType) newErrors.propertyType = "Property type is required.";
    if (!propertyAddress) newErrors.propertyAddress = "Property address is required.";
    if (!totalArea) newErrors.totalArea = "Total area is required.";
    if (!rooms) newErrors.rooms = "Number of rooms is required.";
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      alert("Form valid! Continue to next step.");
    }
  };

  return (
    <div className="property-main-container">
      <div className="image-container">
        <img
          src="https://images.pexels.com/photos/2119714/pexels-photo-2119714.jpeg"
          alt="bg-login"
        />
      </div>

      <div className="property-form-container">

        <div className="texts-container">
          <div className="step-indicator">STEP 1 OF 4</div>
          <div className="basic-info">Basic information</div>
        </div>

        <div className="multisteps">
          <div className="step-one"></div>
          <div className="step-two"></div>
          <div className="step-three"></div>
          <div className="step-four"></div>
        </div>

        <div className="form-title">Property details</div>

        <div className={`property-type-container ${errors.propertyType ? "error" : ""}`}>
          <label className="property-label">PROPERTY TYPE</label>
          <div className="property-type-input">
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
            >
              <option value="">Select property type</option>
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
              <option value="commercial">Commercial</option>
              <option value="office">Office</option>
              <option value="land">Land</option>
            </select>
          </div>
          {errors.propertyType && <div className="form-input-error-text">{errors.propertyType}</div>}
        </div>

        <div className={`property-type-container ${errors.propertyAddress ? "error" : ""}`}>
          <label className="property-label">PROPERTY ADDRESS</label>
          <div className="property-type-input">
            <input
              type="text"
              placeholder="Street, City, Country"
              value={propertyAddress}
              onChange={(e) => setPropertyAddress(e.target.value)}
            />
          </div>
          {errors.propertyAddress && <div className="form-input-error-text">{errors.propertyAddress}</div>}
        </div>

        <div className="property-row">
          <div className={`property-type-container half ${errors.totalArea ? "error" : ""}`}>
            <label className="property-label">TOTAL AREA (m²)</label>
            <div className="property-type-input">
              <input
                type="number"
                placeholder="e.g. 120"
                value={totalArea}
                onChange={(e) => setTotalArea(e.target.value)}
                min="0"
              />
            </div>
            {errors.totalArea && <div className="form-input-error-text">{errors.totalArea}</div>}
          </div>

          <div className={`property-type-container half ${errors.rooms ? "error" : ""}`}>
            <label className="property-label">ROOMS</label>
            <div className="property-type-input">
              <input
                type="number"
                placeholder="e.g. 3"
                value={rooms}
                onChange={(e) => setRooms(e.target.value)}
                min="0"
              />
            </div>
            {errors.rooms && <div className="form-input-error-text">{errors.rooms}</div>}
          </div>
        </div>

        <div className="map-container">
          {/* Google Map will be embedded here later */}
          <p className="map-placeholder-text">Google Map preview will appear here</p>
        </div>

        <button
          className="form-continue-button"
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default CreateProperty;
