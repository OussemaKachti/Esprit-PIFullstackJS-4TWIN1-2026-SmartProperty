import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import PageMeta from "../components/common/PageMeta";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
  city: string;
  region?: string;
  country?: string;
  images?: { url: string }[];
  createdAt: string;
  updatedAt: string;
};

const formattedPrice = (price: number | undefined | null) => {
  if (price == null) return "—";
  try {
    return `${new Intl.NumberFormat("fr-TN").format(price)} TND`;
  } catch {
    return `${price} TND`;
  }
};

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectionsOpen, setSectionsOpen] = useState({
    description: true,
    features: true,
    about: false,
    location: false,
    reviews: true,
  });

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

  const mainImage =
    property?.images && property.images.length > 0
      ? property.images[0].url
      : "https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg?auto=compress&cs=tinysrgb&w=1200";

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
                    src={mainImage}
                    alt={property.title}
                    className="object-cover w-full h-72 md:h-96"
                  />
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
                    {property.images.slice(0, 8).map((img, index) => (
                      <div
                        key={index}
                        className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800"
                      >
                        <img
                          src={img.url}
                          alt={`${property.title} ${index + 1}`}
                          className="object-cover w-full h-20"
                        />
                      </div>
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
                          Reviews (45)
                        </h3>
                        <button className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white rounded-full bg-gray-900 hover:bg-black dark:bg-white dark:text-gray-900">
                          ✏️ Write a Review
                        </button>
                      </div>

                      {/* Summary + rating distribution */}
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-50 border border-gray-100 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Customer Reviews &amp; Ratings
                          </p>
                          <div className="text-center">
                            <p className="text-3xl font-semibold text-gray-900 dark:text-white">
                              4.9{" "}
                              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                / 5.0
                              </span>
                            </p>
                            <div className="flex items-center justify-center gap-1 text-amber-400 text-sm">
                              ★★★★★
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Based on 2,459 reviews
                          </p>
                        </div>
                        <div className="p-4 border border-gray-100 rounded-2xl bg-white dark:bg-gray-900 dark:border-gray-800">
                          {[
                            { label: "5 Star Ratings", value: 85, count: 247 },
                            { label: "4 Star Ratings", value: 75, count: 145 },
                            { label: "3 Star Ratings", value: 65, count: 600 },
                            { label: "2 Star Ratings", value: 55, count: 560 },
                            { label: "1 Star Ratings", value: 25, count: 400 },
                          ].map((row) => (
                            <div
                              key={row.label}
                              className="flex items-center gap-2 mb-2 last:mb-0"
                            >
                              <span className="w-28 text-xs text-gray-600 dark:text-gray-300">
                                {row.label}
                              </span>
                              <div className="flex-1 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                                <div
                                  className="h-2 rounded-full bg-amber-400"
                                  style={{ width: `${row.value}%` }}
                                />
                              </div>
                              <span className="w-10 text-xs text-right text-gray-600 dark:text-gray-300">
                                {row.count}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Individual reviews (static examples) */}
                      {[
                        {
                          name: "Joseph Massey",
                          title: "Unforgettable stay!",
                          text: "This property exceeded my expectations. The location, comfort and amenities were all top-notch. It felt like a true getaway.",
                        },
                        {
                          name: "Jeffrey Jones",
                          title: "Excellent service",
                          text: "Very smooth experience from booking to check-out. The team was responsive and professional throughout.",
                        },
                      ].map((review) => (
                        <div
                          key={review.name}
                          className="border border-gray-100 rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-gray-900 dark:border-gray-800"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center justify-center w-9 h-9 text-xs font-semibold text-white rounded-full bg-emerald-500">
                              {review.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {review.name}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <span>2 days ago</span>
                                <span className="text-amber-400">★★★★★</span>
                                <span>{review.title}</span>
                              </div>
                            </div>
                          </div>
                          <p className="mb-2 text-sm text-gray-700 dark:text-gray-200">
                            {review.text}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              👍 <span>21</span>
                            </span>
                            <span className="flex items-center gap-1">
                              👎 <span>5</span>
                            </span>
                            <span className="flex items-center gap-1">
                              ❤ <span>12</span>
                            </span>
                          </div>
                        </div>
                      ))}
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

              {/* Provider Details */}
              <div className="border border-gray-200 rounded-2xl bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Provider Details
                  </h3>
                </div>
                <div className="px-4 py-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-2xl bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
                    <div className="flex items-center justify-center w-10 h-10 text-sm font-semibold text-white bg-emerald-500 rounded-full">
                      {property.city?.[0] || "A"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Company Agent
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        SmartProperty
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-3 py-2 text-xs border border-gray-200 rounded-2xl dark:border-gray-800">
                      <span className="inline-flex items-center justify-center w-6 h-6 text-emerald-500 bg-emerald-50 rounded-full dark:bg-emerald-500/10">
                        📞
                      </span>
                      <span className="text-gray-700 dark:text-gray-200">
                        Call us: <span className="font-medium">+216 00 000 000</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 text-xs border border-gray-200 rounded-2xl dark:border-gray-800">
                      <span className="inline-flex items-center justify-center w-6 h-6 text-indigo-500 bg-indigo-50 rounded-full dark:bg-indigo-500/10">
                        ✉️
                      </span>
                      <span className="text-gray-700 dark:text-gray-200">
                        Email: <span className="font-medium">contact@smartproperty.tn</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button className="flex-1 px-3 py-2 text-xs font-semibold text-white rounded-full bg-emerald-500 hover:bg-emerald-600">
                      Whatsapp
                    </button>
                    <button className="flex-1 px-3 py-2 text-xs font-semibold text-white rounded-full bg-gray-900 hover:bg-black dark:bg-white dark:text-gray-900">
                      Chat Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Why Book With Us */}
              <div className="border border-gray-200 rounded-2xl bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Why Book With Us
                  </h3>
                </div>
                <div className="px-4 py-4 text-sm text-gray-600 space-y-2 dark:text-gray-300">
                  <p className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 text-violet-500 bg-violet-50 rounded-full dark:bg-violet-500/10">
                      ⭐
                    </span>
                    Expertise and Experience
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 text-violet-500 bg-violet-50 rounded-full dark:bg-violet-500/10">
                      📋
                    </span>
                    Tailored Services
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 text-violet-500 bg-violet-50 rounded-full dark:bg-violet-500/10">
                      📌
                    </span>
                    Comprehensive Planning
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 text-violet-500 bg-violet-50 rounded-full dark:bg-violet-500/10">
                      🤝
                    </span>
                    Client Satisfaction
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 text-violet-500 bg-violet-50 rounded-full dark:bg-violet-500/10">
                      🕒
                    </span>
                    24/7 Support
                  </p>
                </div>
              </div>

              {/* Nearby Landmarks & Visits */}
              <div className="border border-gray-200 rounded-2xl bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Nearby Landmarks &amp; Visits
                  </h3>
                </div>
                <div className="px-4 py-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800">
                    {/* Placeholder map image; can be replaced with real map later */}
                    <div className="flex items-center justify-center h-40 bg-gradient-to-br from-sky-500 to-blue-700 text-white text-xs font-semibold">
                      View Location on Map
                    </div>
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

