"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSpriteUrl } from "@/lib/game/constants";
import { PokemonDetailDialog } from "./pokemon-detail-dialog";
import type { CollectionItem } from "@/lib/game/types";

interface CollectionPage {
  data: CollectionItem[];
  nextCursor: string | null;
}

const typeColors: Record<string, string> = {
  normal: "bg-gray-400",
  fire: "bg-orange-500",
  water: "bg-blue-500",
  electric: "bg-yellow-400",
  grass: "bg-green-500",
  ice: "bg-cyan-300",
  fighting: "bg-red-700",
  poison: "bg-purple-500",
  ground: "bg-amber-600",
  flying: "bg-indigo-300",
  psychic: "bg-pink-500",
  bug: "bg-lime-500",
  rock: "bg-yellow-700",
  ghost: "bg-purple-700",
  dragon: "bg-indigo-600",
  dark: "bg-gray-700",
  steel: "bg-gray-400",
  fairy: "bg-pink-300",
};

export function CollectionGrid() {
  const searchParams = useSearchParams();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [selectedPokemon, setSelectedPokemon] =
    useState<CollectionItem | null>(null);

  const queryString = searchParams.toString();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery<CollectionPage>({
    queryKey: ["collection", queryString],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams(queryString);
      if (pageParam) params.set("cursor", pageParam as string);
      const res = await fetch(`/api/collection?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch collection");
      return res.json();
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: "200px",
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleObserver]);

  const allPokemon = data?.pages.flatMap((page) => page.data) ?? [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl bg-purple-100/50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 text-red-400">
        Failed to load collection. Please try again.
      </div>
    );
  }

  if (allPokemon.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-3">&#x1F4E6;</div>
        <h3 className="text-lg font-semibold text-muted-foreground">
          No Pokemon caught yet
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Start matching cards on the Game Board to build your collection!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {allPokemon.map((pokemon) => (
          <Card
            key={pokemon.pokemon_id}
            className="cursor-pointer hover:ring-2 hover:ring-purple-400 transition-all group"
            onClick={() => setSelectedPokemon(pokemon)}
          >
            <CardContent className="flex flex-col items-center p-3 gap-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getSpriteUrl(pokemon.pokemon_id)}
                alt={pokemon.name}
                className="w-16 h-16 object-contain group-hover:scale-110 transition-transform"
              />
              <span className="text-xs font-medium capitalize truncate w-full text-center">
                {pokemon.name}
              </span>
              <div className="flex flex-wrap gap-0.5 justify-center">
                {pokemon.type.map((t) => (
                  <Badge
                    key={t}
                    className={`${typeColors[t] ?? "bg-gray-400"} text-white text-[9px] px-1.5 py-0`}
                  >
                    {t}
                  </Badge>
                ))}
              </div>
              <Badge variant="outline" className="text-[10px]">
                x{pokemon.count}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <div ref={sentinelRef} className="h-10" />
      {isFetchingNextPage && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          Loading more...
        </div>
      )}

      <PokemonDetailDialog
        pokemon={selectedPokemon}
        open={selectedPokemon !== null}
        onClose={() => setSelectedPokemon(null)}
      />
    </>
  );
}
