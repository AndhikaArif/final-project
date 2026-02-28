import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_DOMAIN;

export interface PropertyDetailParams {
  checkIn?: string;
  checkOut?: string;
}

export async function getPropertyDetail(
  id: string,
  params?: PropertyDetailParams,
) {
  const res = await axios.get(`${API}/api/properties/${id}`, { params });
  return res.data.data;
}

export async function getPropertyCalendar(id: string) {
  const res = await axios.get(`${API}/api/properties/${id}/calendar`);
  return res.data;
}
