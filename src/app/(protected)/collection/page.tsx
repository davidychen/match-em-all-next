"use client";

import { Suspense } from "react";
import { CollectionFilters } from "@/components/collection/collection-filters";
import { CollectionGrid } from "@/components/collection/collection-grid";

export default function CollectionPage() {
  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-purple-700">My Collection</h1>
      <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
        <CollectionFilters />
        <CollectionGrid />
      </Suspense>
    </div>
  );
}
