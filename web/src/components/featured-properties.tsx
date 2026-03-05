import PropertyCard from "./property-card";

type Property = {
  id: string;
  name: string;
  image: string | null;
  city: string;
  category: string;
  cheapestPrice: number;
};

async function getFeaturedProperties(): Promise<Property[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN}/api/properties?limit=6`,
    { cache: "no-store" },
  );

  if (!res.ok) return [];

  const json = await res.json();

  return json.data || [];
}

export default async function FeaturedProperties() {
  const properties = await getFeaturedProperties();

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <h2 className="text-2xl font-bold mb-8">Featured Properties</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-black">
        {properties.map((p: Property) => (
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
    </section>
  );
}
