export interface School {
  id: number;
  name: string;
  school_type?: string;
  city?: string;
  latitude?: number | null;
  longitude?: number | null;
  [key: string]: unknown; // Allow additional properties from backend
}

export interface University {
  id: number;
  name: string;
  university_type?: string;
  city?: string;
  qs_world_rank?: number | null;
  tuition_international_min?: number | null;
  tuition_international_max?: number | null;
  strong_subjects?: string;
  [key: string]: unknown; // Allow additional properties from backend
}

export interface Kindergarten extends School {
  brand_name?: string;
  education_system?: string;
  owner_or_group?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website_url?: string;
  fee_min?: number | null;
  fee_max?: number | null;
  fee_currency?: string;
  fee_unit?: string;
}
