"use client";

import { useOnlinePlayers } from "@/hooks/use-online-players";
import { useAuth } from "@/hooks/use-auth";
import { getSpriteUrl } from "@/lib/game/constants";
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
      <span className="text-sm text-muted-foreground font-medium">
        Online ({count})
      </span>
      <div className="flex items-center -space-x-2">
        {players.map((player) => {
          const isCurrentUser = player.user_id === user?.id;
          const spriteUrl = player.avatar_id
            ? getSpriteUrl(player.avatar_id)
            : null;

          return (
            <div
              key={player.user_id}
              className="flex flex-col items-center gap-0.5"
            >
              <Avatar
                className={cn(
                  "w-8 h-8 border-2",
                  isCurrentUser
                    ? "border-purple-500 ring-2 ring-purple-300"
                    : "border-white"
                )}
              >
                {spriteUrl && (
                  <AvatarImage src={spriteUrl} alt={player.username} />
                )}
                <AvatarFallback className="bg-purple-200 text-purple-700 text-xs font-bold">
                  {player.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-[10px] text-muted-foreground truncate max-w-[4rem]">
                {isCurrentUser ? "You" : player.username}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
