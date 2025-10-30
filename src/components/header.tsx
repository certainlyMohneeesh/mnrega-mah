"use client";

import Link from "next/link";
import { Menu, X, Globe } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
            M
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-bold text-gray-900">MGNREGA</div>
            <div className="text-xs text-gray-500">Maharashtra</div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:gap-x-8">
          <Link
            href="/"
            className="text-sm font-semibold leading-6 text-gray-900 hover:text-orange-600 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/districts"
            className="text-sm font-semibold leading-6 text-gray-900 hover:text-orange-600 transition-colors"
          >
            Districts
          </Link>
          <Link
            href="/compare"
            className="text-sm font-semibold leading-6 text-gray-900 hover:text-orange-600 transition-colors"
          >
            Compare
          </Link>
          <Link
            href="/about"
            className="text-sm font-semibold leading-6 text-gray-900 hover:text-orange-600 transition-colors"
          >
            About
          </Link>
        </div>

        {/* Language Selector */}
        <div className="hidden lg:flex lg:items-center lg:gap-x-4">
          <button className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors">
            <Globe className="h-4 w-4" />
            <span>English</span>
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="lg:hidden rounded-md p-2 text-gray-700"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t bg-white">
          <div className="space-y-1 px-4 pb-3 pt-2">
            <Link
              href="/"
              className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/districts"
              className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Districts
            </Link>
            <Link
              href="/compare"
              className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Compare
            </Link>
            <Link
              href="/about"
              className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <button className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50">
              <Globe className="h-5 w-5" />
              <span>English</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
