"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Sparkles, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getAnimatedSpriteUrl, getBackSpriteUrl } from "@/lib/game/constants";
import type { CollectionItem } from "@/lib/game/types";

const typeColors: Record<string, string> = {
  normal: "bg-gray-400",
  fire: "bg-orange-500",
  water: "bg-blue-500",
  electric: "bg-yellow-400",
  grass: "bg-green-500",
  ice: "bg-cyan-300",
  fighting: "bg-red-700",
  poison: "bg-white/[0.07]0",
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

interface PokemonDetailDialogProps {
  pokemon: CollectionItem | null;
  open: boolean;
  onClose: () => void;
}

export function PokemonDetailDialog({
  pokemon,
  open,
  onClose,
}: PokemonDetailDialogProps) {
  const [evolving, setEvolving] = useState(false);
  const [evolvedPokemon, setEvolvedPokemon] =
    useState<CollectionItem | null>(null);
  const [showEvolution, setShowEvolution] = useState(false);
  const [showBack, setShowBack] = useState(false);

  if (!pokemon) return null;

  const canEvolve =
    pokemon.count >= 3 &&
    pokemon.evolves_to !== null &&
    pokemon.evolves_to.length > 0;

  async function handleEvolve() {
    if (!pokemon) return;
    setEvolving(true);

    try {
      const res = await fetch("/api/evolution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pokemon_id: pokemon.pokemon_id }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Evolution failed");
        return;
      }

      setEvolvedPokemon(data.evolved);
      setShowEvolution(true);
      toast.success(`${pokemon.name} evolved!`);
    } catch {
      toast.error("Evolution failed. Please try again.");
    } finally {
      setEvolving(false);
    }
  }

  function handleClose() {
    setShowEvolution(false);
    setEvolvedPokemon(null);
    setShowBack(false);
    onClose();
  }

  const displayPokemon =
    showEvolution && evolvedPokemon ? evolvedPokemon : pokemon;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-sm bg-[#110225]/95 backdrop-blur-xl border-white/10">
        <DialogHeader>
          <DialogTitle className="text-xl capitalize text-center">
            {displayPokemon.name}
            {displayPokemon.is_legendary && (
              <Sparkles className="inline w-4 h-4 ml-1.5 text-yellow-500" />
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <div
            className="relative w-32 h-32 cursor-pointer"
            style={{ perspective: "600px" }}
            onClick={() => setShowBack((b) => !b)}
            title="Click to flip"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={displayPokemon.pokemon_id}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: showBack ? 180 : 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Front — Official Artwork */}
                <div
                  className="absolute inset-0 bg-white/[0.07] rounded-2xl flex items-center justify-center"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getAnimatedSpriteUrl(displayPokemon.pokemon_id)}
                    alt={displayPokemon.name}
                    className="w-28 h-28 object-contain"
                  />
                </div>
                {/* Back — Back Sprite */}
                <div
                  className="absolute inset-0 bg-white/[0.07] rounded-2xl flex items-center justify-center"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getBackSpriteUrl(displayPokemon.pokemon_id)}
                    alt={`${displayPokemon.name} back`}
                    className="w-24 h-24 object-contain [image-rendering:pixelated]"
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <p className="text-[10px] text-muted-foreground -mt-2">Click sprite to flip</p>

          <div className="flex gap-1.5">
            {displayPokemon.type.map((t) => (
              <Badge
                key={t}
                className={`${typeColors[t] ?? "bg-gray-400"} text-white capitalize`}
              >
                {t}
              </Badge>
            ))}
          </div>

          <div className="w-full grid grid-cols-2 gap-3 text-sm">
            <div className="text-center">
              <p className="text-muted-foreground text-xs">Capture Rate</p>
              <p className="font-semibold">{displayPokemon.rate ?? "N/A"}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-xs">Owned</p>
              <p className="font-semibold">x{displayPokemon.count}</p>
            </div>
          </div>

          <Separator />

          <div className="w-full flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>First caught:</span>
              <span className="ml-auto font-medium text-foreground">
                {new Date(displayPokemon.first_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>Last caught:</span>
              <span className="ml-auto font-medium text-foreground">
                {new Date(displayPokemon.last_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {canEvolve && !showEvolution && (
            <>
              <Separator />
              <Button
                onClick={handleEvolve}
                disabled={evolving}
                className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-purple-950 font-bold shadow-lg shadow-yellow-500/25"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {evolving
                  ? "Evolving..."
                  : `Evolve (costs 3 ${pokemon.name})`}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
