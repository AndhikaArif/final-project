import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_DOMAIN,
});

export interface CatalogParams {
  city?: string;
  checkIn?: string;
  checkOut?: string;
  search?: string;
  category?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export async function getPropertyCatalog(params: CatalogParams) {
  const res = await api.get("/api/properties", { params });
  return res.data;
}
