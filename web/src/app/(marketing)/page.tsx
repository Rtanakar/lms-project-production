// ============================================================================
// page.tsx — Landing page (placeholder for now)
// ============================================================================
// Phase 11.3 me proper marketing landing banayenge. Abhi minimal placeholder
// jo brand-aligned hai aur auth pages ke links rakhta hai.
// ============================================================================

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, GraduationCap } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <GraduationCap className="h-7 w-7" />
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Learn. Build. Grow.
        </h1>

        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          A modern learning platform built for serious learners. Track your
          progress, earn certificates, and master skills at your own pace.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/sign-up">
              Get started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
