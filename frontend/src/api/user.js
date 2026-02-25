import { apiRequest } from "./client";

// Get current authenticated user (uses /api/users/profile)
export async function getCurrentUser() {
  const data = await apiRequest("/api/users/profile");
  // backend returns { message, user }
  return data.user;
}

// Mark multi-step onboarding / form as completed for current user
export async function completeOnboarding() {
  return apiRequest("/api/users/complete-onboarding", {
    method: "POST",
  });
}

