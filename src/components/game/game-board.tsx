"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { TOTAL_CARDS, FLIP_TIMEOUT_MS } from "@/lib/game/constants";
import { GameCard } from "./game-card";
import type { BoardCard, PokemonInfo } from "@/lib/game/types";

/** Clean a card array: hide stale flips (>5s old, not matched) */
function cleanStaleCards(cards: BoardCard[]): BoardCard[] {
  const now = Date.now();
  return cards.map((card) => {
    if (
      card.pokemon &&
      !card.is_matched &&
      card.flipped_at &&
      now - new Date(card.flipped_at).getTime() > FLIP_TIMEOUT_MS
    ) {
      return { ...card, pokemon: null, owner_id: null, owner_name: null, flipped_at: null };
    }
    return card;
  });
}

export function GameBoard() {
  const [cards, setCards] = useState<BoardCard[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const flippingRef = useRef(false);
  const flipQueueRef = useRef<number[]>([]);

  // Fetch board state from server
  const fetchBoard = useCallback(async () => {
    try {
      const res = await fetch("/api/game/state");
      const { cards: data } = await res.json();
      if (data) {
        setCards(cleanStaleCards(data));
      }
    } catch {
      // ignore fetch errors
    }
    setLoading(false);
  }, []);

  // Initial load + poll every 2s for multiplayer sync
  useEffect(() => {
    fetchBoard();
    const interval = setInterval(fetchBoard, 2000);
    return () => clearInterval(interval);
  }, [fetchBoard]);

  // Client-side stale cleanup every second (between polls)
  useEffect(() => {
    const interval = setInterval(() => {
      setCards((prev) => cleanStaleCards(prev));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Process a single flip request
  const processFlip = useCallback(
    async (index: number) => {
      if (!user) return;

      const res = await fetch("/api/game/flip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index }),
      });
      const data = await res.json();

      if (data.pokemon) {
        // Optimistically update this card in state
        setCards((prev) =>
          prev.map((c) =>
            c.index === index
              ? {
                  ...c,
                  pokemon: data.pokemon,
                  owner_id: user.id,
                  owner_name: user.user_metadata?.username ?? "Player",
                  is_matched: data.status === "matched",
                  flipped_at: new Date().toISOString(),
                  matched_at: data.status === "matched" ? new Date().toISOString() : null,
                }
              : c
          )
        );

        // If matched, also mark the other card as matched
        if (data.status === "matched") {
          // Refetch to get the full matched state from server
          setTimeout(fetchBoard, 500);
        }
      }
    },
    [user, fetchBoard]
  );

  // Process queued flips one at a time
  const processQueue = useCallback(async () => {
    if (flippingRef.current) return;
    flippingRef.current = true;
    while (flipQueueRef.current.length > 0) {
      const index = flipQueueRef.current.shift()!;
      await processFlip(index);
    }
    flippingRef.current = false;
  }, [processFlip]);

  const handleFlip = useCallback(
    (index: number) => {
      if (!user) return;

      // Count unmatched cards currently showing for this user
      const myUnmatched = cards.filter(
        (c) => c.owner_id === user.id && !c.is_matched && c.pokemon
      );

      // If 2+ showing, clear them optimistically before the new flip
      if (myUnmatched.length >= 2) {
        setCards((prev) =>
          prev.map((c) => {
            if (c.owner_id === user.id && !c.is_matched && c.pokemon) {
              return { ...c, pokemon: null, owner_id: null, owner_name: null, flipped_at: null };
            }
            return c;
          })
        );
      }

      flipQueueRef.current.push(index);
      processQueue();
    },
    [user, cards, processQueue]
  );

  if (loading) {
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

  if (cards.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No game board found.</p>
        <button
          className="mt-2 text-purple-600 underline"
          onClick={() => fetch("/api/game/init", { method: "POST" }).then(fetchBoard)}
        >
          Initialize a new game
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-6 gap-1.5 sm:gap-2 w-full max-w-[500px] mx-auto">
      {cards.map((card) => (
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
