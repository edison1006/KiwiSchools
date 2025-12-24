import { apiClient } from "./apiClient";
import type { Region } from "../types";

export async function fetchRegions(type?: string): Promise<Region[]> {
  const response = await apiClient.get<Region[]>("/regions", {
    params: type ? { type } : undefined
  });
  return response.data;
}
















