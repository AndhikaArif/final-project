"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import toast from "react-hot-toast";

import { useAuth } from "@/context/auth-context";
import LoadingScreen from "@/components/loading-screen";

export default function SocialLoginPage() {
  const { status } = useSession();
  const router = useRouter();
  const { refreshUser } = useAuth();
  const handled = useRef(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      localStorage.removeItem("social-role");
      router.replace("/login");
      return;
    }

    if (handled.current) return;

    handled.current = true;

    const role = localStorage.getItem("social-role") as
      | "USER"
      | "TENANT"
      | null;

    if (!role) {
      router.replace("/login");
      return;
    }

    const run = async () => {
      try {
        const res = await fetch("/api/get-auth-token");
        const data = await res.json();

        if (!data.token) {
          localStorage.removeItem("social-role");
          toast.error("Failed to retrieve session token.");
          router.replace("/login");
          return;
        }

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_DOMAIN}/api/auth/social/login`,
          { role },
          {
            headers: { Authorization: `Bearer ${data.token}` },
            withCredentials: true,
          },
        );

        if (response.data.needsRegistration) {
          router.replace(`/register/social-register?role=${role}`);
          return;
        }

        localStorage.removeItem("social-role");
        await refreshUser();
        router.replace("/");
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const status = err.response?.status;

          if (status === 404) {
            router.replace(`/social-register?role=${role}`);
            return;
          }

          if (status === 401) {
            localStorage.removeItem("social-role");
            toast.error("Session expired. Please login again.");
            router.replace("/login");
            return;
          }

          if (status === 403) {
            toast.error(
              "This email is already registered using a different login method. Please sign in using the original provider.",
            );
            localStorage.removeItem("social-role");
            return;
          }

          if (status === 429) {
            toast.error("Too many attempts. Please try again later.");
            return;
          }

          if (status && status >= 500) {
            toast.error("Server is currently unavailable.");
            return;
          }

          if (err.response?.data?.message) {
            toast.error(err.response.data.message);
            return;
          }
        }

        toast.error("Social login failed");
        router.replace("/login");
      }
    };

    run();
  }, [status, router, refreshUser]);

  return <LoadingScreen />;
}
