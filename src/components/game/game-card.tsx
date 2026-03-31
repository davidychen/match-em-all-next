"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSpriteUrl } from "@/lib/game/constants";
import type { BoardCard } from "@/lib/game/types";

interface GameCardProps {
  index: number;
  card: BoardCard | null;
  onFlip: (index: number) => void;
  currentUserId: string | null;
}

export function GameCard({ index, card, onFlip, currentUserId }: GameCardProps) {
  const hasData = card?.pokemon != null;
  const isMatched = card?.is_matched === true;
  const isOwnedByMe = card?.owner_id === currentUserId;

  const handleClick = () => {
    if (hasData || isMatched) return;
    onFlip(index);
  };

  const spriteUrl = card?.pokemon ? getSpriteUrl(card.pokemon.pokemonId) : "";

  // Simple show/hide approach - no 3D transforms
  return (
    <div
      className="relative aspect-square w-full min-w-[60px] cursor-pointer"
      onClick={handleClick}
    >
      {/* Back face - pokeball (shown when not flipped) */}
      {!hasData && (
        <div
          className={cn(
            "absolute inset-0 rounded-xl shadow-md border-2 border-purple-400/50",
            "bg-gradient-to-br from-purple-700 to-purple-900 overflow-hidden",
            "flex items-center justify-center",
            "hover:border-purple-300 hover:shadow-purple-400/20 hover:shadow-lg transition-all"
          )}
        >
          <div className="relative w-10 h-10 sm:w-12 sm:h-12">
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-red-500 to-red-600" style={{ clipPath: "inset(0 0 50% 0)" }} />
            <div className="absolute inset-0 rounded-full bg-white" style={{ clipPath: "inset(50% 0 0 0)" }} />
            <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-gray-800" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gray-800 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </div>
        </div>
      )}

      {/* Front face - pokemon (shown when flipped) */}
      {hasData && (
        <div
          className={cn(
            "absolute inset-0 rounded-xl shadow-md flex items-center justify-center p-1 animate-in fade-in zoom-in-95 duration-300",
            "bg-white border-2",
            isMatched && isOwnedByMe && "border-green-400 shadow-green-400/40 shadow-lg opacity-80",
            isMatched && !isOwnedByMe && "border-gray-400 opacity-50",
            !isMatched && isOwnedByMe && "border-purple-500 shadow-purple-300/30 shadow-md",
            !isMatched && !isOwnedByMe && "border-amber-500"
          )}
        >
          {card?.pokemon && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={spriteUrl}
                alt={card.pokemon.nameEn || card.pokemon.name}
                className="w-full h-full object-contain"
                style={{ imageRendering: "pixelated" }}
                draggable={false}
              />
              {card.pokemon.isLegendary && (
                <Star className="absolute top-0.5 right-0.5 w-3 h-3 text-yellow-500 fill-yellow-400" />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
