"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { BoardCard } from "@/lib/game/types";
import { FLIP_TIMEOUT_MS } from "@/lib/game/constants";

export function useBoard() {
  const [cards, setCards] = useState<BoardCard[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());
  const channelStatusRef = useRef<string>("INITIAL");

  const fetchCards = useCallback(async () => {
    const res = await fetch("/api/game/state");
    if (res.ok) {
      const { cards: data } = await res.json();
      setCards((data as BoardCard[]) ?? []);
    }
    setLoading(false);
  }, []);

  // Update a single card in state (optimistic or realtime patch)
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
    const supabase = supabaseRef.current;

    // Initial fetch
    fetchCards();

    // ── Realtime subscription on board_cards ──
    const channel = supabase
      .channel("board-cards-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "board_cards" },
        (payload) => {
          const updated = payload.new as BoardCard;
          if (updated && typeof updated.index === "number") {
            setCards(prev =>
              prev.map(c => c.index === updated.index ? { ...c, ...updated } : c)
            );
          }
        }
      )
      .subscribe((status) => {
        channelStatusRef.current = status;
        // On reconnect, sync any missed changes
        if (status === "SUBSCRIBED") {
          fetchCards();
        }
      });

    // ── Client-side stale flip cleanup (every 1s) ──
    const cleanupInterval = setInterval(() => {
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

    // ── Fallback poll (12s) — only fires when realtime is disconnected ──
    const fallbackInterval = setInterval(() => {
      if (channelStatusRef.current !== "SUBSCRIBED") {
        fetchCards();
      }
    }, 12000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(cleanupInterval);
      clearInterval(fallbackInterval);
    };
  }, [fetchCards]);

  return { cards, loading, refetch: fetchCards, updateCard, setCards };
}
