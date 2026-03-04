"use client";

import { useState, useEffect, FormEvent } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import type { Room, UpdatePayload } from "@/types/room.type";

interface Props {
  propertyId: string;
  room: Room | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RoomForm({
  propertyId,
  room,
  onClose,
  onSuccess,
}: Props) {
  const isEdit = !!room;

  // 🔥 string state for inputs
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [totalRoom, setTotalRoom] = useState("1");
  const [submitting, setSubmitting] = useState(false);

  const isValid =
    name.trim().length > 0 &&
    description.trim().length > 0 &&
    Number(price) > 0 &&
    Number(totalRoom) > 0;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValid) return toast.error("Please fill all fields correctly");

    try {
      setSubmitting(true);

      if (isEdit && room) {
        const payload: UpdatePayload = {};

        if (name !== room.name) payload.name = name;
        if (Number(price) !== room.price) payload.price = Number(price);
        if (description !== room.description) payload.description = description;
        if (Number(totalRoom) !== room.totalRoom)
          payload.totalRoom = Number(totalRoom);

        if (!Object.keys(payload).length) {
          onClose();
          return;
        }

        await axios.put(
          `${process.env.NEXT_PUBLIC_API_DOMAIN}/api/tenant/rooms/${room.id}`,
          payload,
          { withCredentials: true },
        );

        toast.success("Room updated");
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_DOMAIN}/api/tenant/properties/${propertyId}/rooms`,
          {
            name,
            price: Number(price),
            description,
            totalRoom: Number(totalRoom),
          },
          { withCredentials: true },
        );

        toast.success("Room created");
      }

      onSuccess();
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Failed to save room");
      } else {
        toast.error("Unexpected error occurred");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 🔥 populate form when edit
  useEffect(() => {
    setName(room?.name ?? "");
    setPrice(room?.price?.toString() ?? "");
    setDescription(room?.description ?? "");
    setTotalRoom(room?.totalRoom?.toString() ?? "1");
  }, [room]);

  // 🔥 close on esc
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl space-y-5 animate-in fade-in zoom-in">
        <h2 className="text-xl font-semibold text-gray-800">
          {isEdit ? "Edit Room" : "Add New Room"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* NAME */}
          <div className="space-y-1">
            <label className="text-sm text-black">Room Name</label>
            <input
              autoFocus
              type="text"
              placeholder="Deluxe Room"
              className="w-full p-2 border rounded-lg bg-gray-50 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
            />
          </div>

          {/* PRICE */}
          <div className="space-y-1">
            <label className="text-sm text-black">Price per Night</label>
            <input
              type="number"
              placeholder="500000"
              className="w-full p-2 border rounded-lg bg-gray-50 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={submitting}
            />
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-1">
            <label className="text-sm text-black">Description</label>
            <textarea
              placeholder="Room with balcony and city view"
              className="w-full p-2 border rounded-lg bg-gray-50 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
            />
          </div>

          {/* TOTAL ROOM */}
          <div className="space-y-1">
            <label className="text-sm text-black">Total Rooms</label>
            <input
              type="number"
              min={1}
              placeholder="10"
              className="w-full p-2 border rounded-lg bg-gray-50 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={totalRoom}
              onChange={(e) => setTotalRoom(e.target.value)}
              disabled={submitting}
            />
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border text-black hover:bg-gray-100 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!isValid || submitting}
              className="px-4 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-600 transition disabled:opacity-50 cursor-pointer"
            >
              {submitting
                ? "Saving..."
                : isEdit
                  ? "Update Room"
                  : "Create Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
