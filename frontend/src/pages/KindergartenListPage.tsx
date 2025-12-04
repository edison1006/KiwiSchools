import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchRegions } from "../api/regionApi";
import {
  fetchKindergartens,
  type KindergartenListParams
} from "../api/kindergartenApi";
import type { Kindergarten, Region } from "../types";
import { KindergartenCard } from "../components/KindergartenCard";

const EDUCATION_OPTIONS = [
  "Montessori",
  "Reggio Emilia",
  "Play-based",
  "Bilingual",
  "Other"
];

export function KindergartenListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [regions, setRegions] = useState<Region[]>([]);
  const [items, setItems] = useState<Kindergarten[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [keyword, setKeyword] = useState(searchParams.get("keyword") ?? "");
  const [selectedRegionId, setSelectedRegionId] = useState<string>(
    searchParams.get("region_id") ?? ""
  );
  const [educationSystem, setEducationSystem] = useState(
    searchParams.get("education_system") ?? ""
  );

  // Load regions for dropdown (city/suburb types from backend)
  useEffect(() => {
    fetchRegions("city")
      .then(setRegions)
      .catch(() => {
        // fail silently for now
      });
  }, []);

  useEffect(() => {
    const params: KindergartenListParams = {
      keyword: keyword || undefined,
      education_system: educationSystem || undefined,
      region_id: selectedRegionId ? Number(selectedRegionId) : undefined
    };

    const nextSearch = new URLSearchParams();
    if (params.keyword) nextSearch.set("keyword", params.keyword);
    if (params.education_system)
      nextSearch.set("education_system", params.education_system);
    if (params.region_id) nextSearch.set("region_id", String(params.region_id));
    setSearchParams(nextSearch);

    setLoading(true);
    setError(null);
    fetchKindergartens(params)
      .then((data) => {
        setItems(data.items);
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Failed to load kindergartens";
        setError(message);
      })
      .finally(() => setLoading(false));
  }, [keyword, educationSystem, selectedRegionId, setSearchParams]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Kindergartens & early childhood education
          </h1>
          <p className="text-xs text-slate-600">
            Filter by region and education system, then explore fees and contact
            details.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:flex-row md:items-end">
        <div className="flex-1 space-y-1">
          <label className="block text-[11px] font-medium text-slate-600">
            Region / City
          </label>
          <select
            value={selectedRegionId}
            onChange={(e) => setSelectedRegionId(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
          >
            <option value="">All regions</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 space-y-1">
          <label className="block text-[11px] font-medium text-slate-600">
            Education system
          </label>
          <select
            value={educationSystem}
            onChange={(e) => setEducationSystem(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
          >
            <option value="">All types</option>
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
            placeholder="Search by name..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
          />
        </div>
      </div>

      <div className="space-y-2">
        {loading && <p className="text-xs text-slate-600">Loading...</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <p className="text-xs text-slate-600">
            No kindergartens found. Try adjusting filters.
          </p>
        )}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {items.map((k) => (
            <KindergartenCard key={k.id} kindergarten={k} />
          ))}
        </div>
      </div>
    </div>
  );
}



