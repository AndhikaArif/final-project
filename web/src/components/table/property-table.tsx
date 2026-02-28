"use client";

import { Property } from "@/app/(protected)/tenant/properties/page";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import Image from "next/image";

interface PropertyTableProps {
  data: Property[];
  deletingId: string | null;
  onEdit: (p: Property) => void;
  onDelete: (id: string) => void;
}

export default function PropertyTable({
  data,
  deletingId,
  onEdit,
  onDelete,
}: PropertyTableProps) {
  if (data.length === 0) {
    return <p className="text-gray-500 mt-4">No properties available.</p>;
  }

  return (
    <div className="mt-4">
      {/* Table untuk desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border border-gray-300 rounded-lg">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-4 py-2 text-left">Image</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">City</th>
              <th className="px-4 py-2 text-left">Address</th>
              <th className="px-4 py-2 text-left">Max Guests</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr
                key={p.id}
                className="border-t border-gray-300 hover:bg-gray-800 transition-colors"
              >
                <td className="px-4 py-2">
                  {p.image ? (
                    <Image
                      src={p.image}
                      alt={p.name}
                      width={64}
                      height={64}
                      className="object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-300 rounded flex items-center justify-center text-gray-500 text-sm">
                      No Image
                    </div>
                  )}
                </td>
                <td className="px-4 py-2">{p.name}</td>
                <td className="px-4 py-2">{p.city}</td>
                <td className="px-4 py-2 truncate max-w-xs">{p.address}</td>
                <td className="px-4 py-2">{p.maxGuest}</td>
                <td className="px-4 py-2">{p.category.name}</td>
                <td className="px-4 py-2 flex items-center gap-2">
                  <button
                    onClick={() => onEdit(p)}
                    className="p-1 pt-4 rounded hover:bg-gray-300 transition cursor-pointer"
                    title="Edit property"
                  >
                    <AiOutlineEdit size={24} className="text-blue-600" />
                  </button>
                  <button
                    onClick={() => onDelete(p.id)}
                    className="p-1 pt-4 rounded hover:bg-gray-300 transition cursor-pointer disabled:opacity-50"
                    disabled={deletingId === p.id}
                    title="Delete property"
                  >
                    {deletingId === p.id ? (
                      <span className="text-red-600 text-sm">Deleting...</span>
                    ) : (
                      <AiOutlineDelete size={24} className="text-red-600" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card untuk mobile */}
      <div className="md:hidden space-y-4">
        {data.map((p) => (
          <div
            key={p.id}
            className="border rounded-lg p-4 bg-gray-50 flex flex-col gap-2"
          >
            <div className="flex gap-4 items-center">
              {p.image ? (
                <Image
                  src={p.image}
                  alt={p.name}
                  width={64}
                  height={64}
                  className="object-cover rounded"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-300 rounded flex items-center justify-center text-gray-500 text-sm">
                  No Image
                </div>
              )}
              <div className="flex flex-col flex-1">
                <span className="font-semibold text-gray-600">{p.name}</span>
                <span className="text-sm text-gray-600">{p.city}</span>
              </div>
            </div>
            <div className="text-sm text-gray-700">Address: {p.address}</div>
            <div className="text-sm text-gray-700">
              Max Guests: {p.maxGuest}
            </div>
            <div className="text-sm text-gray-700">
              Category: {p.category.name}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onEdit(p)}
                className="p-2 bg-blue-600 text-white rounded"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(p.id)}
                className="p-2 bg-red-600 text-white rounded"
                disabled={deletingId === p.id}
              >
                {deletingId === p.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
