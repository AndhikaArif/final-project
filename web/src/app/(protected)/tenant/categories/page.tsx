"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import CategoryForm from "@/components/form/category-form";
import CategoryTable from "@/components/table/category-table";
import LoadingScreen from "@/components/loading-screen";
import toast from "react-hot-toast";
import { confirmDelete } from "@/utils/confirm-delete.util";

export interface Category {
  id: string;
  name: string;
}

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_DOMAIN}/api/tenant/categories`,
        { withCredentials: true },
      );

      console.log(res.data);

      setCategories(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          toast.error("Server is not reachable");
        } else if (err.response.status >= 500) {
          toast.error("Internal server error");
        } else {
          toast.error(
            err.response.data?.message || "Failed to load categories",
          );
        }
      } else {
        toast.error("Unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = (id: string) => {
    confirmDelete(async () => {
      try {
        if (deletingId) return;
        setDeletingId(id);

        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_DOMAIN}/api/tenant/categories/${id}`,
          { withCredentials: true },
        );

        toast.success("Category deleted successfully");
        await fetchCategories();

        if (editing?.id === id) {
          setEditing(null);
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (!err.response) {
            toast.error("Server is not reachable");
          } else if (err.response.status >= 500) {
            toast.error("Internal server error");
          } else {
            toast.error(err.response.data?.message || "Delete failed");
          }
        } else {
          toast.error("Unexpected error occurred");
        }
      } finally {
        setDeletingId(null);
      }
    }, "Delete this category permanently?");
  };

  return (
    <div className="p-8 space-y-6 relative">
      {loading && <LoadingScreen />}

      <h1 className="text-2xl font-bold">Category Management</h1>

      <CategoryForm
        key={editing?.id ?? "create"}
        editing={editing}
        onSuccess={() => {
          setEditing(null);
          fetchCategories();
        }}
      />

      <CategoryTable
        data={categories}
        deletingId={deletingId}
        onEdit={(cat) => setEditing(cat)}
        onDelete={handleDelete}
      />
    </div>
  );
}
