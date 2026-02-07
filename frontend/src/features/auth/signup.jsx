import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/login.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import GmailButton from "./GmailButton";

export default function Signup() {
  const navigate = useNavigate();
  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  const [firstname, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");


  const [codeError, setCodeError] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const inputsRef = useRef([]);
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]);

  const handleContinue = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowVerification(true);
    }, 2000);
  };


  const verifyCode = async (codeStr) => {
    navigate("/login");
  };

  const handleCodeChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const updated = [...code];
    updated[index] = value;
    setCode(updated);
    setCodeError("");

    if (value && index < code.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    if (updated.every((d) => d !== "")) {
      verifyCode(updated.join(""));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pasteData)) return;

    const pasteArray = pasteData.split("");
    setCode(pasteArray);
    setCodeError("");

    inputsRef.current[5]?.focus();
  };

  return (
    <div className="main-container">
      <div className="image-container">
        <img src="https://images.pexels.com/photos/7614534/pexels-photo-7614534.jpeg" alt="bg-login" />
        <div className="hero-text">
          Welcome to<br /> SmartProperty  </div>
        <div className="sub-hero-text">Signup to manage your properties, tenants and operations__all in one place.</div>
      </div>

      <div className="form-container">


        <h1 className="heading-title">Join SmartProperty</h1>

        <p className="text">Create your account to get started</p>

        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <GmailButton />
        </GoogleOAuthProvider>

        <span className="or-text">Or</span>

        {!showVerification && (
          <>
            <div className="firsname-lastname">
              <div className="firstname-container">
                FirstName
                <div className="firstname-input">
                  <input
                    type="text"
                    value={firstname}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
              </div>

              <div className="lastname-container">
                LastName
                <div className="lastname-input">
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

            </div>

            <div className="role-container">
              Role
              <div className="role-select">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  aria-label="Select role"
                >
                  <option value="" disabled>
                    Select role
                  </option>
                  <option value="tenant">Tenant</option>
                  <option value="agency">Agency</option>
                  <option value="owner">Owner</option>
                  <option value="buyer">Buyer</option>
                </select>
              </div>
            </div>


            <div className="email-container">
              Email
              <div className="email-input">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}

                />
              </div>
            </div>

            <div className="password-container">
              Password
              <div className="password-input">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}

                />
              </div>
            </div>


            <div
              className="continue-button"
              onClick={!isLoading ? handleContinue : undefined}
            >


              {isLoading ? <div className="loader"></div> : <span className="continue-text">Continue</span>}
            </div>

            <span className="signin-redirect">
              Already have an account?{" "}
              <span
                className="signin-link"
                onClick={() => navigate("/login")}
              >
                Sign in
              </span>
            </span>


            <span className="terms-of-services">
              By signing up you agree to our{" "}
              <span className="underline">Terms of service</span> &{" "}
              <span className="underline">Privacy policy</span>
            </span>
          </>
        )}

        {showVerification && (
          <>
            <div
              className={`verification-code ${codeError ? "error" : ""}`}
              onPaste={handlePaste}
            >
              {code.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputsRef.current[i] = el)}
                  className="code-number"
                  maxLength="1"
                  value={d}
                  onChange={(e) => handleCodeChange(e.target.value, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />
              ))}
            </div>

            {codeError && (
              <span className="input-error-text" style={{ marginTop: "6px" }}>
                {codeError}
              </span>
            )}

            <span className="email-issue-text">
              Didn’t receive the email?{" "}
              <span
                className="resend-code"
              >
                Resend code
              </span>
            </span>
          </>
        )}
      </div>
    </div>
  );
}
