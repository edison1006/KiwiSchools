import { ChangeEvent } from "react";

export type SchoolTypeFilter =
  | ""
  | "kindergarten"
  | "primary"
  | "intermediate"
  | "secondary"
  | "composite"
  | "university"
  | "institute_of_technology"
  | "private_tertiary";

export interface FiltersProps {
  region: string;
  city: string;
  suburb: string;
  schoolType: SchoolTypeFilter;
  onChange: (next: {
    region: string;
    city: string;
    suburb: string;
    schoolType: SchoolTypeFilter;
  }) => void;
}

export function Filters(props: FiltersProps) {
  const { region, city, suburb, schoolType, onChange } = props;

  const handleInput =
    (field: "region" | "city" | "suburb" | "schoolType") =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      onChange({
        region,
        city,
        suburb,
        schoolType,
        [field]: e.target.value
      } as FiltersProps);
    };

  return (
    <div className="filters">
      <div className="filter-row">
        <div className="filter-field">
          <label htmlFor="region">Region</label>
          <input
            id="region"
            type="text"
            value={region}
            onChange={handleInput("region")}
            placeholder="e.g. Auckland"
          />
        </div>
        <div className="filter-field">
          <label htmlFor="city">City</label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={handleInput("city")}
            placeholder="e.g. Auckland"
          />
        </div>
        <div className="filter-field">
          <label htmlFor="suburb">Suburb</label>
          <input
            id="suburb"
            type="text"
            value={suburb}
            onChange={handleInput("suburb")}
            placeholder="e.g. Remuera"
          />
        </div>
        <div className="filter-field">
          <label htmlFor="type">Type</label>
          <select
            id="type"
            value={schoolType}
            onChange={handleInput("schoolType")}
          >
            <option value="">All</option>
            <option value="kindergarten">Kindergarten / ECE</option>
            <option value="primary">Primary</option>
            <option value="intermediate">Intermediate</option>
            <option value="secondary">Secondary</option>
            <option value="composite">Composite</option>
            <option value="university">University</option>
            <option value="institute_of_technology">Institute of Technology</option>
            <option value="private_tertiary">Private Tertiary</option>
          </select>
        </div>
      </div>
    </div>
  );
}





