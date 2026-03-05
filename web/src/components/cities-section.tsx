"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cityImages } from "@/libs/city-images";

export default function CitiesSection() {
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true); // Tambahkan loading state
  const router = useRouter();

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_DOMAIN}/api/properties/cities`,
        );
        // Misal: Kita hanya ingin menampilkan 8 kota pertama di section ini
        setCities(res.data.data.slice(0, 8));
      } catch (error) {
        console.error("Failed to fetch cities", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  const handleClick = (city: string) => {
    // Gunakan encodeURIComponent untuk menangani nama kota dengan spasi
    router.push(`/catalog?city=${encodeURIComponent(city)}`);
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl font-bold">Explore by City</h2>
          <p className="text-gray-500 mt-2">
            Temukan properti impian di kota-kota terbaik.
          </p>
        </div>
        {/* Jika datanya banyak, beri link ke halaman pencarian lengkap */}
        <button
          onClick={() => router.push("/catalog")}
          className="text-blue-600 font-medium hover:underline"
        >
          Lihat Semua
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {loading
          ? [...Array(4)].map(
              (
                _,
                i, // Skeleton Loading
              ) => (
                <div
                  key={i}
                  className="h-40 rounded-xl bg-gray-200 animate-pulse"
                />
              ),
            )
          : cities.map((city) => {
              const image =
                cityImages[city.toLowerCase()] ??
                "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600";

              return (
                <div
                  key={city}
                  onClick={() => handleClick(city)}
                  className="relative h-40 rounded-xl overflow-hidden cursor-pointer group shadow-md"
                >
                  <Image
                    src={image}
                    alt={city}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-110 transition duration-500"
                  />

                  {/* Overlay yang lebih smooth */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent flex items-center justify-center group-hover:bg-black/50 transition-all duration-300">
                    <h3 className="text-white text-xl font-bold tracking-wide drop-shadow-lg">
                      {city}
                    </h3>
                  </div>
                </div>
              );
            })}
      </div>
    </section>
  );
}
