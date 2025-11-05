import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function HomePageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Hero Section Skeleton */}
      <section className="relative min-h-[90vh] flex items-center justify-center py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#E76D67' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#E76D67]/90 via-[#E76D67] to-[#D65A54]"></div>
        
        <div className="mx-auto max-w-7xl w-full relative z-10">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* India Map Illustration Skeleton */}
            <div className="flex items-center justify-center w-full order-1 lg:order-none">
              <div className="w-full max-w-[320px] sm:max-w-[420px] md:max-w-[520px] lg:max-w-2xl">
                <div className="aspect-square bg-white/10 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Content Side */}
            <div className="space-y-6 sm:space-y-8 text-white text-center lg:text-left order-2 lg:order-none">
              <div className="space-y-4 sm:space-y-6">
                {/* Title Skeleton */}
                <div className="space-y-4">
                  <div className="h-10 sm:h-12 md:h-16 lg:h-20 bg-white/20 rounded-lg w-3/4 mx-auto lg:mx-0 animate-pulse"></div>
                  <div className="h-10 sm:h-12 md:h-16 lg:h-20 bg-white/20 rounded-lg w-2/3 mx-auto lg:mx-0 animate-pulse"></div>
                </div>
                
                {/* Description Skeleton */}
                <div className="space-y-2">
                  <div className="h-6 bg-white/20 rounded w-full max-w-xl mx-auto lg:mx-0 animate-pulse"></div>
                  <div className="h-6 bg-white/20 rounded w-5/6 max-w-xl mx-auto lg:mx-0 animate-pulse"></div>
                </div>

                {/* Last Updated Skeleton */}
                <div className="h-5 bg-white/20 rounded w-48 mx-auto lg:mx-0 animate-pulse"></div>
              </div>

              {/* Buttons Skeleton */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2 sm:pt-4">
                <div className="h-12 bg-white/30 rounded-lg w-44 animate-pulse"></div>
                <div className="h-12 bg-white/30 rounded-lg w-40 animate-pulse"></div>
                <div className="h-12 bg-white/30 rounded-lg w-40 animate-pulse"></div>
              </div>

              {/* Quick Stats Bar Skeleton */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="text-center lg:text-left space-y-2">
                    <div className="h-8 bg-white/20 rounded w-16 mx-auto lg:mx-0 animate-pulse"></div>
                    <div className="h-4 bg-white/20 rounded w-20 mx-auto lg:mx-0 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* National Stats Section Skeleton */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-6xl">
          {/* Section Header Skeleton */}
          <div className="text-center mb-12 space-y-4">
            <div className="h-10 bg-gray-200 rounded-lg w-96 mx-auto animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-full max-w-3xl mx-auto animate-pulse"></div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6 animate-pulse border-l-4 border-gray-300">
                <div className="space-y-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </Card>
            ))}
          </div>

          {/* Impact Highlight Skeleton */}
          <div className="mt-12 p-6 bg-white rounded-xl shadow-lg border border-gray-200 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-64"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer Section Skeleton */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-5xl">
          {/* Section Header Skeleton */}
          <div className="text-center mb-16 space-y-4">
            <div className="h-10 bg-gray-200 rounded-lg w-80 mx-auto animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-full max-w-3xl mx-auto animate-pulse"></div>
          </div>

          {/* Feature Boxes Skeleton */}
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 mb-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Smart Search Section Skeleton */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white border-t border-gray-100">
        <div className="mx-auto max-w-4xl">
          <div className="text-center space-y-8">
            {/* Section Header Skeleton */}
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded-lg w-96 mx-auto animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-full max-w-2xl mx-auto animate-pulse"></div>
            </div>

            {/* Search Bar Skeleton */}
            <div className="max-w-2xl mx-auto">
              <div className="h-14 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>

            {/* Feature Cards Skeleton */}
            <div className="grid sm:grid-cols-3 gap-6 pt-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center space-y-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-lg mx-auto animate-pulse"></div>
                  <div className="h-5 bg-gray-200 rounded w-32 mx-auto animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Map CTA Section Skeleton */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-100">
        <div className="mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            {/* Icon Skeleton */}
            <div className="inline-flex items-center justify-center w-20 h-20">
              <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse"></div>
            </div>

            {/* Heading Skeleton */}
            <div className="space-y-4">
              <div className="h-12 bg-gray-200 rounded-lg w-full max-w-2xl mx-auto animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-full max-w-3xl mx-auto animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-2/3 max-w-3xl mx-auto animate-pulse"></div>
            </div>

            {/* Features Grid Skeleton */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto pt-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-6 border border-gray-200 animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              ))}
            </div>

            {/* Key Features Skeleton */}
            <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto pt-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-12 h-12 mb-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                  <div className="h-5 bg-gray-200 rounded w-40 mx-auto animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                </div>
              ))}
            </div>

            {/* CTA Button Skeleton */}
            <div className="pt-8 space-y-4">
              <div className="h-14 bg-gray-200 rounded-xl w-80 mx-auto animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* State Statistics Grid Section Skeleton */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="mx-auto max-w-7xl">
          {/* Section Header Skeleton */}
          <div className="text-center mb-12 space-y-4">
            <div className="h-8 bg-gray-200 rounded-full w-48 mx-auto animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded-lg w-96 mx-auto animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-full max-w-3xl mx-auto animate-pulse"></div>
          </div>

          {/* State Cards Grid Skeleton */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <Card key={i} className="p-6 animate-pulse hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  {/* State Name */}
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  
                  {/* Stats */}
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                  </div>
                  
                  {/* View Details Button */}
                  <div className="h-10 bg-gray-200 rounded-lg w-full mt-4"></div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination Skeleton */}
          <div className="flex justify-center items-center gap-2 mt-12">
            <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
            ))}
            <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </section>
    </div>
  );
}
