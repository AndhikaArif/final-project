// import { useEffect, useState } from "react";
// import PropertyOrderCard from "@/components/property-order-card";
// import { PropertyItem } from "@/types/property";
import Link from "next/link";
import Image from "next/image";

export default function CreateOrderPage() {
  //   const [properties, setProperties] = useState<PropertyItem[]>([]);

  //   useEffect(() => {
  //     fetch("http:/localhost:3000/api/property")
  //       .then((res) => res.json())
  //       .then((data) => setProperties(data));
  //   }, []);

  return (
    <div className="min-h-fit bg-white flex flex-col justify-center items-center gap-y-4 py-10">
      {/* PROPERTY ORDER CARD */}
      {/* {properties.map((property) => (
        <PropertyOrderCard key={property.id} property={property} />
      ))} */}

      <div className="flex flex-col border border-gray-200 w-[450px] h-[300px]">
        <div className="relative w-[450px] h-45 mb-4">
          <Image
            src="/hotel-dummy.jpeg"
            alt="hotel-dummy"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col text-black gap-y-2 px-2">
          <h2 className="text-xl font-semibold">Hotel Dummy</h2>
          <h3 className="text-sm">
            Jl. Warna Warni No. 403, Tegal Timur, Kota Tegal
          </h3>
          <h4 className="text-sm">Wifi | Parkir | Restoran</h4>
        </div>
      </div>

      {/* ORDER DETAIL */}
      <div className="flex flex-col justify-between border border-gray-200 w-[450px] h-[250px] py-4 px-2">
        {/* Stay Date */}
        <div className="flex flex-col">
          <h2 className="text-xl text-black mb-4">Booking detail</h2>
          <div className="flex gap-x-20">
            <div>
              <h3 className="text-sm text-black tracking-wider mb-1">
                Check-in
              </h3>
              <h4 className="text-md text-black font-semibold">
                Min, 1 Mar 2026
              </h4>
              <h4 className="text-sm text-gray-400">From 14.00</h4>
            </div>
            <div className="flex gap-x-2">
              <div className="border-l border-gray-300"></div>
              <div>
                <h3 className="text-sm text-black tracking-wider mb-1">
                  Check-out
                </h3>
                <h4 className="text-md text-black font-semibold">
                  Sel, 3 Mar 2026
                </h4>
                <h4 className="text-sm text-gray-400">Until 12.00</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-300"></div>

        {/* Room & Guest Quantity */}
        <div>
          <h3 className="text-sm text-black tracking-wider mb-1">You choose</h3>
          <h4 className="text-md text-black font-semibold mb-1">
            2 nights, 2 rooms for 3 adult
          </h4>
          <h4 className="text-sm text-gray-400">2 x Standard Twin Room</h4>
        </div>
      </div>

      {/* TOTAL AMOUNT */}
      <div className="flex flex-col justify-between border border-gray-200 w-[450px] h-[180px] py-4 px-2">
        <h2 className="text-xl text-black mb-2">Detail Price</h2>

        <div className="flex justify-between">
          <div className="flex flex-col text-sm text-black gap-y-1">
            <h3>Standart Twin x 2</h3>
            <h3 className="text-gray-400">@ Rp 500.000</h3>
          </div>

          <div className="flex flex-col text-sm text-black gap-y-1">
            <h3>Rp 1.000.000</h3>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <h3 className="text-2xl text-black font-semibold">Total</h3>
          <h3 className="text-2xl text-black font-semibold">Rp 1.000.000</h3>
        </div>
      </div>

      {/* FORM DETAIL */}
      <div className="flex flex-col border border-gray-200 w-[450px] h-[370px] py-4 px-2">
        <h2 className="text-xl text-black mb-2">Insert Your Detail</h2>

        <div className="flex flex-col gap-y-4">
          <div className="flex flex-col">
            <h3 className="text-sm text-black tracking-wide">First Name</h3>
            <div className="border border-gray-400 w-[430px] h-10 rounded-md"></div>
          </div>

          <div className="flex flex-col">
            <h3 className="text-sm text-black tracking-wide">Last Name</h3>
            <div className="border border-gray-400 w-[430px] h-10 rounded-md"></div>
          </div>

          <div className="flex flex-col">
            <h3 className="text-sm text-black tracking-wide">Email Address</h3>
            <div className="border border-gray-400 w-[430px] h-10 rounded-md"></div>
          </div>

          <div className="flex flex-col">
            <h3 className="text-sm text-black tracking-wide">Phone Number</h3>
            <div className="border border-gray-400 w-[430px] h-10 rounded-md"></div>
          </div>
        </div>
      </div>

      {/* BUTTON PAY */}
      <Link href="/payment/create">
        <div className="bg-sky-600 w-85 py-2 rounded-2xl flex justify-center items-center hover:bg-sky-700">
          <h3 className="text-md font-semibold tracking-wider">Book Room</h3>
        </div>
      </Link>
    </div>
  );
}
