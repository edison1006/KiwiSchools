import { Link } from "react-router-dom";
import type { School } from "../types";

interface Props {
  school: School;
}

export function SchoolCard({ school }: Props) {
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
          {school.city && (
            <p className="text-[11px] text-slate-500">{school.city}</p>
          )}
        </div>
        {school.school_type && (
          <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 capitalize">
            {school.school_type.replace(/_/g, " ")}
          </span>
        )}
      </header>
      <div className="space-y-1 text-xs text-slate-600">
        {school.school_type && (
          <p className="capitalize">{school.school_type.replace(/_/g, " ")}</p>
        )}
      </div>
    </article>
  );
}
