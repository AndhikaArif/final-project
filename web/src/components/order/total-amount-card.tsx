interface OrderItem {
  roomTypeName: string;
  basePrice: number;
  roomQuantity: number;
  nights: number;
}

interface TotalAmountCardProps {
  items: OrderItem[];
}

export default function TotalAmountCard({ items }: TotalAmountCardProps) {
  // 🔥 Hitung total keseluruhan
  const grandTotal = items.reduce((acc, item) => {
    return acc + item.basePrice * item.roomQuantity * item.nights;
  }, 0);

  return (
    <div className="flex flex-col border border-gray-200 w-[450px] py-4 px-2">
      <h2 className="text-xl text-black mb-4">Detail Price</h2>

      {/* 🔥 LOOP SEMUA ROOM TYPE */}
      {items.map((item, index) => {
        const subtotal = item.basePrice * item.roomQuantity * item.nights;

        return (
          <div key={index} className="mb-4">
            <div className="flex justify-between">
              <div className="flex flex-col text-sm gap-y-1">
                <h3 className="text-black">
                  {item.roomTypeName} x {item.roomQuantity}
                </h3>

                <p className="text-gray-400">
                  Rp {(item.basePrice ?? 0).toLocaleString("id-ID")} / night
                </p>

                <p className="text-gray-400">{item.nights} nights</p>
              </div>

              <div className="text-sm text-black">
                <h3>Rp {subtotal.toLocaleString("id-ID")}</h3>
              </div>
            </div>

            {/* Garis pemisah antar room */}
            {index !== items.length - 1 && (
              <div className="border-t border-gray-200 my-4"></div>
            )}
          </div>
        );
      })}

      {/* 🔥 TOTAL AKHIR */}
      <div className="border-t border-gray-300 my-4"></div>

      <div className="flex justify-between text-xl font-semibold text-black">
        <h3>Total</h3>
        <h3>Rp {grandTotal.toLocaleString("id-ID")}</h3>
      </div>
    </div>
  );
}
