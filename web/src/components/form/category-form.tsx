"use client";

import { useState } from "react";
import axios from "axios";
import { Category } from "@/app/(protected)/tenant/categories/page";
import toast from "react-hot-toast";

interface Props {
  editing: Category | null;
  onSuccess: () => void;
}

export default function CategoryForm({ editing, onSuccess }: Props) {
  const [name, setName] = useState(editing?.name ?? "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      setSubmitting(true);

      if (editing) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_DOMAIN}/api/tenant/categories/${editing.id}`,
          { name },
          { withCredentials: true },
        );
        toast.success("Category updated successfully");
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_DOMAIN}/api/tenant/categories`,
          { name },
          { withCredentials: true },
        );
        toast.success("Category created successfully");
      }

      onSuccess();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          toast.error("Server is not reachable");
        } else if (err.response.status >= 500) {
          toast.error("Internal server error");
        } else {
          toast.error(err.response.data?.message || "Request failed");
        }
      } else {
        toast.error("Unexpected error occurred");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-4">
      <input
        type="text"
        placeholder="Category name"
        className="border px-4 py-2 rounded w-64"
        value={name}
        disabled={submitting}
        onChange={(e) => setName(e.target.value)}
      />

      <button
        type="submit"
        disabled={submitting}
        className="bg-blue-600 text-white hover:bg-blue-500 px-4 py-2 rounded disabled:opacity-50 cursor-pointer"
      >
        {submitting ? "Processing..." : editing ? "Update" : "Create"}
      </button>
    </form>
  );
}
