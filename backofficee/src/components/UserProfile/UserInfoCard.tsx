import { useEffect, useState } from "react";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import toast from "react-hot-toast";
import type { ProfileUser } from "../../pages/UserProfiles";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const resolveAvatarUrl = (avatarUrl?: string) => {
  if (!avatarUrl) return "";
  if (/^data:/i.test(avatarUrl) || /^https?:\/\//i.test(avatarUrl)) return avatarUrl;
  const base = API_URL.replace(/\/api$/, "");
  return avatarUrl.startsWith("/") ? `${base}${avatarUrl}` : `${base}/${avatarUrl}`;
};

interface UserInfoCardProps {
  user: ProfileUser;
  onProfileUpdated: () => void;
}

export default function UserInfoCard({ user, onProfileUpdated }: UserInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user.firstName ?? "");
  const [lastName, setLastName] = useState(user.lastName ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(resolveAvatarUrl(user.avatarUrl));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setPhone(user.phone ?? "");
    setAvatarPreview(resolveAvatarUrl(user.avatarUrl));
  }, [user]);

  const handleEdit = () => {
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setPhone(user.phone ?? "");
    setAvatarPreview(resolveAvatarUrl(user.avatarUrl));
    setAvatarFile(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setPhone(user.phone ?? "");
    setAvatarPreview(resolveAvatarUrl(user.avatarUrl));
    setAvatarFile(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const payload = new FormData();
      payload.append("firstName", firstName.trim() || "");
      payload.append("lastName", lastName.trim() || "");
      payload.append("phone", phone.trim() || "");
      if (avatarFile) payload.append("avatar", avatarFile);
      const res = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: payload,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.message || "Failed to update profile.");
        return;
      }
      setAvatarPreview(resolveAvatarUrl(data.user?.avatarUrl) || avatarPreview);
      setAvatarFile(null);
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("user-updated"));
      }
      toast.success("Profile updated successfully.");
      onProfileUpdated();
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("An error occurred while updating your profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      {!isEditing ? (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Personal Information
            </h4>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  First Name
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user.firstName || "—"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Last Name
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user.lastName || "—"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Email address
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user.email}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Phone
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user.phone || "—"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Role
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user.role}
                </p>
              </div>
            </div>
          </div>

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
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <h4 className="text-2xl font-semibold text-gray-800 dark:text-white/90 mb-2">
              Edit Personal Information
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Update your details to keep your profile up-to-date.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <div className="mb-6">
              <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90">
                Personal Information
              </h5>

              <div className="mb-6 rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Profile preview" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-2xl font-semibold text-gray-500 dark:text-gray-400">
                        {user.firstName?.[0] || user.lastName?.[0] || user.login?.[0] || "?"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white/90">Profile photo</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Upload a clear portrait to personalize your account.
                    </p>
                    <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
                      Change photo
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setAvatarFile(file);
                          if (!file) {
                            setAvatarPreview(resolveAvatarUrl(user.avatarUrl));
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = () => setAvatarPreview(String(reader.result || ""));
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">PNG, JPG or WEBP up to 5 MB.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="col-span-2 lg:col-span-1">
                  <Label>First Name</Label>
                  <Input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Last Name</Label>
                  <Input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Email Address</Label>
                  <Input type="text" value={user.email} disabled />
                  <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                    Email cannot be changed here.
                  </p>
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Phone</Label>
                  <Input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +216 12 345 678"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 lg:justify-end">
              <Button size="sm" variant="outline" type="button" onClick={handleCancel}>
                Close
              </Button>
              <Button size="sm" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
