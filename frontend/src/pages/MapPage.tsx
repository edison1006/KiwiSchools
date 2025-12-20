import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { GoogleMap, Marker, useJsApiLoader, InfoWindow } from "@react-google-maps/api";
import { fetchSchools } from "../api/schoolApi";
import type { School } from "../types";

// New Zealand center coordinates
const NZ_CENTER = { lat: -41.2865, lng: 174.7762 };

const MAP_CONTAINER_STYLE = {
  height: "100%",
  width: "100%"
} as const;

// Helper function to create blue circle marker icon - only call when google is loaded
const createBlueMarkerIcon = () => {
  if (typeof google === "undefined" || !google.maps) {
    return undefined;
  }
  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 10,
    fillColor: "#4285F4", // Google Blue
    fillOpacity: 1,
    strokeColor: "#FFFFFF",
    strokeWeight: 2,
  };
};

// North Island cities
const NORTH_ISLAND_CITIES = [
  "Auckland",
  "Hamilton",
  "Tauranga",
  "Wellington",
  "Palmerston North",
  "Whangarei",
  "Rotorua",
  "New Plymouth",
  "Napier",
  "Hastings",
  "Gisborne",
  "Whanganui",
  "Taupo",
  "Masterton",
  "Levin",
  "Cambridge",
  "Te Awamutu",
  "Tokoroa",
  "Matamata",
  "Thames",
  "Kawerau",
  "Opotiki"
];

// South Island cities
const SOUTH_ISLAND_CITIES = [
  "Christchurch",
  "Dunedin",
  "Nelson",
  "Queenstown",
  "Invercargill",
  "Timaru",
  "Blenheim",
  "Ashburton",
  "Oamaru",
  "Greymouth",
  "Wanaka",
  "Alexandra",
  "Cromwell",
  "Kaikoura",
  "Westport",
  "Motueka",
  "Gore",
  "Waimate",
  "Balclutha"
];

// City coordinates mapping
const CITY_COORDINATES: Record<string, { lat: number; lng: number; zoom: number }> = {
  // North Island
  Auckland: { lat: -36.8485, lng: 174.7633, zoom: 11 },
  Hamilton: { lat: -37.7870, lng: 175.2793, zoom: 12 },
  Tauranga: { lat: -37.6878, lng: 176.1651, zoom: 12 },
  Wellington: { lat: -41.2865, lng: 174.7762, zoom: 12 },
  "Palmerston North": { lat: -40.3523, lng: 175.6082, zoom: 12 },
  Whangarei: { lat: -35.7251, lng: 174.3237, zoom: 12 },
  Rotorua: { lat: -38.1368, lng: 176.2497, zoom: 12 },
  "New Plymouth": { lat: -39.0570, lng: 174.0750, zoom: 12 },
  Napier: { lat: -39.4928, lng: 176.9120, zoom: 12 },
  Hastings: { lat: -39.6381, lng: 176.8492, zoom: 12 },
  Gisborne: { lat: -38.6623, lng: 178.0176, zoom: 12 },
  Whanganui: { lat: -39.9301, lng: 175.0477, zoom: 12 },
  Taupo: { lat: -38.6857, lng: 176.0702, zoom: 12 },
  Masterton: { lat: -40.9495, lng: 175.6573, zoom: 12 },
  Levin: { lat: -40.6214, lng: 175.2853, zoom: 12 },
  Cambridge: { lat: -37.8782, lng: 175.4676, zoom: 12 },
  "Te Awamutu": { lat: -38.0100, lng: 175.3200, zoom: 12 },
  Tokoroa: { lat: -38.2333, lng: 175.8667, zoom: 12 },
  Matamata: { lat: -37.8167, lng: 175.7833, zoom: 12 },
  Thames: { lat: -37.1383, lng: 175.5403, zoom: 12 },
  Kawerau: { lat: -38.1000, lng: 176.7000, zoom: 12 },
  Opotiki: { lat: -38.0044, lng: 177.2872, zoom: 12 },
  // South Island
  Christchurch: { lat: -43.5321, lng: 172.6362, zoom: 11 },
  Dunedin: { lat: -45.8741, lng: 170.5036, zoom: 12 },
  Nelson: { lat: -41.2706, lng: 173.2840, zoom: 12 },
  Queenstown: { lat: -45.0312, lng: 168.6626, zoom: 12 },
  Invercargill: { lat: -46.4132, lng: 168.3530, zoom: 12 },
  Timaru: { lat: -44.3967, lng: 171.2536, zoom: 12 },
  Blenheim: { lat: -41.5145, lng: 173.9528, zoom: 12 },
  Ashburton: { lat: -43.9023, lng: 171.7493, zoom: 12 },
  Oamaru: { lat: -45.0975, lng: 170.9703, zoom: 12 },
  Greymouth: { lat: -42.4494, lng: 171.2108, zoom: 12 },
  Wanaka: { lat: -44.6930, lng: 169.1320, zoom: 12 },
  Alexandra: { lat: -45.2487, lng: 169.3925, zoom: 12 },
  Cromwell: { lat: -45.0389, lng: 169.2000, zoom: 12 },
  Kaikoura: { lat: -42.4000, lng: 173.6800, zoom: 12 },
  Westport: { lat: -41.7544, lng: 171.6011, zoom: 12 },
  Motueka: { lat: -41.1233, lng: 173.0128, zoom: 12 },
  Gore: { lat: -46.1028, lng: 168.9436, zoom: 12 },
  Waimate: { lat: -44.7333, lng: 171.0500, zoom: 12 },
  Balclutha: { lat: -46.2333, lng: 169.7500, zoom: 12 }
};

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

