import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from '../utils/toast';
import '../styles/login.css';

const API_BASE = 'http://localhost:5000';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();

  const [status, setStatus] = useState('verifying'); // verifying | valid | invalid
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      return;
    }
    const verify = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users/verify-reset-token/${token}`, {
          method: 'POST',
        });
        const data = await res.json();
        setStatus(data.success ? 'valid' : 'invalid');
      } catch {
        setStatus('invalid');
      }
    };
    verify();
  }, [token]);

  const handleReset = async () => {
    let hasError = false;
    if (!password) { setPasswordError('Please enter a new password'); hasError = true; }
    else if (password.length < 6) { setPasswordError('Minimum 6 characters'); hasError = true; }
    else setPasswordError('');

    if (!confirm) { setConfirmError('Please confirm your password'); hasError = true; }
    else if (password !== confirm) { setConfirmError('Passwords do not match'); hasError = true; }
    else setConfirmError('');

    if (hasError) return;
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/users/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || 'Reset failed');
        setIsLoading(false);
        return;
      }

      toast.success('Password reset successfully!');
      navigate('/login');
    } catch {
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
        {status === 'verifying' && (
          <>
            <h1 className="heading-title">Verifying link...</h1>
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div className="loader" style={{ margin: 'auto' }}></div>
            </div>
          </>
        )}

        {status === 'invalid' && (
          <>
            <h1 className="heading-title">Link expired</h1>
            <p className="text" style={{ color: '#e53e3e', marginBottom: '24px' }}>
              This reset link is invalid or has expired (10 min).
            </p>
            <button className="continue-button" onClick={() => navigate('/forgot-password')}>
              <span className="continue-text">Request a new link</span>
            </button>
          </>
        )}

        {status === 'valid' && (
          <>
            <h1 className="heading-title">Reset Password</h1>
            <p className="text" style={{ marginBottom: '24px' }}>
              Enter your new password below
            </p>

            <div className="password-container">
              New Password
              <div className={`password-input ${passwordError ? 'error' : ''}`} style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  placeholder="Enter new password"
                  onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                  disabled={isLoading}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '18px', color: '#94a3b8' }}
                >
                  {showPassword ? '🙈' : '👁'}
                </span>
              </div>
              {passwordError && <span className="input-error-text">{passwordError}</span>}
            </div>

            <div className="password-container" style={{ marginTop: '16px' }}>
              Confirm Password
              <div className={`password-input ${confirmError ? 'error' : ''}`} style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  placeholder="Confirm new password"
                  onChange={(e) => { setConfirm(e.target.value); setConfirmError(''); }}
                  disabled={isLoading}
                />
                <span
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '18px', color: '#94a3b8' }}
                >
                  {showConfirm ? '🙈' : '👁'}
                </span>
              </div>
              {confirmError && <span className="input-error-text">{confirmError}</span>}
            </div>

            <button
              type="button"
              className="continue-button"
              onClick={handleReset}
              disabled={isLoading}
              style={{ marginTop: '24px' }}
            >
              {isLoading ? <div className="loader"></div> : <span className="continue-text">Reset Password</span>}
            </button>
          </>
        )}

        <span className="signin-redirect" style={{ marginTop: '20px' }}>
          <span className="signin-link" onClick={() => navigate('/login')}>
            ← Back to Sign In
          </span>
        </span>
      </div>
    </div>
  );
};

export default ResetPassword;



