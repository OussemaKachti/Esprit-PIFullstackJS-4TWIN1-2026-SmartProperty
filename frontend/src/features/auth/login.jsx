import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/login.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import GmailButton from "./GmailButton";
import toast from "../../utils/toast";
import { shouldAccessBackoffice, getRedirectUrl, storeUserData, redirectToBackofficeWithToken } from "../../utils/auth";
const API_BASE = "http://localhost:5000";

export default function Login() {
  const navigate = useNavigate();
  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 2FA state
  const [show2FA, setShow2FA] = useState(false);
  const [twoFAEmail, setTwoFAEmail] = useState("");
  const [twoFACode, setTwoFACode] = useState(["", "", "", "", "", ""]);
  const [twoFAError, setTwoFAError] = useState("");
  const [isBackupMode, setIsBackupMode] = useState(false);
  const [backupCode, setBackupCode] = useState("");
  const inputRefs = useRef([]);

  const handleLogin = async () => {
    let hasError = false;

    if (!email) {
      setEmailError("Please enter your email address");
      hasError = true;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Please enter your password");
      hasError = true;
    } else {
      setPasswordError("");
    }

    if (hasError) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Login failed");
        setIsLoading(false);
        return;
      }

      // Store token and user data
      localStorage.setItem("token", data.token);
      if (data.user) {
        storeUserData(data.user);
      }

      toast.success("Login successful");

      // Redirect based on user role
      const userRole = data.user?.role;
      if (userRole && shouldAccessBackoffice(userRole)) {
        // AGENCY, OWNER, ADMIN → redirect to backoffice
        const backofficeUrl = getRedirectUrl(userRole);
        redirectToBackofficeWithToken(backofficeUrl, data.token);
      } else {
        // TENANT, BUYER → stay in frontend
        navigate("/");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  // Handle OTP digit input
  const handleOTPChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...twoFACode];
    updated[index] = value.slice(-1);
    setTwoFACode(updated);
    setTwoFAError("");
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyDown = (index, e) => {
    if (e.key === "Backspace" && !twoFACode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOTPPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setTwoFACode(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handle2FASubmit = async () => {
    const token = isBackupMode ? backupCode.trim() : twoFACode.join("");

    if (!token || (!isBackupMode && token.length < 6)) {
      setTwoFAError(isBackupMode ? "Please enter your backup code" : "Please enter the 6-digit code");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/users/2fa/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: twoFAEmail, token, isBackupCode: isBackupMode }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setTwoFAError(data.message || "Invalid code. Please try again.");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Login successful");
      navigate("/form?step=1");
    } catch (error) {
      setTwoFAError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };


  // ── 2FA Screen ──────────────────────────────────────────────
  if (show2FA) {
    return (
      <div className="main-container">
        <div className="image-container">
          <img src="https://images.pexels.com/photos/7614534/pexels-photo-7614534.jpeg" alt="bg-login" />
        </div>

        <div className="form-container">
          <h1 className="heading-title">Two-Factor Authentication</h1>
          <p className="text">
            {isBackupMode
              ? "Enter one of your backup codes"
              : "Enter the 6-digit code from your authenticator app"}
          </p>

          {!isBackupMode ? (
            <div style={{ display: "flex", gap: "8px", justifyContent: "center", margin: "24px 0" }}>
              {twoFACode.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(i, e.target.value)}
                  onKeyDown={(e) => handleOTPKeyDown(i, e)}
                  onPaste={i === 0 ? handleOTPPaste : undefined}
                  disabled={isLoading}
                  style={{
                    width: "48px",
                    height: "56px",
                    textAlign: "center",
                    fontSize: "24px",
                    fontWeight: "bold",
                    border: twoFAError ? "2px solid #e53e3e" : "2px solid #e2e8f0",
                    borderRadius: "10px",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="email-container" style={{ marginTop: "24px" }}>
              Backup Code
              <div className={`email-input ${twoFAError ? "error" : ""}`}>
                <input
                  type="text"
                  value={backupCode}
                  placeholder="Enter backup code (e.g. ABCD1234)"
                  onChange={(e) => { setBackupCode(e.target.value); setTwoFAError(""); }}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {twoFAError && (
            <span className="input-error-text" style={{ textAlign: "center", display: "block" }}>
              {twoFAError}
            </span>
          )}

          <button
            type="button"
            className="continue-button"
            onClick={handle2FASubmit}
            disabled={isLoading}
            style={{ marginTop: "8px" }}
          >
            {isLoading ? <div className="loader"></div> : <span className="continue-text">Verify</span>}
          </button>

          <span
            className="signin-link"
            style={{ display: "block", textAlign: "center", marginTop: "16px", cursor: "pointer" }}
            onClick={() => { setIsBackupMode(!isBackupMode); setTwoFAError(""); setBackupCode(""); setTwoFACode(["","","","","",""]); }}
          >
            {isBackupMode ? "Use authenticator app instead" : "Use a backup code instead"}
          </span>

          <span
            className="signin-link"
            style={{ display: "block", textAlign: "center", marginTop: "12px", cursor: "pointer" }}
            onClick={() => { setShow2FA(false); setTwoFAError(""); }}
          >
            ← Back to login
          </span>
        </div>
      </div>
    );
  }

  // ── Normal Login Screen ──────────────────────────────────────
  return (
    <div className="main-container">
      
       <div className="image-container">
        <img src="https://images.pexels.com/photos/7614534/pexels-photo-7614534.jpeg" alt="bg-login" />
        
      </div>

      <div className="form-container">
        <h1 className="heading-title">Login to SmartProperty</h1>

        <p className="text">Sign in to your account</p>

        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <GmailButton />
        </GoogleOAuthProvider>

        <span className="or-text">Or</span>

        <div className="email-container">
          Email
          <div className={`email-input ${emailError ? "error" : ""}`}>
            <input
              type="email"
              value={email}
              placeholder="Enter your email"
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              disabled={isLoading}
            />
          </div>
          {emailError && <span className="input-error-text">{emailError}</span>}
        </div>

        <div className="password-container">
          Password
          <div className={`password-input ${passwordError ? "error" : ""}`} style={{ position: 'relative' }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              placeholder="Enter your password"
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError("");
              }}
              disabled={isLoading}
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
          {passwordError && <span className="input-error-text">{passwordError}</span>}
        </div>

       <div className="reset-password-container">
        
          <div className="remember-me-container">
            <input type="checkbox" id="rememberMe" disabled={isLoading} />
            <label htmlFor="rememberMe" className="remember-me">Remember me</label>
          </div>
          <span
            className="forgot-password"
            onClick={() => navigate('/forgot-password')}
            style={{ cursor: 'pointer' }}
          >
            Forgot password?
          </span>                
       </div>



       <button
  type="button"
  className="continue-button"
  onClick={handleLogin}
  disabled={isLoading}
>
  {isLoading ? (
    <div className="loader"></div>
  ) : (
    <span className="continue-text">Login</span>
  )}
</button>

        <span className="signin-redirect">
          Don't have an account?{" "}
          <span
            className="signin-link"
            onClick={() => navigate("/signup")}
          >
            Sign up
          </span>
        </span>

       

        <span className="terms-of-services">
          By signing in you agree to our{" "}
          <span className="underline">Terms of service</span> &{" "}
          <span className="underline">Privacy policy</span>
        </span>
      </div>
    </div>
  );
}