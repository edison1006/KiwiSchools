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
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const mapRef = useRef<any>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
  });

  // Initial load of schools
  useEffect(() => {
    const loadInitialSchools = async () => {
      setLoading(true);
      try {
        const data = await fetchSchools({});
        setSchools(data.items.filter((s) => s.latitude && s.longitude));
      } catch (error) {
        console.error("Failed to load schools:", error);
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
                return (
                  <Marker
                    key={school.id}
                    position={{ lat: school.latitude, lng: school.longitude }}
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
