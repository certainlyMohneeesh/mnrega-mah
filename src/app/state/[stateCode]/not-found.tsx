import Link from "next/link";
import { MapPin, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StateNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto text-center space-y-6">
          {/* 404 Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-6">
              <MapPin className="w-12 h-12 text-primary" />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <h1 className="text-6xl font-bold text-primary">404</h1>
            <h2 className="text-2xl font-semibold">State Not Found</h2>
            <p className="text-muted-foreground">
              The state you're looking for doesn't exist or the URL is incorrect.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="default">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/compare">
                <MapPin className="w-4 h-4 mr-2" />
                View All States
              </Link>
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-muted-foreground">
            Make sure the state name is spelled correctly in the URL.
          </p>
        </div>
      </div>
    </div>
  );
}
