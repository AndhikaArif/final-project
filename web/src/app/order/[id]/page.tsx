"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import OrderDetailCard from "@/components/payment/order-detail-card";

interface PageProps {
  params: {
    orderId: string;
  };
}

export default function OrderDetail({ params }: PageProps) {
  const [expiredAt, setExpiredAt] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/order/${params.orderId}`,
          {
            withCredentials: true,
          },
        );

        setExpiredAt(res.data.expiredAt);
      } catch (error) {
        console.error("Failed to fetch order:", error);
      }
    };

    fetchOrder();
  }, [params.orderId]);
  return <OrderDetailCard orderId={params.orderId} />;
}
