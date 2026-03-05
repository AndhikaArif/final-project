"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface PropertyCardProps {
  id: string;
  name: string;
  city: string;
  price: number | null;
  image: string;
}

export default function PropertyCard({
  id,
  name,
  city,
  price,
  image,
}: PropertyCardProps) {
  const searchParams = useSearchParams();

  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");

  const query =
    checkIn && checkOut ? `?checkIn=${checkIn}&checkOut=${checkOut}` : "";

  return (
    <Link
      href={`/properties/${id}${query}`}
      className="border rounded-xl overflow-hidden shadow hover:shadow-lg transition bg-white block"
    >
      <div className="relative h-48 w-full">
        <Image src={image} alt={name} fill className="object-cover" />
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg">{name}</h3>
        <p className="text-gray-500 text-sm">{city}</p>

        {price != null && (
          <p className="mt-2 font-bold text-blue-600">
            Rp {price.toLocaleString("id-ID")} / night
          </p>
        )}
      </div>
    </Link>
  );
}
