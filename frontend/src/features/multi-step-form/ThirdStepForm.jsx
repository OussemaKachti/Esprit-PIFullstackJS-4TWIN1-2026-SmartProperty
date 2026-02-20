import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/thirdStepForm.css";
import PricingSection from "./components/PricingSection";
import AIPrediction from "./components/AIPrediction";
import TourUpload from "./components/TourUpload";

const ThirdStepForm = () => {
  const navigate = useNavigate();

  const [listingType, setListingType] = useState("");
  const [price, setPrice]             = useState("");
  const [period, setPeriod]           = useState("");
  const [useAI, setUseAI]             = useState(false);
  const [aiLoading, setAiLoading]     = useState(false);
  const [aiResult, setAiResult]       = useState(null);
  const [tourFiles, setTourFiles]     = useState([]);
  const [errors, setErrors]           = useState({});

  const runAI = async () => {
    setAiLoading(true);
    setAiResult(null);
    await new Promise((r) => setTimeout(r, 2000)); 
    setAiResult({ suggested: 285000, low: 260000, high: 310000, confidence: 82 });
    setAiLoading(false);
  };

  const handleToggleAI = (on) => {
    setUseAI(on);
    if (on) runAI();
    else { setAiResult(null); setAiLoading(false); }
  };

  const validate = () => {
    const e = {};
    if (!listingType) e.listingType = "Listing type is required.";
    if (!price) e.price = "Price is required.";
    else if (isNaN(price) || Number(price) <= 0) e.price = "Enter a valid price.";
    if (listingType === "rent" && !period) e.period = "Rental period is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleContinue = () => {
    if (validate()) navigate("/form?step=4");
  };

  return (
    <div className="ts-container">
      <div className="ts-image">
        <img
          src="https://images.pexels.com/photos/9060306/pexels-photo-9060306.jpeg"
          alt="property"
        />
      </div>

      <div className="ts-form">
        <div className="ts-header">
          <div className="ts-step-indicator">STEP 3 OF 4</div>
          <div className="ts-step-title">Pricing & Media</div>
        </div>

        <div className="ts-progress">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`ts-bar ${i <= 2 ? "active" : ""}`} />
          ))}
        </div>

        <div className="ts-title">Pricing</div>

        <PricingSection
          listingType={listingType}
          setListingType={setListingType}
          price={price}
          setPrice={setPrice}
          period={period}
          setPeriod={setPeriod}
          errors={errors}
          setErrors={setErrors}
        />

        <AIPrediction
          useAI={useAI}
          onToggle={handleToggleAI}
          aiLoading={aiLoading}
          aiResult={aiResult}
          onUsePrice={(p) => setPrice(String(p))}
        />

        <div className="ts-divider" />

        <TourUpload tourFiles={tourFiles} setTourFiles={setTourFiles} />

        <button className="ts-button" onClick={handleContinue}>
          Continue
        </button>
      </div>
    </div>
  );
};

export default ThirdStepForm;