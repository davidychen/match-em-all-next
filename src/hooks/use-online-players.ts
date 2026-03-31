"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { OnlinePlayer } from "@/lib/game/types";

export function useOnlinePlayers(userId?: string, username?: string, avatarId?: number | null) {
  const [players, setPlayers] = useState<OnlinePlayer[]>([]);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    if (!userId || !username) return;

    const supabase = supabaseRef.current;
    const channel = supabase.channel("online-users", {
      config: { presence: { key: userId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<OnlinePlayer>();
        const allPlayers = Object.values(state).flat();
        setPlayers(allPlayers);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: userId,
            username,
            avatar_id: avatarId ?? null,
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, username, avatarId]);

  return { players, count: players.length };
}
