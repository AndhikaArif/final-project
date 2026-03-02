"use client";

<<<<<<< HEAD
import Link from "next/link";
import Image from "next/image";
import { useState, useRef } from "react";
import { IoClose } from "react-icons/io5";
import { IoMenu } from "react-icons/io5";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <nav className="h-15 px-4 bg-sky-600 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-wider">
          Stay
        </Link>

        {/* Hamburger (mobile only) */}
        <button
          className="text-3xl cursor-pointer hover:opacity-50 sm:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? (
            <IoClose className="text-3xl" />
          ) : (
            <IoMenu className="text-3xl" />
          )}
        </button>

        {/* Mobile dropdown menu */}
        {isOpen && (
          <div
            ref={menuRef}
            className={`absolute top-16 right-4 px-4 py-4 w-50 sm:hidden flex flex-col gap-4 shadow-xl transition duration-300 `}
          >
            {/* <div className="flex flex-col gap-4 ">
              {loading ? (
                <div className="opacity-50 text-sm">...</div>
              ) : user ? (
                <div className="flex items-center gap-3">
                  <Link href="/profile">
                    <div className="relative h-9 w-9 cursor-pointer">
                      <Image
                        src={userImage}
                        className="rounded-full border object-cover"
                        fill
                        alt="Photo Profile"
                      />
                    </div>
                  </Link>

                  <button
                    onClick={logout}
                    className="text-red-400 hover:underline cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="transition-colors duration-300 hover:text-blue-400"
                  >
                    Register
                  </Link>

                  <Link
                    href="/login"
                    className="transition-colors duration-300 hover:text-blue-400"
                  >
                    Login
                  </Link>
                </>
              )}
            </div> */}

            <div className="flex flex-col gap-4">
              <div className="border border-gray-200 w-[165px]"></div>
              {/* <div className="flex justify-between">
                <button
                  onClick={toggleTheme}
                  className="text-md hover:text-blue-400 transition-transform duration-150 cursor-pointer"
                >
                  {isDark ? "Light Mode" : "Dark Mode"}
                </button>

                <button
                  onClick={toggleTheme}
                  className="text-xl hover:scale-120 transition-transform duration-150 cursor-pointer"
                >
                  {isDark ? (
                    <IoSunny className="text-yellow-400" />
                  ) : (
                    <IoMoon className="text-gray-600" />
                  )}
                </button>
              </div> */}
            </div>
          </div>
        )}
=======
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import Image from "next/image";
import { IoMenu, IoClose, IoSearch } from "react-icons/io5";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading, logout, userImage } = useAuth();
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const isUser = user?.role === "USER";
  const isTenant = user?.role === "TENANT";

  const handleSearch = () => {
    if (!keyword.trim()) return;
    router.push(`/properties?search=${encodeURIComponent(keyword)}`);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      {/* ================= TOP NAVBAR ================= */}
      <nav className="flex justify-between items-center py-4 px-4 md:px-8 w-full bg-gray-950 border-b border-gray-300">
        {/* Logo */}
        <Link
          href={isTenant ? "/tenant/dashboard" : "/"}
          className="text-2xl font-semibold tracking-wide"
        >
          Paparoom
        </Link>

        {/* Search */}
        {!isTenant && (
          <div className="hidden sm:flex items-center w-80 border rounded-2xl px-4 py-1.5 bg-gray-100">
            <input
              type="text"
              placeholder="Search property..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 bg-transparent outline-none text-sm text-black"
            />
            <IoSearch
              onClick={handleSearch}
              className="text-xl cursor-pointer"
            />
          </div>
        )}

        {/* Hamburger (mobile) */}
        <button
          className="text-3xl sm:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? <IoClose /> : <IoMenu />}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden sm:flex items-center gap-8">
          {/* Public */}
          <Link href="/" className="hover:text-blue-500">
            Home
          </Link>

          {!isTenant && (
            <Link href="/properties" className="hover:text-blue-500">
              Properties
            </Link>
          )}

          {/* User */}
          {isUser && (
            <Link href="/my-bookings" className="hover:text-blue-500">
              My Bookings
            </Link>
          )}

          {/* Tenant */}
          {isTenant && (
            <>
              <Link href="/tenant/dashboard" className="hover:text-blue-500">
                Dashboard
              </Link>
              <Link href="/tenant/properties" className="hover:text-blue-500">
                My Properties
              </Link>
              <Link href="/tenant/categories" className="hover:text-blue-500">
                Categories
              </Link>
              <Link href="/tenant/orders" className="hover:text-blue-500">
                Orders
              </Link>
              <Link href="/tenant/reports" className="hover:text-blue-500">
                Reports
              </Link>
            </>
          )}

          {/* Auth Section */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="opacity-50 text-sm">...</div>
            ) : user ? (
              <>
                <Link href="/profile">
                  <div className="relative h-9 w-9 cursor-pointer">
                    <Image
                      src={userImage}
                      fill
                      alt="Profile"
                      className="rounded-full object-cover border"
                    />
                  </div>
                </Link>
                <button
                  onClick={logout}
                  className="text-red-400 hover:underline cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-blue-500">
                  Login
                </Link>
                <Link href="/register" className="hover:text-blue-500">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ================= MOBILE DROPDOWN ================= */}
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute top-16 right-4 px-4 py-4 w-52 sm:hidden flex flex-col gap-4 shadow-xl bg-white border rounded-lg"
        >
          {!isTenant && (
            <Link href="/properties" className="text-black hover:scale-101">
              Properties
            </Link>
          )}

          {isUser && (
            <Link href="/my-bookings" className="text-black hover:scale-101">
              My Bookings
            </Link>
          )}

          {isTenant && (
            <>
              <Link
                href="/tenant/dashboard"
                className="text-black hover:scale-101"
              >
                Dashboard
              </Link>
              <Link
                href="/tenant/properties"
                className="text-black hover:scale-101"
              >
                My Properties
              </Link>
              <Link
                href="/tenant/orders"
                className="text-black hover:scale-101"
              >
                Orders
              </Link>
            </>
          )}

          {user ? (
            <>
              <Link href="/profile" className="text-black hover:scale-101">
                Profile
              </Link>
              <button onClick={logout} className="text-red-500">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-black hover:scale-101">
                Login
              </Link>
              <Link href="/register" className="text-black hover:scale-101">
                Register
              </Link>
            </>
          )}
        </div>
      )}

      {/* ================= BOTTOM NAVBAR (MOBILE) ================= */}
      <nav className="fixed bottom-0 h-16 flex justify-around items-center w-full border-t bg-white sm:hidden">
        <Link href={isTenant ? "/tenant/dashboard" : "/"}>Home</Link>

        {!isTenant && <Link href="/properties">Explore</Link>}

        {isUser && <Link href="/my-bookings">Bookings</Link>}

        {isTenant && <Link href="/tenant/properties">My Properties</Link>}

        {user && <Link href="/profile">Profile</Link>}
>>>>>>> main
      </nav>
    </>
  );
}
