import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchSchoolById } from "../api/schoolApi";
import type { School } from "../types";

export function SchoolDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<School | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetchSchoolById(Number(id))
      .then(setData)
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Failed To Load School";
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
    return <p className="text-xs text-slate-600">School Not Found.</p>;
  }

  return (
    <div className="space-y-4">
      <Link
        to="/schools"
        className="inline-flex items-center text-xs text-slate-600 hover:text-slate-800"
      >
        ← Back To Schools
      </Link>

      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-900">{data.name}</h1>
        {data.city && (
          <p className="text-xs text-slate-500">{data.city}</p>
        )}
        {data.school_type && (
          <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 capitalize">
            {data.school_type.replace(/_/g, " ")}
          </span>
        )}
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <h2 className="text-xs font-semibold text-slate-800">
            Overview
          </h2>
          {data.school_type && (
            <p className="text-xs text-slate-600">
              <span className="font-medium">School Type:</span>{" "}
              <span className="capitalize">{data.school_type.replace(/_/g, " ")}</span>
            </p>
          )}
          {data.city && (
            <p className="text-xs text-slate-600">
              <span className="font-medium">City:</span> {data.city}
            </p>
          )}
          {(data.latitude && data.longitude) && (
            <p className="text-xs text-slate-600">
              <span className="font-medium">Location:</span> {data.latitude.toFixed(4)}, {data.longitude.toFixed(4)}
            </p>
          )}
        </div>

        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <h2 className="text-xs font-semibold text-slate-800">
            Additional Information
          </h2>
          <p className="text-xs text-slate-600">
            More details about this school will be displayed here when available.
          </p>
        </div>
      </section>
    </div>
  );
}
