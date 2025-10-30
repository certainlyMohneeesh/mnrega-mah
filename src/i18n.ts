import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

// Supported locales
export const locales = ["mr", "hi", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "mr";

export const localeNames: Record<Locale, string> = {
  mr: "मराठी",
  hi: "हिंदी",
  en: "English",
};

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) notFound();

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
