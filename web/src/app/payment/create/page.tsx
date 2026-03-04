import Image from "next/image";

export default function Payment() {
  return (
    <div className="min-h-fit bg-white flex flex-col justify-center items-center py-10 gap-y-4">
      {/* ORDER AND PAYMENT DETAIL */}
      <div className="flex flex-col justify-center items-center gap-y-4">
        <div className="flex flex-col justify-center items-center gap-y-4">
          {/* ORDER DETAIL */}
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
              <h3 className="text-sm text-black tracking-wider mb-1">
                You choose
              </h3>
              <h4 className="text-md text-black font-semibold mb-1">
                2 nights, 2 rooms for 3 adult
              </h4>
              <h4 className="text-sm text-gray-400">2 x Standard Twin Room</h4>
            </div>
          </div>

          {/* Total Amount */}
          <div className="flex flex-col justify-center border border-gray-200 w-[450px] h-[180px] px-2">
            <h2 className="text-xl text-black mb-4">Detail Price</h2>

            <div className="flex justify-between mb-4">
              <div className="flex flex-col text-sm text-black gap-y-1">
                <h3>Standart Twin x 2</h3>
                <h3 className="text-gray-400">@ Rp 500.000</h3>
              </div>

              <div className="flex flex-col text-sm text-black gap-y-1">
                <h3>Rp 1.000.000</h3>
              </div>
            </div>

            <div className="">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl text-black font-semibold">Total</h3>
                <h3 className="text-2xl text-black font-semibold">
                  Rp 1.000.000
                </h3>
              </div>

              <div className="flex justify-between items-center text-sm text-black">
                <h2>Payment Status:</h2>
                <h2>Waiting confirmation</h2>
              </div>
            </div>
          </div>
        </div>

        {/* PAYMENT PROOF & STATUS */}
        <div className="flex flex-col justify-center items-center gap-y-4">
          {/* Upload Payment Proof */}
          <div className="border border-gray-200 shadow-sm border-dashed w-[450px] h-40 flex justify-center items-center">
            <h3 className="text-gray-300">Upload payment proof here</h3>
          </div>

          <div className="flex justify-between items-center w-[400px]">
            <button className="bg-sky-500 w-[150px] py-2 rounded-2xl hover:bg-sky-600 hover:cursor-pointer text-white font-semibold tracking-wide">
              Upload
            </button>

            <button className="bg-red-400 w-[150px] py-2 rounded-2xl hover:bg-red-500 hover:cursor-pointer text-white font-semibold tracking-wide">
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* CHECK-IN TICKET */}
      <div className="flex flex-col border border-gray-200 w-[450px] h-108 px-2 py-4 gap-y-8">
        <div className="flex flex-col gap-y-1">
          <h2 className="text-xl text-black mb-4">Check-In Ticket</h2>

          <div className="flex justify-between items-center text-md text-black">
            <h2>Order Id:</h2>
            <h2>358bd65f-2cdc-468a-a403-aa3ef0bdaa61</h2>
          </div>

          <div className="flex justify-between items-center text-md text-black">
            <h2>Name:</h2>
            <h2>Akmal Di Sini</h2>
          </div>

          <div className="flex justify-between items-center text-md text-black">
            <h2>Email:</h2>
            <h2>akmaldisini@gmail.com</h2>
          </div>

          <div className="flex justify-between items-center text-md text-black">
            <h2>Nomor Hp:</h2>
            <h2>08123456789</h2>
          </div>
        </div>

        <div className="border-t border-gray-200"></div>

        <div className="flex flex-col gap-y-6">
          <div className="text-black">
            <h2 className="text-xl font-semibold mb-1">Hotel Dummy</h2>
            <h4 className="text-md">2 nights, 2 rooms for 3 adult</h4>
            <h4 className="text-sm text-gray-400">2 x Standard Twin Room</h4>
          </div>

          <div className="flex flex-col">
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
        </div>
      </div>
    </div>
  );
}
