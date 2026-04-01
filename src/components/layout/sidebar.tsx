"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, Archive, User, Share2, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
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
          <div className="w-8 h-8 rounded-lg bg-purple-600 shadow-lg shadow-purple-500/30 flex items-center justify-center">
            <span className="text-white text-sm font-bold">M</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">
              Match
            </h1>
            <p className="text-[10px] text-purple-400 leading-tight">
              &apos;Em All
            </p>
          </div>
        </Link>
      </div>

      <div className="mx-3 h-px bg-white/10" />

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
                  ? "bg-white/10 text-white shadow-sm shadow-purple-500/10"
                  : "text-purple-300 hover:bg-white/[0.07] hover:text-purple-100"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mx-3 h-px bg-white/10" />

      <div className="p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-purple-400 hover:text-red-400 hover:bg-white/[0.05]"
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
    <aside className="hidden lg:flex flex-col w-60 border-r border-white/10 bg-[#0d0120]/80 backdrop-blur-xl h-screen sticky top-0">
      <SidebarContent />
    </aside>
  );
}
