"use client";

import type { Room } from "@/types/room.type";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";

interface Props {
  data: Room[];
  deletingId: string | null;
  onEdit: (room: Room) => void;
  onDelete: (id: string) => void;
}

export default function RoomTable({
  data,
  deletingId,
  onEdit,
  onDelete,
}: Props) {
  if (!data.length) {
    return <p className="text-gray-500 mt-4">No rooms available.</p>;
  }

  const formatRupiah = (value: unknown) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(n);
  };

  return (
    <div className="mt-4">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border border-gray-300 rounded-lg">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Price</th>
              <th className="px-4 py-2 text-left">Total Rooms</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.map((r) => (
              <tr
                key={r.id}
                className="border-t border-gray-300 hover:bg-gray-800 transition-colors"
              >
                <td className="px-4 py-2">{r.name}</td>
                <td className="px-4 py-2">{formatRupiah(r.price)}</td>
                <td className="px-4 py-2">{r.totalRoom}</td>

                <td className="px-4 py-2 flex items-center gap-2">
                  <button
                    onClick={() => onEdit(r)}
                    className="p-1 rounded hover:bg-gray-300 transition cursor-pointer"
                    title="Edit room"
                  >
                    <AiOutlineEdit size={22} className="text-blue-600" />
                  </button>

                  <button
                    onClick={() => onDelete(r.id)}
                    className="p-1 rounded hover:bg-gray-300 transition disabled:opacity-50 cursor-pointer"
                    disabled={deletingId === r.id}
                    title="Delete room"
                  >
                    {deletingId === r.id ? (
                      <span className="text-red-600 text-sm">Deleting...</span>
                    ) : (
                      <AiOutlineDelete size={22} className="text-red-600" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-4">
        {data.map((r) => (
          <div
            key={r.id}
            className="border rounded-lg p-4 bg-gray-50 flex flex-col gap-2"
          >
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="font-semibold text-gray-800">{r.name}</span>
                <span className="text-sm text-gray-600">
                  {formatRupiah(r.price)}
                </span>
              </div>
            </div>

            <div className="text-sm text-gray-700">
              Total rooms: {r.totalRoom}
            </div>

            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onEdit(r)}
                className="p-2 bg-blue-600 text-white rounded"
              >
                Edit
              </button>

              <button
                onClick={() => onDelete(r.id)}
                className="p-2 bg-red-600 text-white rounded disabled:opacity-50"
                disabled={deletingId === r.id}
              >
                {deletingId === r.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
