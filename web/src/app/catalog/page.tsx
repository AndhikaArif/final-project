"use client";

import { useSearchParams } from "next/navigation";

export default function CatalogPage() {
  const params = useSearchParams();

  const city = params.get("city");
  const checkIn = params.get("checkIn");
  const checkOut = params.get("checkOut");

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-6">Property Catalog</h1>

      <div className="bg-gray-100 p-4 rounded-lg">
        <p>City: {city}</p>
        <p>Check In: {checkIn}</p>
        <p>Check Out: {checkOut}</p>
      </div>
    </div>
  );
}
