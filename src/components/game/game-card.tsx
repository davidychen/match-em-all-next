"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAnimatedSpriteUrl, getSpriteUrl } from "@/lib/game/constants";
import type { BoardCard } from "@/lib/game/types";

interface GameCardProps {
  index: number;
  card: BoardCard | null;
  onFlip: (index: number) => void;
  currentUserId: string | null;
  isPending?: boolean;
}

function PokeBall() {
  return (
    <div className="relative w-10 h-10 sm:w-12 sm:h-12">
      {/* Top half - red */}
      <div
        className="absolute inset-0 rounded-full bg-gradient-to-b from-red-500 to-red-600"
        style={{ clipPath: "inset(0 0 50% 0)" }}
      />
      {/* Bottom half - white */}
      <div
        className="absolute inset-0 rounded-full bg-white"
        style={{ clipPath: "inset(50% 0 0 0)" }}
      />
      {/* Center line */}
      <div className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2 bg-gray-800" />
      {/* Center button */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-gray-800 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-white border border-gray-300" />
      </div>
    </div>
  );
}

export function GameCard({ index, card, onFlip, currentUserId, isPending }: GameCardProps) {
  const isRevealed = card?.pokemon != null;
  const isMatched = card?.is_matched === true;
  const isOwnedByMe = card?.owner_id === currentUserId;
  const canClick = !isRevealed && !isMatched && !isPending;
  const [gifFailed, setGifFailed] = useState(false);

  // Flip the card if we have pokemon data OR if it's pending (waiting for server)
  const showFlipped = isRevealed || isPending;

  const handleClick = () => {
    if (!canClick) return;
    onFlip(index);
  };

  const pokemonId = card?.pokemon?.pokemonId;
  const spriteUrl = pokemonId
    ? gifFailed
      ? getSpriteUrl(pokemonId)
      : getAnimatedSpriteUrl(pokemonId)
    : "";

  return (
    <div
      className={cn(
        "relative aspect-square w-full min-w-[60px]",
        canClick && "cursor-pointer"
      )}
      style={{ perspective: "800px" }}
      onClick={handleClick}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        initial={false}
        animate={{ rotateY: showFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* ===== BACK FACE — Pokeball ===== */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-xl shadow-md border-2",
            "bg-gradient-to-br from-purple-700 via-purple-800 to-purple-900",
            "overflow-hidden flex items-center justify-center",
            "border-purple-400/50"
          )}
          style={{ backfaceVisibility: "hidden" }}
          whileHover={canClick ? {
            scale: 1.06,
            borderColor: "rgba(192, 132, 252, 0.8)",
            boxShadow: "0 0 16px 2px rgba(147, 51, 234, 0.35)",
          } : undefined}
          whileTap={canClick ? { scale: 0.95 } : undefined}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          {/* Subtle shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />

          {/* Pokeball with hover wiggle */}
          <motion.div
            whileHover={canClick ? {
              rotate: [0, -8, 8, -5, 5, 0],
              transition: { duration: 0.6, ease: "easeInOut" }
            } : undefined}
          >
            <PokeBall />
          </motion.div>
        </motion.div>

        {/* ===== FRONT FACE — Pokemon ===== */}
        <div
          className={cn(
            "absolute inset-0 rounded-xl shadow-md flex items-center justify-center p-1.5",
            "bg-[#1a0a2e] border-2",
            isPending && !isRevealed && "border-purple-400/50 shadow-purple-400/20 shadow-md",
            isMatched && isOwnedByMe && "border-green-400 shadow-green-400/50 shadow-lg",
            isMatched && !isOwnedByMe && "border-gray-500/50 shadow-gray-500/20 shadow-md",
            !isMatched && !isPending && isOwnedByMe && "border-purple-500 shadow-purple-400/30 shadow-md",
            !isMatched && !isPending && !isOwnedByMe && "border-amber-400 shadow-amber-300/30 shadow-md"
          )}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* Loading shimmer while waiting for server */}
          {isPending && !isRevealed && (
            <div className="absolute inset-0 rounded-lg overflow-hidden bg-purple-900/60">
              {/* Pulsing question mark */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl font-bold text-purple-300/80"
                animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.05, 0.9] }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              >
                ?
              </motion.div>
              {/* Sweeping shine */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(105deg, transparent 30%, rgba(168, 130, 255, 0.35) 45%, rgba(255, 255, 255, 0.18) 50%, rgba(168, 130, 255, 0.35) 55%, transparent 70%)",
                }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          )}

          {card?.pokemon && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={spriteUrl}
                alt={card.pokemon.nameEn || card.pokemon.name}
                className={cn(
                  "w-full h-full object-contain drop-shadow-sm",
                  isMatched && !isOwnedByMe && "opacity-60 grayscale-[30%]"
                )}
                style={gifFailed ? { imageRendering: "pixelated" } : undefined}
                onError={() => {
                  if (!gifFailed) setGifFailed(true);
                }}
                draggable={false}
              />
              {card.pokemon.isLegendary && (
                <motion.div
                  className="absolute top-0.5 right-0.5"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                >
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400 drop-shadow-sm" />
                </motion.div>
              )}
              {isMatched && isOwnedByMe && (
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-green-400"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: [0, 0.5, 0], scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.5, repeat: 1 }}
                />
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
