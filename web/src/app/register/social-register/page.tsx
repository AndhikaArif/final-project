"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import axios from "axios";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { ZodError } from "zod";

import { socialRegisterSchema } from "@/validation/social-register.validation";
import { useAuth } from "@/context/auth-context";
import LoadingScreen from "@/components/loading-screen";

interface ISocialRegisterFormValues {
  name: string;
  storeName: string;
  storeAddress: string;
}

export default function SocialRegisterPage() {
  const router = useRouter();
  const { status } = useSession();
  const { refreshUser } = useAuth();
  const [lastErrorTime, setLastErrorTime] = useState(0);

  const [role] = useState<"USER" | "TENANT" | null>(
    () => localStorage.getItem("social-role") as "USER" | "TENANT" | null,
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      localStorage.removeItem("social-role");
      router.replace("/login");
    }
  }, [status, router, role]);

  useEffect(() => {
    async function checkSocialLogin() {
      if (status !== "authenticated" || !role) return;

      try {
        const tokenRes = await fetch("/api/get-auth-token");
        const tokenData = await tokenRes.json();

        if (!tokenData.token) {
          router.replace("/login");
          return;
        }

        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_DOMAIN}/api/auth/social/login`,
          { role },
          {
            headers: {
              Authorization: `Bearer ${tokenData.token}`,
            },
            withCredentials: true,
          },
        );

        // ✅ Kalau tidak ada needsRegistration → login sukses
        if (!res.data.needsRegistration) {
          localStorage.removeItem("social-role");
          await refreshUser();
          router.replace("/");
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const status = err.response?.status;

          if (status === 404) {
            return;
          }

          router.replace("/login");
        }
      }
    }

    checkSocialLogin();
  }, [status, role, refreshUser, router]);

  async function handleSubmit(values: ISocialRegisterFormValues) {
    if (!role) return;

    try {
      const tokenRes = await fetch("/api/get-auth-token");
      const tokenData = await tokenRes.json();

      if (!tokenData.token) {
        localStorage.removeItem("social-role");
        router.replace("/login");
        return;
      }

      const payload =
        role === "USER"
          ? { role, name: values.name }
          : {
              role,
              storeName: values.storeName,
              storeAddress: values.storeAddress || null,
            };

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_DOMAIN}/api/auth/social/register`,
        payload,
        {
          headers: { Authorization: `Bearer ${tokenData.token}` },
          withCredentials: true,
        },
      );

      localStorage.removeItem("social-role");

      await refreshUser();
      router.replace("/");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 400) {
          const now = Date.now();
          if (now - lastErrorTime < 2000) return;
          setLastErrorTime(now);
          toast.error("Invalid input.");
          return;
        }

        if (status === 401) {
          const now = Date.now();
          if (now - lastErrorTime < 2000) return;
          setLastErrorTime(now);
          localStorage.removeItem("social-role");
          router.replace("/login");
          return;
        }

        if (status === 403) {
          const now = Date.now();
          if (now - lastErrorTime < 2000) return;
          setLastErrorTime(now);
          toast.error("Unauthorized role access.");
          localStorage.removeItem("social-role");
          router.replace("/login");
          return;
        }

        if (status === 429) {
          const now = Date.now();
          if (now - lastErrorTime < 2000) return;
          setLastErrorTime(now);
          toast.error("Too many attempts.");
          return;
        }

        if (status && status >= 500) {
          const now = Date.now();
          if (now - lastErrorTime < 2000) return;
          setLastErrorTime(now);
          toast.error("Server error.");
          return;
        }
      }

      const now = Date.now();
      if (now - lastErrorTime < 2000) return;
      setLastErrorTime(now);
      toast.error("Failed to complete registration.");
    }
  }

  if (status === "loading" || !role) return <LoadingScreen />;

  return (
    <div className="max-w-md mx-auto p-6 mt-10 border rounded-xl">
      <h2 className="text-xl font-semibold mb-4">Complete Your Account</h2>

      <Formik<ISocialRegisterFormValues>
        initialValues={{
          name: "",
          storeName: "",
          storeAddress: "",
        }}
        validate={(values) => {
          if (!role) return {};

          try {
            socialRegisterSchema.parse({ ...values, role });
            return {};
          } catch (err) {
            if (err instanceof ZodError) {
              const errors: Record<string, string> = {};

              err.issues.forEach((e) => {
                if (e.path?.[0]) {
                  errors[e.path[0] as string] = e.message;
                }
              });

              return errors;
            }

            return {};
          }
        }}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="flex flex-col gap-3">
            {role === "USER" && (
              <>
                <Field
                  name="name"
                  placeholder="Your Name"
                  className="border p-2 rounded text-black bg-white"
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </>
            )}

            {role === "TENANT" && (
              <>
                <Field
                  name="storeName"
                  placeholder="Store Name"
                  className="border p-2 rounded text-black bg-white"
                />
                <ErrorMessage
                  name="storeName"
                  component="div"
                  className="text-red-500 text-sm"
                />

                <Field
                  name="storeAddress"
                  placeholder="Store Address"
                  className="border p-2 rounded text-black bg-white"
                />
                <ErrorMessage
                  name="storeAddress"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`p-2 rounded text-black transition ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-white hover:opacity-90 cursor-pointer"
              }`}
            >
              {isSubmitting ? "Processing..." : "Continue"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
