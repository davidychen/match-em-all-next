"use client";

import { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CollectionFilters } from "@/components/collection/collection-filters";
import { CollectionGrid } from "@/components/collection/collection-grid";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function CollectionPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col gap-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-purple-700">My Collection</h1>
        <Suspense fallback={null}>
          <CollectionFilters />
          <CollectionGrid />
        </Suspense>
      </div>
    </QueryClientProvider>
  );
}
