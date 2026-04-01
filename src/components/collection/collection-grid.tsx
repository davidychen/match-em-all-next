"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAnimatedSpriteUrl, getBackSpriteUrl } from "@/lib/game/constants";
import { PokemonDetailDialog } from "./pokemon-detail-dialog";
import type { CollectionItem } from "@/lib/game/types";

const PAGE_SIZE = 18;

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

interface ApiResponse {
  items: CollectionItem[];
  total: number;
}

function FlippableCard({
  pokemon,
  globalFlip,
  onClick,
}: {
  pokemon: CollectionItem;
  globalFlip: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const showBack = globalFlip ? !hovered : hovered;

  return (
    <Card
      className="cursor-pointer hover:ring-2 hover:ring-purple-400/50 transition-shadow group bg-white/[0.07] backdrop-blur-sm border-white/10"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <CardContent className="flex flex-col items-center p-3 gap-1.5">
        <div className="relative w-16 h-16" style={{ perspective: "400px" }}>
          <motion.div
            className="absolute inset-0"
            animate={{ rotateY: showBack ? 180 : 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Front — Official Artwork */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ backfaceVisibility: "hidden" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getAnimatedSpriteUrl(pokemon.pokemon_id)}
                alt={pokemon.name}
                className="w-16 h-16 object-contain"
              />
            </div>
            {/* Back — Back Sprite */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getBackSpriteUrl(pokemon.pokemon_id)}
                alt={`${pokemon.name} back`}
                className="w-16 h-16 object-contain [image-rendering:pixelated]"
              />
            </div>
          </motion.div>
        </div>
        <span className="text-xs font-medium capitalize truncate w-full text-center text-purple-100">
          {pokemon.name_en}
        </span>
        <div className="flex flex-wrap gap-0.5 justify-center">
          {(pokemon.type ?? []).map((t) => (
            <Badge
              key={t}
              className={`${typeColors[t] ?? "bg-gray-400"} text-white text-[9px] px-1.5 py-0`}
            >
              {t}
            </Badge>
          ))}
        </div>
        <Badge variant="outline" className="text-[10px] border-white/20 text-purple-300">
          x{pokemon.count}
        </Badge>
      </CardContent>
    </Card>
  );
}

export function CollectionGrid() {
  const searchParams = useSearchParams();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [selectedPokemon, setSelectedPokemon] = useState<CollectionItem | null>(null);
  const [globalFlip, setGlobalFlip] = useState(false);

  const filterBy = searchParams.get("filterBy") ?? "all";
  const filterKey = searchParams.get("filterKey") ?? "";
  const sortBy = searchParams.get("sortBy") ?? "pokemon_id";
  const order = searchParams.get("order") ?? "asc";

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery<ApiResponse>({
    queryKey: ["collection", filterBy, filterKey, sortBy, order],
    queryFn: async ({ pageParam }) => {
      const offset = (pageParam as number) ?? 0;
      const params = new URLSearchParams({
        filterBy,
        filterKey,
        sortBy,
        order,
        limit: String(PAGE_SIZE),
        offset: String(offset),
      });
      const res = await fetch(`/api/collection?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch collection");
      return res.json();
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.items.length, 0);
      return loaded < lastPage.total ? loaded : undefined;
    },
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
    const observer = new IntersectionObserver(handleObserver, { rootMargin: "200px" });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleObserver]);

  const allPokemon = data?.pages.flatMap((page) => page.items) ?? [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-xl bg-white/[0.05] animate-pulse" />
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
        <div className="text-5xl mb-3">📦</div>
        <h3 className="text-lg font-semibold text-purple-300">No Pokemon caught yet</h3>
        <p className="text-sm text-purple-400 mt-1">
          Start matching cards on the Game Board to build your collection!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-purple-300">{data?.pages[0]?.total ?? 0} Pokemon collected</p>
        <div className="flex items-center gap-1">
          <span className="text-xs text-purple-400 mr-1">View:</span>
          <Button
            variant="outline"
            size="sm"
            className={`h-7 text-xs px-2 ${!globalFlip ? "bg-white/10 text-white border-purple-400" : "bg-white/[0.05] text-purple-300 border-white/10"}`}
            onClick={() => setGlobalFlip(false)}
          >
            Front
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`h-7 text-xs px-2 ${globalFlip ? "bg-white/10 text-white border-purple-400" : "bg-white/[0.05] text-purple-300 border-white/10"}`}
            onClick={() => setGlobalFlip(true)}
          >
            Back
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {allPokemon.map((pokemon) => (
          <FlippableCard
            key={pokemon.pokemon_id}
            pokemon={pokemon}
            globalFlip={globalFlip}
            onClick={() => setSelectedPokemon(pokemon)}
          />
        ))}
      </div>

      <div ref={sentinelRef} className="h-10" />
      {isFetchingNextPage && (
        <div className="text-center py-4 text-sm text-muted-foreground">Loading more...</div>
      )}

      <PokemonDetailDialog
        pokemon={selectedPokemon}
        open={selectedPokemon !== null}
        onClose={() => setSelectedPokemon(null)}
      />
    </>
  );
}
