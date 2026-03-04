"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Formik, Form, Field } from "formik";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import toast from "react-hot-toast";

type SocialRegisterForm = {
  role: "USER" | "TENANT";
  name?: string;
  storeName?: string;
  storeAddress?: string;
};

export default function SocialRegisterPage() {
  const router = useRouter();
  const params = useSearchParams();
  const role = (params.get("role") as "USER" | "TENANT") || "USER";

  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("Session expired, please login again");
      router.replace("/login");
    }
  }, [status, router]);

  async function submitSocialRegister(values: SocialRegisterForm) {
    try {
      // ambil JWT resmi dari NextAuth cookie
      const tokenRes = await fetch("/api/get-auth-token");
      const tokenData = await tokenRes.json();

      if (!tokenData.token) {
        toast.error("Failed to retrieve token");
        return;
      }

      const cleaned = Object.fromEntries(
        Object.entries(values).filter(([, v]) => v !== ""),
      );

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_DOMAIN}/api/auth/social/register`,
        cleaned,
        {
          headers: { Authorization: `Bearer ${tokenData.token}` },
          withCredentials: true,
        },
      );

      toast.success("Account created");
      router.replace("/");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 400) {
          toast.error("Invalid data. Please check your input.");
          return;
        }

        if (status === 401) {
          toast.error("Session expired. Please login again.");
          router.replace("/login");
          return;
        }

        if (status === 409) {
          toast.error("Account already exists.");
          return;
        }

        if (status === 429) {
          toast.error("Too many attempts. Try again later.");
          return;
        }

        if (status && status >= 500) {
          toast.error("Server error. Please try again later.");
          return;
        }

        if (err.response?.data?.message) {
          toast.error(err.response.data.message);
          return;
        }
      }

      toast.error("Failed to complete registration.");
    }
  }

  if (status === "loading") return <div>Loading...</div>;
  if (status !== "authenticated") return;

  return (
    <div className="max-w-md mx-auto p-6 mt-10 border rounded-xl">
      <h2 className="text-xl mb-4">Complete your account</h2>

      <Formik
        initialValues={{ role, name: "", storeName: "", storeAddress: "" }}
        onSubmit={submitSocialRegister}
      >
        {({ values }) => (
          <Form className="flex flex-col gap-3">
            {values.role === "USER" && (
              <Field
                name="name"
                placeholder="Name"
                className="border p-2 rounded text-black"
              />
            )}
            {values.role === "TENANT" && (
              <>
                <Field
                  name="storeName"
                  placeholder="Store Name"
                  className="border p-2 rounded text-black"
                />
                <Field
                  name="storeAddress"
                  placeholder="Store Address"
                  className="border p-2 rounded text-black"
                />
              </>
            )}

            <button type="submit" className="bg-black text-white p-2 rounded">
              Continue
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
