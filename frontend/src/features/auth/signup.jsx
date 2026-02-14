import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/login.css";

export default function Signup() {
  const navigate = useNavigate();

  const [login, setLogin] = useState("");
  const [firstname, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");

  const [fieldErrors, setFieldErrors] = useState({ login: "", email: "", password: "" });
  const [codeError, setCodeError] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const inputsRef = useRef([]);
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]);

  const validateRequired = () => {
    const errors = { login: "", email: "", password: "" };
    if (!login.trim()) errors.login = "Username is required";
    if (!email.trim()) errors.email = "Email is required";
    if (!password.trim()) errors.password = "Password is required";
    setFieldErrors(errors);
    return !errors.login && !errors.email && !errors.password;
  };

  const handleContinue = async () => {
    if (!validateRequired()) return;

    setIsLoading(true);
    setFieldErrors({ login: "", email: "", password: "" });

    try {
      const payload = {
        login: login.trim(),
        email: email.trim(),
        password: password,
        firstName: firstname,
        lastName: lastName,
        phone: phone,
        role: role,
      };

      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setIsLoading(false);
        setShowVerification(true);
      } else {
        setIsLoading(false);
        const msg = data.message || "Registration failed.";
        if (msg.toLowerCase().includes("login") && msg.toLowerCase().includes("email") && msg.toLowerCase().includes("password")) {
          setFieldErrors({
            login: "Username is required",
            email: "Email is required",
            password: "Password is required",
          });
        } else {
          setFieldErrors({ login: msg, email: "", password: "" });
        }
      }
    } catch (err) {
      setIsLoading(false);
      setFieldErrors({ login: "", email: "Network error. Please try again.", password: "" });
    }
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
        
      </div>

      <div className="form-container signup-form">

        <h1 className="heading-title">Join SmartProperty</h1>
        <p className="text signup-subtitle">Create your account to get started</p>

        {!showVerification && (
          <>
            <div className="email-container signup-field">
              Username
              <div className={`email-input ${fieldErrors.login ? "error" : ""}`}>
                <input
                  type="text"
                  value={login}
                  onChange={(e) => { setLogin(e.target.value); if (fieldErrors.login) setFieldErrors((prev) => ({ ...prev, login: "" })); }}
                  placeholder="Enter your username"
                />
              </div>
              {fieldErrors.login && <span className="field-error">{fieldErrors.login}</span>}
            </div>

            <div className="firsname-lastname">
              <div className="firstname-container">
                First name
                <div className="firstname-input">
                  <input
                    type="text"
                    value={firstname}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                  />
                </div>
              </div>

              <div className="lastname-container">
                Last name
                <div className="lastname-input">
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
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
                  <option value="TENANT">Tenant</option>
                  <option value="AGENCY">Agency</option>
                  <option value="OWNER">Owner</option>
                  <option value="BUYER">Buyer</option>
                </select>
              </div>
            </div>


            <div className="email-container signup-field">
              Email
              <div className={`email-input ${fieldErrors.email ? "error" : ""}`}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: "" })); }}
                  placeholder="Enter your email"
                />
              </div>
              {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
            </div>

            <div className="password-container signup-field">
              Password
              <div className={`password-input ${fieldErrors.password ? "error" : ""}`}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: "" })); }}
                  placeholder="Create a password"
                />
              </div>
              {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
            </div>

            <div className="email-container signup-field">
              Phone
              <div className="email-input">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1234567890"
                />
              </div>
            </div>

            <button
              type="button"
              className="continue-button signup-continue-button"
              onClick={!isLoading ? handleContinue : undefined}
              disabled={isLoading}
            >
              {isLoading ? <div className="loader"></div> : <span className="continue-text">Continue</span>}
            </button>

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
