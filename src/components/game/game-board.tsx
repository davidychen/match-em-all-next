"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { TOTAL_CARDS } from "@/lib/game/constants";
import { GameCard } from "./game-card";
import type { BoardCard, PokemonInfo } from "@/lib/game/types";

// Store flipped pokemon in a separate ref to avoid state conflicts
type FlippedCard = {
  pokemon: PokemonInfo;
  ownerId: string;
  ownerName: string;
  isMatched: boolean;
  flippedAt: number; // timestamp ms
};

export function GameBoard() {
  const [cards, setCards] = useState<BoardCard[]>([]);
  const [flipped, setFlipped] = useState<Record<number, FlippedCard>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetch("/api/game/state")
      .then((r) => r.json())
      .then(({ cards: data }) => {
        setCards(data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleFlip = useCallback(
    async (index: number) => {
      const res = await fetch("/api/game/flip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index }),
      });
      const data = await res.json();

      if (data.pokemon && user) {
        setFlipped((prev) => ({
          ...prev,
          [index]: {
            pokemon: data.pokemon,
            ownerId: user.id,
            ownerName: user.user_metadata?.username ?? "Player",
            isMatched: data.status === "matched",
            flippedAt: Date.now(),
          },
        }));
      }
    },
    [user]
  );

  // Auto-flip-back: remove entries older than 5 seconds (unless matched)
  useEffect(() => {
    const interval = setInterval(() => {
      setFlipped((prev) => {
        const now = Date.now();
        const next: Record<number, FlippedCard> = {};
        for (const [key, val] of Object.entries(prev)) {
          if (val.isMatched || now - val.flippedAt < 5000) {
            next[Number(key)] = val;
          }
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading || cards.length === 0) {
    return (
      <div className="grid grid-cols-6 gap-1.5 sm:gap-2 w-full max-w-[500px] mx-auto">
        {Array.from({ length: TOTAL_CARDS }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl min-w-[60px] bg-purple-200/50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  // Merge base cards with flipped overlay
  const mergedCards: BoardCard[] = cards.map((card) => {
    const f = flipped[card.index];
    if (f) {
      return {
        ...card,
        pokemon: f.pokemon,
        owner_id: f.ownerId,
        owner_name: f.ownerName,
        is_matched: f.isMatched,
        flipped_at: new Date(f.flippedAt).toISOString(),
      };
    }
    return card;
  });

  return (
    <div className="grid grid-cols-6 gap-1.5 sm:gap-2 w-full max-w-[500px] mx-auto">
      {mergedCards.map((card) => (
        <GameCard
          key={card.index}
          index={card.index}
          card={card}
          onFlip={handleFlip}
          currentUserId={user?.id ?? null}
        />
      ))}
    </div>
  );
}
