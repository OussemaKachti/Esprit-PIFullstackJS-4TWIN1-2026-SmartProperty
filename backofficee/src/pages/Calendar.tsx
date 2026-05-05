import { useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { DatesSetArg, EventClickArg, EventContentArg, EventInput } from "@fullcalendar/core";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";
import PageMeta from "../components/common/PageMeta";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
};

interface LeaseCalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
    status: string;
    tenantName: string;
    tenantEmail: string;
    tenantPhone: string;
    propertyTitle: string;
    propertyReference: string;
    propertyCity: string;
    rentAmount: number;
    charges: number;
    rangeStart: string;
    rangeEnd: string;
    rangeLabel: string;
  };
}

type CalendarPayload = {
  roleView: string;
  events: Array<{
    id: string;
    title: string;
    start: string;
    end: string;
    status: string;
    colorKey: string;
    rentAmount: number;
    charges: number;
    tenant: { name: string; email?: string; phone?: string };
    property: { title?: string; reference?: string; city?: string };
  }>;
  metrics: {
    totalLeases: number;
    confirmedLeases: number;
    pendingLeases: number;
    completedLeases: number;
    tenants: number;
    properties: number;
  };
};

const formatAmount = (value?: number) =>
  typeof value === "number" ? `${value.toLocaleString()} TND` : "-";

const formatDateShort = (value: string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
};

const formatEventDate = (value: unknown) => {
  if (!value) return "-";

  let date: Date;
  if (value instanceof Date) {
    date = value;
  } else if (Array.isArray(value)) {
    const [year, month = 1, day = 1, hour = 0, minute = 0, second = 0] = value as number[];
    date = new Date(year, month - 1, day, hour, minute, second);
  } else if (typeof value === "string" || typeof value === "number") {
    date = new Date(value);
  } else {
    return "-";
  }

  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
};

