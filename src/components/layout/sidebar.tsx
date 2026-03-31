"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, Archive, User, Share2, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/game", label: "Game", icon: Gamepad2 },
  { href: "/collection", label: "Collection", icon: Archive },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/share", label: "Share", icon: Share2 },
] as const;

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-5">
        <Link
          href="/game"
          className="flex items-center gap-2"
          onClick={onNavigate}
        >
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">M</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-purple-700 leading-tight">
              Gotta Match
            </h1>
            <p className="text-[10px] text-purple-500 leading-tight">
              &apos;Em All
            </p>
          </div>
        </Link>
      </div>

      <Separator />

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-purple-100 text-purple-700"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <Separator />

      <div className="p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-red-600"
          onClick={() => {
            onNavigate?.();
            signOut();
          }}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-60 border-r bg-card h-screen sticky top-0">
      <SidebarContent />
    </aside>
  );
}
