import { Link } from "react-router-dom";
import type { School } from "../types";

interface Props {
  school: School;
}

export function SchoolCard({ school }: Props) {
  const tuition =
    school.tuition_min || school.tuition_max
      ? `${school.tuition_currency ?? "NZD"} ${school.tuition_min?.toLocaleString() ?? "?"}${
          school.tuition_max
            ? ` - ${school.tuition_max.toLocaleString()}`
            : ""
        } / year`
      : "Tuition info not available";

  const zoneText =
    school.zone && (school.zone.avg_house_price || school.zone.median_house_price)
      ? `Zone: ${school.zone.name}, avg house price approx ${
          school.zone.median_house_price ??
          school.zone.avg_house_price ??
          0
        } NZD`
      : school.zone
      ? `Zone: ${school.zone.name}`
      : "No zone info";

  return (
    <article className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <header className="mb-2 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            <Link
              to={`/schools/${school.id}`}
              className="hover:text-emerald-700"
            >
              {school.name}
            </Link>
          </h2>
          <p className="text-[11px] text-slate-500">
            {school.sector
              ? school.sector.replace("_", " ")
              : school.city || "School"}
          </p>
        </div>
        <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium capitalize text-slate-700">
          {school.school_type}
        </span>
      </header>
      <div className="space-y-1 text-xs text-slate-600">
        {school.education_systems && (
          <p>
            <span className="font-medium">Curriculum:</span>{" "}
            {school.education_systems}
          </p>
        )}
        {school.curriculum && (
          <p>
            <span className="font-medium">Curriculum:</span>{" "}
            {school.curriculum}
          </p>
        )}
        <p>{tuition}</p>
        <p>{zoneText}</p>
      </div>
    </article>
  );
}



