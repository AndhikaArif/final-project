import { PropertyItem } from "@/types/property";
import Image from "next/image";

export default function PropertyOrderCard({
  property,
}: {
  property: PropertyItem;
}) {
  const imageSrc =
    property.image && property.image !== ""
      ? property.image
      : "https://images.unsplash.com/photo-1560185127-6ed189bf02f4";

  return (
    <div className="flex flex-col bg-white border border-gray-200 w-[450px] pb-4">
      <div className="relative w-[450px] h-45 mb-4">
        <Image
          src={imageSrc}
          alt={property.name}
          fill
          className="object-cover rounded-t-2xl"
        />
      </div>
      <div className="flex flex-col text-black gap-y-2 px-2">
        <h3 className="text-xl font-semibold">{property.name}</h3>
        {/* Tambahkan rating */}
        <h4 className="text-sm">{property.address}</h4>
        <h4 className="text-sm text-gray-500">{property.description}</h4>
      </div>
    </div>
  );
}
