"use client";

import Link from "next/link";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StateError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto text-center space-y-6">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-6">
              <AlertCircle className="w-12 h-12 text-destructive" />
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Something went wrong!</h1>
            <p className="text-muted-foreground">
              We encountered an error while loading this state page.
            </p>
            {error.message && (
              <p className="text-sm text-muted-foreground/80 font-mono bg-muted p-3 rounded">
                {error.message}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={reset} variant="default">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-muted-foreground">
            If this problem persists, please contact support or try again later.
          </p>
        </div>
      </div>
    </div>
  );
}
