import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../../styles/firstStepForm.css';

const CreateProperty = () => {
  const navigate = useNavigate();
  const [propertyType, setPropertyType] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [totalArea, setTotalArea] = useState("");
  const [rooms, setRooms] = useState("");
  const [errors, setErrors] = useState({});

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);

  // Initialize map once
  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 40.7128, lng: -74.006 },
      zoom: 13,
    });
  }, []);

  useEffect(() => {
    if (!window.google || !mapInstance.current || !propertyAddress) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: propertyAddress }, (results, status) => {
      if (status === "OK" && results[0]) {
        const location = results[0].geometry.location;
        mapInstance.current.setCenter(location);

        if (markerInstance.current) {
          markerInstance.current.setMap(null);
        }

        markerInstance.current = new window.google.maps.Marker({
          map: mapInstance.current,
          position: location,
        });
      }
    });
  }, [propertyAddress]);

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
    if (validate()) navigate("/form?step=2");
  };

  return (
    <div className="create-property-container">
      <div className="create-property-image">
        <img
          src="https://images.pexels.com/photos/9060306/pexels-photo-9060306.jpeg"
          alt="bg-login"
        />
      </div>

      <div className="create-property-form">
        <div className="create-property-header">
          <div className="create-property-step-indicator">STEP 1 OF 4</div>
          <div className="create-property-step-title">Basic information</div>
        </div>

        <div className="create-property-progress">
          <div className="create-property-progress-bar active"></div>
          <div className="create-property-progress-bar"></div>
          <div className="create-property-progress-bar"></div>
          <div className="create-property-progress-bar"></div>
        </div>

        <div className="create-property-title">Property details</div>

        <div className={`create-property-field ${errors.propertyType ? "error" : ""}`}>
          <label className="create-property-label">PROPERTY TYPE</label>
          <div className="create-property-input-wrapper">
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
          {errors.propertyType && <div className="create-property-error">{errors.propertyType}</div>}
        </div>

        <div className={`create-property-field ${errors.propertyAddress ? "error" : ""}`}>
          <label className="create-property-label">PROPERTY ADDRESS</label>
          <div className="create-property-input-wrapper">
            <input
              type="text"
              placeholder="Street, City, Country"
              value={propertyAddress}
              onChange={(e) => setPropertyAddress(e.target.value)}
            />
          </div>
          {errors.propertyAddress && <div className="create-property-error">{errors.propertyAddress}</div>}
        </div>

        <div className="create-property-row">
          <div className={`create-property-field half ${errors.totalArea ? "error" : ""}`}>
            <label className="create-property-label">TOTAL AREA (mÂ²)</label>
            <div className="create-property-input-wrapper">
              <input
                type="number"
                placeholder="e.g. 120"
                value={totalArea}
                onChange={(e) => setTotalArea(e.target.value)}
                min="0"
              />
            </div>
            {errors.totalArea && <div className="create-property-error">{errors.totalArea}</div>}
          </div>

          <div className={`create-property-field half ${errors.rooms ? "error" : ""}`}>
            <label className="create-property-label">ROOMS</label>
            <div className="create-property-input-wrapper">
              <input
                type="number"
                placeholder="e.g. 3"
                value={rooms}
                onChange={(e) => setRooms(e.target.value)}
                min="0"
              />
            </div>
            {errors.rooms && <div className="create-property-error">{errors.rooms}</div>}
          </div>
        </div>

        <div className="create-property-map">
          <div
            ref={mapRef}
            style={{ height: "300px", width: "100%", borderRadius: "12px", background: "#f5f5f5" }}
          />
        </div>

        <button
          className="create-property-button"
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default CreateProperty;