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
          err instanceof Error ? err.message : "Failed To Load University";
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
    return <p className="text-xs text-slate-600">University Not Found.</p>;
  }

  const tuitionIntl =
    data.tuition_international_min || data.tuition_international_max
      ? `NZD ${
          data.tuition_international_min?.toLocaleString() ?? "?"
        }${
          data.tuition_international_max
            ? ` - ${data.tuition_international_max.toLocaleString()}`
            : ""
        } / year (international)`
      : "Tuition info not available";

  return (
    <div className="space-y-4">
      <Link
        to="/universities"
        className="inline-flex items-center text-xs text-slate-600 hover:text-slate-800"
      >
        ← Back To Universities
      </Link>

      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-900">{data.name}</h1>
        {data.city && (
          <p className="text-xs text-slate-500">{data.city}</p>
        )}
        <div className="flex items-center gap-2">
          {data.university_type && (
            <span className="inline-flex rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700 capitalize">
              {data.university_type.replace(/_/g, " ")}
            </span>
          )}
          {data.qs_world_rank && (
            <span className="inline-flex rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
              QS World Rank #{data.qs_world_rank}
            </span>
          )}
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <h2 className="text-xs font-semibold text-slate-800">
            Overview
          </h2>
          <p className="text-xs text-slate-600">
            <span className="font-medium">Tuition (International):</span> {tuitionIntl}
          </p>
          {data.strong_subjects && (
            <p className="text-xs text-slate-600">
              <span className="font-medium">Strong Subjects:</span> {data.strong_subjects}
            </p>
          )}
        </div>

        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <h2 className="text-xs font-semibold text-slate-800">
            Additional Information
          </h2>
          <p className="text-xs text-slate-600">
            More details about this university will be displayed here when available.
          </p>
        </div>
      </section>
    </div>
  );
}
