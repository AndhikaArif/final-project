"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cityImages } from "@/libs/city-images";

export default function CitiesSection() {
  const [cities, setCities] = useState<string[]>([]);
  const router = useRouter();

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

  const handleClick = (city: string) => {
    router.push(`/catalog?city=${city}`);
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold mb-10 text-center">Explore by City</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {cities.map((city) => {
          const image =
            cityImages[city.toLowerCase()] ??
            "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600";

          return (
            <div
              key={city}
              onClick={() => handleClick(city)}
              className="relative h-40 rounded-xl overflow-hidden cursor-pointer group"
            >
              <Image
                src={image}
                alt={city}
                fill
                className="object-cover group-hover:scale-110 transition duration-300"
              />

              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <h3 className="text-white text-xl font-semibold">{city}</h3>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
