"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { getSpriteUrl } from "@/lib/game/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CaughtPokemon {
  pokemon_id: number;
  name: string;
}

export default function ProfilePage() {
  const { user, profile, loading } = useAuth();
  const [caughtPokemon, setCaughtPokemon] = useState<CaughtPokemon[]>([]);
  const [updating, setUpdating] = useState(false);
  const supabase = useRef(createClient()).current;

  useEffect(() => {
    if (!user) return;

    async function fetchCaught() {
      const { data } = await supabase
        .from("collections")
        .select("pokemon_id, name")
        .eq("owner_id", user!.id);

      if (data) {
        const unique = Array.from(
          new Map(
            (data as CaughtPokemon[]).map((p) => [p.pokemon_id, p])
          ).values()
        );
        setCaughtPokemon(unique.sort((a, b) => a.pokemon_id - b.pokemon_id));
      }
    }

    fetchCaught();
  }, [user, supabase]);

  const handleAvatarChange = useCallback(async (pokemonId: string | null) => {
    if (!pokemonId) return;
    setUpdating(true);
    try {
      const res = await fetch("/api/avatar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar_id: parseInt(pokemonId, 10) }),
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
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  const avatarUrl = profile.avatar_id
    ? getSpriteUrl(profile.avatar_id)
    : null;

  return (
    <div className="max-w-md mx-auto flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-purple-700">Profile</h1>

      <Card>
        <CardHeader className="items-center">
          <Avatar className="w-24 h-24 border-4 border-purple-300">
            {avatarUrl && (
              <AvatarImage src={avatarUrl} alt={profile.username} />
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
              <Select
                value={profile.avatar_id?.toString() ?? ""}
                onValueChange={handleAvatarChange}
                disabled={updating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a Pokemon avatar" />
                </SelectTrigger>
                <SelectContent>
                  {caughtPokemon.map((p) => (
                    <SelectItem
                      key={p.pokemon_id}
                      value={p.pokemon_id.toString()}
                      className="capitalize"
                    >
                      #{p.pokemon_id} {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
