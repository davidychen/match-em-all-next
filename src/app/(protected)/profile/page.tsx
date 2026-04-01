"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { getAnimatedSpriteUrl } from "@/lib/game/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Search, ChevronDown } from "lucide-react";

/* ---------- types ---------- */

interface CaughtPokemon {
  pokemon_id: number;
  name: string;
  name_en: string;
  type: string[];
}

type SortKey = "id" | "name" | "recent";

/* ---------- constants ---------- */

const POKEMON_TYPES = [
  "normal", "fire", "water", "electric", "grass", "ice",
  "fighting", "poison", "ground", "flying", "psychic",
  "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy",
] as const;

const TYPE_COLOR_MAP: Record<string, string> = {
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

const TYPE_TEXT_MAP: Record<string, string> = {
  normal: "text-gray-400",
  fire: "text-orange-500",
  water: "text-blue-500",
  electric: "text-yellow-400",
  grass: "text-green-500",
  ice: "text-cyan-300",
  fighting: "text-red-700",
  poison: "text-purple-500",
  ground: "text-amber-600",
  flying: "text-indigo-300",
  psychic: "text-pink-500",
  bug: "text-lime-500",
  rock: "text-yellow-700",
  ghost: "text-purple-700",
  dragon: "text-indigo-600",
  dark: "text-gray-700",
  steel: "text-gray-400",
  fairy: "text-pink-300",
};

const PAGE_SIZE = 30;

/* ---------- component ---------- */

export default function ProfilePage() {
  const { user, profile, loading } = useAuth();
  const [caughtPokemon, setCaughtPokemon] = useState<CaughtPokemon[]>([]);
  const [updating, setUpdating] = useState(false);

  // Filter / sort state
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;

    fetch("/api/collection?limit=500")
      .then((r) => r.json())
      .then((data) => {
        if (data.items) {
          setCaughtPokemon(
            data.items.map((p: CaughtPokemon & { type?: string[] }) => ({
              pokemon_id: p.pokemon_id,
              name: p.name,
              name_en: p.name_en,
              type: Array.isArray(p.type) ? p.type : [],
            }))
          );
        }
      });
  }, [user]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, typeFilter, sortKey]);

  // Filtered + sorted list
  const filteredPokemon = useMemo(() => {
    let list = [...caughtPokemon];

    // Text search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name_en.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          String(p.pokemon_id).includes(q)
      );
    }

    // Type filter
    if (typeFilter) {
      list = list.filter((p) =>
        p.type.some((t) => t.toLowerCase() === typeFilter)
      );
    }

    // Sort
    switch (sortKey) {
      case "name":
        list.sort((a, b) => (a.name_en || a.name).localeCompare(b.name_en || b.name));
        break;
      case "recent":
        list.reverse();
        break;
      case "id":
      default:
        list.sort((a, b) => a.pokemon_id - b.pokemon_id);
        break;
    }

    return list;
  }, [caughtPokemon, search, typeFilter, sortKey]);

  const visiblePokemon = useMemo(
    () => filteredPokemon.slice(0, visibleCount),
    [filteredPokemon, visibleCount]
  );

  const hasMore = visibleCount < filteredPokemon.length;

  const handleAvatarChange = useCallback(
    async (pokemonId: number) => {
      setUpdating(true);
      try {
        const res = await fetch("/api/avatar", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pokemonId }),
        });

        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error ?? "Failed to update avatar");
          return;
        }

        toast.success("Avatar updated!");
        window.location.reload();
      } catch {
        toast.error("Failed to update avatar");
      } finally {
        setUpdating(false);
      }
    },
    []
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  const avatarUrl = profile.avatar_id ? getAnimatedSpriteUrl(profile.avatar_id) : null;

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-white">Profile</h1>

      {/* Avatar display card */}
      <Card>
        <CardHeader className="items-center">
          <Avatar className="w-24 h-24 border-4 border-purple-500/30 bg-purple-900/50 overflow-hidden">
            {avatarUrl && (
              <AvatarImage
                src={avatarUrl}
                alt={profile.username}
                className="scale-[1.3] object-contain"
              />
            )}
            <AvatarFallback className="bg-purple-900/50 text-purple-300 text-2xl font-bold">
              {profile.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-xl mt-2">{profile.username}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {caughtPokemon.length} Pokemon caught
          </p>
        </CardHeader>
      </Card>

      {/* Change Avatar section */}
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <Label className="text-base font-semibold">Change Avatar</Label>

          {caughtPokemon.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Catch some Pokemon to use them as your avatar!
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Search box */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-white/10 bg-white/[0.07] text-white text-sm placeholder:text-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                />
              </div>

              {/* Type filter chips */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setTypeFilter(null)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    typeFilter === null
                      ? "bg-purple-600 text-white shadow-sm"
                      : "bg-white/[0.07] text-purple-300 hover:bg-white/[0.12]"
                  }`}
                >
                  All
                </button>
                {POKEMON_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(typeFilter === type ? null : type)}
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all ${
                      typeFilter === type
                        ? `${TYPE_COLOR_MAP[type]} text-white shadow-sm`
                        : "bg-white/[0.07] text-purple-300 hover:bg-white/[0.12]"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Sort controls */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Sort:</span>
                {(
                  [
                    { key: "id", label: "ID" },
                    { key: "name", label: "Name" },
                    { key: "recent", label: "Recent" },
                  ] as { key: SortKey; label: string }[]
                ).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setSortKey(key)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      sortKey === key
                        ? "bg-white/10 text-white border border-purple-400"
                        : "bg-white/[0.05] text-purple-300 border border-white/10 hover:bg-white/[0.07]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
                <span className="ml-auto text-xs text-muted-foreground">
                  {filteredPokemon.length} result{filteredPokemon.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Pokemon grid */}
              {filteredPokemon.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No Pokemon match your filters.
                </p>
              ) : (
                <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                  {visiblePokemon.map((p) => {
                    const isSelected = profile.avatar_id === p.pokemon_id;
                    const isHovered = hoveredId === p.pokemon_id;

                    return (
                      <div key={p.pokemon_id} className="relative">
                        <button
                          disabled={updating}
                          onClick={() => handleAvatarChange(p.pokemon_id)}
                          onMouseEnter={() => setHoveredId(p.pokemon_id)}
                          onMouseLeave={() => setHoveredId(null)}
                          className={`
                            relative aspect-square rounded-lg border-2 p-1 w-full
                            transition-all hover:scale-105 hover:shadow-md
                            disabled:opacity-50 disabled:cursor-not-allowed
                            ${
                              isSelected
                                ? "border-purple-400 bg-purple-500/20 shadow-purple-500/20 shadow-md"
                                : "border-white/10 hover:border-purple-400/50 bg-white/[0.07]"
                            }
                          `}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getAnimatedSpriteUrl(p.pokemon_id)}
                            alt={p.name_en || p.name}
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center shadow-sm">
                              <span className="text-white text-[10px] font-bold">&#10003;</span>
                            </div>
                          )}
                        </button>

                        {/* Hover tooltip */}
                        {isHovered && (
                          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-20 bg-gray-900/95 text-white px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none whitespace-nowrap text-center">
                            <p className="text-xs font-semibold">{p.name_en || p.name}</p>
                            <div className="flex items-center justify-center gap-1 mt-0.5">
                              <span className="text-[10px] text-gray-400">#{p.pokemon_id}</span>
                              {p.type.map((t) => (
                                <span
                                  key={t}
                                  className={`text-[10px] capitalize font-medium ${TYPE_TEXT_MAP[t.toLowerCase()] || "text-gray-300"}`}
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Show more button */}
              {hasMore && (
                <button
                  onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                  className="flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-purple-300 hover:text-white hover:bg-white/[0.07] rounded-lg transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                  Show More ({filteredPokemon.length - visibleCount} remaining)
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
