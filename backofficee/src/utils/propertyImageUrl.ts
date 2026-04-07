const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/** Resolve property image path to full URL (same rules as MyProperties). */
export function resolvePropertyImageUrl(relativeUrl?: string | null): string {
  if (!relativeUrl) {
    return "/images/product/product-01.jpg";
  }
  const normalized = relativeUrl.replace(/\\/g, "/");
  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }
  const baseApi = API_URL.replace(/\/api$/, "");
  if (normalized.startsWith("/uploads/")) {
    return `${baseApi}${normalized}`;
  }
  if (normalized.startsWith("uploads/")) {
    return `${baseApi}/${normalized}`;
  }
  return `${baseApi}/${normalized}`;
}
