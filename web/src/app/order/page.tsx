"use client";

import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useFormik } from "formik";

import PropertyOrderCard from "@/components/order/property-order-card";
import DurationQuantityCard from "@/components/order/duration-quantity-card";
import TotalAmountCard from "@/components/order/total-amount-card";
import GuestForm from "@/components/order/form-card";

import { PropertyItem } from "@/types/property";

interface RoomType {
  id: string;
  name: string;
  basePrice: number;
  description: string;
  totalRoom: number;
}

interface OrderItem {
  roomTypeId: string;
  roomTypeName: string;
  basePrice: number;
  roomQuantity: number;
  nights: number;
}

export default function CreateOrderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // QUERY PARAMS
  const propertyId = searchParams.get("propertyId") ?? "";
  const checkIn = searchParams.get("checkIn") ?? "";
  const checkOut = searchParams.get("checkOut") ?? "";
  const guest = Number(searchParams.get("guest") ?? 1);
  const roomsParam = searchParams.get("rooms") ?? "";

  // STATE
  const [property, setProperty] = useState<PropertyItem | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const invalidParams = !propertyId || !checkIn || !checkOut || !roomsParam;

  // CALCULATE NIGHTS
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diff = checkOutDate.getTime() - checkInDate.getTime();

    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
  }, [checkIn, checkOut]);

  // PARSE ROOMS PARAM
  const parsedRooms = useMemo(() => {
    if (!roomsParam) return [];

    return roomsParam.split(",").map((r) => {
      const [roomTypeId, qty] = r.split(":");
      return {
        roomTypeId,
        roomQuantity: Number(qty),
      };
    });
  }, [roomsParam]);

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (invalidParams) {
          setError("Invalid booking parameters");
          setLoading(false);
          return;
        }

        if (nights <= 0) {
          setError("Invalid date range");
          setLoading(false);
          return;
        }

        if (guest < 1) {
          setError("Guest must be at least 1");
          setLoading(false);
          return;
        }

        // FETCH PROPERTY
        const propertyRes = await axios.get<{ data: PropertyItem }>(
          `http://localhost:8000/api/properties/${propertyId}`,
        );
        setProperty(propertyRes.data.data);

        // FETCH ROOM TYPES
        const roomRequests = parsedRooms.map((room) =>
          axios.get<{ data: RoomType }>(
            `http://localhost:8000/api/property/rooms/${room.roomTypeId}`,
          ),
        );

        const roomResponses = await Promise.all(roomRequests);

        // BUILD ORDER ITEMS
        const orderItems: OrderItem[] = roomResponses.map((res, index) => {
          const roomData = res.data.data;
          return {
            roomTypeId: roomData.id,
            roomTypeName: roomData.name,
            basePrice: roomData.basePrice ?? 0,
            roomQuantity: parsedRooms[index].roomQuantity,
            nights,
          };
        });

        setItems(orderItems);
      } catch (err) {
        console.error(err);
        setError("Failed to load booking data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [propertyId, parsedRooms, nights, invalidParams, guest]);

  // FORM
  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
    },

    onSubmit: async (values) => {
      try {
        const payload = {
          propertyId,
          checkIn,
          checkOut,
          guest,
          items: items.map((item) => ({
            roomTypeId: item.roomTypeId,
            roomQuantity: item.roomQuantity,
          })),
          guestInfo: values,
        };

        console.log("Order payload:", payload); // 🔥 Debug payload

        const orderRes = await axios.post(
          "http://localhost:8000/api/order/create",
          payload,
          { withCredentials: true },
        );

        const orderId = orderRes.data.id;

        const paymentRes = await axios.post(
          "http://localhost:8000/api/payment/create",
          { orderId },
          { withCredentials: true },
        );

        if (!paymentRes.data) throw new Error("Payment creation failed");

        router.push(`/payment/${orderId}`);
      } catch (err: any) {
        console.error(err);

        if (err.response?.status === 401 || err.response?.status === 403) {
          alert(err.response.data?.message ?? "Not authorized");
          router.push("/login");
        } else {
          alert("Failed to create order. Please try again.");
        }
      }
    },
  });

  // GUARD UI
  if (loading) return <div className="text-black p-10">Loading...</div>;
  if (error) return <div className="text-red-500 p-10">{error}</div>;
  if (!property || !items.length)
    return <div className="text-red-500 p-10">Booking data not found</div>;

  return (
    <div className="min-h-fit bg-white flex flex-col justify-center items-center gap-y-4 pt-10 pb-25 xl:flex-row xl:items-start xl:gap-x-6">
      <div className="flex flex-col gap-y-4">
        <PropertyOrderCard property={property} />

        <DurationQuantityCard
          checkIn={checkIn}
          checkOut={checkOut}
          guest={guest}
          items={items.map((item) => ({
            roomTypeName: item.roomTypeName,
            roomQuantity: item.roomQuantity,
          }))}
        />

        <TotalAmountCard items={items} />
      </div>

      <div className="flex flex-col items-center gap-y-4">
        <GuestForm formik={formik} />

        <button
          type="button"
          onClick={formik.submitForm}
          disabled={formik.isSubmitting}
          className="bg-sky-600 w-85 py-2 rounded-2xl flex justify-center items-center hover:bg-sky-700 hover:cursor-pointer disabled:opacity-50 xl:w-[450px]"
        >
          <h3 className="text-md font-semibold tracking-wider">
            {formik.isSubmitting ? "Processing..." : "Pay Room"}
          </h3>
        </button>
      </div>
    </div>
  );
}
