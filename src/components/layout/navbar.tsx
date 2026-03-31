"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${profile.avatar_id}.png`
    : null;

  return (
    <header className="flex items-center justify-between h-14 px-4 border-b bg-card lg:px-6">
      <div className="flex items-center gap-3">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 w-9 lg:hidden hover:bg-accent hover:text-accent-foreground">
            <Menu className="w-5 h-5" />
            <span className="sr-only">Toggle menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-60 p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SidebarContent onNavigate={() => setSheetOpen(false)} />
          </SheetContent>
        </Sheet>
        <span className="text-sm font-semibold text-purple-700 lg:hidden">
          Gotta Match &apos;Em All
        </span>
      </div>

      <div className="flex items-center gap-2">
        {profile && (
          <>
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {profile.username}
            </span>
            <Avatar className="w-8 h-8">
              {avatarUrl && (
                <AvatarImage src={avatarUrl} alt={profile.username} />
              )}
              <AvatarFallback className="bg-purple-200 text-purple-700 text-xs font-bold">
                {profile.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </>
        )}
      </div>
    </header>
  );
}
