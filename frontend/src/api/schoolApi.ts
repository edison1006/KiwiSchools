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
  const response = await apiClient.get<School[]>("/schools", {
    params: {
      school_type: params.school_type,
      name: params.keyword, // Backend uses 'name' parameter
      city: undefined, // Not used in current implementation
      region: undefined, // Not used in current implementation
    }
  });
  // Convert List response to PaginatedSchools format
  return {
    items: response.data,
    total: response.data.length,
    page: params.page ?? 1,
    page_size: params.page_size ?? 20
  };
}

export async function fetchSchoolById(id: number): Promise<School> {
  const response = await apiClient.get<School>(`/schools/${id}`);
  return response.data;
}





