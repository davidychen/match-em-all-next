"use client";

import { useCallback, useEffect, useState } from "react";
import type { BoardCard } from "@/lib/game/types";
import { FLIP_TIMEOUT_MS } from "@/lib/game/constants";

export function useBoard() {
  const [cards, setCards] = useState<BoardCard[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCards = useCallback(async () => {
    const res = await fetch("/api/game/state");
    if (res.ok) {
      const { cards: data } = await res.json();
      setCards((data as BoardCard[]) ?? []);
    }
    setLoading(false);
  }, []);

  // Update a single card in state (optimistic)
  const updateCard = useCallback((index: number, patch: Partial<BoardCard>) => {
    setCards(prev => {
      const next = [...prev];
      const idx = next.findIndex(c => c.index === index);
      if (idx >= 0) {
        next[idx] = { ...next[idx], ...patch };
      }
      return next;
    });
  }, []);

  useEffect(() => {
    fetchCards();

    // Auto-flip-back: every second, clear cards that are flipped > 5s ago
    const interval = setInterval(() => {
      const now = Date.now();
      setCards(prev => prev.map(card => {
        if (
          card.flipped_at &&
          !card.is_matched &&
          now - new Date(card.flipped_at).getTime() > FLIP_TIMEOUT_MS
        ) {
          return { ...card, owner_id: null, owner_name: null, pokemon: null, flipped_at: null };
        }
        return card;
      }));
    }, 1000);

    // Sync with server every 10 seconds (gentle poll for other players' updates)
    const syncInterval = setInterval(fetchCards, 10000);

    return () => {
      clearInterval(interval);
      clearInterval(syncInterval);
    };
  }, [fetchCards]);

  return { cards, loading, refetch: fetchCards, updateCard };
}
