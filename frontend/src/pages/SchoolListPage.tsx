import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchSchools } from "../api/schoolApi";
import type { School } from "../types";
import { SchoolCard } from "../components/SchoolCard";

export function SchoolListPage() {
  const [searchParams] = useSearchParams();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const keyword = searchParams.get("keyword") || "";
  const schoolType = searchParams.get("school_type") || "";
  const city = searchParams.get("city") || "";

  useEffect(() => {
    const loadSchools = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSchools({
          keyword: keyword || undefined,
          school_type: schoolType || undefined,
        });
        // Filter by city if provided
        let filteredSchools = data.items;
        if (city) {
          filteredSchools = filteredSchools.filter(
            (school) => school.city?.toLowerCase() === city.toLowerCase()
          );
        }
        setSchools(filteredSchools);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load schools";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadSchools();
  }, [keyword, schoolType, city]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-slate-900">Schools</h1>
        <p className="text-xs text-slate-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-slate-900">Schools</h1>
        <p className="text-xs text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Schools</h1>
      {(keyword || schoolType || city) && (
        <div className="space-y-1">
          {keyword && (
            <p className="text-xs text-slate-600">
              Search results for: <span className="font-medium">{keyword}</span>
            </p>
          )}
          {schoolType && (
            <p className="text-xs text-slate-600">
              School type: <span className="font-medium capitalize">{schoolType.replace(/_/g, " ")}</span>
            </p>
          )}
          {city && (
            <p className="text-xs text-slate-600">
              City: <span className="font-medium">{city}</span>
            </p>
          )}
        </div>
      )}
      {schools.length === 0 ? (
        <p className="text-xs text-slate-600">No schools found.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {schools.map((school) => (
            <SchoolCard key={school.id} school={school} />
          ))}
        </div>
      )}
    </div>
  );
}
