import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

// Supported locales
export const locales = ["mr", "hi", "en", "ta", "te", "ml", "kn", "bn", "gu"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "mr";

export const localeNames: Record<Locale, string> = {
  mr: "मराठी",
  hi: "हिंदी",
  en: "English",
  ta: "தமிழ்",
  te: "తెలుగు",
  ml: "മലയാളം",
  kn: "ಕನ್ನಡ",
  bn: "বাংলা",
  gu: "ગુજરાતી",
};

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
