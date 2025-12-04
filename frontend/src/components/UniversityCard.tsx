import { Link } from "react-router-dom";
import type { University } from "../types";

interface Props {
  university: University;
}

export function UniversityCard({ university }: Props) {
  const tuitionIntl =
    university.tuition_international_min || university.tuition_international_max
      ? `NZD ${
          university.tuition_international_min?.toLocaleString() ?? "?"
        }${
          university.tuition_international_max
            ? ` - ${university.tuition_international_max.toLocaleString()}`
            : ""
        } / year (intl)`
      : "Tuition info not available";

  return (
    <article className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <header className="mb-2 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            <Link
              to={`/universities/${university.id}`}
              className="hover:text-emerald-700"
            >
              {university.name}
            </Link>
          </h2>
          {university.city && (
            <p className="text-[11px] text-slate-500">{university.city}</p>
          )}
        </div>
        {university.qs_world_rank && (
          <span className="inline-flex rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
            QS #{university.qs_world_rank}
          </span>
        )}
      </header>
      <div className="space-y-1 text-xs text-slate-600">
        <p className="capitalize">{university.university_type}</p>
        <p>{tuitionIntl}</p>
        {university.strong_subjects && (
          <p>
            <span className="font-medium">Strong subjects:</span>{" "}
            {university.strong_subjects}
          </p>
        )}
      </div>
    </article>
  );
}



