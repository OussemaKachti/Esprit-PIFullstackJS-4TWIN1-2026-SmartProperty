import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/thirdStepForm.css";
import PricingSection from "./components/PricingSection";

const ThirdStepForm = () => {
  const navigate = useNavigate();

  const [listingType, setListingType] = useState("");
  const [price, setPrice]             = useState("");
  const [period, setPeriod]           = useState("");
  const [useAI, setUseAI]             = useState(false);
  const [aiLoading, setAiLoading]     = useState(false);
  const [aiResult, setAiResult]       = useState(null);
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
        <div className="ts-inner">

          <div className="ts-top-row">
            <button
              className="ts-back-btn"
              onClick={() => navigate("/form?step=2")}
              title="Go back"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="ts-step-indicator">STEP 3 OF 4</div>
            <div className="ts-step-title">Pricing</div>
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

          <div className="ts-toggle-section">
            <div className="ts-toggle-left">
              <div className="ts-ai-icon">
                            <svg fill="#000000" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M12.32 8a3 3 0 0 0-2-.7H5.63A1.59 1.59 0 0 1 4 5.69a2 2 0 0 1 0-.25 1.59 1.59 0 0 1 1.63-1.33h4.62a1.59 1.59 0 0 1 1.57 1.33h1.5a3.08 3.08 0 0 0-3.07-2.83H8.67V.31H7.42v2.3H5.63a3.08 3.08 0 0 0-3.07 2.83 2.09 2.09 0 0 0 0 .25 3.07 3.07 0 0 0 3.07 3.07h4.74A1.59 1.59 0 0 1 12 10.35a1.86 1.86 0 0 1 0 .34 1.59 1.59 0 0 1-1.55 1.24h-4.7a1.59 1.59 0 0 1-1.55-1.24H2.69a3.08 3.08 0 0 0 3.06 2.73h1.67v2.27h1.25v-2.27h1.7a3.08 3.08 0 0 0 3.06-2.73v-.34A3.06 3.06 0 0 0 12.32 8z"></path></g></svg>

              </div>
              <div className="ts-toggle-label-wrap">
                <div className="ts-toggle-label">AI Price Prediction</div>
                <div className="ts-toggle-sub">Get an instant market estimate</div>
              </div>
            </div>
            <label className="ts-switch">
              <input type="checkbox" checked={useAI} onChange={(e) => handleToggleAI(e.target.checked)} />
              <span className="ts-slider" />
            </label>
          </div>

          <div className={`ts-ai-wrapper${useAI ? "" : " hidden"}`}>
            {aiLoading && (
              <div className="ts-ai-loading">
                <div className="ts-skeleton" style={{ width: "60%" }} />
                <div className="ts-skeleton" style={{ width: "40%" }} />
                <div className="ts-skeleton" style={{ width: "80%" }} />
                <div className="ts-skeleton" style={{ width: "50%" }} />
              </div>
            )}
            {!aiLoading && aiResult && (
              <div className="ts-ai-result">
                <div className="ts-ai-result-header">
                  <div className="ts-ai-result-title">AI Suggested Price</div>
                  <div className="ts-ai-badge">AI</div>
                </div>
                <div className="ts-ai-price-row">
                  <div className="ts-ai-price">${aiResult.suggested.toLocaleString()}</div>
                  <div className="ts-ai-range">${aiResult.low.toLocaleString()} – ${aiResult.high.toLocaleString()}</div>
                </div>
                <div className="ts-ai-confidence">
                  <div className="ts-ai-confidence-track">
                    <div className="ts-ai-confidence-fill" style={{ width: `${aiResult.confidence}%` }} />
                  </div>
                  <div className="ts-ai-confidence-label">{aiResult.confidence}% confidence</div>
                </div>
                <button className="ts-use-ai-btn" onClick={() => setPrice(String(aiResult.suggested))}>
                  Use this price
                </button>
              </div>
            )}
          </div>

          <button className="ts-button" onClick={handleContinue}>
            Continue
          </button>

        </div>
      </div>
    </div>
  );
};

export default ThirdStepForm;