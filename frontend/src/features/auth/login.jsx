import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/login.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import GmailButton from "./GmailButton";
import toast from "../../utils/toast";
import { shouldAccessBackoffice, getRedirectUrl, storeUserData, redirectToBackofficeWithToken } from "../../utils/auth";

export default function Login() {
  const navigate = useNavigate();
  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      const response = await fetch("http://localhost:5000/api/users/login", {
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
          <span className="forgot-password">Forgot password?</span>                
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