import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/login.css";
import { getApiUrl } from "../../api/client";
import toast from "../../utils/toast";

const REGISTER_URL = getApiUrl("/api/users/register");

export default function Signup() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [login, setLogin] = useState("");
  const [firstname, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const [cinRectoFile, setCinRectoFile] = useState(null);
  const [cinVersoFile, setCinVersoFile] = useState(null);
  const [passportFile, setPassportFile] = useState(null);
  const [agencyFile, setAgencyFile] = useState(null);

  const [fieldErrors, setFieldErrors] = useState({
    login: "",
    email: "",
    password: "",
    phone: "",
    role: "",
    documents: "",
  });
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
  const avatarInitials = `${firstname?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?';

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value?.trim() || "");

  const handleAvatarChange = (file) => {
    if (!file) {
      setAvatarFile(null);
      setAvatarPreview("");
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  };

  const validateStep1 = () => {
    const errors = { login: "", email: "", password: "", phone: "", role: "", documents: "" };
    if (!login.trim()) errors.login = "Username is required";
    if (!email.trim()) errors.email = "Email is required";
    else if (!validateEmail(email)) errors.email = "Invalid email address (e.g. name@domain.com)";
    if (!password.trim()) errors.password = "Password is required";
    else if (!passwordValid) {
      errors.password = "Password does not meet all requirements";
      setShowPasswordRules(true);
    }
    if (!role) errors.role = "Please select a role";
    const phoneVal = phone.trim().replace(/\s/g, "");
    if (phoneVal && !/^\d{8}$/.test(phoneVal)) errors.phone = "Tunisian number: 8 digits (e.g. 12345678)";
    setFieldErrors(errors);
    return !errors.login && !errors.email && !errors.password && !errors.phone && !errors.role;
  };

  const validateStep2 = () => {
    let docErr = "";
    if (role === "AGENCY") {
      if (!agencyFile) docErr = "Please upload your agency registration document.";
    } else {
      const hasPassport = Boolean(passportFile);
      const hasCinBothSides = Boolean(cinRectoFile && cinVersoFile);
      if (!hasPassport && !hasCinBothSides) {
        docErr = "Please upload either a passport, or both CIN sides (recto and verso).";
      }
    }
    setFieldErrors((prev) => ({ ...prev, documents: docErr }));
    return !docErr;
  };

  const handleContinueStep1 = () => {
    if (!validateStep1()) return;
    setFieldErrors((prev) => ({ ...prev, documents: "" }));
    setStep(2);
  };

  const handleSubmitRegistration = async () => {
    if (!validateStep2()) return;

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("login", login.trim());
      formData.append("email", email.trim());
      formData.append("password", password);
      formData.append("firstName", firstname);
      formData.append("lastName", lastName);
      formData.append("role", role);
      if (phone.trim()) formData.append("phone", phone.trim());
      if (avatarFile) formData.append("avatar", avatarFile);

      if (role === "AGENCY" && agencyFile) {
        formData.append("agencyRegistration", agencyFile);
      } else {
        if (cinRectoFile) formData.append("cinRecto", cinRectoFile);
        if (cinVersoFile) formData.append("cinVerso", cinVersoFile);
        if (passportFile) formData.append("passport", passportFile);
      }

      const response = await fetch(REGISTER_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => ({}));
      setIsLoading(false);

      if (response.ok) {
        toast.success(data.message || "Account created. Please sign in after approval.");
        navigate("/login");
        return;
      }

      const msg = data.message || "Registration failed.";
      if (msg.toLowerCase().includes("document") || msg.toLowerCase().includes("upload")) {
        setFieldErrors((prev) => ({ ...prev, documents: msg }));
      } else {
        setFieldErrors((prev) => ({ ...prev, login: msg }));
      }
    } catch {
      setIsLoading(false);
      setFieldErrors((prev) => ({
        ...prev,
        email: "Network error. Please try again.",
      }));
    }
  };

  const docHint =
    role === "AGENCY"
      ? "Upload a legal proof that your business is registered (e.g. extrait RNE, patente, or equivalent to KBIS). PDF or image, max 6 MB."
      : "Upload either your passport, or your national ID (CIN) with both sides (recto + verso). PDF or image, max 6 MB each.";

  return (
    <div className="main-container">
      <div className="image-container">
        <img src="https://images.pexels.com/photos/7614534/pexels-photo-7614534.jpeg" alt="bg-login" />
      </div>

      <div className="form-container signup-form">
        {step === 1 ? (
          <>
            <h1 className="heading-title">Join SmartProperty</h1>
            <p className="text signup-subtitle">Create your account to get started</p>

            <div className="email-container signup-field">
              Username
              <div className={`email-input ${fieldErrors.login ? "error" : ""}`}>
                <input
                  type="text"
                  value={login}
                  onChange={(e) => {
                    setLogin(e.target.value);
                    if (fieldErrors.login) setFieldErrors((prev) => ({ ...prev, login: "" }));
                  }}
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

            <div className="role-phone-row">
              <div className="role-column">
                Role
                <div className={`role-select ${fieldErrors.role ? "error" : ""}`}>
                  <select
                    value={role}
                    onChange={(e) => {
                      setRole(e.target.value);
                      if (fieldErrors.role) setFieldErrors((prev) => ({ ...prev, role: "" }));
                    }}
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
                {fieldErrors.role && <span className="field-error">{fieldErrors.role}</span>}
              </div>

              <div className="phone-column-role">
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
            </div>

            <div className="email-container signup-field">
              Email
              <div className={`email-input ${fieldErrors.email ? "error" : ""}`}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  placeholder="Enter your email"
                />
              </div>
              {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
            </div>

            <div className="password-container signup-field">
              Password
              <div className={`password-input ${fieldErrors.password ? "error" : ""}`}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  placeholder="Create a password"
                  onFocus={() => setShowPasswordRules(true)}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  <svg
                    className="password-toggle-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {showPassword ? (
                      <>
                        <path
                          d="M2 12C3.8 7.8 7.6 5 12 5C16.4 5 20.2 7.8 22 12C20.2 16.2 16.4 19 12 19C7.6 19 3.8 16.2 2 12Z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                      </>
                    ) : (
                      <>
                        <path
                          d="M2 12C3.8 7.8 7.6 5 12 5C16.4 5 20.2 7.8 22 12C20.2 16.2 16.4 19 12 19C7.6 19 3.8 16.2 2 12Z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                        <path d="M4 20L20 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </>
                    )}
                  </svg>
                </button>
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

            <div className="signup-step1-actions">
              <div className="signup-avatar-phone-row">
                <div className="signup-avatar-section">
                  <div className="signup-avatar-label">Profile photo <span className="field-optional">(optional)</span></div>
                  <div className="signup-avatar-card signup-avatar-card--premium">
                    <div className="signup-avatar-preview-wrap">
                      <div className="signup-avatar-preview" aria-hidden="true">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Profile preview" />
                        ) : (
                          <span className="signup-avatar-placeholder">{avatarInitials}</span>
                        )}
                      </div>
                    </div>
                    <div className="signup-avatar-copywrap">
                      <div className="signup-avatar-title">Profile picture</div>
                      <p className="signup-avatar-hint">Helps others recognize you. PNG or JPG.</p>
                      <div className="signup-avatar-actions">
                        <label className="signup-avatar-button signup-avatar-button--premium">
                          <span className="signup-avatar-button-icon" aria-hidden="true">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path
                                d="M12 16V8M12 8L9 11M12 8L15 11"
                                stroke="currentColor"
                                strokeWidth="1.75"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M4 16.5V17C4 18.1046 4.89543 19 6 19H18C19.1046 19 20 18.1046 20 17V16.5"
                                stroke="currentColor"
                                strokeWidth="1.75"
                                strokeLinecap="round"
                              />
                            </svg>
                          </span>
                          Choose image
                          <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => handleAvatarChange(e.target.files?.[0] || null)}
                          />
                        </label>
                        {avatarPreview ? (
                          <button
                            type="button"
                            className="signup-avatar-remove"
                            onClick={() => handleAvatarChange(null)}
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="continue-row">
                <button
                  type="button"
                  className="continue-button"
                  onClick={!isLoading ? handleContinueStep1 : undefined}
                  disabled={isLoading}
                >
                  {isLoading ? <div className="loader"></div> : <span className="continue-text">Continue</span>}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="verify-header">
              <div>
                <h1 className="heading-title">Verify your identity</h1>
                <p className="text signup-subtitle">{docHint}</p>
              </div>
              <span className="verify-step">Step 2 / 2</span>
            </div>

            {role === "AGENCY" ? (
              <div className={`verify-card ${fieldErrors.documents ? "error" : ""}`}>
                <div className="verify-card-title">Agency registration</div>
                <div className="verify-card-subtitle">
                  Upload a document proving your agency is registered (PDF or image).
                </div>
                <label className="verify-upload">
                  <span className="verify-upload-label">
                    {agencyFile?.name ? agencyFile.name : "Choose a file"}
                  </span>
                  <input
                    className="verify-upload-input"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={(e) => {
                      setAgencyFile(e.target.files?.[0] || null);
                      if (fieldErrors.documents) setFieldErrors((prev) => ({ ...prev, documents: "" }));
                    }}
                  />
                </label>
              </div>
            ) : (
              <>
                <div className={`verify-card ${fieldErrors.documents ? "error" : ""}`}>
                  <div className="verify-card-title">National ID (CIN)</div>
                  <div className="verify-card-subtitle">
                    If you choose CIN, please upload <strong>both sides</strong>.
                  </div>

                  <div className="verify-grid">
                    <label className="verify-upload">
                      <span className="verify-upload-top">
                        CIN recto <span className="field-optional">(required)</span>
                      </span>
                      <span className="verify-upload-label">
                        {cinRectoFile?.name ? cinRectoFile.name : "Choose a file"}
                      </span>
                      <input
                        className="verify-upload-input"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        onChange={(e) => {
                          setCinRectoFile(e.target.files?.[0] || null);
                          if (fieldErrors.documents) setFieldErrors((prev) => ({ ...prev, documents: "" }));
                        }}
                      />
                    </label>

                    <label className="verify-upload">
                      <span className="verify-upload-top">
                        CIN verso <span className="field-optional">(required)</span>
                      </span>
                      <span className="verify-upload-label">
                        {cinVersoFile?.name ? cinVersoFile.name : "Choose a file"}
                      </span>
                      <input
                        className="verify-upload-input"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        onChange={(e) => {
                          setCinVersoFile(e.target.files?.[0] || null);
                          if (fieldErrors.documents) setFieldErrors((prev) => ({ ...prev, documents: "" }));
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="verify-divider">
                  <span>OR</span>
                </div>

                <div className={`verify-card ${fieldErrors.documents ? "error" : ""}`}>
                  <div className="verify-card-title">Passport</div>
                  <div className="verify-card-subtitle">Upload a clear scan or photo (PDF or image).</div>
                  <label className="verify-upload">
                    <span className="verify-upload-label">
                      {passportFile?.name ? passportFile.name : "Choose a file"}
                    </span>
                    <input
                      className="verify-upload-input"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      onChange={(e) => {
                        setPassportFile(e.target.files?.[0] || null);
                        if (fieldErrors.documents) setFieldErrors((prev) => ({ ...prev, documents: "" }));
                      }}
                    />
                  </label>
                </div>
              </>
            )}

            {fieldErrors.documents && <span className="field-error">{fieldErrors.documents}</span>}

            <button
              type="button"
              className="continue-button signup-continue-button"
              onClick={!isLoading ? handleSubmitRegistration : undefined}
              disabled={isLoading}
            >
              {isLoading ? <div className="loader"></div> : <span className="continue-text">Submit</span>}
            </button>

            <button
              type="button"
              className="signin-link"
              style={{
                display: "block",
                textAlign: "center",
                marginTop: "12px",
                background: "none",
                border: "none",
                cursor: "pointer",
                width: "100%",
              }}
              onClick={() => setStep(1)}
              disabled={isLoading}
            >
              ← Back
            </button>
          </>
        )}

        <span className="terms-of-services">
          By signing up you agree to our <span className="underline">Terms of service</span> &{" "}
          <span className="underline">Privacy policy</span>
        </span>

        <span className="signin-redirect">
          Already have an account?{" "}
          <span className="signin-link" onClick={() => navigate("/login")}>
            Sign in
          </span>
        </span>
      </div>
    </div>
  );
}
