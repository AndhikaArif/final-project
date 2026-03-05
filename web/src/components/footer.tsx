"use client";

import Link from "next/link";
import { FaInstagram, FaTwitter, FaFacebook } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-white mt-24">
      <div className="max-w-6xl mx-auto px-6 py-14">
        {/* Top Section */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <h2 className="text-xl font-bold mb-3">Paparoom</h2>
            <p className="text-white text-sm leading-relaxed">
              Discover the best properties and book your perfect stay with ease.
              Paparoom helps you find the right place for every journey.
            </p>

            {/* Social */}
            <div className="flex gap-4 mt-5 text-gray-400 text-lg">
              <a className="hover:text-white transition cursor-pointer">
                <FaInstagram />
              </a>
              <a className="hover:text-white transition cursor-pointer">
                <FaTwitter />
              </a>
              <a className="hover:text-white transition cursor-pointer">
                <FaFacebook />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-semibold mb-4">Explore</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li>
                <Link
                  href="/catalog"
                  className="hover:text-white transition cursor-pointer"
                >
                  Properties
                </Link>
              </li>
              <li>
                <Link
                  href="/cities"
                  className="hover:text-white transition cursor-pointer"
                >
                  Destinations
                </Link>
              </li>
              <li>
                <Link
                  href="/deals"
                  className="hover:text-white transition cursor-pointer"
                >
                  Deals
                </Link>
              </li>
              <li>
                <Link
                  href="/new"
                  className="hover:text-white transition cursor-pointer"
                >
                  New Listings
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li>
                <Link
                  href="/about"
                  className="hover:text-white transition cursor-pointer"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="hover:text-white transition cursor-pointer"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-white transition cursor-pointer"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/partners"
                  className="hover:text-white transition cursor-pointer"
                >
                  Partners
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li>
                <Link
                  href="/help"
                  className="hover:text-white transition cursor-pointer"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-white transition cursor-pointer"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-white transition cursor-pointer"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-white transition cursor-pointer"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} Paparoom. All rights reserved.</p>

          <div className="flex gap-6">
            <Link
              href="/terms"
              className="hover:text-white transition cursor-pointer"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="hover:text-white transition cursor-pointer"
            >
              Privacy
            </Link>
            <Link
              href="/cookies"
              className="hover:text-white transition cursor-pointer"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
