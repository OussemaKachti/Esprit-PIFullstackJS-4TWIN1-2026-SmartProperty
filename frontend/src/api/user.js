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

