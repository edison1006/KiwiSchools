import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchUniversityById } from "../api/universityApi";
import type { University } from "../types";

export function UniversityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<University | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetchUniversityById(Number(id))
      .then(setData)
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Failed to load university";
        setError(message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="text-xs text-slate-600">Loading...</p>;
  }

  if (error) {
    return <p className="text-xs text-red-600">{error}</p>;
  }

  if (!data) {
    return <p className="text-xs text-slate-600">University not found.</p>;
  }

  const tuitionDomestic =
    data.tuition_domestic_min || data.tuition_domestic_max
      ? `NZD ${data.tuition_domestic_min?.toLocaleString() ?? "?"}${
          data.tuition_domestic_max
            ? ` - ${data.tuition_domestic_max.toLocaleString()}`
            : ""
        } / year`
      : "Not available";

  const tuitionIntl =
    data.tuition_international_min || data.tuition_international_max
      ? `NZD ${data.tuition_international_min?.toLocaleString() ?? "?"}${
          data.tuition_international_max
            ? ` - ${data.tuition_international_max.toLocaleString()}`
            : ""
        } / year`
      : "Not available";

  return (
    <div className="space-y-4">
      <Link
        to="/universities"
        className="inline-flex items-center text-xs text-slate-600 hover:text-slate-800"
      >
        ← Back to universities
      </Link>

      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-900">{data.name}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium capitalize text-slate-700">
            {data.university_type}
          </span>
          {data.qs_world_rank && (
            <span className="inline-flex rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
              QS #{data.qs_world_rank}
            </span>
          )}
        </div>
        {data.city && (
          <p className="text-xs text-slate-600">City: {data.city}</p>
        )}
      </header>

      <section className="grid gap-4 md:grid-cols-[2fr,1.5fr]">
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <h2 className="text-xs font-semibold text-slate-800">Overview</h2>
          {data.description && (
            <p className="text-xs text-slate-600">{data.description}</p>
          )}
          {data.strong_subjects && (
            <div className="text-xs text-slate-600">
              <p className="font-medium">Strong subjects</p>
              <p>{data.strong_subjects}</p>
            </div>
          )}
          {data.website_url && (
            <p className="text-xs">
              <a
                href={data.website_url}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-emerald-700 hover:text-emerald-800"
              >
                Visit university website
              </a>
            </p>
          )}
        </div>

        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <h2 className="text-xs font-semibold text-slate-800">
            Tuition (per year)
          </h2>
          <p className="text-xs text-slate-600">
            <span className="font-medium">Domestic:</span> {tuitionDomestic}
          </p>
          <p className="text-xs text-slate-600">
            <span className="font-medium">International:</span> {tuitionIntl}
          </p>
        </div>
      </section>
    </div>
  );
}



