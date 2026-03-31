import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white">
      <header className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto w-full">
        <span className="text-lg font-bold tracking-tight">
          Gotta Match &apos;Em All
        </span>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button
              variant="ghost"
              className="text-purple-200 hover:text-white hover:bg-white/10"
            >
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-white text-purple-800 hover:bg-purple-100 font-semibold">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-red-600 relative flex items-center justify-center shadow-2xl shadow-purple-500/30">
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-red-500 to-red-600" />
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-white" />
              <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-gray-800" />
            </div>
            <div className="relative z-10 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-white" />
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Gotta Match
            <br />
            <span className="bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">
              &apos;Em All!
            </span>
          </h1>

          <p className="text-xl text-purple-200 max-w-lg leading-relaxed">
            A multiplayer Pokemon card matching game. Flip cards, find matching
            pairs, and build your collection of Pokemon.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left w-full max-w-lg">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-2xl mb-2">&#x1F3B4;</div>
              <h3 className="font-semibold text-sm">Flip Cards</h3>
              <p className="text-xs text-purple-300 mt-1">
                Flip two cards on the shared board to find matching Pokemon
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-2xl mb-2">&#x2728;</div>
              <h3 className="font-semibold text-sm">Match Pairs</h3>
              <p className="text-xs text-purple-300 mt-1">
                Match a pair and add that Pokemon to your personal collection
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-2xl mb-2">&#x1F4C8;</div>
              <h3 className="font-semibold text-sm">Evolve</h3>
              <p className="text-xs text-purple-300 mt-1">
                Collect 3 of the same Pokemon to unlock evolution
              </p>
            </div>
          </div>

          <Link href="/register">
            <Button
              size="lg"
              className="bg-gradient-to-r from-yellow-400 to-amber-500 text-purple-900 hover:from-yellow-300 hover:to-amber-400 font-bold text-lg px-8 h-12 shadow-lg shadow-yellow-500/25"
            >
              Start Playing
            </Button>
          </Link>
        </div>
      </main>

      <footer className="text-center py-6 text-purple-400 text-sm">
        <p>Catch, match, and collect them all.</p>
      </footer>
    </div>
  );
}
