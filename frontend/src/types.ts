export interface Region {
  id: number;
  name: string;
  type: "country" | "region" | "city" | "suburb";
  parent_id?: number | null;
}

export interface Zone {
  id: number;
  name: string;
  region?: string | null;
  city?: string | null;
  suburb?: string | null;
  median_house_price?: number | null;
  median_house_price_currency?: string | null;
  last_updated?: string | null;
}

export interface SchoolStats {
  year: number;
  progression_rate?: number | null;
  ranking?: string | null;
}

export interface School {
  id: number;
  name: string;
  school_type: string;
  description?: string | null;
  owner?: string | null;
  education_systems?: string | null;
  tuition_min?: number | null;
  tuition_max?: number | null;
  tuition_currency: string;
  region?: string | null;
  city?: string | null;
  suburb?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  sector?: string | null;
  level?: string | null;
  curriculum?: string | null;
  progression_rate?: number | null;
  national_ranking?: number | null;
  institution_type?: string | null;
  qs_world_rank?: number | null;
  strong_programs?: string | null;
  zone_id?: number | null;
  zone?: Zone | null;
  recent_stats?: SchoolStats[];
}

export interface Kindergarten {
  id: number;
  name: string;
  brand_name?: string | null;
  owner_or_group?: string | null;
  owner?: string | null; // Backend uses 'owner'
  description?: string | null;
  education_system?: string | null;
  education_systems?: string | null; // Backend uses 'education_systems'
  fee_min?: number | null;
  fee_max?: number | null;
  fee_currency?: string | null;
  fee_unit?: string | null;
  website_url?: string | null;
  website?: string | null; // Backend uses 'website'
  address?: string | null;
  region?: string | null; // Backend provides region
  city?: string | null; // Backend provides city
  suburb?: string | null; // Backend provides suburb
  region_id?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  email?: string | null;
}

export interface University {
  id: number;
  name: string;
  university_type: string;
  city?: string | null;
  qs_world_rank?: number | null;
  strong_subjects?: string | null;
  tuition_domestic_min?: number | null;
  tuition_domestic_max?: number | null;
  tuition_international_min?: number | null;
  tuition_international_max?: number | null;
  website_url?: string | null;
  description?: string | null;
}


