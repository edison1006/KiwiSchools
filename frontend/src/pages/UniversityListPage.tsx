import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchUniversities } from "../api/universityApi";
import type { University } from "../types";
import { UniversityCard } from "../components/UniversityCard";

export function UniversityListPage() {
  const [searchParams] = useSearchParams();
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const keyword = searchParams.get("keyword") || "";
  const universityType = searchParams.get("university_type") || "";

  useEffect(() => {
    const loadUniversities = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchUniversities({
          keyword: keyword || undefined,
          university_type: universityType || undefined,
        });
        setUniversities(data.items);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load universities";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadUniversities();
  }, [keyword, universityType]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-slate-900">Universities</h1>
        <p className="text-xs text-slate-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-slate-900">Universities</h1>
        <p className="text-xs text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Universities</h1>
      {(keyword || universityType) && (
        <div className="space-y-1">
          {keyword && (
            <p className="text-xs text-slate-600">
              Search results for: <span className="font-medium">{keyword}</span>
            </p>
          )}
          {universityType && (
            <p className="text-xs text-slate-600">
              University type: <span className="font-medium capitalize">{universityType.replace(/_/g, " ")}</span>
            </p>
          )}
        </div>
      )}
      {universities.length === 0 ? (
        <p className="text-xs text-slate-600">No universities found.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {universities.map((university) => (
            <UniversityCard key={university.id} university={university} />
          ))}
        </div>
      )}
    </div>
  );
}
