import { useState, useEffect } from "react";
import type { ProfileUser } from "../../pages/UserProfiles";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

interface WalletLinkingCardProps {
    user: ProfileUser & { walletNumber?: string };
    onUpdate: () => void;
}

export default function WalletLinkingCard({ user, onUpdate }: WalletLinkingCardProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [tempWalletNumber, setTempWalletNumber] = useState(user.walletNumber || "");
    const [balance, setBalance] = useState<number | null>(null);

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
        <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 bg-white dark:bg-white/[0.03]">
            <div className="flex flex-col gap-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-gray-100 dark:border-gray-800 pb-5">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <svg className="text-blue-600 dark:text-blue-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="20" height="14" x="2" y="5" rx="2" />
                                <line x1="2" x2="22" y1="10" y2="10" />
                            </svg>
                            <h4 className="text-lg font-bold text-gray-800 dark:text-white/90">
                                EasyWallet Account
                            </h4>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                            Manage your financial link for property payments and rental income.
                        </p>
                    </div>

                    {!user.walletNumber && !loading && (
                        <button
                            onClick={handleCreateWallet}
                            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-sm active:scale-95"
                        >
                            Create & Link Wallet
                        </button>
                    )}

                    {loading && !isEditing && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            Processing...
                        </div>
                    )}
                </div>

                {/* Main Content Sections */}
                {user.walletNumber && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Wallet Number Block */}
                        <div className="relative p-5 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 group">
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                        Wallet Number
                                    </span>
                                    {!isEditing && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                                            title="Edit Wallet"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                                <path d="m15 5 4 4" />
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                {isEditing ? (
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={tempWalletNumber}
                                            onChange={(e) => setTempWalletNumber(e.target.value)}
                                            className="w-full px-4 py-2.5 text-sm border-2 border-blue-100 dark:border-blue-900/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-white transition-all outline-none"
                                            placeholder="Enter 16-digit wallet number"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleUpdateWallet}
                                                disabled={loading}
                                                className="flex-1 px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                {loading ? "Saving..." : "Save Changes"}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setTempWalletNumber(user.walletNumber || "");
                                                }}
                                                disabled={loading}
                                                className="flex-1 px-4 py-2 text-xs font-bold text-gray-600 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className="text-lg font-mono font-bold text-gray-800 dark:text-white tracking-widest bg-white dark:bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800">
                                            {user.walletNumber.replace(/(\d{4})/g, '$1 ').trim()}
                                        </div>
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 rounded-lg border border-green-100 dark:border-green-900/30">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                            <span className="text-[10px] font-bold uppercase">Linked</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Balance Block */}
                        <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-900/05 border border-blue-100/50 dark:border-blue-900/20">
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-blue-400 dark:text-blue-500">
                                        Current Balance
                                    </span>
                                    <button
                                        onClick={fetchBalance}
                                        disabled={loading}
                                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors rounded-lg"
                                        title="Refresh Balance"
                                    >
                                        <svg className={loading ? "animate-spin" : ""} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                            <path d="M3 3v5h5" />
                                            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                                            <path d="M16 16h5v5" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-gray-800 dark:text-white">
                                        {balance !== null ? balance.toLocaleString(undefined, { minimumFractionDigits: 3 }) : "---"}
                                    </span>
                                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400">TND</span>
                                </div>

                                <div className="text-[10px] text-gray-400 dark:text-gray-500 italic">
                                    * Balance is fetched in real-time from EasyWallet service
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Notifications */}
            {error && (
                <div className="mt-6 flex items-center gap-3 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 px-4 py-3 rounded-xl border border-red-100 dark:border-red-900/20">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                    {error}
                </div>
            )}

            {success && (
                <div className="mt-6 flex items-center gap-3 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10 px-4 py-3 rounded-xl border border-green-100 dark:border-green-900/20">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    {success}
                </div>
            )}
        </div>
    );
}
