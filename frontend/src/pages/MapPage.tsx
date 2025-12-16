import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { GoogleMap, Marker, useJsApiLoader, InfoWindow } from "@react-google-maps/api";
import { fetchSchools } from "../api/schoolApi";
import type { School } from "../types";
import type { SchoolTypeFilter } from "../components/Filters";

// New Zealand center coordinates
const NZ_CENTER = { lat: -41.2865, lng: 174.7762 };

const MAP_CONTAINER_STYLE = {
  height: "100%",
  width: "100%"
} as const;

// Custom blue circle marker icon - creates a blue dot with white border
const BLUE_MARKER_ICON = {
  path: google.maps.SymbolPath.CIRCLE,
  scale: 10,
  fillColor: "#4285F4", // Google Blue
  fillOpacity: 1,
  strokeColor: "#FFFFFF",
  strokeWeight: 2,
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

// Component to handle map search and filters
function MapSearchAndFilters({
  onSearch,
  onFilterChange,
  filters
}: {
  onSearch: (keyword: string) => void;
  onFilterChange: (filters: {
    region: string;
    city: string;
    schoolType: SchoolTypeFilter;
  }) => void;
  filters: {
    region: string;
    city: string;
    schoolType: SchoolTypeFilter;
  };
}) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const { t } = useTranslation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      onSearch(searchKeyword.trim());
    }
  };

  // Get available cities based on selected island
  const availableCities =
    filters.region === "north"
      ? NORTH_ISLAND_CITIES
      : filters.region === "south"
      ? SOUTH_ISLAND_CITIES
      : [];

  // Handle region change - reset city when region changes
  const handleRegionChange = (region: string) => {
    onFilterChange({
      ...filters,
      region,
      city: "" // Reset city when region changes
    });
  };

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        />
        <button
          type="submit"
          className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
        >
          {t("search")}
        </button>
      </form>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="filter-region" className="mb-1 block text-xs font-medium text-slate-700">
            Island
          </label>
          <select
            id="filter-region"
            value={filters.region}
            onChange={(e) => handleRegionChange(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">All Islands</option>
            <option value="north">North Island</option>
            <option value="south">South Island</option>
          </select>
        </div>
        <div>
          <label htmlFor="filter-city" className="mb-1 block text-xs font-medium text-slate-700">
            City
          </label>
          <select
            id="filter-city"
            value={filters.city}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                city: e.target.value
              })
            }
            disabled={!filters.region}
            className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="">All Cities</option>
            {availableCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filter-type" className="mb-1 block text-xs font-medium text-slate-700">
            School Type
          </label>
          <select
            id="filter-type"
            value={filters.schoolType}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                schoolType: e.target.value as SchoolTypeFilter
              })
            }
            className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">All Types</option>
            <option value="kindergarten">Kindergarten / ECE</option>
            <option value="primary">Primary</option>
            <option value="intermediate">Intermediate</option>
            <option value="secondary">Secondary</option>
            <option value="composite">Composite</option>
            <option value="university">University</option>
            <option value="institute_of_technology">Institute of Technology</option>
            <option value="private_tertiary">Private Tertiary</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export function MapPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [filters, setFilters] = useState<{
    region: string;
    city: string;
    schoolType: SchoolTypeFilter;
  }>({
    region: "",
    city: "",
    schoolType: ""
  });
  const mapRef = useRef<any>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
  });

  // Load schools with current filters
  const loadSchools = useCallback(async (keyword?: string) => {
    setLoading(true);
    try {
      const params: {
        keyword?: string;
        school_type?: string;
        city?: string;
      } = {};

      if (keyword) {
        params.keyword = keyword;
      }
      if (filters.schoolType) {
        params.school_type = filters.schoolType;
      }

      // If city is selected, use it directly
      if (filters.city) {
        params.city = filters.city;
      }

      // Fetch schools
      const data = await fetchSchools(params);
      let filtered = data.items.filter((s) => s.latitude && s.longitude);

      // If island is selected but no city, filter by island cities
      if (filters.region && !filters.city) {
        const islandCities =
          filters.region === "north" ? NORTH_ISLAND_CITIES : SOUTH_ISLAND_CITIES;
        filtered = filtered.filter((s) => {
          const city = s.city?.toLowerCase() || "";
          return islandCities.some(
            (cityName) => city === cityName.toLowerCase()
          );
        });
      }

      setSchools(filtered);

      // If schools found and searching, zoom to first result
      if (keyword && filtered.length > 0 && filtered[0].latitude && filtered[0].longitude) {
        const firstSchool = filtered[0];
        if (mapRef.current) {
          mapRef.current.panTo({ lat: firstSchool.latitude, lng: firstSchool.longitude });
          mapRef.current.setZoom(12);
        }
      }
    } catch (error) {
      console.error("Failed to load schools:", error);
    } finally {
      setLoading(false);
    }
  }, [filters.region, filters.city, filters.schoolType]);

  // Initial load and reload when filters change
  useEffect(() => {
    loadSchools();
  }, [loadSchools]);

  // Move map to selected city
  useEffect(() => {
    if (filters.city && isLoaded && mapRef.current) {
      const cityCoords = CITY_COORDINATES[filters.city];
      if (cityCoords) {
        // Use setTimeout to ensure map is fully loaded
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.panTo({ lat: cityCoords.lat, lng: cityCoords.lng });
            mapRef.current.setZoom(cityCoords.zoom);
          }
        }, 100);
      }
    }
  }, [filters.city, isLoaded]);

  // Handle search
  const handleSearch = async (keyword: string) => {
    setSearchKeyword(keyword);
    await loadSchools(keyword);
  };

  // Handle filter change
  const handleFilterChange = (newFilters: {
    region: string;
    city: string;
    schoolType: SchoolTypeFilter;
  }) => {
    setFilters(newFilters);
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

      {/* Search and Filters - moved below header */}
      <MapSearchAndFilters
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        filters={filters}
      />

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
              // Create blue circle icon
              const blueIcon = {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: "#4285F4", // Google Blue
                fillOpacity: 1,
                strokeColor: "#FFFFFF",
                strokeWeight: 2,
              };
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
                <div className="min-w-[220px] max-w-[280px] space-y-2">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 leading-tight mb-1.5">
                      {selectedSchool.name}
                    </h3>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-700 capitalize">
                        {selectedSchool.school_type?.replace(/_/g, " ")}
                      </p>
                      {selectedSchool.city && (
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <span>📍</span>
                          <span>
                            {selectedSchool.city}
                            {selectedSchool.suburb && `, ${selectedSchool.suburb}`}
                          </span>
                        </p>
                      )}
                      {selectedSchool.sector && (
                        <p className="text-xs text-slate-500 capitalize">
                          {selectedSchool.sector.replace(/_/g, " ")}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedSchool(null);
                      navigate(`/schools/${selectedSchool.id}`);
                    }}
                    className="w-full rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
                  >
                    View Details
                  </button>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
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
