import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { fetchSchools } from "../api/schoolApi";
import type { School } from "../types";

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// New Zealand center coordinates
const NZ_CENTER: [number, number] = [-41.2865, 174.7762];
const NZ_ZOOM = 6;

// Component to handle map search
function MapSearch({ onSearch }: { onSearch: (keyword: string) => void }) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const { t } = useTranslation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      onSearch(searchKeyword.trim());
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="absolute left-4 top-4 z-[1000] w-64 rounded-lg border border-slate-200 bg-white shadow-lg"
    >
      <div className="flex items-center gap-2 p-2">
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="flex-1 border-none bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
        <button
          type="submit"
          className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600"
        >
          {t("search")}
        </button>
      </div>
    </form>
  );
}

// Component to handle map bounds changes for search
function MapBoundsHandler({ onBoundsChange }: { onBoundsChange: (bounds: L.LatLngBounds) => void }) {
  const map = useMap();

  useEffect(() => {
    const handleMoveEnd = () => {
      onBoundsChange(map.getBounds());
    };

    map.on("moveend", handleMoveEnd);
    map.on("zoomend", handleMoveEnd);

    // Initial bounds
    onBoundsChange(map.getBounds());

    return () => {
      map.off("moveend", handleMoveEnd);
      map.off("zoomend", handleMoveEnd);
    };
  }, [map, onBoundsChange]);

  return null;
}

export function MapPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const mapRef = useRef<L.Map | null>(null);

  // Load schools when map bounds change
  const handleBoundsChange = async (bounds: L.LatLngBounds) => {
    setLoading(true);
    try {
      const params = {
        keyword: searchKeyword || undefined,
      };
      const data = await fetchSchools(params);
      // Filter schools within visible bounds
      const visibleSchools = data.items.filter((school) => {
        if (school.latitude && school.longitude) {
          return bounds.contains([school.latitude, school.longitude]);
        }
        return false;
      });
      setSchools(visibleSchools);
    } catch (error) {
      console.error("Failed to load schools:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = async (keyword: string) => {
    setSearchKeyword(keyword);
    setLoading(true);
    try {
      const data = await fetchSchools({ keyword });
      setSchools(data.items.filter((s) => s.latitude && s.longitude));
      
      // If schools found, zoom to first result
      if (data.items.length > 0 && data.items[0].latitude && data.items[0].longitude) {
        const firstSchool = data.items[0];
        if (mapRef.current) {
          mapRef.current.setView([firstSchool.latitude!, firstSchool.longitude!], 12);
        }
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            {t("mapMode")}
          </h1>
          <p className="text-xs text-slate-600">
            Explore Schools On The Map
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back To Home
        </Link>
      </div>

      <div className="relative h-[600px] w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading && (
          <div className="absolute right-4 top-4 z-[1000] rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-lg">
            Loading...
          </div>
        )}
        <MapSearch onSearch={handleSearch} />
        <MapContainer
          center={NZ_CENTER}
          zoom={NZ_ZOOM}
          style={{ height: "100%", width: "100%" }}
          ref={mapRef}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapBoundsHandler onBoundsChange={handleBoundsChange} />
          {schools.map((school) => {
            if (!school.latitude || !school.longitude) return null;
            return (
              <Marker
                key={school.id}
                position={[school.latitude, school.longitude]}
              >
                <Popup>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm">{school.name}</h3>
                    <p className="text-xs text-slate-600">{school.school_type}</p>
                    {school.city && (
                      <p className="text-xs text-slate-500">{school.city}</p>
                    )}
                    <button
                      onClick={() => navigate(`/schools/${school.id}`)}
                      className="mt-2 rounded-md bg-emerald-500 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-600"
                    >
                      View Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {schools.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-xs text-slate-600">
            Found <span className="font-semibold">{schools.length}</span> schools on the map
          </p>
        </div>
      )}
    </div>
  );
}
