import { useState, useEffect } from "react";

const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:5000/api";

export default function WalletLinkingCard({ user, onUpdate }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [tempWalletNumber, setTempWalletNumber] = useState(user.walletNumber || "");
    const [balance, setBalance] = useState(null);

    const fetchBalance = async () => {
        if (!user.walletNumber) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/easy-wallet/balance`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
                setBalance(data.data.balance);
            }
        } catch (err) {
            console.error("Error fetching balance:", err);
        }
    };

    useEffect(() => {
        setTempWalletNumber(user.walletNumber || "");
        if (user.walletNumber) {
            fetchBalance();
        } else {
            setBalance(null);
        }
    }, [user.walletNumber]);

    const handleCreateWallet = async () => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            const token = localStorage.getItem("token");
            if (!token) {
                setError("You are not authenticated.");
                return;
            }

            const res = await fetch(`${API_URL}/easy-wallet/create`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId: user._id })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Failed to create wallet.");
                return;
            }

            setSuccess("Wallet created and linked successfully!");
            onUpdate();
        } catch (err) {
            console.error("Wallet creation error:", err);
            setError("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateWallet = async () => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            const token = localStorage.getItem("token");
            if (!token) {
                setError("You are not authenticated.");
                return;
            }

            const res = await fetch(`${API_URL}/users/profile`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    walletNumber: tempWalletNumber,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Failed to update wallet number.");
                return;
            }

            setSuccess("Wallet number updated successfully!");
            setIsEditing(false);
            onUpdate();
        } catch (err) {
            console.error("Wallet update error:", err);
            setError("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card shadow-none border-0 bg-transparent">
            <div className="d-flex justify-content-between align-items-end mb-4">
                <div>
                    <h5 className="mb-1 fw-bold text-dark fs-4" style={{ letterSpacing: '-0.5px' }}>
                        Payment Wallet
                    </h5>
                    <p className="text-muted mb-0 small">Manage your EasyWallet connection</p>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger rounded-4 border-0 d-flex align-items-center mb-4 py-3" role="alert" style={{ backgroundColor: '#fef2f2', color: '#991b1b' }}>
                    <i className="material-icons-outlined me-2">error_outline</i>
                    {error}
                </div>
            )}

            {success && (
                <div className="alert alert-success rounded-4 border-0 d-flex align-items-center mb-4 py-3" role="alert" style={{ backgroundColor: '#f0fdf4', color: '#166534' }}>
                    <i className="material-icons-outlined me-2">check_circle</i>
                    {success}
                </div>
            )}

            {user.walletNumber ? (
                !isEditing ? (
                    <div
                        className="position-relative p-4 p-sm-5 text-white shadow"
                        style={{
                            borderRadius: '24px',
                            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Decorative background element */}
                        <div className="position-absolute" style={{ top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }}></div>

                        <div className="d-flex justify-content-between align-items-start mb-5 position-relative z-index-1">
                            <div>
                                <p className="mb-1 text-white-50 small fw-medium text-uppercase" style={{ letterSpacing: '1px' }}>Total Balance</p>
                                <h2 className="display-4 fw-bold mb-0 text-white" style={{ letterSpacing: '-1px' }}>
                                    {balance !== null ? balance.toLocaleString(undefined, { minimumFractionDigits: 3 }) : "—"} <span className="fs-5 fw-normal text-white-50">TND</span>
                                </h2>
                            </div>
                            <button
                                onClick={fetchBalance}
                                className="btn btn-link text-white-50 p-2 text-decoration-none transition-all shadow-none"
                                disabled={loading}
                                title="Refresh Balance"
                            >
                                <i className={`material-icons-outlined ${loading ? 'spin' : ''}`} style={{ fontSize: '24px' }}>sync</i>
                            </button>
                        </div>

                        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-end gap-4 position-relative z-index-1">
                            <div>
                                <p className="mb-1 text-white-50 small fw-medium text-uppercase" style={{ letterSpacing: '1px' }}>Wallet Number</p>
                                <p className="mb-0 fw-medium fs-4 font-monospace text-white" style={{ letterSpacing: '3px' }}>
                                    {user.walletNumber.replace(/(\d{4})/g, '$1 ').trim()}
                                </p>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <span className="badge rounded-pill text-white border border-white-50" style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '8px 14px', fontWeight: '500' }}>
                                    <span className="d-inline-block bg-success rounded-circle me-2" style={{ width: '6px', height: '6px' }}></span>
                                    Active
                                </span>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm"
                                    style={{ width: '42px', height: '42px' }}
                                    title="Edit Wallet Info"
                                >
                                    <i className="material-icons-outlined text-dark" style={{ fontSize: '18px' }}>edit</i>
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="card border-0 shadow-sm" style={{ borderRadius: '24px', backgroundColor: '#f8fafc' }}>
                        <div className="card-body p-4 p-sm-5">
                            <h5 className="fw-semibold mb-4 text-dark">Update Wallet Number</h5>
                            <div className="mb-4">
                                <label className="form-label fw-medium text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Wallet Number</label>
                                <input
                                    type="text"
                                    className="form-control form-control-lg rounded-4 fw-medium font-monospace shadow-none border-0 bg-white"
                                    value={tempWalletNumber}
                                    onChange={(e) => setTempWalletNumber(e.target.value)}
                                    placeholder="Enter 16-digit wallet number"
                                    style={{ padding: '16px 20px', fontSize: '18px' }}
                                    autoFocus
                                />
                            </div>

                            <div className="d-flex gap-3 mt-5">
                                <button
                                    onClick={handleUpdateWallet}
                                    disabled={loading}
                                    className="btn px-4 py-3 rounded-pill fw-medium flex-grow-1 text-white"
                                    style={{ backgroundColor: '#0f172a', border: 'none' }}
                                >
                                    {loading ? "Saving..." : "Save Changes"}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setTempWalletNumber(user.walletNumber || "");
                                    }}
                                    disabled={loading}
                                    className="btn px-4 py-3 rounded-pill fw-medium bg-white border-0 text-dark shadow-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )
            ) : (
                <div className="p-5 text-center d-flex flex-column align-items-center justify-content-center border rounded-4" style={{ borderColor: '#e2e8f0', backgroundColor: '#f8fafc', minHeight: '320px', borderStyle: 'dashed' }}>
                    <div className="mb-4 d-flex justify-content-center align-items-center rounded-circle" style={{ width: '80px', height: '80px', backgroundColor: '#e2e8f0' }}>
                        <i className="material-icons-outlined text-slate-500" style={{ fontSize: '32px', color: '#64748b' }}>account_balance_wallet</i>
                    </div>
                    <h4 className="fw-semibold mb-2 text-dark">No Wallet Connected</h4>
                    <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '300px' }}>
                        Link your EasyWallet to seamlessly handle property transactions and view your balance instantly.
                    </p>
                    <button
                        onClick={handleCreateWallet}
                        className="btn px-5 py-3 rounded-pill fw-medium shadow-sm text-white transition-all d-flex align-items-center gap-2"
                        style={{ backgroundColor: '#0f172a' }}
                        disabled={loading}
                    >
                        {loading && <span className="spinner-border spinner-border-sm" role="status"></span>}
                        {loading ? 'Creating...' : 'Create & Connect Now'}
                    </button>
                </div>
            )}
        </div>
    );
}
