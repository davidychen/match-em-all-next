"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useBoard } from "@/hooks/use-board";
import { TOTAL_CARDS } from "@/lib/game/constants";
import { GameCard } from "./game-card";
import { RoundComplete } from "./round-complete";

export function GameBoard() {
  const { cards, loading, refetch, setCards } = useBoard();
  const [showRoundComplete, setShowRoundComplete] = useState(false);
  const [pendingFlips, setPendingFlips] = useState<Set<number>>(new Set());
  const { user } = useAuth();
  const flippingRef = useRef(false);
  const flipQueueRef = useRef<number[]>([]);

  // Detect when all cards are matched
  const allMatched = useMemo(() => {
    return cards.length === TOTAL_CARDS && cards.every((c) => c.is_matched);
  }, [cards]);

  // Show overlay when all matched
  useEffect(() => {
    if (allMatched) {
      setShowRoundComplete(true);
    }
  }, [allMatched]);

  // Count how many unique pokemon the current user matched
  const myMatchCount = useMemo(() => {
    if (!user) return 0;
    const matched = cards.filter((c) => c.is_matched && c.owner_id === user.id && c.pokemon);
    const uniquePokemon = new Set(matched.map((c) => c.pokemon!.pokemonId));
    return uniquePokemon.size;
  }, [cards, user]);

  // Handle new round: init new game, refetch board, hide overlay
  const handleNewRound = useCallback(async () => {
    try {
      await fetch("/api/game/init", { method: "POST" });
      await refetch();
    } catch {
      // ignore errors, realtime will sync
    }
    setShowRoundComplete(false);
  }, [refetch]);

  // Process a single flip request
  const processFlip = useCallback(
    async (index: number) => {
      if (!user) return;

      try {
        const res = await fetch("/api/game/flip", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ index }),
        });
        const data = await res.json();

        if (data.pokemon) {
          // Fill in the pokemon data — card is already visually flipped from pending state
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
        }
      } finally {
        // Clear pending state whether success or error
        setPendingFlips((prev) => {
          const next = new Set(prev);
          next.delete(index);
          return next;
        });
      }
    },
    [user, setCards]
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

      // Immediately mark card as pending — starts flip animation before server responds
      setPendingFlips((prev) => new Set(prev).add(index));

      flipQueueRef.current.push(index);
      processQueue();
    },
    [user, cards, processQueue, setCards]
  );

  if (loading) {
    return (
      <div className="grid grid-cols-6 gap-1.5 sm:gap-2 w-full max-w-[500px] mx-auto">
        {Array.from({ length: TOTAL_CARDS }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl min-w-[60px] bg-white/[0.05] animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-12 text-purple-300">
        <p>No game board found.</p>
        <button
          className="mt-2 text-purple-400 hover:text-purple-200 underline transition-colors"
          onClick={() => fetch("/api/game/init", { method: "POST" }).then(refetch)}
        >
          Initialize a new game
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-6 gap-1.5 sm:gap-2 w-full max-w-[500px] mx-auto">
        {cards.map((card) => (
          <GameCard
            key={card.index}
            index={card.index}
            card={card}
            onFlip={handleFlip}
            currentUserId={user?.id ?? null}
            isPending={pendingFlips.has(card.index)}
          />
        ))}
      </div>

      {showRoundComplete && (
        <RoundComplete matchCount={myMatchCount} onNewRound={handleNewRound} />
      )}
    </>
  );
}
