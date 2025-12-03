import { apiClient } from "./apiClient";
import type { School } from "../types";

export interface SchoolListParams {
  region_id?: number;
  school_type?: string;
  ownership_type?: string;
  keyword?: string;
  page?: number;
  page_size?: number;
}

export interface PaginatedSchools {
  items: School[];
  total: number;
  page: number;
  page_size: number;
}

export async function fetchSchools(params: SchoolListParams): Promise<PaginatedSchools> {
  const response = await apiClient.get<PaginatedSchools>("/schools", {
    params: {
      region_id: params.region_id,
      school_type: params.school_type,
      ownership_type: params.ownership_type,
      keyword: params.keyword,
      page: params.page ?? 1,
      page_size: params.page_size ?? 20
    }
  });
  return response.data;
}

export async function fetchSchoolById(id: number): Promise<School> {
  const response = await apiClient.get<School>(`/schools/${id}`);
  return response.data;
}


