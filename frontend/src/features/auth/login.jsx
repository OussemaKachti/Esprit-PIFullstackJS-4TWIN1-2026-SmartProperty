import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/login.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import GmailButton from "./GmailButton";

export default function Login() {
  const navigate = useNavigate();
  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    setLoginError("");

    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoginError(data.message || "Login failed");
        setIsLoading(false);
        return;
      }

      // Store JWT token
      localStorage.setItem("token", data.token);

      // Redirect or update UI as needed
      navigate("/form");
    } catch (error) {
      setLoginError("An error occurred. Please try again.");
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
          <div className={`password-input ${passwordError ? "error" : ""}`}>
            <input
              type="password"
              value={password}
              placeholder="Enter your password"
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError("");
              }}
              disabled={isLoading}
            />
          </div>
          {passwordError && <span className="input-error-text">{passwordError}</span>}
        </div>

        {loginError && (
          <span className="input-error-text" style={{ marginTop: "10px", width: "100%", maxWidth: "536px" }}>
            {loginError}
          </span>
        )}

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