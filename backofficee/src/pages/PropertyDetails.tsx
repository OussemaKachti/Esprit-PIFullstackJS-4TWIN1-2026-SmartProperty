import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import PageMeta from "../components/common/PageMeta";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Fix Leaflet default icon issue (Vite/React)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Component to animate map view when position changes
function ChangeMapView({ center }: { center: [number, number] }) {
  const map = useMap();
  const mapRef = useRef(map);

  useEffect(() => {
    mapRef.current.flyTo(center, 15, { duration: 1.5 });
  }, [center]);

  return null;
}

type PropertyDetails = {
  _id: string;
  reference: string;
  title: string;
  description?: string;
  type: string;
  listingType?: string;
  status?: string;
  price: number;
  surface?: number;
  rooms?: number;
  bathrooms?: number;
  address?: string;
  city: string;
  region?: string;
  country?: string;
  images?: { url: string }[];
  location?: {
    type?: string;
    coordinates?: [number, number]; // [longitude, latitude]
  };
  createdAt: string;
  updatedAt: string;
};

type FeedbackAuthor = {
  firstName?: string;
  lastName?: string;
  login?: string;
  email?: string;
};

type PropertyFeedback = {
  _id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  authorId?: FeedbackAuthor | string;
};

const formattedPrice = (price: number | undefined | null) => {
  if (price == null) return "—";
  try {
    return `${new Intl.NumberFormat("fr-TN").format(price)} TND`;
  } catch {
    return `${price} TND`;
  }
};

const feedbackAuthorLabel = (author: FeedbackAuthor | string | undefined) => {
  if (!author || typeof author === "string") return "Visitor";
  const name = `${author.firstName || ""} ${author.lastName || ""}`.trim();
  return name || author.login || author.email || "Visitor";
};

const feedbackAuthorInitials = (author: FeedbackAuthor | string | undefined) => {
  const label = feedbackAuthorLabel(author);
  const parts = label.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return label.slice(0, 2).toUpperCase() || "?";
};

