import { apiClient } from "./apiClient";
import type { University } from "../types";

export interface UniversityListParams {
  city?: string;
  university_type?: string;
  keyword?: string;
}

export async function fetchUniversities(
  params: UniversityListParams
): Promise<University[]> {
  const response = await apiClient.get<University[]>("/universities", {
    params: {
      city: params.city,
      university_type: params.university_type,
      name: params.keyword, // Backend uses 'name' parameter
    }
  });
  return response.data;
}

export async function fetchUniversityById(id: number): Promise<University> {
  const response = await apiClient.get<University>(`/universities/${id}`);
  return response.data;
}





