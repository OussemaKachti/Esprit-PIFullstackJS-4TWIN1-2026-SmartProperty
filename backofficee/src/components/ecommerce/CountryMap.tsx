import { useMemo } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export type CitySlice = {
  city: string;
  count: number;
  percent: number;
};

interface CountryMapProps {
  mapColor?: string;
  topCities?: CitySlice[];
}

const CITY_COORDINATES: Record<string, [number, number]> = {
  tunis: [36.8065, 10.1815],
  ariana: [36.8665, 10.1647],
  "ben arous": [36.7531, 10.2189],
  benarous: [36.7531, 10.2189],
  manouba: [36.81, 10.0956],
  nabeul: [36.4513, 10.735],
  hammamet: [36.4, 10.6167],
  sousse: [35.8256, 10.6084],
  monastir: [35.7643, 10.8113],
  mahdia: [35.5047, 11.0622],
  sfax: [34.7406, 10.7603],
  gabes: [33.8815, 10.0982],
  medenine: [33.3547, 10.5055],
  djerba: [33.8076, 10.8451],
  jerba: [33.8076, 10.8451],
  zarzis: [33.5039, 11.1122],
  kairouan: [35.6781, 10.0963],
  bizerte: [37.2744, 9.8739],
  beja: [36.7256, 9.1817],
  jendouba: [36.5011, 8.7802],
  kef: [36.1742, 8.7049],
  siliana: [36.0849, 9.3708],
  zaghouan: [36.4029, 10.1429],
  kebili: [33.7044, 8.9656],
  tozeur: [33.9197, 8.1335],
  gafsa: [34.425, 8.7842],
  kasserine: [35.1676, 8.8365],
  sidibouzid: [35.0382, 9.4858],
  "sidi bouzid": [35.0382, 9.4858],
  tataouine: [32.9297, 10.4518],
};

const normalizeCity = (city: string) =>
  city
    .split(/[,\-/]/)[0]
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const TUNISIA_BOUNDS: [[number, number], [number, number]] = [
  [30.0, 7.0],
  [38.8, 12.8],
];

const CountryMap: React.FC<CountryMapProps> = ({ topCities = [] }) => {
  const markers = useMemo(
    () =>
      topCities
        .slice(0, 8)
        .map((city, index) => {
          const key = normalizeCity(city.city);
          const latLng = CITY_COORDINATES[key];
          if (!latLng) return null;

            const radius = Math.max(5, Math.min(10, 5 + city.percent / 12));
          const tone = index === 0 ? "#465FFF" : "#6B7CFF";

          return {
            latLng,
            city: city.city,
            count: city.count,
            percent: city.percent,
            radius,
            tone,
          };
        })
        .filter(Boolean) as Array<{
        latLng: [number, number];
        city: string;
        count: number;
        percent: number;
        radius: number;
        tone: string;
      }>,
    [topCities]
  );

  return (
    <div className="h-full w-full overflow-hidden rounded-[22px] border border-gray-200 bg-gradient-to-br from-white via-white to-slate-50 shadow-[0_8px_30px_rgba(70,95,255,0.05)] dark:border-gray-800 dark:from-white/[0.03] dark:via-white/[0.03] dark:to-white/[0.02]">
      <MapContainer
        bounds={TUNISIA_BOUNDS}
        boundsOptions={{ padding: [28, 28] }}
        maxBounds={TUNISIA_BOUNDS}
        maxBoundsViscosity={1}
          zoom={9}
          minZoom={6}
          maxZoom={11}
        scrollWheelZoom={false}
        dragging={true}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {markers.map((marker) => (
          <CircleMarker
            key={marker.city}
            center={marker.latLng}
              radius={marker.radius}
            pathOptions={{
              color: "#ffffff",
                weight: 1.5,
              fillColor: marker.tone,
              fillOpacity: 0.9,
            }}
          >
            <Popup closeButton={false} offset={[0, -4]}>
              <div className="min-w-[120px] space-y-1">
                <p className="text-sm font-semibold text-gray-900">{marker.city}</p>
                <p className="text-xs text-gray-500">
                  {marker.count} {marker.count === 1 ? "property" : "properties"}
                </p>
                <p className="text-xs font-medium text-brand-600">{marker.percent}% of total</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      <div className="pointer-events-none absolute left-4 top-4 rounded-2xl border border-white/70 bg-white/85 px-3 py-2 text-xs font-medium text-gray-700 shadow-lg backdrop-blur dark:border-gray-800 dark:bg-gray-900/80 dark:text-gray-200">
        Tunisia overview
      </div>
    </div>
  );
};

export default CountryMap;
