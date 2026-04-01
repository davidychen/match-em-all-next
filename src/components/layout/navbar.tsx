"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getAnimatedSpriteUrl } from "@/lib/game/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarContent } from "./sidebar";

export function Navbar() {
  const { profile } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);

  const avatarUrl = profile?.avatar_id
    ? getAnimatedSpriteUrl(profile.avatar_id)
    : null;

  return (
    <header className="flex items-center justify-between h-14 px-4 border-b border-white/10 bg-[#0d0120]/60 backdrop-blur-xl lg:px-6">
      <div className="flex items-center gap-3">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 w-9 lg:hidden text-purple-300 hover:bg-white/10 hover:text-white transition-colors">
            <Menu className="w-5 h-5" />
            <span className="sr-only">Toggle menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-60 p-0 bg-[#0d0120]/95 backdrop-blur-xl border-r border-white/10">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SidebarContent onNavigate={() => setSheetOpen(false)} />
          </SheetContent>
        </Sheet>
        <span className="text-sm font-semibold text-purple-300 lg:hidden">
          Match &apos;Em All
        </span>
      </div>

      <div className="flex items-center gap-2">
        {profile && (
          <>
            <span className="text-sm text-purple-300 hidden sm:inline">
              {profile.username}
            </span>
            <Avatar className="w-8 h-8 bg-purple-900/50 border border-purple-500/30 overflow-hidden">
              {avatarUrl && (
                <AvatarImage
                  src={avatarUrl}
                  alt={profile.username}
                  className="scale-[1.3] object-contain"
                />
              )}
              <AvatarFallback className="bg-purple-900/50 text-purple-300 text-xs font-bold">
                {profile.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </>
        )}
      </div>
    </header>
  );
}