const starsForRating = (rating: number) => {
  const r = Math.min(5, Math.max(0, Math.round(Number(rating) || 0)));
  return "★".repeat(r) + "☆".repeat(5 - r);
};

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [sectionsOpen, setSectionsOpen] = useState({
    description: true,
    features: true,
    about: false,
    location: false,
    reviews: true,
  });
  const [reviewList, setReviewList] = useState<PropertyFeedback[]>([]);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [reviewAvg, setReviewAvg] = useState<string | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    const loadProperty = async () => {
      if (!id) {
        setError("Property id is missing.");
        setIsLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/properties/${id}`, {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : undefined,
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("Failed to load property details:", text);
          setError("Unable to load property details.");
          setIsLoading(false);
          return;
        }

        const data = await res.json();
        const payload = data.data || data.property || data;
        setProperty(payload);
      } catch (err) {
        console.error("Error while loading property details:", err);
        setError("An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProperty();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setReviewsLoading(true);
      try {
        const [sumRes, listRes] = await Promise.all([
          fetch(`${API_URL}/feedbacks/summary?propertyId=${encodeURIComponent(id)}`),
          fetch(`${API_URL}/feedbacks?propertyId=${encodeURIComponent(id)}&limit=100`),
        ]);
        const sumJ = await sumRes.json();
        const listJ = await listRes.json();
        if (cancelled) return;
        const list = (listJ?.data?.feedbacks as PropertyFeedback[]) || [];
        setReviewList(list);
        const byProp = sumJ?.data?.byProperty || {};
        const summary = byProp[id];
        if (summary?.totalReviews) {
          setReviewAvg(String(summary.averageRating ?? "0"));
          setReviewTotal(Number(summary.totalReviews));
        } else if (list.length > 0) {
          const avg =
            list.reduce((s, f) => s + (Number(f.rating) || 0), 0) / list.length;
          setReviewAvg(avg.toFixed(1));
          setReviewTotal(list.length);
        } else {
          setReviewAvg(null);
          setReviewTotal(0);
        }
      } catch {
        if (!cancelled) {
          setReviewList([]);
          setReviewTotal(0);
          setReviewAvg(null);
        }
      } finally {
        if (!cancelled) setReviewsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [property?._id]);

  // Geocode address - always geocode if address exists, even if coordinates are stored
  useEffect(() => {
    if (!property) {
      setMapPosition(null);
      return;
    }

    // Build address parts for geocoding
    const addressParts = [
      property.address,
      property.city,
      property.region,
      property.country || "Tunisia",
    ].filter(Boolean);

    // If no address at all, check if we have valid stored coordinates
    if (addressParts.length === 0) {
      const coords = property.location?.coordinates;
      if (coords && Array.isArray(coords) && coords.length === 2) {
        const [lon, lat] = coords;
        if (Number.isFinite(lon) && Number.isFinite(lat) && lon !== 0 && lat !== 0) {
          console.log("No address, using stored coordinates:", [lat, lon]);
          setMapPosition([lat, lon]);
          return;
        }
      }
      console.log("No address parts and no valid coordinates, using default Tunis");
      setMapPosition([36.8065, 10.1815]); // Default: Tunis
      return;
    }

    // Always geocode the address if it exists (even if coordinates are stored)
    // This ensures the map shows the correct location based on the address
    const query = addressParts.join(", ");
    console.log("Geocoding address:", query);
    
    const geocodeTimeout = setTimeout(async () => {
      try {
        // Try with full address first
        let res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1&countrycodes=tn`,
          {
            headers: {
              'User-Agent': 'SmartProperty/1.0'
            }
          }
        );
        let data = await res.json();
        
        // If no results, try with just address + city
        if (!data || data.length === 0) {
          const simplifiedQuery = [property.address, property.city].filter(Boolean).join(", ");
          console.log("No results, trying simplified query:", simplifiedQuery);
          res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(simplifiedQuery)}&limit=1&addressdetails=1&countrycodes=tn`,
            {
              headers: {
                'User-Agent': 'SmartProperty/1.0'
              }
            }
          );
          data = await res.json();
        }
        
        console.log("Geocoding response:", data);
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          if (Number.isFinite(lat) && Number.isFinite(lon)) {
            console.log("Geocoded coordinates:", [lat, lon], "for address:", query);
            setMapPosition([lat, lon]);
          } else {
            console.log("Invalid coordinates from geocoding, using default");
            setMapPosition([36.8065, 10.1815]); // Default: Tunis
          }
        } else {
          console.log("No results from geocoding, using default");
          setMapPosition([36.8065, 10.1815]); // Default: Tunis
        }
      } catch (err) {
        console.error("Geocoding error:", err);
        setMapPosition([36.8065, 10.1815]); // Default: Tunis
      }
    }, 500);

    return () => clearTimeout(geocodeTimeout);
  }, [property]);

  const resolveImageUrl = (relativeUrl?: string) => {
    if (!relativeUrl) {
      return "https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg?auto=compress&cs=tinysrgb&w=1200";
    }

    // Normalise les backslashes Windows -> slashes
    const normalized = relativeUrl.replace(/\\/g, "/");

    // Si c'est déjà une URL absolue (http/https), on la renvoie telle quelle
    if (/^https?:\/\//i.test(normalized)) {
      return normalized;
    }

    // si ça commence par /uploads ou uploads -> pointer vers backend
    const baseApi = API_URL.replace(/\/api$/, "");
    if (normalized.startsWith("/uploads/")) {
      return `${baseApi}${normalized}`;
    }
    if (normalized.startsWith("uploads/")) {
      return `${baseApi}/${normalized}`;
    }

    return `${baseApi}/${normalized}`;
  };

  const imageUrls = (() => {
    const imgs = property?.images ?? [];
    if (!imgs || imgs.length === 0) return [resolveImageUrl()];
    return imgs.map((img) => resolveImageUrl(img.url));
  })();

  const safeImageIndex = Math.min(currentImageIndex, imageUrls.length - 1);
  const currentImageUrl = imageUrls[safeImageIndex];
  const canNavigateImages = imageUrls.length > 1;

  const goPrevImage = () => {
    if (!canNavigateImages) return;
    setCurrentImageIndex((i) => (i - 1 + imageUrls.length) % imageUrls.length);
  };

  const goNextImage = () => {
    if (!canNavigateImages) return;
    setCurrentImageIndex((i) => (i + 1) % imageUrls.length);
  };

  const mapCenter: [number, number] = mapPosition || [36.8065, 10.1815]; // Default: Tunis

  const displayAddress =
    property?.address?.trim() ||
    [property?.city, property?.region, property?.country || "Tunisia"]
      .filter(Boolean)
      .join(", ");

  // Force map to re-render when position changes
  const mapKey = mapPosition ? `${mapPosition[0]}-${mapPosition[1]}` : 'default';

  return (
    <>
      <PageMeta
        title={
          property
            ? `${property.title} | Property Details`
            : "Property Details | SmartProperty Backoffice"
        }
        description="Detailed view of a property."
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {property?.title || "Property details"}
            </h1>
            {property && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Ref: <span className="font-mono">{property.reference}</span>
              </p>
            )}
          </div>
          <Link
            to="/my-properties"
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700"
          >
            ← Back to My Properties
          </Link>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16 text-sm text-gray-500 dark:text-gray-400">
            Loading property details...
          </div>
        )}

        {error && !isLoading && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        )}

        {property && !isLoading && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            {/* Left column: images + accordions */}
            <div className="space-y-6">
              {/* Main image + thumbnails */}
              <div className="overflow-hidden bg-white border border-gray-200 rounded-2xl shadow-sm dark:bg-gray-900 dark:border-gray-800">
                <div className="relative">
                  <img
                    src={currentImageUrl}
                    alt={property.title}
                    className="object-contain w-full h-72 md:h-96 bg-gray-50 dark:bg-gray-800"
                  />

                  {canNavigateImages && (
                    <>
                      <button
                        type="button"
                        onClick={goPrevImage}
                        aria-label="Previous image"
                        className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70 transition-colors"
                      >
                        <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M12.5 15l-5-5 5-5" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={goNextImage}
                        aria-label="Next image"
                        className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70 transition-colors"
                      >
                        <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M7.5 5l5 5-5 5" />
                        </svg>
                      </button>

                      <div className="absolute right-3 top-3 rounded-full bg-black/50 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
                        {safeImageIndex + 1}/{imageUrls.length}
                      </div>
                    </>
                  )}

                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-4 py-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <div>
                      <div className="text-lg font-semibold text-white">
                        {formattedPrice(property.price)}
                      </div>
                      <p className="text-xs text-gray-200">
                        {property.city}, {property.country || "Tunisia"}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-semibold text-white rounded-full bg-indigo-500/90">
                      {property.type}
                    </span>
                  </div>
                </div>

                {property.images && property.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-1 p-3 border-t border-gray-100 dark:border-gray-800">
                    {imageUrls.slice(0, 8).map((url, index) => (
                      <button
                        key={url + index}
                        type="button"
                        onClick={() => setCurrentImageIndex(index)}
                        className={`overflow-hidden rounded-xl border transition-colors ${
                          index === safeImageIndex
                            ? "border-brand-500 ring-2 ring-brand-500/30"
                            : "border-gray-100 hover:border-gray-200 dark:border-gray-800 dark:hover:border-gray-700"
                        }`}
                        aria-label={`View image ${index + 1}`}
                      >
                        <img
                          src={url}
                          alt={`${property.title} ${index + 1}`}
                          className="object-cover w-full h-20"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Accordions-like sections */}
              <div className="space-y-4">
                {/* Description */}
                <div className="border border-gray-200 rounded-2xl bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <button
                    type="button"
                    onClick={() =>
                      setSectionsOpen((prev) => ({
                        ...prev,
                        description: !prev.description,
                      }))
                    }
                    className="flex w-full items-center justify-between px-5 py-4 text-base font-semibold text-gray-900 border-b border-gray-100 rounded-t-2xl dark:text-gray-100 dark:border-gray-800"
                  >
                    <span>Description</span>
                    <span
                      className={`transition-transform ${sectionsOpen.description ? "rotate-180" : ""}`}
                    >
                      ▾
                    </span>
                  </button>
                  {sectionsOpen.description && (
                    <div className="px-5 py-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                      {property.description ? (
                        <p className="whitespace-pre-line">
                          {property.description}
                        </p>
                      ) : (
                        <p>No description provided for this property.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Property features */}
                <div className="border border-gray-200 rounded-2xl bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <button
                    type="button"
                    onClick={() =>
                      setSectionsOpen((prev) => ({
                        ...prev,
                        features: !prev.features,
                      }))
                    }
                    className="flex w-full items-center justify-between px-5 py-4 text-base font-semibold text-gray-900 border-b border-gray-100 rounded-t-2xl dark:text-gray-100 dark:border-gray-800"
                  >
                    <span>Property Features</span>
                    <span
                      className={`transition-transform ${sectionsOpen.features ? "rotate-180" : ""}`}
                    >
                      ▾
                    </span>
                  </button>
                  {sectionsOpen.features && (
                    <div className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <p className="mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Type
                          </p>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {property.type}
                          </p>
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Status
                          </p>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {property.status || "AVAILABLE"}
                          </p>
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Listing
                          </p>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {property.listingType === "FOR_RENT"
                              ? "For Rent"
                              : "For Sale"}
                          </p>
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Surface
                          </p>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {property.surface
                              ? `${property.surface} m²`
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Rooms
                          </p>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {property.rooms ?? "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Bathrooms
                          </p>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {property.bathrooms ?? "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* About Property (texte marketing générique pour l’instant) */}
                <div className="border border-gray-200 rounded-2xl bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <button
                    type="button"
                    onClick={() =>
                      setSectionsOpen((prev) => ({
                        ...prev,
                        about: !prev.about,
                      }))
                    }
                    className="flex w-full items-center justify-between px-5 py-4 text-base font-semibold text-gray-900 border-b border-gray-100 rounded-t-2xl dark:text-gray-100 dark:border-gray-800"
                  >
                    <span>About Property</span>
                    <span
                      className={`transition-transform ${sectionsOpen.about ? "rotate-180" : ""}`}
                    >
                      ▾
                    </span>
                  </button>
                  {sectionsOpen.about && (
                    <div className="px-5 py-4 text-sm text-gray-600 space-y-2 dark:text-gray-300">
                      <p>
                        This property offers an excellent living experience with a balanced
                        combination of comfort, accessibility and neighborhood amenities.
                      </p>
                      <p>
                        Located in {property.city}, {property.country || "Tunisia"}, it is ideal
                        for owners looking for a modern and practical space.
                      </p>
                    </div>
                  )}
                </div>

                {/* Location */}
                <div className="border border-gray-200 rounded-2xl bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <button
                    type="button"
                    onClick={() =>
                      setSectionsOpen((prev) => ({
                        ...prev,
                        location: !prev.location,
                      }))
                    }
                    className="flex w-full items-center justify-between px-5 py-4 text-base font-semibold text-gray-900 border-b border-gray-100 rounded-t-2xl dark:text-gray-100 dark:border-gray-800"
                  >
                    <span>Location</span>
                    <span
                      className={`transition-transform ${sectionsOpen.location ? "rotate-180" : ""}`}
                    >
                      ▾
                    </span>
                  </button>
                  {sectionsOpen.location && (
                    <div className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {property.city}, {property.region || ""}{" "}
                        {property.country || "Tunisia"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Reviews */}
                <div className="border border-gray-200 rounded-2xl bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <button
                    type="button"
                    onClick={() =>
                      setSectionsOpen((prev) => ({
                        ...prev,
                        reviews: !prev.reviews,
                      }))
                    }
                    className="flex w-full items-center justify-between px-5 py-4 text-base font-semibold text-gray-900 border-b border-gray-100 rounded-t-2xl dark:text-gray-100 dark:border-gray-800"
                  >
                    <span>Reviews</span>
                    <span
                      className={`transition-transform ${sectionsOpen.reviews ? "rotate-180" : ""}`}
                    >
                      ▾
                    </span>
                  </button>
                  {sectionsOpen.reviews && (
                    <div className="px-5 py-4 text-sm text-gray-600 space-y-4 dark:text-gray-300">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Reviews ({reviewTotal})
                        </h3>
                      </div>

                      {reviewsLoading ? (
                        <p className="text-xs text-gray-500 dark:text-gray-400">Loading reviews…</p>
                      ) : reviewTotal === 0 ? (
                        <p className="text-xs text-gray-500 dark:text-gray-400 py-2">
                          No reviews yet for this property.
                        </p>
                      ) : (
                        <>
                          <div className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-50 border border-gray-100 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Average rating
                            </p>
                            <div className="text-center">
                              <p className="text-3xl font-semibold text-gray-900 dark:text-white">
                                {reviewAvg ?? "—"}{" "}
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                  / 5.0
                                </span>
                              </p>
                              <div className="flex items-center justify-center gap-1 text-amber-400 text-sm tracking-tight">
                                {reviewAvg ? starsForRating(Number(reviewAvg)) : ""}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Based on {reviewTotal}{" "}
                              {reviewTotal === 1 ? "review" : "reviews"}
                            </p>
                          </div>

                          {reviewList.map((fb) => (
                            <div
                              key={fb._id}
                              className="border border-gray-100 rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-gray-900 dark:border-gray-800"
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <div className="flex items-center justify-center w-9 h-9 text-xs font-semibold text-white rounded-full bg-emerald-500">
                                  {feedbackAuthorInitials(fb.authorId)}
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {feedbackAuthorLabel(fb.authorId)}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                    <span>
                                      {fb.createdAt
                                        ? new Date(fb.createdAt).toLocaleDateString()
                                        : ""}
                                    </span>
                                    <span className="text-amber-400 tracking-tight">
                                      {starsForRating(fb.rating)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {fb.comment ? (
                                <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                                  {fb.comment}
                                </p>
                              ) : (
                                <p className="text-xs text-gray-400 italic">No comment</p>
                              )}
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right column: summary + provider + why book + landmarks */}
            <div className="space-y-4">
              {/* Price summary */}
              <div className="border border-gray-200 rounded-2xl bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400">
                    Price
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                    {formattedPrice(property.price)}
                  </p>
                </div>
                <div className="px-4 py-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <p>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      Type:
                    </span>{" "}
                    {property.type}
                  </p>
                  <p>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      Status:
                    </span>{" "}
                    {property.status || "AVAILABLE"}
                  </p>
                  <p>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      Listing:
                    </span>{" "}
                    {property.listingType === "FOR_RENT"
                      ? "For Rent"
                      : "For Sale"}
                  </p>
                  <p>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      Location:
                    </span>{" "}
                    {property.city}, {property.country || "Tunisia"}
                  </p>
                </div>
              </div>

              

              {/* Why Book With Us */}
             

              {/* Nearby Landmarks & Visits */}
              <div className="border border-gray-200 rounded-2xl bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Nearby Landmarks &amp; Visits
                  </h3>
                </div>
                <div className="px-4 py-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800">
                    <div className="h-44">
                      {mapPosition && (
                        <MapContainer
                          key={mapKey}
                          center={mapCenter}
                          zoom={15}
                          scrollWheelZoom={false}
                          style={{ height: "100%", width: "100%" }}
                          className="z-0"
                        >
                          <ChangeMapView center={mapCenter} />
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <Marker position={mapCenter}>
                            <Popup>
                              <div className="text-xs">
                                <div className="font-semibold">{property?.title}</div>
                                <div className="opacity-80">{displayAddress}</div>
                              </div>
                            </Popup>
                          </Marker>
                        </MapContainer>
                      )}
                      {!mapPosition && (
                        <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Loading map...</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="px-3 py-2 border border-gray-200 rounded-2xl bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400">
                      Property Address
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                      {displayAddress}
                    </p>
                  </div>
                  <ul className="space-y-1 text-xs">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">✔</span>
                      Near main city attractions
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">✔</span>
                      Easy access to transportation
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">✔</span>
                      Shops and services nearby
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

