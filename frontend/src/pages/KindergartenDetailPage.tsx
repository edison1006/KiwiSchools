import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchKindergartenById } from "../api/kindergartenApi";
import type { Kindergarten } from "../types";

export function KindergartenDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Kindergarten | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetchKindergartenById(Number(id))
      .then(setData)
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Failed to load kindergarten";
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
    return <p className="text-xs text-slate-600">Kindergarten not found.</p>;
  }

  const feeText =
    data.fee_min || data.fee_max
      ? `${data.fee_currency ?? "NZD"} ${
          data.fee_min?.toLocaleString() ?? "?"
        }${
          data.fee_max ? ` - ${data.fee_max.toLocaleString()}` : ""
        }${
          data.fee_unit ? ` / ${data.fee_unit.replace("per_", "")}` : ""
        }`
      : "Fee info not available";

  return (
    <div className="space-y-4">
      <Link
        to="/kindergartens"
        className="inline-flex items-center text-xs text-slate-600 hover:text-slate-800"
      >
        ← Back to kindergartens
      </Link>

      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-900">{data.name}</h1>
        {data.brand_name && (
          <p className="text-xs text-slate-500">{data.brand_name}</p>
        )}
        {data.education_system && (
          <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
            {data.education_system}
          </span>
        )}
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <h2 className="text-xs font-semibold text-slate-800">
            Overview
          </h2>
          {data.owner_or_group && (
            <p className="text-xs text-slate-600">
              <span className="font-medium">Owner / group:</span>{" "}
              {data.owner_or_group}
            </p>
          )}
          {data.description && (
            <p className="text-xs text-slate-600">{data.description}</p>
          )}
        </div>

        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <h2 className="text-xs font-semibold text-slate-800">
            Fees & contact
          </h2>
          <p className="text-xs text-slate-600">
            <span className="font-medium">Estimated fees:</span> {feeText}
          </p>
          {data.address && (
            <p className="text-xs text-slate-600">
              <span className="font-medium">Address:</span> {data.address}
            </p>
          )}
          {data.phone && (
            <p className="text-xs text-slate-600">
              <span className="font-medium">Phone:</span> {data.phone}
            </p>
          )}
          {data.email && (
            <p className="text-xs text-slate-600">
              <span className="font-medium">Email:</span> {data.email}
            </p>
          )}
          {data.website_url && (
            <p>
              <a
                href={data.website_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
              >
                Visit website
              </a>
            </p>
          )}
        </div>
      </section>
    </div>
  );
}


