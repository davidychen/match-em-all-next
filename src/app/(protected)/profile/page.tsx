"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { getSpriteUrl } from "@/lib/game/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface CaughtPokemon {
  pokemon_id: number;
  name: string;
  name_en: string;
}

export default function ProfilePage() {
  const { user, profile, loading } = useAuth();
  const [caughtPokemon, setCaughtPokemon] = useState<CaughtPokemon[]>([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!user) return;

    fetch("/api/collection?limit=200")
      .then((r) => r.json())
      .then((data) => {
        if (data.items) {
          setCaughtPokemon(
            data.items
              .map((p: CaughtPokemon) => ({
                pokemon_id: p.pokemon_id,
                name: p.name,
                name_en: p.name_en,
              }))
              .sort((a: CaughtPokemon, b: CaughtPokemon) => a.pokemon_id - b.pokemon_id)
          );
        }
      });
  }, [user]);

  const handleAvatarChange = useCallback(
    async (pokemonId: number) => {
      setUpdating(true);
      try {
        const res = await fetch("/api/avatar", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pokemonId }),
        });

        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error ?? "Failed to update avatar");
          return;
        }

        toast.success("Avatar updated!");
        window.location.reload();
      } catch {
        toast.error("Failed to update avatar");
      } finally {
        setUpdating(false);
      }
    },
    []
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  const avatarUrl = profile.avatar_id ? getSpriteUrl(profile.avatar_id) : null;

  return (
    <div className="max-w-md mx-auto flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-purple-700">Profile</h1>

      <Card>
        <CardHeader className="items-center">
          <Avatar className="w-24 h-24 border-4 border-purple-300">
            {avatarUrl && (
              <AvatarImage
                src={avatarUrl}
                alt={profile.username}
                style={{ imageRendering: "pixelated" }}
              />
            )}
            <AvatarFallback className="bg-purple-200 text-purple-700 text-2xl font-bold">
              {profile.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-xl mt-2">{profile.username}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Change Avatar</Label>
            {caughtPokemon.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Catch some Pokemon to use them as your avatar!
              </p>
            ) : (
              <div className="grid grid-cols-6 gap-2">
                {caughtPokemon.map((p) => (
                  <button
                    key={p.pokemon_id}
                    disabled={updating}
                    onClick={() => handleAvatarChange(p.pokemon_id)}
                    className={`
                      relative aspect-square rounded-lg border-2 p-1
                      transition-all hover:scale-110 hover:shadow-md
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${
                        profile.avatar_id === p.pokemon_id
                          ? "border-purple-500 bg-purple-50 shadow-purple-200 shadow-md"
                          : "border-gray-200 hover:border-purple-300 bg-white"
                      }
                    `}
                    title={p.name_en || p.name}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getSpriteUrl(p.pokemon_id)}
                      alt={p.name_en || p.name}
                      className="w-full h-full object-contain"
                      style={{ imageRendering: "pixelated" }}
                    />
                    {profile.avatar_id === p.pokemon_id && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-[10px]">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
