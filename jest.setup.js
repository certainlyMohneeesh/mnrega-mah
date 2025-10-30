import "@testing-library/jest-dom";

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => (key) => key,
  useLocale: () => "en",
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));