export function MapPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const mapRef = useRef<any>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
  });

  // Initial load of schools - only if backend is likely available
  useEffect(() => {
    // Skip initial load if we know backend was unavailable recently
    const backendWasUnavailable = sessionStorage.getItem("backend_unavailable_warning_logged") === "true";
    
    // Only attempt initial load if backend seems available
    // User can manually search to test connection
    if (backendWasUnavailable) {
      return; // Skip initial load to avoid unnecessary errors
    }

    const loadInitialSchools = async () => {
      setLoading(true);
      try {
        const data = await fetchSchools({});
        setSchools(data.items.filter((s) => s.latitude && s.longitude));
      } catch (error) {
        // Silently fail on initial load - user can search when backend is ready
        // Error is already logged by apiClient interceptor, no need to log again
        setError(null); // Don't show error on initial load
      } finally {
        setLoading(false);
      }
    };

    loadInitialSchools();
  }, []);

  // Handle search
  const handleSearch = async (keyword: string) => {
    setSearchKeyword(keyword);
    setLoading(true);
    try {
      const data = await fetchSchools({ keyword });
      const withCoords = data.items.filter((s) => s.latitude && s.longitude);
      setSchools(withCoords);

      // If schools found, zoom to first result
      if (withCoords.length > 0 && withCoords[0].latitude && withCoords[0].longitude) {
        const firstSchool = withCoords[0];
        if (mapRef.current) {
          mapRef.current.panTo({ lat: firstSchool.latitude, lng: firstSchool.longitude });
          mapRef.current.setZoom(12);
        }
      }
    } catch (error) {
      console.error("Search failed:", error);
      // Show user-friendly error message
      if (error instanceof Error && (error.message.includes("Network Error") || error.message.includes("ERR_CONNECTION_REFUSED"))) {
        setError("Unable to connect to the backend server. Please ensure the backend is running on http://localhost:8000");
      } else {
        setError("Failed to search schools. Please try again.");
      }
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

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <div className="flex items-start gap-2">
            <svg
              className="h-5 w-5 flex-shrink-0 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-xs font-medium text-amber-800">{error}</p>
              <p className="mt-1 text-xs text-amber-700">
                To start the backend server, run: <code className="rounded bg-amber-100 px-1 py-0.5">cd backend && uvicorn app.main:app --reload --port 8000</code>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="relative h-[600px] w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading && (
          <div className="absolute right-4 top-4 z-[1000] rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-lg">
            Loading...
          </div>
        )}
        {!isLoaded && !loadError && (
          <div className="flex h-full items-center justify-center text-xs text-slate-600">
            Loading Map...
          </div>
        )}
        {loadError && (
          <div className="flex h-full items-center justify-center text-xs text-red-600">
            Failed To Load Google Maps. Please Check Your API Key.
          </div>
        )}
        {isLoaded && !loadError && (
          <>
            <MapSearch onSearch={handleSearch} />
            <GoogleMap
              mapContainerStyle={MAP_CONTAINER_STYLE}
              center={NZ_CENTER}
              zoom={6}
              onLoad={(map) => {
                mapRef.current = map;
              }}
            >
              {schools.map((school) => {
                if (!school.latitude || !school.longitude) return null;
                // Create blue circle icon - only when google is loaded
                const blueIcon = createBlueMarkerIcon();
                return (
                  <Marker
                    key={school.id}
                    position={{ lat: school.latitude, lng: school.longitude }}
                    icon={blueIcon}
                    onClick={() => setSelectedSchool(school)}
                  />
                );
              })}

              {selectedSchool && selectedSchool.latitude && selectedSchool.longitude && (
                <InfoWindow
                  position={{ lat: selectedSchool.latitude, lng: selectedSchool.longitude }}
                  onCloseClick={() => setSelectedSchool(null)}
                >
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold">{selectedSchool.name}</h3>
                    <p className="text-xs text-slate-600">{selectedSchool.school_type}</p>
                    {selectedSchool.city && (
                      <p className="text-xs text-slate-500">{selectedSchool.city}</p>
                    )}
                    <button
                      onClick={() => navigate(`/schools/${selectedSchool.id}`)}
                      className="mt-2 rounded-md bg-emerald-500 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-600"
                    >
                      View Details
                    </button>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </>
        )}
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
