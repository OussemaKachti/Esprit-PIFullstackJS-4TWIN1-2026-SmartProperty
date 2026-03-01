import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../../styles/firstStepForm.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function ChangeMapView({ center }) {
  const map = useMap();
  const mapRef = useRef(map);

  useEffect(() => {
    mapRef.current.flyTo(center, 15, { duration: 1.5 });
  }, [center]);

  return null;
}

const CreateProperty = ({ onStep1Complete }) => {
  const navigate = useNavigate();
  const [propertyType, setPropertyType] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [totalArea, setTotalArea] = useState("");
  const [rooms, setRooms] = useState("");
  const [errors, setErrors] = useState({});
  const [position, setPosition] = useState([36.8065, 10.1815]);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!propertyAddress) {
      setAddressSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            propertyAddress
          )}&addressdetails=1&limit=5&countrycodes=tn&bounded=1`
        );
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Update map to the first match
          setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
          setAddressSuggestions(data);
          setShowSuggestions(true);
        } else {
          setAddressSuggestions([]);
        }
      } catch (err) {
        console.log(err);
        setAddressSuggestions([]);
      }
    }, 700);
  }, [propertyAddress]);

  const handleAddressChange = (e) => {
    setPropertyAddress(e.target.value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion) => {
    setPropertyAddress(suggestion.display_name);
    setPosition([parseFloat(suggestion.lat), parseFloat(suggestion.lon)]);
    setAddressSuggestions([]);
    setShowSuggestions(false);
  };

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
    if (!validate()) return;
    onStep1Complete?.({
      propertyType,
      propertyAddress,
      totalArea,
      rooms,
      position,
    });
    navigate("/form?step=2");
  };

  return (
    <div className="create-property-container">

      <div className="create-property-image">
        <img src="https://images.pexels.com/photos/9060306/pexels-photo-9060306.jpeg" alt="bg-login" />
      </div>

      <div className="create-property-form">

        <div className="create-property-inner">

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

          {/* Property Type */}
          <div className={`create-property-field ${errors.propertyType ? "error" : ""}`}>
            <label className="create-property-label">PROPERTY TYPE</label>
            <div className="create-property-input-wrapper">
              <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                <option value="">Select property type</option>
                <option value="apartment">Apartment</option>
                <option value="villa">Villa</option>
                <option value="commercial">Commercial</option>
                <option value="office">Office</option>
                <option value="land">Land</option>
              </select>
            </div>
            {/* Always rendered — min-height keeps layout stable */}
            <div className="create-property-error">{errors.propertyType || ""}</div>
          </div>

          {/* Property Address */}
          <div className={`create-property-field ${errors.propertyAddress ? "error" : ""}`}>
            <label className="create-property-label">PROPERTY ADDRESS</label>
            <div className="create-property-input-wrapper address-input-wrapper">
              <input
                type="text"
                placeholder="Street, City, Country"
                value={propertyAddress}
                onChange={handleAddressChange}
                onFocus={() => {
                  if (addressSuggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  // Small delay so click can register before hiding
                  setTimeout(() => setShowSuggestions(false), 150);
                }}
              />
              {showSuggestions && addressSuggestions.length > 0 && (
                <div className="address-suggestions">
                  {addressSuggestions.map((item) => (
                    <button
                      key={item.place_id}
                      type="button"
                      className="address-suggestion-item"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSuggestionClick(item)}
                    >
                      {item.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="create-property-error">{errors.propertyAddress || ""}</div>
          </div>

          {/* Area + Rooms */}
          <div className="create-property-row">
            <div className={`create-property-field half ${errors.totalArea ? "error" : ""}`}>
              <label className="create-property-label">TOTAL AREA (m²)</label>
              <div className="create-property-input-wrapper">
                <input
                  type="number"
                  placeholder="e.g. 120"
                  value={totalArea}
                  onChange={(e) => setTotalArea(e.target.value)}
                  min="0"
                />
              </div>
              <div className="create-property-error">{errors.totalArea || ""}</div>
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
              <div className="create-property-error">{errors.rooms || ""}</div>
            </div>
          </div>

          {/* Map */}
          <div className="create-property-map">
            <MapContainer
              center={position}
              zoom={15}
              scrollWheelZoom={true}
              style={{ height: "240px", width: "100%", borderRadius: "12px" }}
            >
              <ChangeMapView center={position} />
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={position}>
                <Popup>{propertyAddress || "Property Location"}</Popup>
              </Marker>
            </MapContainer>
          </div>

          <button className="create-property-button" onClick={handleContinue}>
            Continue
          </button>

        </div>
      </div>
    </div>
  );
};

export default CreateProperty;