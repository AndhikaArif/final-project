"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";

import LoadingScreen from "@/components/loading-screen";
import RoomTable from "@/components/table/room-table";
import RoomForm from "@/components/form/room-form";
import { confirmDelete } from "@/utils/confirm-delete.util";

import type { Room } from "@/types/room.type";

export default function RoomsPage() {
  const params = useParams();
  const propertyId = params.propertyId as string;

  const [rooms, setRooms] = useState<Room[]>([]);
  const [editing, setEditing] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_DOMAIN}/api/tenant/properties/${propertyId}/rooms`,
        { withCredentials: true },
      );

      setRooms(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (!err.response) toast.error("Server is not reachable");
        else if (err.response.status >= 500)
          toast.error("Internal server error");
        else toast.error(err.response.data?.message || "Failed to load rooms");
      } else toast.error("Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleDelete = (id: string) => {
    confirmDelete(async () => {
      try {
        setDeletingId(id);

        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_DOMAIN}/api/tenant/rooms/${id}`,
          { withCredentials: true },
        );

        toast.success("Room deleted");
        setRooms((prev) => prev.filter((r) => r.id !== id));
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
    }, "Delete this room permanently?");
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="p-8 space-y-6 relative">
      <Link href="/tenant/properties">← Back to properties</Link>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Room Management</h1>
        <button
          onClick={() => {
            setEditing(null);
            setOpenForm(true);
          }}
          className="px-4 py-2 bg-black text-white rounded-lg"
        >
          + Add Room
        </button>
      </div>
      <RoomTable
        data={rooms}
        deletingId={deletingId}
        onEdit={(room) => {
          setEditing(room);
          setOpenForm(true);
        }}
        onDelete={handleDelete}
      />
      {openForm && (
        <RoomForm
          propertyId={propertyId}
          room={editing}
          onClose={() => setOpenForm(false)}
          onSuccess={() => {
            setOpenForm(false);
            fetchRooms();
          }}
        />
      )}
    </div>
  );
}
