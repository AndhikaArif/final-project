"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

interface IUserProfile {
  role: "USER" | "TENANT";
  email: string;
  verificationStatus: "PENDING" | "VERIFIED";

  name?: string;
  profileImage?: string;

  storeName?: string;
  storeAddress?: string;
  logo?: string;
  isApproved?: boolean;
}

interface IAuthContext {
  user: IUserProfile | null;
  loading: boolean;
  userImage: string;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  forceLogout: () => void;
}

const AuthContext = createContext<IAuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // ---- Fetch user on first load ----
  async function refreshUser() {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_DOMAIN}/api/profile`,
        { withCredentials: true },
      );

      setUser(res.data);
    } catch {
      setUser(null);
    }
  }

  // ---- Logout ----
  async function logout() {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_DOMAIN}/api/auth/logout`,
        {},
        { withCredentials: true },
      );
    } catch {}
    setUser(null);
  }

  useEffect(() => {
    async function init() {
      await refreshUser();
      setLoading(false);
    }
    init();

    function syncLogout(e: StorageEvent) {
      if (e.key === "logout-event") {
        setUser(null);
      }
    }

    window.addEventListener("storage", syncLogout);

    return () => {
      window.removeEventListener("storage", syncLogout);
    };
  }, []);

  function broadcastLogout() {
    localStorage.setItem("logout-event", Date.now().toString());
  }

  function forceLogout() {
    broadcastLogout();
    setUser(null);

    localStorage.setItem("session-expired", "true");

    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        refreshUser,
        logout,
        forceLogout,
        userImage:
          user?.role === "TENANT"
            ? user?.logo ||
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgsaRe2zqH_BBicvUorUseeTaE4kxPL2FmOQ&s"
            : user?.profileImage ||
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgsaRe2zqH_BBicvUorUseeTaE4kxPL2FmOQ&s",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
