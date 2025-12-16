import { apiClient } from "./apiClient";
import { fetchSchools } from "./schoolApi";
import type { Kindergarten } from "../types";

export interface KindergartenListParams {
  region_id?: number;
  region?: string; // Backend uses region string
  city?: string;
  suburb?: string;
  education_system?: string;
  keyword?: string;
  page?: number;
  page_size?: number;
}

export interface PaginatedKindergartens {
  items: Kindergarten[];
  total: number;
  page: number;
  page_size: number;
}

export async function fetchKindergartens(
  params: KindergartenListParams
): Promise<PaginatedKindergartens> {
  // Use schools endpoint with school_type=kindergarten to get data from CSV import
  const response = await fetchSchools({
    school_type: "kindergarten",
    keyword: params.keyword,
    region: params.region,
    city: params.city,
    page: params.page,
    page_size: params.page_size || 1000
  });
  
  // Filter by education_system if provided (client-side filtering)
  let items = response.items;
  if (params.education_system) {
    const systemLower = params.education_system.toLowerCase();
    items = items.filter((k) => {
      const system = (k.education_system || k.education_systems || "").toLowerCase();
      return system.includes(systemLower);
    });
  }
  
  // Convert to PaginatedKindergartens format
  return {
    items: items as Kindergarten[],
    total: items.length,
    page: params.page ?? 1,
    page_size: params.page_size ?? 20
  };
}

export async function fetchKindergartenById(id: number): Promise<Kindergarten> {
  const response = await apiClient.get<Kindergarten>(`/kindergartens/${id}`);
  return response.data;
}





