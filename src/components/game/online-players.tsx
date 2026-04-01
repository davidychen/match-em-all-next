"use client";

import { useOnlinePlayers } from "@/hooks/use-online-players";
import { useAuth } from "@/hooks/use-auth";
import { getAnimatedSpriteUrl } from "@/lib/game/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function OnlinePlayers() {
  const { user, profile } = useAuth();
  const { players, count } = useOnlinePlayers(
    user?.id,
    profile?.username,
    profile?.avatar_id
  );

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-purple-300 font-medium">
        Online ({count})
      </span>
      <div className="flex items-center -space-x-2">
        {players.map((player) => {
          const isCurrentUser = player.user_id === user?.id;
          const spriteUrl = player.avatar_id
            ? getAnimatedSpriteUrl(player.avatar_id)
            : null;

          return (
            <div
              key={player.user_id}
              className="flex flex-col items-center gap-0.5"
            >
              <Avatar
                className={cn(
                  "w-8 h-8 border-2 bg-purple-900/50 overflow-hidden",
                  isCurrentUser
                    ? "border-purple-400 ring-2 ring-purple-400/30"
                    : "border-white/20"
                )}
              >
                {spriteUrl && (
                  <AvatarImage
                    src={spriteUrl}
                    alt={player.username}
                    className="scale-[1.3] object-contain"
                  />
                )}
                <AvatarFallback className="bg-purple-900/50 text-purple-300 text-xs font-bold">
                  {player.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-[10px] text-purple-300 truncate max-w-[4rem]">
                {isCurrentUser ? "You" : player.username}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
