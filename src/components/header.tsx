"use client";

import Link from "next/link";
import { Menu, X, Globe, ChevronDown, Home, Map, MapPin, BarChart3, Info } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";

const languages = [
  { code: 'mr', name: 'मराठी', englishName: 'Marathi' },
  { code: 'hi', name: 'हिंदी', englishName: 'Hindi' },
  { code: 'en', name: 'English', englishName: 'English' },
  { code: 'ta', name: 'தமிழ்', englishName: 'Tamil' },
  { code: 'te', name: 'తెలుగు', englishName: 'Telugu' },
  { code: 'ml', name: 'മലയാളം', englishName: 'Malayalam' },
  { code: 'kn', name: 'ಕನ್ನಡ', englishName: 'Kannada' },
  { code: 'bn', name: 'বাংলা', englishName: 'Bengali' },
  { code: 'gu', name: 'ગુજરાતી', englishName: 'Gujarati' },
] as const;

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/90 shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-11 w-11 rounded-xl flex items-center justify-center relative transform transition-transform group-hover:scale-105" style={{ background: 'linear-gradient(135deg, #E76D67 0%, #514E80 100%)' }}>
            <svg viewBox="0 0 40 40" className="w-7 h-7" aria-hidden="true">
              <circle cx="20" cy="20" r="15" fill="white" opacity="0.1"/>
              <circle cx="20" cy="20" r="12" fill="white" opacity="0.15"/>
              <circle cx="20" cy="20" r="9" fill="white" opacity="0.2"/>
              <path d="M20 11 L20 29 M11 20 L29 20" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
              <circle cx="20" cy="11" r="1.5" fill="white"/>
              <circle cx="29" cy="20" r="1.5" fill="white"/>
              <circle cx="20" cy="29" r="1.5" fill="white"/>
              <circle cx="11" cy="20" r="1.5" fill="white"/>
            </svg>
          </div>
          <div className="hidden sm:block">
            <div className="text-base font-bold text-gray-900 leading-tight">MGNREGA India</div>
            <div className="text-xs text-gray-500">Data Dashboard</div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:items-center lg:gap-x-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:text-brand hover:bg-brand/5 transition-all"
          >
            <Home className="h-4 w-4" />
            <span>{t('nav.home')}</span>
          </Link>
          <Link
            href="/map"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:text-brand hover:bg-brand/5 transition-all"
          >
            <Map className="h-4 w-4" />
            <span>Interactive Map</span>
          </Link>
          <Link
            href="/#states"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:text-brand hover:bg-brand/5 transition-all"
          >
            <MapPin className="h-4 w-4" />
            <span>States</span>
          </Link>
          <Link
            href="/compare"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:text-brand hover:bg-brand/5 transition-all"
          >
            <BarChart3 className="h-4 w-4" />
            <span>{t('nav.compare')}</span>
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:text-brand hover:bg-brand/5 transition-all"
          >
            <Info className="h-4 w-4" />
            <span>{t('nav.about')}</span>
          </Link>
        </div>

        {/* Right side: Language + Mobile Menu */}
        <div className="flex items-center gap-3">
          {/* Language Selector - Desktop */}
          <div className="hidden lg:block relative">
            <button 
              className="flex items-center gap-2 rounded-lg bg-accent-purple/10 px-4 py-2.5 text-sm font-semibold text-accent-purple hover:bg-accent-purple/20 transition-all"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
            >
              <Globe className="h-4 w-4" />
              <span className="hidden xl:inline">{languages.find(l => l.code === language)?.name}</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {langMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setLangMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white shadow-xl border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as any);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${
                        language === lang.code ? 'bg-accent-purple/5 text-accent-purple font-semibold' : 'text-gray-700'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-base">{lang.name}</span>
                        <span className="text-xs text-gray-500">({lang.englishName})</span>
                      </span>
                      {language === lang.code && (
                        <div className="w-2 h-2 rounded-full bg-accent-purple" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden rounded-lg p-2.5 text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden z-40" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-x-0 top-[73px] lg:hidden bg-white border-t border-b shadow-xl z-50 max-h-[calc(100vh-73px)] overflow-y-auto">
            <div className="px-4 py-4 space-y-1">
              {/* Navigation Links */}
              <Link
                href="/"
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-semibold text-gray-900 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="h-5 w-5 text-gray-600" />
                <span>{t('nav.home')}</span>
              </Link>
              <Link
                href="/map"
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-semibold text-gray-900 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Map className="h-5 w-5 text-gray-600" />
                <span>Interactive Map</span>
              </Link>
              <Link
                href="/#states"
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-semibold text-gray-900 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <MapPin className="h-5 w-5 text-gray-600" />
                <span>States</span>
              </Link>
              <Link
                href="/compare"
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-semibold text-gray-900 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <BarChart3 className="h-5 w-5 text-gray-600" />
                <span>{t('nav.compare')}</span>
              </Link>
              <Link
                href="/about"
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-semibold text-gray-900 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Info className="h-5 w-5 text-gray-600" />
                <span>{t('nav.about')}</span>
              </Link>
              
              {/* Language Selector */}
              <div className="pt-3 mt-3 border-t">
                <div className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <Globe className="h-4 w-4" />
                  <span>Language</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as any);
                        setMobileMenuOpen(false);
                      }}
                      className={`text-left rounded-xl px-4 py-3 text-sm font-semibold hover:bg-gray-50 active:bg-gray-100 transition-colors ${
                        language === lang.code ? 'bg-accent-purple/10 text-accent-purple ring-2 ring-accent-purple/20' : 'text-gray-900 bg-gray-50'
                      }`}
                    >
                      <div className="font-semibold">{lang.name}</div>
                      <div className="text-xs opacity-70 mt-0.5">{lang.englishName}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
