import { useEffect, useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import UserAddressCard from "../components/UserProfile/UserAddressCard";
import PageMeta from "../components/common/PageMeta";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export type ProfileUser = {
  id: string;
  login: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: string;
  twoFactorEnabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export default function UserProfiles() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please sign in to view your profile.");
        setUser(null);
        return;
      }
      const res = await fetch(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 401) {
          setError("Session expired. Please sign in again.");
          setUser(null);
          return;
        }
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Failed to load profile.");
        setUser(null);
        return;
      }
      const data = await res.json();
      setUser(data.user || null);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("An error occurred while loading your profile.");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <>
      <PageMeta
        title="Profile | SmartProperty Backoffice"
        description="View and edit your profile."
      />
      <PageBreadcrumb pageTitle="Profile" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>

        {loading && (
          <div className="flex items-center justify-center py-12 text-sm text-gray-500 dark:text-gray-400">
            Loading profile...
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        )}

        {!loading && !error && user && (
          <div className="space-y-6">
            <UserMetaCard user={user} />
            <UserInfoCard user={user} onProfileUpdated={fetchProfile} />
            <UserAddressCard />
          </div>
        )}
      </div>
    </>
  );
}
