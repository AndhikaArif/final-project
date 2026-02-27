"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingSearch() {
  const router = useRouter();

  const [city, setCity] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const handleSearch = () => {
    const q = new URLSearchParams();

    if (city) q.set("city", city);
    if (checkIn) q.set("checkIn", checkIn);
    if (checkOut) q.set("checkOut", checkOut);

    router.push(`/properties?${q.toString()}`);
  };

  return (
    <div className="bg-white text-black shadow-lg rounded-2xl p-5 flex flex-wrap gap-3 items-end">
      {/* CITY */}
      <div>
        <label className="text-sm">Destination</label>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="border px-3 py-2 rounded-lg block"
        >
          <option value="">Select city</option>
          <option value="Jakarta">Jakarta</option>
          <option value="Bandung">Bandung</option>
          <option value="Bali">Bali</option>
        </select>
      </div>

      {/* CHECKIN */}
      <div>
        <label className="text-sm">Check in</label>
        <input
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          className="border px-3 py-2 rounded-lg block"
        />
      </div>

      {/* CHECKOUT */}
      <div>
        <label className="text-sm">Check out</label>
        <input
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          className="border px-3 py-2 rounded-lg block"
        />
      </div>

      <button
        onClick={handleSearch}
        className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
      >
        Search
      </button>
    </div>
  );
}
