"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";

type Room = {
  id: string;
  name: string;
  description: string;
  totalRoom: number;
  priceCalendar: Record<string, number>;
};

type PropertyDetail = {
  id: string;
  name: string;
  description: string;
  image: string | null;
  address: string;
  city: string;
  category: string;
  rooms: Room[];
};

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const [guest, setGuest] = useState(1);

  const [selectedRooms, setSelectedRooms] = useState<Record<string, number>>(
    {},
  );

  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_DOMAIN}/api/properties/${id}`,
      );

      setProperty(res.data.data);
      setLoading(false);
    };

    fetchProperty();
  }, [id]);

  const updateRoomQty = (roomId: string, qty: number) => {
    setSelectedRooms((prev) => ({
      ...prev,
      [roomId]: qty,
    }));
  };

  const handleBook = () => {
    if (!checkIn || !checkOut) {
      alert("Select check in and check out date");
      return;
    }

    if (guest < 1) {
      alert("Guest must be at least 1");
      return;
    }

    const rooms = Object.entries(selectedRooms)
      .filter(([_, qty]) => qty > 0)
      .map(([roomId, qty]) => `${roomId}:${qty}`)
      .join(",");

    if (!rooms) {
      alert("Select at least one room");
      return;
    }

    router.push(
      `/order?propertyId=${id}&checkIn=${checkIn}&checkOut=${checkOut}&guest=${guest}&rooms=${rooms}`,
    );
  };

  if (loading || !property) return <p className="p-10">Loading...</p>;

  const imageSrc =
    property.image ??
    "https://images.unsplash.com/photo-1560185127-6ed189bf02f4";

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* IMAGE */}
      <div className="relative h-80 w-full rounded-xl overflow-hidden mb-6">
        <Image
          src={imageSrc}
          alt={property.name}
          fill
          className="object-cover"
        />
      </div>

      {/* BOOKING PANEL */}
      <div className="bg-gray-800 p-4 rounded-xl mb-8 grid md:grid-cols-3 gap-4">
        {/* CHECKIN */}
        <div className="flex flex-col">
          <label className="text-white text-sm mb-1">Check In</label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="p-2 rounded bg-gray-700 text-white"
          />
        </div>

        {/* CHECKOUT */}
        <div className="flex flex-col">
          <label className="text-white text-sm mb-1">Check Out</label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="p-2 rounded bg-gray-700 text-white"
          />
        </div>

        {/* GUEST */}
        <div className="flex flex-col">
          <label className="text-white text-sm mb-1">Guest</label>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setGuest(Math.max(guest - 1, 1))}
              className="bg-gray-600 px-3 py-1 rounded text-white"
            >
              -
            </button>

            <span className="text-white w-8 text-center">{guest}</span>

            <button
              onClick={() => setGuest(guest + 1)}
              className="bg-gray-600 px-3 py-1 rounded text-white"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* PROPERTY INFO */}
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold text-white mb-4">
            {property.name}
          </h1>

          <p className="text-gray-300">
            {property.address}, {property.city}
          </p>

          <p className="text-gray-300 mt-4">{property.description}</p>
        </div>

        {/* ROOM LIST */}
        <div className="space-y-4">
          <h2 className="text-xl text-white font-semibold">Rooms</h2>

          {property.rooms.map((room) => {
            const price =
              checkIn && room.priceCalendar?.[checkIn]
                ? room.priceCalendar[checkIn]
                : Object.values(room.priceCalendar || {})[0];

            return (
              <div
                key={room.id}
                className="border border-gray-700 rounded-xl p-4 bg-gray-800"
              >
                <h3 className="font-semibold text-white">{room.name}</h3>

                <p className="text-gray-300 text-sm mb-2">{room.description}</p>

                <p className="text-blue-400 font-bold mb-3">
                  Rp {price?.toLocaleString()} / night
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateRoomQty(
                        room.id,
                        Math.max((selectedRooms[room.id] || 0) - 1, 0),
                      )
                    }
                    className="bg-gray-600 px-3 rounded text-white"
                  >
                    -
                  </button>

                  <span className="text-white w-6 text-center">
                    {selectedRooms[room.id] || 0}
                  </span>

                  <button
                    onClick={() =>
                      updateRoomQty(room.id, (selectedRooms[room.id] || 0) + 1)
                    }
                    className="bg-gray-600 px-3 rounded text-white"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}

          {/* BOOK BUTTON */}
          <button
            onClick={handleBook}
            className="w-full bg-blue-600 py-3 rounded-xl text-white font-semibold mt-6 hover:bg-blue-700"
          >
            Book Selected Rooms
          </button>
        </div>
      </div>
    </div>
  );
}
