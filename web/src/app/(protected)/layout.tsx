"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingScreen from "../../components/loading-screen";
import axios from "axios";

type Props = { children: React.ReactNode };

export default function ProtectedLayout({ children }: Props) {
  const { user, loading, forceLogout } = useAuth();
  const router = useRouter();

  // redirect kalau belum login
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (res) => res,
      (error) => {
        if (error.response?.status === 401) {
          forceLogout(); // auto logout kalau JWT expired
        }
        return Promise.reject(error);
      },
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [forceLogout]);

  if (loading) return <LoadingScreen />;
  if (!user) return null;

  return <>{children}</>;
}
