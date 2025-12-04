import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchUniversities, type UniversityListParams } from "../api/universityApi";
import type { University } from "../types";
import { UniversityCard } from "../components/UniversityCard";

export function UniversityListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [city, setCity] = useState(searchParams.get("city") ?? "");
  const [type, setType] = useState(searchParams.get("university_type") ?? "");
  const [keyword, setKeyword] = useState(searchParams.get("keyword") ?? "");

  useEffect(() => {
    const params: UniversityListParams = {
      city: city || undefined,
      university_type: type || undefined,
      keyword: keyword || undefined
    };

    const next = new URLSearchParams();
    if (params.city) next.set("city", params.city);
    if (params.university_type) next.set("university_type", params.university_type);
    if (params.keyword) next.set("keyword", params.keyword);
    setSearchParams(next);

    setLoading(true);
    setError(null);

    fetchUniversities(params)
      .then(setItems)
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Failed to load universities";
        setError(message);
      })
      .finally(() => setLoading(false));
  }, [city, type, keyword, setSearchParams]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Universities & institutes of technology
          </h1>
          <p className="text-xs text-slate-600">
            Filter by city and type, then explore QS rankings, strong subjects and
            tuition ranges.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:flex-row md:items-end">
        <div className="flex-1 space-y-1">
          <label className="block text-[11px] font-medium text-slate-600">
            City
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Auckland"
            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
          />
        </div>

        <div className="flex-1 space-y-1">
          <label className="block text-[11px] font-medium text-slate-600">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
          >
            <option value="">All types</option>
            <option value="university">University</option>
            <option value="institute_of_technology">
              Institute of technology
            </option>
            <option value="private">Private</option>
          </select>
        </div>

        <div className="flex-1 space-y-1">
          <label className="block text-[11px] font-medium text-slate-600">
            Keyword
          </label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search by name..."
            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
          />
        </div>
      </div>

      <div className="space-y-2">
        {loading && <p className="text-xs text-slate-600">Loading...</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <p className="text-xs text-slate-600">
            No universities found. Try adjusting filters.
          </p>
        )}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {items.map((u) => (
            <UniversityCard key={u.id} university={u} />
          ))}
        </div>
      </div>
    </div>
  );
}



