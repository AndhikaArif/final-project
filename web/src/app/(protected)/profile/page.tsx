"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { Formik, Form, Field } from "formik";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import LoadingScreen from "@/components/loading-screen";

export default function ProfilePage() {
  const { user, refreshUser, loading, userImage } = useAuth();
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  useEffect(() => {
    if (!loading && user === null) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading) return <LoadingScreen />;
  if (!user) return null;

  const handleResendVerification = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_DOMAIN}/api/auth/resend-verification`,
        {},
        { withCredentials: true },
      );

      toast.success("Verification email sent");
    } catch {
      toast.error("Failed to resend verification email");
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim()) {
      toast.error("Email cannot be empty");
      return false;
    }

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_DOMAIN}/api/profile/update-email`,
        { email: newEmail },
        { withCredentials: true },
      );

      toast.success("Email updated. Please verify again.");
      setNewEmail("");
      await refreshUser();
      return true;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || "Failed to update email";

        toast.error(message);

        if (err.response?.status === 401) {
          router.replace("/login");
        }

        return false;
      }

      toast.error("Something went wrong");
      return false;
    }
  };

  return (
    <main className="pb-20">
      <div className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-6">My Profile</h1>

        <Formik
          initialValues={{
            name: user.role === "USER" ? (user.name ?? "") : "",
            storeName: user.role === "TENANT" ? (user.storeName ?? "") : "",
            storeAddress:
              user.role === "TENANT" ? (user.storeAddress ?? "") : "",
          }}
          enableReinitialize
          onSubmit={async (values, { setSubmitting }) => {
            try {
              setError("");

              if (user.role === "USER" && !values.name.trim()) {
                setError("Name cannot be empty");
                setSubmitting(false);
                return;
              }

              if (
                user.role === "TENANT" &&
                !values.storeAddress.trim() &&
                !values.storeName.trim()
              ) {
                setError("Store name and store address cannot be empty");
                setSubmitting(false);
                return;
              }

              await axios.put(
                `${process.env.NEXT_PUBLIC_API_DOMAIN}/api/profile`,
                user.role === "USER"
                  ? { name: values.name }
                  : {
                      storeName: values.storeName,
                      storeAddress: values.storeAddress,
                    },
                { withCredentials: true },
              );

              setPreview(null);
              await refreshUser();
              toast.success("Profile updated successfully");
            } catch (err) {
              if (axios.isAxiosError(err)) {
                if (err.response?.status === 401) {
                  router.replace("/");
                  return;
                }
              }
              setError("Failed to update profile");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              {/* PROFILE IMAGE */}
              <div className="flex items-center gap-6 mb-8">
                <label className="relative cursor-pointer group w-24 h-24 block">
                  <div className="relative w-24 h-24">
                    <Image
                      src={preview || userImage}
                      fill
                      className="rounded-full object-cover"
                      alt="Profile"
                    />

                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center z-10">
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.currentTarget.files?.[0];

                      if (!file) return;

                      if (file.size > 1024 * 1024) {
                        toast.error("Max file size is 1MB");
                        return;
                      }

                      if (preview) URL.revokeObjectURL(preview);

                      const localPreview = URL.createObjectURL(file);
                      setPreview(localPreview);

                      setIsUploading(true);

                      try {
                        const imageData = new FormData();
                        imageData.append("image", file);

                        await axios.post(
                          `${process.env.NEXT_PUBLIC_API_DOMAIN}/api/profile/upload-image`,
                          imageData,
                          { withCredentials: true },
                        );

                        await refreshUser();
                        setPreview(null);
                        toast.success("Profile image updated");
                      } catch (err) {
                        if (axios.isAxiosError(err)) {
                          toast.error("Failed to upload image");
                          URL.revokeObjectURL(localPreview);
                          setPreview(null);
                        }
                      } finally {
                        setIsUploading(false);
                      }
                    }}
                  />
                </label>

                <div>
                  <p className="font-medium text-lg">
                    {user.role === "USER"
                      ? (user.name ?? "No Name")
                      : (user.storeName ?? "No Store Name")}
                  </p>

                  <p
                    className={`py-1 text-sm rounded ${user.role === "TENANT" ? "text-purple-700" : "text-blue-500"}`}
                  >
                    {user.role}
                  </p>

                  <div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm">{user.email}</p>

                      {!isEditingEmail && (
                        <button
                          type="button"
                          onClick={() => setIsEditingEmail(true)}
                          className="text-xs text-blue-600 underline hover:scale-105 cursor-pointer"
                        >
                          Edit
                        </button>
                      )}
                    </div>

                    {isEditingEmail && (
                      <div className="mt-3 flex gap-2">
                        <input
                          type="email"
                          placeholder="New Email"
                          className="border p-2 rounded w-full text-sm"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                        />

                        <button
                          type="button"
                          onClick={async () => {
                            const success = await handleChangeEmail();
                            if (success) {
                              setIsEditingEmail(false);
                            }
                          }}
                          className="border px-3 rounded text-sm cursor-pointer hover:scale-105"
                        >
                          Save
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingEmail(false);
                            setNewEmail("");
                          }}
                          className="border px-3 rounded text-sm cursor-pointer hover:scale-105"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {user.verificationStatus === "PENDING" && (
                    <div className="mt-2">
                      <p className="text-xs text-red-500">Email not verified</p>
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        className="text-xs text-blue-600 underline"
                      >
                        Resend verification
                      </button>
                    </div>
                  )}

                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      user.verificationStatus === "VERIFIED"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {user.verificationStatus}
                  </span>
                </div>
              </div>

              {error && (
                <div className="mb-4 bg-red-100 text-red-600 px-3 py-2 rounded text-sm">
                  {error}
                </div>
              )}

              {user.role === "USER" && (
                <>
                  <label className="block mb-2 font-medium">Name</label>
                  <Field
                    name="name"
                    className="w-full border p-2 mb-6 rounded"
                  />
                </>
              )}

              {user.role === "TENANT" && (
                <>
                  <label className="block mb-2 font-medium">Store Name</label>
                  <Field
                    name="storeName"
                    className="w-full border p-2 mb-4 rounded"
                  />

                  <label className="block mb-2 font-medium">
                    Store Address
                  </label>
                  <Field
                    name="storeAddress"
                    className="w-full border p-2 mb-6 rounded"
                  />
                </>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:scale-105 transition cursor-pointer"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>

                {user.provider === "EMAIL" ? (
                  <button
                    type="button"
                    onClick={() => router.push("/forgot-password")}
                    className="border px-4 py-2 rounded hover:scale-105 transition cursor-pointer"
                  >
                    Reset Password
                  </button>
                ) : (
                  <p className="text-xs text-gray-500 italic">
                    Password is managed by your social login provider
                  </p>
                )}
              </div>

              {user.role === "TENANT" && (
                <div className="my-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => router.push("/tenant/properties")}
                    className="border px-4 py-2 rounded hover:scale-105 transition bg-white text-black cursor-pointer"
                  >
                    Manage Property
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("tenant/categories")}
                    className="border px-4 py-2 rounded hover:scale-105 transition bg-white text-black cursor-pointer"
                  >
                    Manage Category
                  </button>
                </div>
              )}
            </Form>
          )}
        </Formik>
      </div>
    </main>
  );
}
