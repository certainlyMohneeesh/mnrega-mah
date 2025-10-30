import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n";

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Automatically detect locale from browser
  localeDetection: true,

  // Prefix strategy
  localePrefix: "as-needed",
});

export const config = {
  // Match only internationalized pathnames
  matcher: ["/", "/(mr|hi|en)/:path*", "/((?!_next|_vercel|.*\\..*).*)"],
};
