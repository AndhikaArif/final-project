"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingScreen from "@/components/loading-screen";

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (user.role !== "TENANT") {
        router.replace("/forbidden");
      }
    }
  }, [user, loading, router]);

  if (loading) return <LoadingScreen />;
  if (!user || user.role !== "TENANT") return null;

  return <>{children}</>;
}
