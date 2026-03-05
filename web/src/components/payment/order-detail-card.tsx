"use client";

import { useEffect, useState } from "react";

interface Props {
  orderId: string;
}

export default function OrderDetailCard({ orderId }: Props) {
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const res = await fetch(`http://localhost:8000/api/order/${orderId}`, {
        credentials: "include",
      });

      const data = await res.json();

      setOrder(data.data);
    };

    fetchOrder();
  }, [orderId]);

  if (!order) return <div>Loading...</div>;

  const item = order.orderItems[0];

  return (
    <div className="flex flex-col border border-gray-200 w-[450px] px-4 py-6 gap-y-8 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold">Check-In Ticket</h2>

      <div className="flex justify-between">
        <span>Order Id:</span>
        <span>{order.id}</span>
      </div>

      <div className="flex justify-between">
        <span>Name:</span>
        <span>{order.user.fullName}</span>
      </div>

      <div className="flex justify-between">
        <span>Email:</span>
        <span>{order.user.email}</span>
      </div>

      <div className="border-t border-gray-200"></div>

      <div>
        <h2 className="text-lg font-semibold">{order.property.name}</h2>
        <p className="text-gray-400">
          {item.roomQuantity} x {item.roomType.name}
        </p>
      </div>

      <div className="flex justify-between">
        <div>
          <p>Check In</p>
          <p>{new Date(item.checkInDate).toLocaleDateString("id-ID")}</p>
        </div>

        <div>
          <p>Check Out</p>
          <p>{new Date(item.checkOutDate).toLocaleDateString("id-ID")}</p>
        </div>
      </div>
    </div>
  );
}
