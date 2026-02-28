"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import LoadingScreen from "@/components/loading-screen";
import PropertyForm from "@/components/form/property-form";
import PropertyTable from "@/components/table/property-table";
import { confirmDelete } from "@/utils/confirm-delete.util";

export interface Property {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  maxGuest: number;
  isActive: boolean;
  category: {
    id: string;
    name: string;
  };
  image?: string | null;
}

export default function PropertyPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [editing, setEditing] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_DOMAIN}/api/tenant/properties`,
        { withCredentials: true },
      );

      setProperties(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          toast.error("Server is not reachable");
        } else if (err.response.status >= 500) {
          toast.error("Internal server error");
        } else {
          toast.error(err.response.data?.message || "Failed to load property");
        }
      } else {
        toast.error("Unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDelete = (id: string) => {
    confirmDelete(async () => {
      try {
        setDeletingId(id);

        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_DOMAIN}/api/tenant/properties/${id}`,
          { withCredentials: true },
        );

        toast.success("Property deleted");
        setProperties((prev) => prev.filter((p) => p.id !== id));
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
    }, "Delete this property permanently?");
  };

  return (
    <div className="p-8 space-y-6 relative">
      {loading && <LoadingScreen />}

      <h1 className="text-2xl font-bold">Property Management</h1>

      <PropertyForm
        editing={editing}
        onSuccess={() => {
          setEditing(null);
          fetchProperties();
        }}
      />

      <PropertyTable
        data={properties}
        deletingId={deletingId}
        onEdit={(p) => setEditing(p)}
        onDelete={handleDelete}
      />
    </div>
  );
}
