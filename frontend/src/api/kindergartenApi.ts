import { apiClient } from "./apiClient";
import type { Kindergarten } from "../types";

export interface KindergartenListParams {
  region_id?: number;
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
  const response = await apiClient.get<PaginatedKindergartens>("/kindergartens", {
    params: {
      region_id: params.region_id,
      city: params.city,
      suburb: params.suburb,
      education_system: params.education_system,
      keyword: params.keyword,
      page: params.page ?? 1,
      page_size: params.page_size ?? 20
    }
  });
  return response.data;
}

export async function fetchKindergartenById(id: number): Promise<Kindergarten> {
  const response = await apiClient.get<Kindergarten>(`/kindergartens/${id}`);
  return response.data;
}



