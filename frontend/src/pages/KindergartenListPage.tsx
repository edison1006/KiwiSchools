import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  fetchKindergartens,
  type KindergartenListParams
} from "../api/kindergartenApi";
import type { Kindergarten } from "../types";
import { KindergartenCard } from "../components/KindergartenCard";

const EDUCATION_OPTIONS = [
  "Montessori",
  "Reggio Emilia",
  "Play-based",
  "Bilingual",
  "Other"
];

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

export function KindergartenListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<Kindergarten[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [keyword, setKeyword] = useState(searchParams.get("keyword") ?? "");
  const [selectedIsland, setSelectedIsland] = useState<string>(
    searchParams.get("island") ?? ""
  );
  const [selectedCity, setSelectedCity] = useState<string>(
    searchParams.get("city") ?? ""
  );
  const [educationSystem, setEducationSystem] = useState(
    searchParams.get("education_system") ?? ""
  );

  // Get available cities based on selected island
  const availableCities = selectedIsland === "north" 
    ? NORTH_ISLAND_CITIES 
    : selectedIsland === "south" 
    ? SOUTH_ISLAND_CITIES 
    : [];

  // Reset city when island changes
  useEffect(() => {
    if (selectedIsland && !availableCities.includes(selectedCity)) {
      setSelectedCity("");
    }
  }, [selectedIsland, selectedCity, availableCities]);

  // Load and filter kindergartens based on selected criteria
  useEffect(() => {
    const params: KindergartenListParams = {
      keyword: keyword || undefined,
      education_system: educationSystem || undefined,
      city: selectedCity || undefined,
    };

    const nextSearch = new URLSearchParams();
    if (params.keyword) nextSearch.set("keyword", params.keyword);
    if (params.education_system)
      nextSearch.set("education_system", params.education_system);
    if (selectedIsland) nextSearch.set("island", selectedIsland);
    if (selectedCity) nextSearch.set("city", selectedCity);
    setSearchParams(nextSearch);

    setLoading(true);
    setError(null);
    
    // Fetch all kindergartens (no filters) to show all by default
    fetchKindergartens({ page_size: 1000 })
      .then((data) => {
        let filtered = data.items;
        
        // Apply client-side filtering
        if (params.keyword) {
          const keywordLower = params.keyword.toLowerCase();
          filtered = filtered.filter((k) =>
            k.name.toLowerCase().includes(keywordLower)
          );
        }
        
        if (params.education_system) {
          const systemLower = params.education_system.toLowerCase();
          filtered = filtered.filter((k) => {
            const system = (k.education_system || k.education_systems || "").toLowerCase();
            return system.includes(systemLower);
          });
        }
        
        if (selectedCity) {
          filtered = filtered.filter((k) => {
            const cityLower = selectedCity.toLowerCase();
            return (
              k.city?.toLowerCase() === cityLower ||
              k.address?.toLowerCase().includes(cityLower) ||
              k.suburb?.toLowerCase().includes(cityLower)
            );
          });
        } else if (selectedIsland) {
          // If only island is selected, filter by cities in that island
          const islandCities = selectedIsland === "north" 
            ? NORTH_ISLAND_CITIES 
            : SOUTH_ISLAND_CITIES;
          filtered = filtered.filter((k) => {
            const city = k.city?.toLowerCase() || "";
            const address = k.address?.toLowerCase() || "";
            return islandCities.some(cityName => 
              city === cityName.toLowerCase() ||
              address.includes(cityName.toLowerCase())
            );
          });
        }
        
        setItems(filtered);
      })
      .catch((err: unknown) => {
        let message = "Failed To Load Kindergartens";
        if (err instanceof Error) {
          message = err.message;
          // Check for network errors
          if (err.message.includes("Network Error") || err.message.includes("ERR_NETWORK")) {
            message = "Network Error: Please check if the backend server is running at http://localhost:8000";
          } else if (err.message.includes("timeout")) {
            message = "Request Timeout: The server is taking too long to respond";
          }
        } else if (typeof err === "object" && err !== null && "response" in err) {
          const axiosError = err as { response?: { status?: number; data?: unknown } };
          if (axiosError.response?.status === 404) {
            message = "API Endpoint Not Found";
          } else if (axiosError.response?.status === 500) {
            message = "Server Error: Please try again later";
          } else {
            message = `Error ${axiosError.response?.status || "Unknown"}: Failed To Load Kindergartens`;
          }
        }
        setError(message);
        console.error("Error loading kindergartens:", err);
      })
      .finally(() => setLoading(false));
  }, [keyword, educationSystem, selectedIsland, selectedCity, setSearchParams]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Kindergartens & Early Childhood Education
          </h1>
          <p className="text-xs text-slate-600">
            Filter By Island, City And Education System, Then Explore Fees And Contact
            Details.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:flex-row md:items-end">
        <div className="flex-1 space-y-1">
          <label className="block text-[11px] font-medium text-slate-600">
            Island
          </label>
          <select
            value={selectedIsland}
            onChange={(e) => {
              setSelectedIsland(e.target.value);
              setSelectedCity(""); // Reset city when island changes
            }}
            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
          >
            <option value="">All Islands</option>
            <option value="north">North Island</option>
            <option value="south">South Island</option>
          </select>
        </div>

        <div className="flex-1 space-y-1">
          <label className="block text-[11px] font-medium text-slate-600">
            City
          </label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            disabled={!selectedIsland}
            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="">All Cities</option>
            {availableCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 space-y-1">
          <label className="block text-[11px] font-medium text-slate-600">
            Education System
          </label>
          <select
            value={educationSystem}
            onChange={(e) => setEducationSystem(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
          >
            <option value="">All Types</option>
            {EDUCATION_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 space-y-1">
          <label className="block text-[11px] font-medium text-slate-600">
            Keyword
          </label>
          <input
            type="text"
            placeholder="Search By Name..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
          />
        </div>
      </div>

      <div className="space-y-2">
        {loading && (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
            <p className="text-xs text-slate-600">Loading...</p>
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-2">
              <svg
                className="h-5 w-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{error}</p>
                {error.includes("Network Error") && (
                  <div className="mt-2 text-xs text-red-700">
                    <p className="mb-1">To fix this issue:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Make sure the backend server is running</li>
                      <li>Start the backend with: <code className="bg-red-100 px-1 rounded">cd backend && uvicorn app.main:app --reload</code></li>
                      <li>Check that the backend is accessible at http://localhost:8000</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {!loading && !error && items.length === 0 && (
          <p className="text-xs text-slate-600">
            No Kindergartens Found. Try Adjusting Filters.
          </p>
        )}
        {!loading && !error && items.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {items.map((k) => (
              <KindergartenCard key={k.id} kindergarten={k} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
