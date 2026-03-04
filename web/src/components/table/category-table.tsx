"use client";

import { Category } from "@/app/(protected)/tenant/categories/page";

interface Props {
  data: Category[];
  deletingId: string | null;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export default function CategoryTable({
  data,
  deletingId,
  onEdit,
  onDelete,
}: Props) {
  return (
    <table className="w-full border">
      <thead>
        <tr className="bg-gray-100 text-black">
          <th className="border p-2 text-left">Name</th>
          <th className="border p-2 text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={2} className="text-center p-4 text-gray-500 italic">
              No categories found
            </td>
          </tr>
        ) : (
          data.map((cat) => (
            <tr key={cat.id}>
              <td className="border p-2">{cat.name}</td>
              <td className="border p-2 text-center space-x-2">
                <button
                  onClick={() => onEdit(cat)}
                  className="bg-yellow-500 text-white hover:bg-yellow-400 px-3 py-1 rounded cursor-pointer"
                >
                  Edit
                </button>

                <button
                  onClick={() => onDelete(cat.id)}
                  disabled={deletingId === cat.id}
                  className="bg-red-600 text-white hover:bg-red-500 px-3 py-1 rounded disabled:opacity-50 cursor-pointer"
                >
                  {deletingId === cat.id ? "Deleting..." : "Delete"}
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
