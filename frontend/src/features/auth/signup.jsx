import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/login.css";

export default function Signup() {
  const navigate = useNavigate();

  const [login, setLogin] = useState("");
  const [firstname, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");

  const [fieldErrors, setFieldErrors] = useState({ login: "", email: "", password: "", phone: "" });
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const PASSWORD_RULES = [
    { id: "length", label: "At least 8 characters", test: (p) => p.length >= 8 },
    { id: "upper", label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
    { id: "lower", label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
    { id: "digit", label: "One number", test: (p) => /\d/.test(p) },
    { id: "special", label: "One special character (!@#$%^&*...)", test: (p) => /[^A-Za-z0-9]/.test(p) },
  ];

  const passwordRuleStatus = PASSWORD_RULES.map((r) => ({ ...r, met: r.test(password) }));
  const passwordValid = passwordRuleStatus.every((r) => r.met);

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value?.trim() || "");

  const validateRequired = () => {
    const errors = { login: "", email: "", password: "", phone: "" };
    if (!login.trim()) errors.login = "Username is required";
    if (!email.trim()) errors.email = "Email is required";
    else if (!validateEmail(email)) errors.email = "Invalid email address (e.g. name@domain.com)";
    if (!password.trim()) errors.password = "Password is required";
    else if (!passwordValid) {
      errors.password = "Password does not meet all requirements";
      setShowPasswordRules(true);
    }
    const phoneVal = phone.trim().replace(/\s/g, "");
    if (phoneVal && !/^\d{8}$/.test(phoneVal)) errors.phone = "Tunisian number: 8 digits (e.g. 12345678)";
    setFieldErrors(errors);
    return !errors.login && !errors.email && !errors.password && !errors.phone;
  };

const handleContinue = async () => {
  if (!validateRequired()) return;

  setIsLoading(true);

  try {
    const payload = {
      login: login.trim(),
      email: email.trim(),
      password,
      firstName: firstname,
      lastName: lastName,
      phone: phone.trim() || undefined,
      role,
    };

    const response = await fetch(
      "http://localhost:5000/api/users/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    setIsLoading(false);

    if (response.ok) {

      if (role === "AGENCY") {
            navigate("/form?step=1");      
      } 
      else {
        navigate("/"); 
      }

    } else {
      setFieldErrors((prev) => ({
        ...prev,
        login: data.message || "Registration failed.",
      }));
    }

  } catch (err) {
    setIsLoading(false);
    setFieldErrors((prev) => ({
      ...prev,
      email: "Network error. Please try again.",
    }));
  }
};

  return (
    <div className="main-container">
      <div className="image-container">
        <img src="https://images.pexels.com/photos/7614534/pexels-photo-7614534.jpeg" alt="bg-login" />
      </div>

      <div className="form-container signup-form">
        <h1 className="heading-title">Join SmartProperty</h1>
        <p className="text signup-subtitle">Create your account to get started</p>

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
            <select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Select role">
              <option value="" disabled>Select role</option>
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
          <div className={`password-input ${fieldErrors.password ? "error" : ""}`} style={{ position: 'relative' }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: "" })); }}
              placeholder="Create a password"
              onFocus={() => setShowPasswordRules(true)}
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', zIndex: 2 }}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 4C5.45455 4 1.72727 7.27273 1 10C1.72727 12.7273 5.45455 16 10 16C14.5455 16 18.2727 12.7273 19 10C18.2727 7.27273 14.5455 4 10 4ZM10 14C7.23858 14 5 11.7614 5 9C5 6.23858 7.23858 4 10 4C12.7614 4 15 6.23858 15 9C15 11.7614 12.7614 14 10 14ZM10 6C8.34315 6 7 7.34315 7 9C7 10.6569 8.34315 12 10 12C11.6569 12 13 10.6569 13 9C13 7.34315 11.6569 6 10 6Z" fill="#888"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 2L18 18" stroke="#888" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M10 4C5.45455 4 1.72727 7.27273 1 10C1.72727 12.7273 5.45455 16 10 16C14.5455 16 18.2727 12.7273 19 10C18.2727 7.27273 14.5455 4 10 4ZM10 14C7.23858 14 5 11.7614 5 9C5 6.23858 7.23858 4 10 4C12.7614 4 15 6.23858 15 9C15 11.7614 12.7614 14 10 14ZM10 6C8.34315 6 7 7.34315 7 9C7 10.6569 8.34315 12 10 12C11.6569 12 13 10.6569 13 9C13 7.34315 11.6569 6 10 6Z" fill="#888"/>
                </svg>
              )}
            </span>
          </div>
          {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
          {showPasswordRules && (
            <div className="password-rules-card">
              <p className="password-rules-title">Your password must contain:</p>
              <ul className="password-rules-list">
                {passwordRuleStatus.map((rule) => (
                  <li key={rule.id} className={rule.met ? "password-rule-met" : "password-rule-unmet"}>
                    <span className="password-rule-icon">{rule.met ? "✓" : "○"}</span>
                    <span>{rule.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="email-container signup-field">
          Phone <span className="field-optional">(optional)</span>
          <div className={`email-input ${fieldErrors.phone ? "error" : ""}`}>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 8);
                setPhone(v);
                if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: "" }));
              }}
              placeholder="8 digits (e.g. 12345678)"
              inputMode="numeric"
              maxLength={8}
            />
          </div>
          {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
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
          <span className="signin-link" onClick={() => navigate("/login")}>Sign in</span>
        </span>

        <span className="terms-of-services">
          By signing up you agree to our{" "}
          <span className="underline">Terms of service</span> &{" "}
          <span className="underline">Privacy policy</span>
        </span>
      </div>
    </div>
  );
}