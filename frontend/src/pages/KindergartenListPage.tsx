import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchKindergartens } from "../api/kindergartenApi";
import type { Kindergarten } from "../types";
import { KindergartenCard } from "../components/KindergartenCard";

export function KindergartenListPage() {
  const [searchParams] = useSearchParams();
  const [kindergartens, setKindergartens] = useState<Kindergarten[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const keyword = searchParams.get("keyword") || "";

  useEffect(() => {
    const loadKindergartens = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchKindergartens({ keyword: keyword || undefined });
        setKindergartens(data.items);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load kindergartens";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadKindergartens();
  }, [keyword]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-slate-900">Kindergartens</h1>
        <p className="text-xs text-slate-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-slate-900">Kindergartens</h1>
        <p className="text-xs text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Kindergartens</h1>
      {keyword && (
        <p className="text-xs text-slate-600">
          Search results for: <span className="font-medium">{keyword}</span>
        </p>
      )}
      {kindergartens.length === 0 ? (
        <p className="text-xs text-slate-600">No kindergartens found.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {kindergartens.map((kindergarten) => (
            <KindergartenCard key={kindergarten.id} kindergarten={kindergarten} />
          ))}
        </div>
      )}
    </div>
  );
}
