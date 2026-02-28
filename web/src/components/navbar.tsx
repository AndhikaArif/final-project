"use client";

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
      </nav>
    </>
  );
}
