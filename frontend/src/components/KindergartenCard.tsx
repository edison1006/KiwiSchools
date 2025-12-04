import { Link } from "react-router-dom";
import type { Kindergarten } from "../types";

interface Props {
  kindergarten: Kindergarten;
}

export function KindergartenCard({ kindergarten }: Props) {
  const feeText =
    kindergarten.fee_min || kindergarten.fee_max
      ? `${kindergarten.fee_currency ?? "NZD"} ${
          kindergarten.fee_min?.toLocaleString() ?? "?"
        }${
          kindergarten.fee_max
            ? ` - ${kindergarten.fee_max.toLocaleString()}`
            : ""
        }${
          kindergarten.fee_unit ? ` / ${kindergarten.fee_unit.replace("per_", "")}` : ""
        }`
      : "Fee info not available";

  return (
    <article className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <header className="mb-2 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            <Link
              to={`/kindergartens/${kindergarten.id}`}
              className="hover:text-emerald-700"
            >
              {kindergarten.name}
            </Link>
          </h2>
          {kindergarten.brand_name && (
            <p className="text-xs text-slate-500">{kindergarten.brand_name}</p>
          )}
        </div>
        {kindergarten.education_system && (
          <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
            {kindergarten.education_system}
          </span>
        )}
      </header>
      <div className="space-y-1 text-xs text-slate-600">
        <p>{feeText}</p>
        {kindergarten.address && <p>{kindergarten.address}</p>}
      </div>
    </article>
  );
}



