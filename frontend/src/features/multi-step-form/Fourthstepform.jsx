import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TourUpload from "./components/TourUpload";
import { completeOnboarding } from "../../api/user";
import "../../styles/fourthStepForm.css";

const FourthStepForm = () => {
  const navigate = useNavigate();
  const [tourFiles, setTourFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      // Mark onboarding as complete for authenticated users
      await completeOnboarding();
    } catch (err) {
      // Ignore errors (e.g., not logged in); still allow navigation
    } finally {
      setSubmitting(false);
      navigate("/");
    }
  };

  return (
    <div className="fs-container">

      <div className="fs-image">
        <img
          src="https://images.pexels.com/photos/9060306/pexels-photo-9060306.jpeg"
          alt="property"
        />
      </div>

      <div className="fs-form">
        <div className="fs-inner">

          <div className="fs-top-row">
            <button
              className="fs-back-btn"
              onClick={() => navigate("/form?step=3")}
              title="Go back"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="fs-step-indicator">STEP 4 OF 4</div>
            <div className="fs-step-title">360° Tour</div>
          </div>

          <div className="fs-progress">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`fs-bar ${i <= 3 ? "active" : ""}`} />
            ))}
          </div>

          <div className="fs-title">360° Virtual Tour</div>
          <p className="fs-subtitle">
            Upload your 360° tour files to give buyers an immersive view of the property.
          </p>

          <TourUpload tourFiles={tourFiles} setTourFiles={setTourFiles} />

          <button className="fs-button" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Listing"}
          </button>

        </div>
      </div>
    </div>
  );
};

export default FourthStepForm;