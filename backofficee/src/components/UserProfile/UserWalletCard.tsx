import { useState, useEffect } from "react";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import toast from "react-hot-toast";
import type { ProfileUser } from "../../pages/UserProfiles";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type UserWalletCardProps = {
    user: ProfileUser;
    onProfileUpdated: () => void;
};

export default function UserWalletCard({ user, onProfileUpdated }: UserWalletCardProps) {
    const [loading, setLoading] = useState(false);
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

    const handleEdit = () => {
        setTempWalletNumber(user.walletNumber || "");
        setIsEditing(true);
    };

    const handleCancel = () => {
        setTempWalletNumber(user.walletNumber || "");
        setIsEditing(false);
    };

    const handleCreateWallet = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("You are not authenticated.");
                return;
            }

            const res = await fetch(`${API_URL}/easy-wallet/create`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId: user.id })
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Failed to create wallet.");
                return;
            }

            toast.success("Wallet created and linked successfully!");
            onProfileUpdated();
        } catch (err) {
            console.error("Wallet creation error:", err);
            toast.error("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateWallet = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("You are not authenticated.");
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
                toast.error(data.message || "Failed to update wallet number.");
                return;
            }

            toast.success("Wallet number updated successfully!");
            setIsEditing(false);
            onProfileUpdated();
        } catch (err) {
            console.error("Wallet update error:", err);
            toast.error("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
            {!isEditing ? (
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
                            EasyWallet Details
                        </h4>

                        {user.walletNumber ? (
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                                <div>
                                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                        Wallet Number
                                    </p>
                                    <p className="text-sm font-medium text-gray-800 dark:text-white/90 font-mono">
                                        {user.walletNumber.replace(/(\d{4})/g, '$1 ').trim()}
                                    </p>
                                </div>

                                <div>
                                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                        Current Balance
                                    </p>
                                    <div className="flex gap-2 items-center">
                                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            {balance !== null ? balance.toLocaleString(undefined, { minimumFractionDigits: 3 }) : "—"} TND
                                        </p>
                                        <button onClick={fetchBalance} title="Refresh Balance" className="text-gray-400 hover:text-blue-500 transition-colors">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                                <path d="M3 3v5h5" />
                                                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                                                <path d="M16 16h5v5" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                        Status
                                    </p>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                                        Active & Linked
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                You have not linked an EasyWallet account yet.
                            </p>
                        )}
                    </div>

                    {!user.walletNumber ? (
                        <button
                            onClick={handleCreateWallet}
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto disabled:opacity-50"
                        >
                            {loading ? "Creating..." : "Create & Link Wallet"}
                        </button>
                    ) : (
                        <button
                            onClick={handleEdit}
                            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
                        >
                            <svg
                                className="fill-current"
                                width="18"
                                height="18"
                                viewBox="0 0 18 18"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                                    fill=""
                                />
                            </svg>
                            Edit
                        </button>
                    )}
                </div>
            ) : (
                <div>
                    <div className="mb-6">
                        <h4 className="text-2xl font-semibold text-gray-800 dark:text-white/90 mb-2">
                            Edit Wallet Details
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Update your EasyWallet link to ensure accurate property payments.
                        </p>
                    </div>

                    <form onSubmit={handleUpdateWallet}>
                        <div className="mb-6">
                            <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90">
                                Wallet Information
                            </h5>

                            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                                <div className="col-span-2 lg:col-span-1">
                                    <Label>Wallet Number</Label>
                                    <Input
                                        type="text"
                                        value={tempWalletNumber}
                                        onChange={(e) => setTempWalletNumber(e.target.value)}
                                        placeholder="Enter 16-digit wallet number"
                                    />
                                    <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                                        Typically 16 digits.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 lg:justify-end">
                            <Button size="sm" variant="outline" type="button" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button size="sm" type="submit" disabled={loading}>
                                {loading ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
