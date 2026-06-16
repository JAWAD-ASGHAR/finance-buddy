"use client";

import { Skeleton } from "boneyard-js/react";
import { SKELETON_FIXTURES } from "@/components/loading/fixtures";
import {
  SKELETON_NAMES,
  type SkeletonName,
} from "@/components/loading/skeleton-names";
import { useInvertedTheme } from "@/lib/theme";

const SKELETON_COLORS = {
  light: {
    color: "oklch(0.86 0 0)",
    shimmerColor: "oklch(0.93 0 0)",
  },
  inverted: {
    color: "oklch(0.28 0 0)",
    shimmerColor: "oklch(0.38 0 0)",
  },
} as const;

function PulseFallback({ rows = 6 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-6" aria-hidden>
      <div className="space-y-3">
        <div className="h-9 w-48 rounded-md bg-border" />
        <div className="h-4 w-full max-w-xl rounded-md bg-border" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-28 rounded-xl bg-border" />
        ))}
      </div>
      {Array.from({ length: rows - 3 }, (_, index) => (
        <div key={index} className="h-40 rounded-xl bg-border" />
      ))}
    </div>
  );
}

export function RouteSkeleton({ name }: { name: SkeletonName }) {
  const config = SKELETON_FIXTURES[name];
  const { inverted } = useInvertedTheme();
  const colors = inverted ? SKELETON_COLORS.inverted : SKELETON_COLORS.light;

  return (
    <Skeleton
      name={name}
      loading
      color={colors.color}
      fixture={config.fixture}
      snapshotConfig={config.snapshotConfig}
      fallback={
        name === SKELETON_NAMES.authForm ? (
          <AuthFormFallback />
        ) : name === SKELETON_NAMES.marketingHero ? (
          <MarketingHeroFallback />
        ) : (
          <PulseFallback rows={name === SKELETON_NAMES.dashboard ? 6 : 4} />
        )
      }
    >
      {config.fixture}
    </Skeleton>
  );
}

function AuthFormFallback() {
  return (
    <div className="flex min-h-screen animate-pulse flex-col items-center justify-center bg-muted/40 px-4 py-12">
      <div className="mb-8 h-8 w-32 rounded-md bg-border" />
      <div className="h-72 w-full max-w-md rounded-xl bg-border" />
    </div>
  );
}

function MarketingHeroFallback() {
  return (
    <div className="section-padding animate-pulse bg-background">
      <div className="container-main space-y-6">
        <div className="mx-auto h-4 w-24 rounded-md bg-border" />
        <div className="mx-auto h-12 w-full max-w-2xl rounded-md bg-border" />
        <div className="mx-auto h-20 w-full max-w-xl rounded-md bg-border" />
      </div>
    </div>
  );
}
