import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/login.css";
import toast from "../../utils/toast";

const API_BASE = "http://localhost:5000";

/**
 * TwoFactorSetup — Page obligatoire après le premier login
 *
 * Reçoit en state de navigation :
 *   { token, user }
 *   → token temporaire (sans 2FA) pour appeler les APIs protégées
 *
 * Étapes :
 *   1. Appelle POST /api/users/2fa/setup  → QR code + secret
 *   2. L'user scan avec son appli (Google Authenticator, Authy…)
 *   3. Saisit le code 6 chiffres → POST /api/users/2fa/verify
 *   4. Affiche les backup codes
 *   5. Redirige vers /form?step=1
 */
export default function TwoFactorSetup() {
  const navigate = useNavigate();
  const location = useLocation();

  // token temporaire passé en state depuis login
  const { token, user } = location.state || {};

  const [step, setStep] = useState(1); // 1=QR, 2=verify, 3=backup
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [setupError, setSetupError] = useState("");
  const inputRefs = useRef([]);

  // Si pas de token en state → rediriger vers login
  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  // Étape 1 : charger le QR code
  const fetchSetup = async () => {
    if (!token) return;
    setIsLoading(true);
    setSetupError("");
    try {
      const res = await fetch(`${API_BASE}/api/users/2fa/setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setSetupError("");
    } catch (err) {
      setSetupError(err.message || "Erreur lors de la génération du QR code");
      toast.error(err.message || "Erreur lors de la génération du QR code");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSetup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleOTPChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otpCode];
    updated[index] = value.slice(-1);
    setOtpCode(updated);
    setOtpError("");
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOTPKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOTPPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtpCode(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otpCode.join("");
    if (code.length < 6) {
      setOtpError("Enter the 6-digit code from your app");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/2fa/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token: code }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setBackupCodes(data.backupCodes);
      setStep(3);
    } catch (err) {
      setOtpError(err.message || "Invalid code. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    // Maintenant on stocke le token et on continue
    localStorage.setItem("token", token);
    if (user) localStorage.setItem("user", JSON.stringify(user));
    toast.success("2FA activated! Your account is now secure.");
    navigate("/form?step=1");
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    toast.success("Backup codes copied!");
  };

  if (!token) return null;

  return (
    <div className="main-container">
      <div className="image-container">
        <img
          src="https://images.pexels.com/photos/7614534/pexels-photo-7614534.jpeg"
          alt="bg-login"
        />
      </div>

      <div className="form-container">
        {/* ── Barre de progression ── */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "28px" }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: "4px",
                borderRadius: "4px",
                background: step >= s ? "#2563eb" : "#e2e8f0",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>

        {/* ══════════════════ STEP 1 — QR CODE ══════════════════ */}
        {step === 1 && (
          <>
            <h1 className="heading-title">Secure your account</h1>
            <p className="text" style={{ marginBottom: "20px" }}>
              Scan this QR code with <strong>Google Authenticator</strong> or{" "}
              <strong>Authy</strong>
            </p>

            {isLoading ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div className="loader" style={{ margin: "auto" }}></div>
                <p style={{ color: "#64748b", marginTop: "12px", fontSize: "14px" }}>Generating QR code...</p>
              </div>
            ) : setupError ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <p style={{ color: "#e53e3e", marginBottom: "16px", fontSize: "14px" }}>{setupError}</p>
                <button
                  className="continue-button"
                  style={{ background: "#f1f5f9", color: "#334155" }}
                  onClick={fetchSetup}
                >
                  <span className="continue-text">Retry</span>
                </button>
              </div>
            ) : (
              <>
                {qrCode && (
                  <div style={{ textAlign: "center", margin: "16px 0" }}>
                    <img
                      src={qrCode}
                      alt="QR Code 2FA"
                      style={{ width: "200px", height: "200px", borderRadius: "12px" }}
                    />
                  </div>
                )}

                <p className="text" style={{ fontSize: "12px", textAlign: "center", color: "#64748b" }}>
                  Can't scan? Enter this code manually:
                </p>
                <div
                  style={{
                    background: "#f1f5f9",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    fontFamily: "monospace",
                    fontSize: "13px",
                    wordBreak: "break-all",
                    textAlign: "center",
                    letterSpacing: "2px",
                    margin: "8px 0 24px",
                  }}
                >
                  {secret}
                </div>

                <button
                  className="continue-button"
                  onClick={() => setStep(2)}
                  disabled={!qrCode}
                >
                  <span className="continue-text">I've scanned the QR code →</span>
                </button>
              </>
            )}
          </>
        )}

        {/* ══════════════════ STEP 2 — VERIFY CODE ══════════════════ */}
        {step === 2 && (
          <>
            <h1 className="heading-title">Enter the code</h1>
            <p className="text" style={{ marginBottom: "24px" }}>
              Enter the 6-digit code shown in your authenticator app to confirm setup
            </p>

            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "center",
                margin: "8px 0 16px",
              }}
            >
              {otpCode.map((digit, i) => (
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
                    border: otpError ? "2px solid #e53e3e" : "2px solid #e2e8f0",
                    borderRadius: "10px",
                    outline: "none",
                  }}
                />
              ))}
            </div>

            {otpError && (
              <span
                className="input-error-text"
                style={{ textAlign: "center", display: "block", marginBottom: "12px" }}
              >
                {otpError}
              </span>
            )}

            <button
              className="continue-button"
              onClick={handleVerify}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="loader"></div>
              ) : (
                <span className="continue-text">Verify & Activate</span>
              )}
            </button>

            <span
              className="signin-link"
              style={{ display: "block", textAlign: "center", marginTop: "16px", cursor: "pointer" }}
              onClick={() => setStep(1)}
            >
              ← Back to QR code
            </span>
          </>
        )}

        {/* ══════════════════ STEP 3 — BACKUP CODES ══════════════════ */}
        {step === 3 && (
          <>
            <h1 className="heading-title">Save your backup codes</h1>
            <p className="text" style={{ marginBottom: "12px" }}>
              Store these codes somewhere safe. Each can be used once if you lose access to your
              authenticator app.
            </p>

            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "16px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                margin: "12px 0",
              }}
            >
              {backupCodes.map((code, i) => (
                <div
                  key={i}
                  style={{
                    fontFamily: "monospace",
                    fontSize: "14px",
                    letterSpacing: "2px",
                    padding: "6px 10px",
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    textAlign: "center",
                  }}
                >
                  {code}
                </div>
              ))}
            </div>

            <button
              className="continue-button"
              style={{ background: "#f1f5f9", color: "#334155", marginBottom: "10px" }}
              onClick={copyBackupCodes}
            >
              <span className="continue-text">Copy all codes</span>
            </button>

            <button className="continue-button" onClick={handleFinish}>
              <span className="continue-text">I've saved them — Continue</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