const Calendar: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<LeaseCalendarEvent | null>(null);
  const [events, setEvents] = useState<LeaseCalendarEvent[]>([]);
  const [roleView, setRoleView] = useState<string>("");
  const [metrics, setMetrics] = useState<CalendarPayload["metrics"] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const metricCards = useMemo(() => {
    if (!metrics) return [];
    return [
      { label: "Total periods", value: metrics.totalLeases },
      { label: "Confirmed", value: metrics.confirmedLeases },
      { label: "Pending", value: metrics.pendingLeases },
      { label: "Completed", value: metrics.completedLeases },
      ...(roleView === "TENANT" || roleView === "BUYER"
        ? []
        : [
            { label: "Tenants", value: metrics.tenants },
            { label: "Properties", value: metrics.properties },
          ]),
    ];
  }, [metrics, roleView]);

  const fetchCalendarEvents = async (start: string, end: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please sign in to access the calendar.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/leases/calendar?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const payload = (await response.json()) as { success?: boolean; message?: string; data?: CalendarPayload };

      if (!response.ok || !payload?.success || !payload?.data) {
        throw new Error(payload?.message || "Failed to load lease calendar");
      }

      setRoleView(payload.data.roleView || "");
      setMetrics(payload.data.metrics || null);
      setEvents(
        payload.data.events.map((item) => ({
          id: item.id,
          title: item.title,
          // Show compact event card on start day only (no stretched multi-day bars)
          start: item.start,
          end: undefined,
          allDay: true,
          extendedProps: {
            calendar: item.colorKey || "Warning",
            status: item.status,
            tenantName: item.tenant?.name || "",
            tenantEmail: item.tenant?.email || "",
            tenantPhone: item.tenant?.phone || "",
            propertyTitle: item.property?.title || "",
            propertyReference: item.property?.reference || "",
            propertyCity: item.property?.city || "",
            rentAmount: item.rentAmount,
            charges: item.charges,
            rangeStart: item.start,
            rangeEnd: item.end,
            rangeLabel: `${formatDateShort(item.start)} - ${formatDateShort(item.end)}`,
          },
        }))
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load calendar";
      setError(message);
      setEvents([]);
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString();
    fetchCalendarEvents(start, end);
  }, []);

  const handleDateWindowChange = (arg: DatesSetArg) => {
    fetchCalendarEvents(arg.start.toISOString(), arg.end.toISOString());
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    setSelectedEvent(event as unknown as LeaseCalendarEvent);
    openModal();
  };

  const closeDetailsModal = () => {
    closeModal();
    setSelectedEvent(null);
  };

  return (
    <>
      <PageMeta title="Lease Calendar | Smart Property" description="Role-based lease occupancy calendar" />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-6">
        {metricCards.map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400">{metric.label}</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{metric.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Rental occupancy calendar</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {roleView === "TENANT" || roleView === "BUYER"
                ? "Your active rental periods by property."
                : "Portfolio periods across tenants and properties."}
            </p>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">Pending</span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">Confirmed</span>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-800">Completed</span>
          </div>
        </div>
        {error ? (
          <div className="p-6 text-sm text-rose-600 dark:text-rose-400">{error}</div>
        ) : null}
        <div className="custom-calendar">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={events}
            datesSet={handleDateWindowChange}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
            eventClassNames={() => ["lease-calendar-event"]}
            displayEventTime={false}
            eventOrder="start,-duration,title"
            editable={false}
            selectable={false}
            dayMaxEvents={true}
            height="auto"
          />
        </div>
        {loading ? <div className="px-5 pb-5 text-sm text-gray-500 dark:text-gray-400">Loading calendar...</div> : null}
        <Modal
          isOpen={isOpen}
          onClose={closeDetailsModal}
          className="max-w-[620px] p-6 lg:p-8"
        >
          <div className="flex flex-col gap-4">
            <h5 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Lease period details
            </h5>
            {selectedEvent ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailItem label="Status" value={STATUS_LABELS[selectedEvent.extendedProps.status] || selectedEvent.extendedProps.status} />
                <DetailItem
                  label="Property"
                  value={selectedEvent.extendedProps.propertyTitle || String(selectedEvent.title || "-")}
                />
                <DetailItem label="Reference" value={selectedEvent.extendedProps.propertyReference || "-"} />
                <DetailItem label="City" value={selectedEvent.extendedProps.propertyCity || "-"} />
                <DetailItem label="Tenant" value={selectedEvent.extendedProps.tenantName || "-"} />
                <DetailItem label="Tenant email" value={selectedEvent.extendedProps.tenantEmail || "-"} />
                <DetailItem label="Tenant phone" value={selectedEvent.extendedProps.tenantPhone || "-"} />
                <DetailItem label="Rent amount" value={formatAmount(selectedEvent.extendedProps.rentAmount)} />
                <DetailItem label="Charges" value={formatAmount(selectedEvent.extendedProps.charges)} />
                <DetailItem
                  label="Start date"
                  value={formatEventDate(selectedEvent.extendedProps.rangeStart || selectedEvent.start)}
                />
                <DetailItem
                  label="End date"
                  value={formatEventDate(selectedEvent.extendedProps.rangeEnd || selectedEvent.end)}
                />
              </div>
            ) : null}
            <div className="flex items-center justify-end">
              <button
                onClick={closeDetailsModal}
                type="button"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-900">
    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
  </div>
);

const parseEventTitle = (rawTitle: string) => {
  const title = String(rawTitle || "").trim();
  const chunks = title.split(" - ").map((chunk) => chunk.trim()).filter(Boolean);

  if (chunks.length >= 2) {
    const secondary = chunks.shift() || "";
    return {
      primary: chunks.join(" - "),
      secondary,
    };
  }

  return {
    primary: title || "Lease period",
    secondary: "",
  };
};

const renderEventContent = (eventInfo: EventContentArg) => {
  const status = String(eventInfo.event.extendedProps.status || "").toUpperCase();
  const colorClass = `fc-bg-${eventInfo.event.extendedProps.calendar.toLowerCase()}`;
  const { primary, secondary } = parseEventTitle(eventInfo.event.title);
  const statusLabel = STATUS_LABELS[status] || status || "Active";

  return (
    <div className={`event-fc-color flex fc-event-main ${colorClass}`}>
      <div className="fc-daygrid-event-dot"></div>
      <div className="fc-event-copy">
        <div className="fc-event-title">{primary}</div>
        <div className="fc-event-range">{String(eventInfo.event.extendedProps.rangeLabel || "")}</div>
        {secondary ? (
          <div className="fc-event-subtitle">{secondary}</div>
        ) : null}
      </div>
      <span className="fc-event-status">{statusLabel}</span>
    </div>
  );
};

export default Calendar;
