"use client";

import { useEffect, useState, useCallback } from "react";
import PropertyCard from "./property-card";

type Property = {
  id: string;
  name: string;
  image: string | null;
  city: string;
  category: string;
  cheapestPrice: number;
};

export default function FeaturedProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fungsi fetch yang di-memoize untuk menghindari re-creation yang tidak perlu
  const fetchProperties = useCallback(async (currentPage: number) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_DOMAIN}/api/properties?limit=6&page=${currentPage}`,
        { cache: "no-store" },
      );

      if (!res.ok) throw new Error("Gagal mengambil data properti");

      const json = await res.json();
      setProperties(json.data || []);

      // Scroll ke atas dengan mulus saat ganti halaman
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties(page);
  }, [page, fetchProperties]);

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          Featured Properties
        </h2>
      </div>

      {/* Loading State dengan Skeleton sederhana */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-80 bg-gray-100 animate-pulse rounded-xl"
            />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-red-50 rounded-xl text-red-600">
          <p>{error}</p>
          <button
            onClick={() => fetchProperties(page)}
            className="mt-4 underline font-medium"
          >
            Coba Lagi
          </button>
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          Belum ada properti tersedia di halaman ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {properties.map((p) => (
            <PropertyCard
              key={p.id}
              id={p.id}
              name={p.name}
              city={p.city}
              price={p.cheapestPrice}
              image={p.image ?? "/placeholder.jpg"}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!error && properties.length > 0 && (
        <div className="flex items-center justify-center mt-12 gap-6">
          <button
            className="px-6 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1 || loading}
          >
            Previous
          </button>

          <span className="text-sm font-semibold text-gray-600">
            Halaman <span className="text-black">{page}</span>
          </span>

          <button
            className="px-6 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition disabled:opacity-30"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={loading || properties.length < 6} // Disable jika data di halaman ini tidak penuh
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
