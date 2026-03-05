"use client";

import { useParams, useSearchParams } from "next/navigation";
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
  reviews: unknown[];
};

export default function PropertyDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const id = params.id as string;
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");

  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = `${process.env.NEXT_PUBLIC_API_DOMAIN}/api/properties/${id}`;

        if (checkIn && checkOut) {
          url += `?checkIn=${checkIn}&checkOut=${checkOut}`;
        }

        const response = await axios.get(url);
        setProperty(response.data.data);
      } catch (err: unknown) {
        console.error(err);
        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Something went wrong",
          );
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, checkIn, checkOut]);

  if (loading) return <p className="p-10 text-white">Loading...</p>;
  if (error) return <p className="p-10 text-red-500">{error}</p>;
  if (!property) return null;
  const imageSrc =
    property.image ??
    "https://images.unsplash.com/photo-1560185127-6ed189bf02f4";

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="relative h-80 w-full rounded-xl overflow-hidden mb-6">
        <Image
          src={imageSrc}
          alt={property.name}
          className="object-cover w-full h-full"
          fill
        />
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left: Property Info */}
        <div className="md:col-span-2 space-y-4">
          <h1 className="text-3xl font-bold text-white">{property.name}</h1>
          <p className="text-gray-300">
            {property.address}, {property.city}
          </p>
          <p className="text-gray-300">{property.description}</p>
        </div>

        {/* Right: Rooms / Booking Panel */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-2 text-white">Rooms</h2>
          {property.rooms.length > 0 ? (
            property.rooms.map((room: Room) => {
              const price =
                checkIn && room.priceCalendar?.[checkIn] != null
                  ? room.priceCalendar[checkIn]
                  : room.priceCalendar
                    ? Object.values(room.priceCalendar)[0]
                    : null;

              return (
                <div
                  key={room.id}
                  className="border border-gray-700 rounded-xl p-4 hover:shadow-lg transition bg-gray-800"
                >
                  <h3 className="font-semibold text-white">{room.name}</h3>
                  <p className="text-gray-300 mb-2">{room.description}</p>
                  <p className="font-bold text-blue-400">
                    {price ? `Rp ${price.toLocaleString()} / night` : "N/A"}
                  </p>
                  <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer">
                    Book Now
                  </button>
                </div>
              );
            })
          ) : (
            <p className="text-gray-300">No rooms available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
