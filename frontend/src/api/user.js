import { apiRequest } from "./client";

export async function getCurrentUser() {
  const data = await apiRequest("/api/users/profile", { base: "backend" });
  return data.user;
}

export async function completeOnboarding() {
  return apiRequest("/api/users/complete-onboarding", {
    method: "POST",
    base: "backend",
  });
}

export async function updateCurrentUserProfile(payload) {
  const data = await apiRequest('/api/users/profile', {
    method: 'PUT',
    base: 'backend',
    body: payload instanceof FormData ? payload : JSON.stringify(payload),
  });
  return data.user;
}

export async function requestPasswordReset(email) {
  return apiRequest('/api/users/forgot-password', {
    method: 'POST',
    base: 'backend',
    body: JSON.stringify({ email }),
  });
}

