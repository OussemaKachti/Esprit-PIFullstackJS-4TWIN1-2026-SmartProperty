import { useState } from "react";
import Button from "../ui/button/Button";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface TwoFactorAuthProps {
  twoFactorEnabled: boolean;
  onUpdate: () => void;
}

export default function TwoFactorAuth({
  twoFactorEnabled,
  onUpdate,
}: TwoFactorAuthProps) {
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [disablePassword, setDisablePassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"setup" | "verify" | "backup">("setup");

  // Setup 2FA - Generate QR Code
  const handleSetup2FA = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/users/2fa/setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to setup 2FA");
        return;
      }

      setQrCode(data.qrCode);
      setSecret(data.manualEntry);
      setShowSetupModal(true);
      setStep("setup");
    } catch (err) {
      console.error("Error setting up 2FA:", err);
      toast.error("An error occurred while setting up 2FA");
    } finally {
      setLoading(false);
    }
  };

  // Verify 2FA code and enable
  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/users/2fa/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ token: verificationCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Invalid verification code");
        return;
      }

      setBackupCodes(data.backupCodes);
      setStep("backup");
      toast.success("2FA enabled successfully!");
    } catch (err) {
      console.error("Error verifying 2FA:", err);
      toast.error("An error occurred while verifying the code");
    } finally {
      setLoading(false);
    }
  };

  // Disable 2FA
  const handleDisable2FA = async () => {
    if (!disablePassword) {
      toast.error("Please enter your password");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/users/2fa/disable`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ password: disablePassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to disable 2FA");
        return;
      }

      toast.success("2FA disabled successfully");
      setShowDisableModal(false);
      setDisablePassword("");
      onUpdate();
    } catch (err) {
      console.error("Error disabling 2FA:", err);
      toast.error("An error occurred while disabling 2FA");
    } finally {
      setLoading(false);
    }
  };

  // Close setup modal and refresh
  const handleCloseSetup = () => {
    setShowSetupModal(false);
    setQrCode("");
    setSecret("");
    setVerificationCode("");
    setBackupCodes([]);
    setStep("setup");
    if (step === "backup") {
      onUpdate();
    }
  };

  // Download backup codes
  const downloadBackupCodes = () => {
    const text = `SmartProperty 2FA Backup Codes\n\n${backupCodes.join("\n")}\n\nKeep these codes in a safe place. Each code can only be used once.`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "smartproperty-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <svg
                className="w-6 h-6 text-gray-700 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Two-Factor Authentication
              </h4>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Add an extra layer of security to your account. You'll need to
              enter a code from your authenticator app when you sign in.
            </p>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Status:
              </span>
              {twoFactorEnabled ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Enabled
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Disabled
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            {twoFactorEnabled ? (
              <button
                onClick={() => setShowDisableModal(true)}
                className="flex items-center justify-center gap-2 rounded-full border border-red-300 bg-white px-4 py-3 text-sm font-medium text-red-600 shadow-theme-xs hover:bg-red-50 dark:border-red-900 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Disable 2FA
              </button>
            ) : (
              <button
                onClick={handleSetup2FA}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-full bg-primary-600 px-4 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                {loading ? "Setting up..." : "Enable 2FA"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Setup Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {step === "setup" && "Setup Two-Factor Authentication"}
                  {step === "verify" && "Verify Your Code"}
                  {step === "backup" && "Save Your Backup Codes"}
                </h3>
                <button
                  onClick={handleCloseSetup}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Step 1: QR Code */}
              {step === "setup" && (
                <div>
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Scan this QR code with your authenticator app (Google
                      Authenticator, Authy, etc.)
                    </p>
                    <div className="flex justify-center p-4 bg-white rounded-lg">
                      <img
                        src={qrCode}
                        alt="QR Code"
                        className="w-64 h-64"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Or enter this code manually:
                    </p>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <code className="flex-1 text-sm font-mono text-gray-800 dark:text-gray-200">
                        {secret}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(secret);
                          toast.success("Copied to clipboard");
                        }}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      >
                        <svg
                          className="w-4 h-4 text-gray-600 dark:text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => setStep("verify")}
                  >
                    Continue
                  </Button>
                </div>
              )}

              {/* Step 2: Verify Code */}
              {step === "verify" && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Enter the 6-digit code from your authenticator app to verify
                    and enable 2FA.
                  </p>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setVerificationCode(value);
                      }}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setStep("setup")}
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleVerify2FA}
                      disabled={loading || verificationCode.length !== 6}
                    >
                      {loading ? "Verifying..." : "Verify & Enable"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Backup Codes */}
              {step === "backup" && (
                <div>
                  <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
                    <div className="flex gap-3">
                      <svg
                        className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-500">
                          Save these backup codes
                        </h4>
                        <p className="text-xs text-yellow-700 dark:text-yellow-600 mt-1">
                          You can use these codes to access your account if you
                          lose access to your authenticator app. Each code can
                          only be used once.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-2">
                      {backupCodes.map((code, index) => (
                        <div
                          key={index}
                          className="p-2 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700"
                        >
                          <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
                            {code}
                          </code>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={downloadBackupCodes}
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Download
                    </Button>
                    <Button className="flex-1" onClick={handleCloseSetup}>
                      Done
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Disable Modal */}
      {showDisableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Disable Two-Factor Authentication
                </h3>
                <button
                  onClick={() => {
                    setShowDisableModal(false);
                    setDisablePassword("");
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-400">
                  Disabling 2FA will make your account less secure. Enter your
                  password to confirm.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowDisableModal(false);
                    setDisablePassword("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={handleDisable2FA}
                  disabled={loading || !disablePassword}
                >
                  {loading ? "Disabling..." : "Disable 2FA"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
