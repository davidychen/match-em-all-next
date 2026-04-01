"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { MatchPlayer } from "@/lib/game/types";

export function GameInfoBar() {
  const { user } = useAuth();
  const [matchData, setMatchData] = useState<MatchPlayer | null>(null);
  const supabase = useRef(createClient()).current;

  useEffect(() => {
    if (!user) return;

    async function fetchMatchData() {
      const { data } = await supabase
        .from("match_players")
        .select("*")
        .eq("owner_id", user!.id)
        .single();

      if (data) setMatchData(data as MatchPlayer);
    }

    fetchMatchData();

    const channel = supabase
      .channel("match-players-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_players",
          filter: `owner_id=eq.${user.id}`,
        },
        (payload) => {
          setMatchData(payload.new as MatchPlayer);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  return (
    <div className="flex items-center gap-6 rounded-xl bg-white/[0.07] backdrop-blur-md border border-white/10 px-4 py-2.5">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-purple-200">
          Your matches:
        </span>
        <span className="inline-flex items-center justify-center min-w-[1.75rem] h-7 rounded-full bg-purple-600 shadow-lg shadow-purple-500/30 text-white text-sm font-bold px-2">
          {matchData?.count ?? 0}
        </span>
      </div>
      {matchData?.last_pokemon_name && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-purple-400">Last matched:</span>
          <span className="text-sm font-medium text-white capitalize">
            {matchData.last_pokemon_name}
          </span>
        </div>
      )}
    </div>
  );
}
