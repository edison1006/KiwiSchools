import { apiClient } from "./apiClient";
import type { University } from "../types";

export interface UniversityListParams {
  keyword?: string;
  university_type?: string;
  page?: number;
  page_size?: number;
}

export interface PaginatedUniversities {
  items: University[];
  total: number;
  page: number;
  page_size: number;
}

export async function fetchUniversities(params: UniversityListParams = {}): Promise<PaginatedUniversities> {
  const response = await apiClient.get<University[]>("/universities", {
    params: {
      name: params.keyword,
      university_type: params.university_type,
    }
  });
  return {
    items: response.data,
    total: response.data.length,
    page: params.page ?? 1,
    page_size: params.page_size ?? 20
  };
}

export async function fetchUniversityById(id: number): Promise<University> {
  const response = await apiClient.get<University>(`/universities/${id}`);
  return response.data;
}
