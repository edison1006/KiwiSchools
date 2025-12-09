import { Link } from "react-router-dom";
import type { Kindergarten } from "../types";

interface Props {
  kindergarten: Kindergarten;
}

export function KindergartenCard({ kindergarten }: Props) {
  // Build location string from region, city, suburb, address
  const locationParts: string[] = [];
  if (kindergarten.region) locationParts.push(kindergarten.region);
  if (kindergarten.city) locationParts.push(kindergarten.city);
  if (kindergarten.suburb) locationParts.push(kindergarten.suburb);
  if (kindergarten.address) locationParts.push(kindergarten.address);
  const location = locationParts.length > 0 ? locationParts.join(", ") : "Location Not Available";

  // Get education system (try both field names)
  const educationSystem = kindergarten.education_system || kindergarten.education_systems;
  
  // Get website (try both field names)
  const website = kindergarten.website || kindergarten.website_url;

  return (
    <article className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <header className="mb-3 flex items-start justify-between gap-2">
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-slate-900">
            <Link
              to={`/kindergartens/${kindergarten.id}`}
              className="hover:text-emerald-700 transition-colors"
            >
              {kindergarten.name}
            </Link>
          </h2>
          {kindergarten.brand_name && (
            <p className="mt-0.5 text-xs text-slate-500">{kindergarten.brand_name}</p>
          )}
        </div>
        {educationSystem && (
          <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 whitespace-nowrap">
            {educationSystem}
          </span>
        )}
      </header>
      
      <div className="space-y-2 text-xs text-slate-600">
        {/* Education System */}
        {educationSystem && (
          <div>
            <span className="font-medium text-slate-700">Education System:</span>{" "}
            <span>{educationSystem}</span>
          </div>
        )}

        {/* Location */}
        <div>
          <span className="font-medium text-slate-700">Location:</span>{" "}
          <span>{location}</span>
        </div>

        {/* Website */}
        {website && (
          <div>
            <span className="font-medium text-slate-700">Website:</span>{" "}
            <a
              href={website.startsWith("http") ? website : `https://${website}`}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-600 hover:text-emerald-700 hover:underline break-all"
              onClick={(e) => e.stopPropagation()}
            >
              {website.replace(/^https?:\/\//, "")}
            </a>
          </div>
        )}

        {/* Contact Information */}
        <div className="space-y-1 pt-1 border-t border-slate-100">
          <span className="font-medium text-slate-700">Contact:</span>
          <div className="pl-0.5 space-y-0.5">
            {kindergarten.phone && (
              <div>
                <span className="text-slate-500">Phone:</span>{" "}
                <a
                  href={`tel:${kindergarten.phone}`}
                  className="text-slate-700 hover:text-emerald-600"
                  onClick={(e) => e.stopPropagation()}
                >
                  {kindergarten.phone}
                </a>
              </div>
            )}
            {kindergarten.email && (
              <div>
                <span className="text-slate-500">Email:</span>{" "}
                <a
                  href={`mailto:${kindergarten.email}`}
                  className="text-slate-700 hover:text-emerald-600 break-all"
                  onClick={(e) => e.stopPropagation()}
                >
                  {kindergarten.email}
                </a>
              </div>
            )}
            {!kindergarten.phone && !kindergarten.email && (
              <span className="text-slate-400">No Contact Info Available</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}





