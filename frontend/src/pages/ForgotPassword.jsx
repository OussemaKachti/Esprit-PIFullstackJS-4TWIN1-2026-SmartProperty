import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from '../utils/toast';
import '../styles/login.css';

const API_BASE = 'http://localhost:5000';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setEmailError('Please enter your email address');
      return;
    }
    setEmailError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/users/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || 'Something went wrong');
        setIsLoading(false);
        return;
      }

      setSubmitted(true);
    } catch (err) {
      toast.error('Network error. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="main-container">
      <div className="image-container">
        <img
          src="https://images.pexels.com/photos/7614534/pexels-photo-7614534.jpeg"
          alt="bg"
        />
      </div>

      <div className="form-container">
        {submitted ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '20px', fontSize: '48px' }}>📧</div>
            <h1 className="heading-title">Check your inbox</h1>
            <p className="text" style={{ marginBottom: '24px' }}>
              If <strong>{email}</strong> is registered, you will receive a password reset link
              within a few minutes. Check your spam folder if you don't see it.
            </p>
            <button
              className="continue-button"
              style={{ background: '#f1f5f9', color: '#334155', marginBottom: '16px' }}
              onClick={() => { setSubmitted(false); setEmail(''); }}
            >
              <span className="continue-text">Send again</span>
            </button>
            <span className="signin-redirect">
              <span className="signin-link" onClick={() => navigate('/login')}>
                ← Back to Sign In
              </span>
            </span>
          </>
        ) : (
          <>
            <h1 className="heading-title">Forgot Password?</h1>
            <p className="text">
              Enter your email and we'll send you a reset link
            </p>

            <div className="email-container" style={{ marginTop: '24px' }}>
              Email
              <div className={`email-input ${emailError ? 'error' : ''}`}>
                <input
                  type="email"
                  value={email}
                  placeholder="Enter your email"
                  onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                  disabled={isLoading}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
              </div>
              {emailError && <span className="input-error-text">{emailError}</span>}
            </div>

            <button
              type="button"
              className="continue-button"
              onClick={handleSubmit}
              disabled={isLoading}
              style={{ marginTop: '24px' }}
            >
              {isLoading ? (
                <div className="loader"></div>
              ) : (
                <span className="continue-text">Send Reset Link</span>
              )}
            </button>

            <span className="signin-redirect" style={{ marginTop: '20px' }}>
              Remember your password?{' '}
              <span className="signin-link" onClick={() => navigate('/login')}>
                Sign in
              </span>
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;



