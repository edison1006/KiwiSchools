import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchSchools, type SchoolListParams } from "../api/schoolApi";
import type { School } from "../types";
import { SchoolCard } from "../components/SchoolCard";

const SCHOOL_TYPES = ["primary", "intermediate", "secondary", "composite"];
const OWNERSHIP_TYPES = ["public", "private", "state_integrated"];

export function SchoolListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // When school_type is set from URL (e.g., from homepage card click),
  // clear other filters to ensure independent search
  const urlSchoolType = searchParams.get("school_type") ?? "";
  const urlKeyword = searchParams.get("keyword");
  const urlOwnershipType = searchParams.get("ownership_type");
  const hasOnlySchoolType = urlSchoolType && !urlKeyword && !urlOwnershipType;

  const [keyword, setKeyword] = useState(urlKeyword ?? "");
  const [schoolType, setSchoolType] = useState(urlSchoolType);
  const [ownershipType, setOwnershipType] = useState(urlOwnershipType ?? "");

  // Clear other filters when coming from homepage card click (only school_type in URL)
  useEffect(() => {
    if (hasOnlySchoolType) {
      setKeyword("");
      setOwnershipType("");
    }
  }, [urlSchoolType, urlKeyword, urlOwnershipType]);

  useEffect(() => {
    const params: SchoolListParams = {
      keyword: keyword || undefined,
      school_type: schoolType || undefined,
      ownership_type: ownershipType || undefined
    };

    const next = new URLSearchParams();
    if (params.keyword) next.set("keyword", params.keyword);
    if (params.school_type) next.set("school_type", params.school_type);
    if (params.ownership_type)
      next.set("ownership_type", params.ownership_type);
    setSearchParams(next);

    setLoading(true);
    setError(null);

    fetchSchools(params)
      .then((data) => {
        setItems(data.items);
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Failed To Load Schools";
        setError(message);
      })
      .finally(() => setLoading(false));
  }, [keyword, schoolType, ownershipType, setSearchParams]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Primary, Intermediate & Secondary Schools
          </h1>
          <p className="text-xs text-slate-600">
            Filter By School Type, Ownership And Keyword. Explore School Zones And
            House Prices On Detail Pages.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:flex-row md:items-end">
        <div className="flex-1 space-y-1">
          <label className="block text-[11px] font-medium text-slate-600">
            School Type
          </label>
          <select
            value={schoolType}
            onChange={(e) => setSchoolType(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
          >
            <option value="">All Types</option>
            {SCHOOL_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 space-y-1">
          <label className="block text-[11px] font-medium text-slate-600">
            Ownership
          </label>
          <select
            value={ownershipType}
            onChange={(e) => setOwnershipType(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
          >
            <option value="">All Ownership Types</option>
            {OWNERSHIP_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace("_", " ")}
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
        {loading && <p className="text-xs text-slate-600">Loading...</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <p className="text-xs text-slate-600">
            No Schools Found. Try Adjusting Filters.
          </p>
        )}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {items.map((s) => (
            <SchoolCard key={s.id} school={s} />
          ))}
        </div>
      </div>
    </div>
  );
}



