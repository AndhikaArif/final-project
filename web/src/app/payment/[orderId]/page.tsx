"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import OrderDetailCard from "@/components/payment/order-detail-card";

interface PageProps {
  params: {
    orderId: string;
  };
}

export default function Payment({ params }: PageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [expiredAt, setExpiredAt] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");

  // FETCH ORDER DATA
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

  // COUNTDOWN TIMER
  useEffect(() => {
    if (!expiredAt) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(expiredAt).getTime();

      const distance = expiry - now;

      if (distance <= 0) {
        setTimeLeft("Payment time expired");
        clearInterval(interval);
        return;
      }

      const minutes = Math.floor(distance / 1000 / 60);
      const seconds = Math.floor((distance / 1000) % 60);

      setTimeLeft(`${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiredAt]);

  // FILE CHANGE
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setFile(e.target.files[0]);
  };

  // UPLOAD PAYMENT PROOF
  const handleUpload = async () => {
    if (!file) {
      alert("Please select payment proof");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("paymentProof", file);

      await axios.post(
        `http://localhost:8000/api/payment/upload/${params.orderId}`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      alert("Payment proof uploaded successfully");
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // CANCEL ORDER
  const handleCancel = async () => {
    try {
      await axios.patch(
        `http://localhost:8000/api/order/cancel/${params.orderId}`,
        {},
        {
          withCredentials: true,
        },
      );

      alert("Order cancelled");
    } catch (error) {
      console.error(error);
      alert("Failed to cancel order");
    }
  };

  return (
    <div className="min-h-fit bg-white flex flex-col justify-center items-center py-10 gap-y-6">
      {/* ORDER DETAIL */}
      <OrderDetailCard orderId={params.orderId} />

      {/* COUNTDOWN TIMER */}
      <div className="bg-red-50 border border-red-200 px-6 py-2 rounded-lg">
        <p className="text-red-600 font-semibold">
          Payment Time Left: {timeLeft || "Loading..."}
        </p>
      </div>

      {/* PAYMENT PROOF */}
      <div className="flex flex-col justify-center items-center gap-y-4">
        <div className="border border-gray-200 shadow-sm border-dashed w-[450px] h-40 flex justify-center items-center">
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        <div className="flex justify-between items-center w-[400px]">
          <button
            onClick={handleUpload}
            disabled={loading}
            className="bg-sky-500 w-[150px] py-2 rounded-2xl hover:bg-sky-600 text-white font-semibold"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>

          <button
            onClick={handleCancel}
            className="bg-red-400 w-[150px] py-2 rounded-2xl hover:bg-red-500 text-white font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
