"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { GameBoard } from "@/components/game/game-board";
import { OnlinePlayers } from "@/components/game/online-players";
import { GameInfoBar } from "@/components/game/game-info-bar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function GamePage() {
  const [rulesOpen, setRulesOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-purple-700">Game Board</h1>
        <Dialog open={rulesOpen} onOpenChange={setRulesOpen}>
          <DialogTrigger>
            <Button variant="outline" size="sm" className="gap-1.5">
              <HelpCircle className="w-4 h-4" />
              How to Play
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>How to Play</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">1. Flip cards:</strong> Click
                any face-down card to reveal the Pokemon hidden underneath.
              </p>
              <p>
                <strong className="text-foreground">2. Find matches:</strong>{" "}
                When two flipped cards show the same Pokemon, you&apos;ve made a
                match! The Pokemon is added to your collection.
              </p>
              <p>
                <strong className="text-foreground">3. Be quick:</strong> Flipped
                cards stay face-up for only 5 seconds before turning back over.
              </p>
              <p>
                <strong className="text-foreground">4. Multiplayer:</strong>{" "}
                Other players are flipping cards at the same time. You can see
                their flips in real-time.
              </p>
              <p>
                <strong className="text-foreground">5. Collect & evolve:</strong>{" "}
                Build your collection in the Collection page. Collect 3 of the
                same Pokemon to evolve it!
              </p>
              <p>
                <strong className="text-foreground">6. Legendary Pokemon:</strong>{" "}
                Cards with a star icon are rare legendary Pokemon. They&apos;re
                harder to find!
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <OnlinePlayers />
      <GameInfoBar />
      <GameBoard />
    </div>
  );
}
