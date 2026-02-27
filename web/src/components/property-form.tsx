"use client";

import { useState, useEffect, FormEvent } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Property } from "@/app/(protected)/tenant/properties/page";

interface IPropertyFormProps {
  editing?: Property | null;
  onSuccess: () => void;
}

export default function PropertyForm({
  editing,
  onSuccess,
}: IPropertyFormProps) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [maxGuest, setMaxGuest] = useState(1);
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [submitting, setSubmitting] = useState(false);

  // Load categories
  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_DOMAIN}/api/categories`, {
        withCredentials: true,
      })
      .then((res) => setCategories(res.data?.data || []))
      .catch(() => toast.error("Failed to fetch categories"));
  }, []);

  // Load editing data
  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setDescription(editing.description || "");
      setCity(editing.city);
      setAddress(editing.address);
      setMaxGuest(editing.maxGuest);
      setCategoryId(editing.category.id);
      setImage(null);
    } else {
      setName("");
      setDescription("");
      setCity("");
      setAddress("");
      setMaxGuest(1);
      setCategoryId("");
      setImage(null);
    }
  }, [editing]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !description || !city || !address || !categoryId) {
      return toast.error("Please fill all required fields");
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("city", city);
    formData.append("address", address);
    formData.append("maxGuest", maxGuest.toString());

    formData.append("categoryId", categoryId);
    if (image) formData.append("image", image);

    try {
      setSubmitting(true);

      if (editing) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_DOMAIN}/api/tenant/properties/${editing.id}`,
          formData,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        toast.success("Property updated");
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_DOMAIN}/api/tenant/properties`,
          formData,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        toast.success("Property created");
      }

      onSuccess();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Failed to save property");
      } else {
        toast.error("Unexpected error occurred");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-white border rounded shadow space-y-4"
    >
      <h2 className="text-lg font-semibold text-black">
        {editing ? "Edit Property" : "Add Property"}
      </h2>

      <div className="flex flex-col space-y-1">
        <label htmlFor="name" className="font-medium text-gray-700">
          Name
        </label>
        <input
          id="name"
          type="text"
          placeholder="Property Name"
          className="input w-full bg-gray-100 text-black p-2 rounded border"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col space-y-1">
        <label htmlFor="description" className="font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          placeholder="Property description"
          className="input w-full bg-gray-100 text-black p-2 rounded border"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col space-y-1">
        <label htmlFor="city" className="font-medium text-gray-700">
          City
        </label>
        <input
          id="city"
          type="text"
          placeholder="City"
          className="input w-full bg-gray-100 text-black p-2 rounded border"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col space-y-1">
        <label htmlFor="address" className="font-medium text-gray-700">
          Address
        </label>
        <input
          id="address"
          type="text"
          placeholder="Address"
          className="input w-full bg-gray-100 text-black p-2 rounded border"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col space-y-1">
        <label htmlFor="maxGuest" className="font-medium text-gray-700">
          Max Guests
        </label>
        <input
          id="maxGuest"
          type="number"
          placeholder="Max Guests"
          className="input w-full bg-gray-100 text-black p-2 rounded border"
          value={maxGuest}
          onChange={(e) => setMaxGuest(Number(e.target.value))}
          min={1}
          required
        />
      </div>

      <div className="flex flex-col space-y-1">
        <label htmlFor="category" className="font-medium text-gray-700">
          Category
        </label>
        <select
          id="category"
          className="input w-full bg-gray-100 text-black p-2 rounded border"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col space-y-1">
        <label
          htmlFor="image"
          className="font-medium text-gray-700 cursor-pointer"
        >
          Image
        </label>
        <input
          id="image"
          type="file"
          accept="image/*"
          className="w-full text-black cursor-pointer"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
        />
      </div>

      <button
        type="submit"
        className="w-full p-2 rounded bg-blue-700 text-white hover:bg-blue-500 transition disabled:opacity-50 cursor-pointer"
        disabled={submitting}
      >
        {submitting
          ? "Saving..."
          : editing
            ? "Update Property"
            : "Create Property"}
      </button>
    </form>
  );
}
