"use client";

import Link from "next/link";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";

const languages = [
  { code: 'mr', name: 'मराठी', englishName: 'Marathi' },
  { code: 'hi', name: 'हिंदी', englishName: 'Hindi' },
  { code: 'en', name: 'English', englishName: 'English' },
] as const;

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

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
            className="text-sm font-semibold leading-6 text-gray-900 hover:text-brand transition-colors"
          >
            {t('nav.home')}
          </Link>
          <Link
            href="/#districts"
            className="text-sm font-semibold leading-6 text-gray-900 hover:text-brand transition-colors"
          >
            {t('nav.districts')}
          </Link>
          <Link
            href="/compare"
            className="text-sm font-semibold leading-6 text-gray-900 hover:text-brand transition-colors"
          >
            {t('nav.compare')}
          </Link>
          <Link
            href="/about"
            className="text-sm font-semibold leading-6 text-gray-900 hover:text-brand transition-colors"
          >
            {t('nav.about')}
          </Link>
        </div>

        {/* Language Selector */}
        <div className="hidden lg:flex lg:items-center lg:gap-x-4 relative">
          <button 
            className="flex items-center gap-2 rounded-full bg-brand/10 px-4 py-2 text-sm font-medium text-brand hover:bg-brand/20 transition-colors"
            onClick={() => setLangMenuOpen(!langMenuOpen)}
          >
            <Globe className="h-4 w-4" />
            <span>{languages.find(l => l.code === language)?.name}</span>
            <ChevronDown className="h-3 w-3" />
          </button>
          
          {langMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-lg bg-white shadow-lg border border-gray-200 py-1 z-50">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code as any);
                    setLangMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                    language === lang.code ? 'bg-brand/5 text-brand font-medium' : 'text-gray-700'
                  }`}
                >
                  {lang.name}
                  <span className="text-xs text-gray-500 ml-2">({lang.englishName})</span>
                </button>
              ))}
            </div>
          )}
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
              {t('nav.home')}
            </Link>
            <Link
              href="/"
              className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.districts')}
            </Link>
            <Link
              href="/compare"
              className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.compare')}
            </Link>
            <Link
              href="/about"
              className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.about')}
            </Link>
            
            <div className="pt-2 border-t mt-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Language</div>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code as any);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left block rounded-lg px-3 py-2 text-base font-semibold hover:bg-gray-50 ${
                    language === lang.code ? 'bg-brand/5 text-brand' : 'text-gray-900'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
