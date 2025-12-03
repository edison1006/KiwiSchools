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
          err instanceof Error ? err.message : "Failed to load school";
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
    return <p className="text-xs text-slate-600">School not found.</p>;
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
        to="/schools"
        className="inline-flex items-center text-xs text-slate-600 hover:text-slate-800"
      >
        ← Back to schools
      </Link>

      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-900">{data.name}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium capitalize text-slate-700">
            {data.school_type}
          </span>
          {data.ownership_type && (
            <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
              {data.ownership_type.replace("_", " ")}
            </span>
          )}
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-[2fr,1.5fr]">
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <h2 className="text-xs font-semibold text-slate-800">Education</h2>
          {data.education_system && (
            <p className="text-xs text-slate-600">
              <span className="font-medium">Curriculum:</span>{" "}
              {data.education_system}
            </p>
          )}
          {data.address && (
            <p className="text-xs text-slate-600">
              <span className="font-medium">Address:</span> {data.address}
            </p>
          )}
          {data.website_url && (
            <p className="text-xs">
              <a
                href={data.website_url}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-emerald-700 hover:text-emerald-800"
              >
                Visit school website
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

      <section className="grid gap-4 md:grid-cols-2">
        <SchoolZoneInfo school={data} />
        <SchoolStatsTable school={data} />
      </section>
    </div>
  );
}

function SchoolZoneInfo({ school }: { school: School }) {
  const zone = school.zone;

  if (!zone) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <h2 className="text-xs font-semibold text-slate-800">
          School zone & house prices
        </h2>
        <p className="text-xs text-slate-600">No zone information available.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <h2 className="text-xs font-semibold text-slate-800">
        School zone & house prices
      </h2>
      <div className="mt-1 space-y-1 text-xs text-slate-600">
        <p>
          <span className="font-medium">Zone:</span> {zone.name}
        </p>
        {zone.avg_house_price && (
          <p>
            <span className="font-medium">Average house price:</span>{" "}
            {zone.median_house_price_currency ?? "NZD"}{" "}
            {zone.avg_house_price.toLocaleString()}
          </p>
        )}
        {zone.median_house_price && (
          <p>
            <span className="font-medium">Median house price:</span>{" "}
            {zone.median_house_price_currency ?? "NZD"}{" "}
            {zone.median_house_price.toLocaleString()}
          </p>
        )}
        {zone.last_updated && (
          <p>
            <span className="font-medium">Last updated:</span>{" "}
            {new Date(zone.last_updated).toLocaleDateString()}
          </p>
        )}
        {zone.external_source_url && (
          <p>
            <a
              href={zone.external_source_url}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              View data source
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

function SchoolStatsTable({ school }: { school: School }) {
  const stats = school.recent_stats ?? [];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <h2 className="text-xs font-semibold text-slate-800">
        Progression & rankings (last 3 years)
      </h2>
      {stats.length === 0 ? (
        <p className="mt-1 text-xs text-slate-600">
          No recent stats available.
        </p>
      ) : (
        <div className="mt-2 overflow-hidden rounded-lg border border-slate-200">
          <table className="min-w-full border-collapse text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-2 py-1 text-left font-medium text-slate-600">
                  Year
                </th>
                <th className="px-2 py-1 text-left font-medium text-slate-600">
                  Progression rate
                </th>
                <th className="px-2 py-1 text-left font-medium text-slate-600">
                  Ranking
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => (
                <tr key={s.year} className="border-t border-slate-100">
                  <td className="px-2 py-1">{s.year}</td>
                  <td className="px-2 py-1">
                    {s.progression_rate != null
                      ? `${s.progression_rate.toFixed(1)}%`
                      : "N/A"}
                  </td>
                  <td className="px-2 py-1">{s.ranking ?? "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}



