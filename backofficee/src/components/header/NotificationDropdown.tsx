import { useEffect, useMemo, useRef, useState } from "react";
import Pusher from "pusher-js";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Link, useNavigate } from "react-router";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const PUSHER_KEY = (import.meta.env as Record<string, string | undefined>).VITE_PUSHER_KEY;
const PUSHER_CLUSTER =
  (import.meta.env as Record<string, string | undefined>).VITE_PUSHER_CLUSTER || "eu";

type EnquiryNotification = {
  id: string;
  type: "ENQUIRY" | "RENT_REQUEST";
  propertyId: string;
  propertyTitle: string;
  authorName: string;
  authorEmail: string | null;
  message: string;
  createdAt: string;
};

type NotificationsResponse = {
  success?: boolean;
  data?: {
    notifications?: EnquiryNotification[];
  };
};

function getOwnerIdFromStorage() {
  try {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) return null;
    const parsedUser = JSON.parse(rawUser);
    return parsedUser?._id || parsedUser?.id || null;
  } catch {
    return null;
  }
}

function formatRelativeTime(dateInput: string) {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "Just now";

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<EnquiryNotification[]>([]);
  const isOpenRef = useRef(false);

  const topNotifications = useMemo(() => notifications.slice(0, 20), [notifications]);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const ownerId = getOwnerIdFromStorage();

    if (!token || !ownerId) {
      return;
    }

    let isMounted = true;

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/notifications/owner`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load notifications");
        }

        const payload: NotificationsResponse = await response.json();
        const list = payload?.data?.notifications || [];

        if (isMounted) {
          setNotifications(list);
          setUnreadCount(list.length);
        }
      } catch (error) {
        console.error("Failed to fetch owner notifications:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchNotifications();

    if (!PUSHER_KEY) {
      return () => {
        isMounted = false;
      };
    }

    const pusher = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      authEndpoint: `${API_URL}/pusher/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const channel = pusher.subscribe(`private-owner-${ownerId}`);

    const handleEnquiryCreated = (notification: EnquiryNotification) => {
      if (!isMounted) return;

      setNotifications((prev) => {
        const deduped = prev.filter((item) => item.id !== notification.id);
        return [notification, ...deduped].slice(0, 50);
      });

      if (!isOpenRef.current) {
        setUnreadCount((prev) => prev + 1);
      }

      if (!isOpenRef.current) {
        setNotifying(true);
      }
    };

    channel.bind("notification.created", handleEnquiryCreated);

    return () => {
      isMounted = false;
      channel.unbind("notification.created", handleEnquiryCreated);
      pusher.unsubscribe(`private-owner-${ownerId}`);
      pusher.disconnect();
    };
  }, []);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleNotificationOpen = (notificationId: string) => {
    setIsOpen(false);
    setNotifying(false);
    setUnreadCount(0);
    navigate("/enquiries", {
      state: {
        selectedId: notificationId,
      },
    });
  };

  const handleClick = () => {
    toggleDropdown();
    if (!isOpen) {
      setNotifying(false);
      setUnreadCount(0);
    }
  };

  const unreadLabel = unreadCount > 99 ? "99+" : unreadCount.toString();

  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleClick}
      >
        <span
          className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 ${
            !notifying ? "hidden" : "flex"
          }`}
        >
          <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
        </span>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 z-20 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white shadow-sm ring-2 ring-white dark:ring-gray-900">
            {unreadLabel}
          </span>
        )}
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notification
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
                {unreadLabel} new
              </span>
            )}
          </h5>
          <button
            onClick={toggleDropdown}
            className="text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <svg
              className="fill-current"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          {loading ? (
            <li className="px-4 py-6 text-sm text-center text-gray-500 dark:text-gray-400">
              Loading notifications...
            </li>
          ) : topNotifications.length === 0 ? (
            <li className="px-4 py-6 text-sm text-center text-gray-500 dark:text-gray-400">
              No new enquiries yet.
            </li>
          ) : (
            topNotifications.map((notification) => (
              <li key={notification.id}>
                <DropdownItem
                  onClick={() => handleNotificationOpen(notification.id)}
                  className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
                >
                  <span className="flex items-center justify-center w-10 h-10 text-blue-600 bg-blue-100 rounded-full dark:bg-blue-900/30 dark:text-blue-300">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.1665 5.83333C4.1665 4.91286 4.91269 4.16667 5.83317 4.16667H14.1665C15.087 4.16667 15.8332 4.91286 15.8332 5.83333V10.8333C15.8332 11.7538 15.087 12.5 14.1665 12.5H8.74984L5.4165 15V12.5H5.83317C4.91269 12.5 4.1665 11.7538 4.1665 10.8333V5.83333Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>

                  <span className="block">
                    <span className="block mb-1 text-theme-sm text-gray-500 dark:text-gray-400">
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        {notification.authorName}
                      </span>{" "}
                      {notification.type === "RENT_REQUEST" ? "requested to rent" : "sent an enquiry for"}{" "}
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        {notification.propertyTitle}
                      </span>
                    </span>

                    <span className="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
                      <span>{notification.type === "RENT_REQUEST" ? "Rent Request" : "Enquiry"}</span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span>{formatRelativeTime(notification.createdAt)}</span>
                    </span>
                  </span>
                </DropdownItem>
              </li>
            ))
          )}
        </ul>
        <Link
          to="/"
          className="block px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          View All Notifications
        </Link>
      </Dropdown>
    </div>
  );
}
