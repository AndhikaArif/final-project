"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function LandingSearch() {
  const router = useRouter();

  const [cities, setCities] = useState<string[]>([]);
  const [city, setCity] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_DOMAIN}/api/properties/cities`,
        );

        setCities(res.data.data);
      } catch (error) {
        console.error("Failed to fetch cities", error);
      }
    };

    fetchCities();
  }, []);

  const handleSearch = () => {
    if (checkIn && checkOut && checkOut <= checkIn) {
      alert("Check-out must be after check-in");
      return;
    }

    const q = new URLSearchParams();

    if (city) q.set("city", city);
    if (checkIn) q.set("checkIn", checkIn);
    if (checkOut) q.set("checkOut", checkOut);

    router.push(`/catalog?${q.toString()}`);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-white text-black shadow-2xl rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-end">
      {/* CITY */}
      <div className="flex flex-col w-full md:w-1/3">
        <label className="text-sm font-medium mb-1">Destination</label>

        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
        >
          <option value="">Select city</option>

          {cities.map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* CHECK IN */}
      <div className="flex flex-col w-full md:w-1/4">
        <label className="text-sm font-medium mb-1">Check in</label>

        <input
          type="date"
          min={today}
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
        />
      </div>

      {/* CHECK OUT */}
      <div className="flex flex-col w-full md:w-1/4">
        <label className="text-sm font-medium mb-1">Check out</label>

        <input
          type="date"
          min={checkIn || today}
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
        />
      </div>

      {/* BUTTON */}
      <button
        onClick={handleSearch}
        className="w-full md:w-auto px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition cursor-pointer"
      >
        Search
      </button>
    </div>
  );
}
