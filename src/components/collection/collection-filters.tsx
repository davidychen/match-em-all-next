"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const pokemonTypes = [
  "normal", "fire", "water", "electric", "grass", "ice",
  "fighting", "poison", "ground", "flying", "psychic",
  "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy",
];

const pokemonColors = [
  "black", "blue", "brown", "gray", "green",
  "pink", "purple", "red", "white", "yellow",
];

const sortOptions = [
  { value: "id", label: "ID" },
  { value: "name", label: "Name" },
  { value: "rarity", label: "Rarity" },
  { value: "first_caught", label: "First Caught" },
  { value: "last_caught", label: "Last Caught" },
  { value: "count", label: "Count" },
];

type FilterCategory = "all" | "type" | "color" | "can_evolve" | "legendary";

export function CollectionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeFilter = (searchParams.get("filter") ?? "all") as FilterCategory;
  const filterValue = searchParams.get("filterValue") ?? "";
  const sortBy = searchParams.get("sort") ?? "id";
  const sortDir = searchParams.get("dir") ?? "asc";

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      params.delete("cursor");
      router.push(`/collection?${params.toString()}`);
    },
    [router, searchParams]
  );

  const filterButtons: { key: FilterCategory; label: string }[] = [
    { key: "all", label: "All" },
    { key: "type", label: "Type" },
    { key: "color", label: "Color" },
    { key: "can_evolve", label: "Can Evolve" },
    { key: "legendary", label: "Legendary" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 flex-wrap">
        {filterButtons.map(({ key, label }) => (
          <Button
            key={key}
            variant={activeFilter === key ? "default" : "outline"}
            size="sm"
            className={cn(
              activeFilter === key &&
                "bg-purple-600 hover:bg-purple-700 text-white"
            )}
            onClick={() =>
              updateParams({
                filter: key === "all" ? null : key,
                filterValue: null,
              })
            }
          >
            {label}
          </Button>
        ))}
      </div>

      {activeFilter === "type" && (
        <Select
          value={filterValue}
          onValueChange={(val) => updateParams({ filterValue: val })}
        >
          <SelectTrigger className="w-32 h-8">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {pokemonTypes.map((type) => (
              <SelectItem key={type} value={type} className="capitalize">
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {activeFilter === "color" && (
        <Select
          value={filterValue}
          onValueChange={(val) => updateParams({ filterValue: val })}
        >
          <SelectTrigger className="w-32 h-8">
            <SelectValue placeholder="Select color" />
          </SelectTrigger>
          <SelectContent>
            {pokemonColors.map((color) => (
              <SelectItem key={color} value={color} className="capitalize">
                {color}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="ml-auto flex items-center gap-1.5">
        <Select
          value={sortBy}
          onValueChange={(val) => updateParams({ sort: val })}
        >
          <SelectTrigger className="w-32 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() =>
            updateParams({ dir: sortDir === "asc" ? "desc" : "asc" })
          }
        >
          <ArrowUpDown
            className={cn(
              "w-3.5 h-3.5 transition-transform",
              sortDir === "desc" && "rotate-180"
            )}
          />
        </Button>
      </div>
    </div>
  );
}
