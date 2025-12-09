import { apiClient } from "./apiClient";
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
  const response = await apiClient.get<Kindergarten[]>("/kindergartens", {
    params: {
      region: params.region, // Backend uses region string
      city: params.city,
      suburb: params.suburb,
      education_system: params.education_system,
      name: params.keyword, // Backend uses 'name' parameter
    }
  });
  // Convert List response to PaginatedKindergartens format
  return {
    items: response.data,
    total: response.data.length,
    page: params.page ?? 1,
    page_size: params.page_size ?? 20
  };
}

export async function fetchKindergartenById(id: number): Promise<Kindergarten> {
  const response = await apiClient.get<Kindergarten>(`/kindergartens/${id}`);
  return response.data;
}





