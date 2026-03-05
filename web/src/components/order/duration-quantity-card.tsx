"use client";

interface RoomItem {
  roomTypeName: string;
  roomQuantity: number;
}

interface Props {
  checkIn: string;
  checkOut: string;
  guest: number;
  items: RoomItem[];
}

export default function DurationQuantityCard({
  checkIn,
  checkOut,
  guest,
  items,
}: Props) {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  const nights =
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24);

  // 🔥 total semua room
  const totalRooms = items.reduce((acc, item) => acc + item.roomQuantity, 0);

  return (
    <div className="flex flex-col justify-between border border-gray-200 w-[450px] gap-y-4 py-4 px-2">
      {/* Staying date */}
      <div className="flex flex-col">
        <h2 className="text-xl text-black mb-4">Booking detail</h2>

        <div className="flex gap-x-20">
          <div>
            <h3 className="text-sm mb-1 text-black tracking-wider">Check-in</h3>
            <h4 className="font-semibold text-black">
              {checkInDate.toDateString()}
            </h4>
            <h4 className="text-sm text-gray-400">From 14.00</h4>
          </div>

          <div className="flex gap-x-2">
            <div className="border-l border-gray-300"></div>
            <div>
              <h3 className="text-sm mb-1 text-black tracking-wider">
                Check-out
              </h3>
              <h4 className="font-semibold text-black">
                {checkOutDate.toDateString()}
              </h4>
              <h4 className="text-sm text-gray-400">Until 12.00</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-300"></div>

      {/* Room & Guest Quantity */}
      <div>
        <h3 className="text-sm mb-2 text-black tracking-wider">You choose</h3>

        <h4 className="font-semibold text-black mb-3">
          {nights} nights, {totalRooms} rooms for {guest} adult
        </h4>

        {/* 🔥 LOOP ROOM TYPES */}
        <div className="flex flex-col gap-y-1">
          {items.map((item, index) => (
            <h4 key={index} className="text-sm text-gray-500">
              {item.roomQuantity} x {item.roomTypeName}
            </h4>
          ))}
        </div>
      </div>
    </div>
  );
}
