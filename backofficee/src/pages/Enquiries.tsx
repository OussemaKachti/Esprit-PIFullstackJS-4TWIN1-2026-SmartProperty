import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type EnquiryNotification = {
  id: string;
  type: "ENQUIRY" | "RENT_REQUEST";
  isRead?: boolean;
  propertyId: string;
  propertyTitle: string;
  authorName: string;
  authorEmail: string | null;
  message: string;
  createdAt: string;
};

type NotificationsResponse = {
  data?: {
    notifications?: EnquiryNotification[];
  };
};

function formatDateTime(dateInput: string) {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getInitialSelectedId(locationState: unknown): string | null {
  if (!locationState || typeof locationState !== "object") return null;
  const state = locationState as { selectedId?: unknown };
  return typeof state.selectedId === "string" ? state.selectedId : null;
}

export default function Enquiries() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<EnquiryNotification[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(
    getInitialSelectedId(location.state)
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchEnquiries = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/notifications/owner`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load enquiries");
        }

        const payload: NotificationsResponse = await response.json();
        const list = payload?.data?.notifications || [];

        if (isMounted) {
          setNotifications(list);

          // Viewing the notifications page marks all owner notifications as read.
          await fetch(`${API_URL}/notifications/owner/read`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({}),
          });
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEnquiries();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!notifications.length) {
      setSelectedId(null);
      return;
    }

    const hasSelected = selectedId && notifications.some((item) => item.id === selectedId);
    if (!hasSelected) {
      setSelectedId(notifications[0].id);
    }
  }, [notifications, selectedId]);

  const selectedEnquiry = useMemo(
    () => notifications.find((item) => item.id === selectedId) || null,
    [notifications, selectedId]
  );

  return (
    <>
      <PageMeta title="Notifications | Smart Property" description="Property owner notifications" />
      <PageBreadcrumb pageTitle="Notifications" />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <section className="lg:col-span-5 xl:col-span-4">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
                All Notifications
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {notifications.length} total
              </p>
            </div>

            <ul className="max-h-[620px] overflow-y-auto custom-scrollbar">
              {loading ? (
                <li className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                  Loading notifications...
                </li>
              ) : notifications.length === 0 ? (
                <li className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                  No notifications yet.
                </li>
              ) : (
                notifications.map((item) => {
                  const isSelected = selectedId === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        className={`w-full border-b border-gray-100 px-5 py-4 text-left transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.03] ${
                          isSelected ? "bg-brand-50 dark:bg-brand-500/[0.08]" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                              {item.authorName}
                            </p>
                            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                              {item.propertyTitle}
                            </p>
                          </div>
                          <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                            {formatDateTime(item.createdAt)}
                          </span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                          {item.message}
                        </p>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </section>

        <section className="lg:col-span-7 xl:col-span-8">
          <div className="min-h-[420px] rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            {!selectedEnquiry ? (
              <div className="flex h-full min-h-[360px] items-center justify-center text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Select a notification from the list to view details.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                      {selectedEnquiry.authorName}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {selectedEnquiry.authorEmail || "No email provided"}
                    </p>
                  </div>
                  <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                    {selectedEnquiry.type === "RENT_REQUEST" ? "Rent Request" : "Notification"}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-800">
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Property
                    </p>
                    <p className="mt-2 text-sm font-medium text-gray-800 dark:text-white/90">
                      {selectedEnquiry.propertyTitle}
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-800">
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Received At
                    </p>
                    <p className="mt-2 text-sm font-medium text-gray-800 dark:text-white/90">
                      {formatDateTime(selectedEnquiry.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-800">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Message
                  </p>
                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-700 dark:text-gray-200">
                    {selectedEnquiry.message}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
