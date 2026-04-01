"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RoundCompleteProps {
  matchCount: number;
  onNewRound: () => void;
}

const COUNTDOWN_SECONDS = 5;

const CONFETTI_COLORS = [
  "#a855f7", // purple-500
  "#fbbf24", // amber-400
  "#f472b6", // pink-400
  "#60a5fa", // blue-400
  "#34d399", // emerald-400
  "#fb923c", // orange-400
  "#c084fc", // purple-400
  "#facc15", // yellow-400
  "#f87171", // red-400
  "#38bdf8", // sky-400
];

function ConfettiDot({ index }: { index: number }) {
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const left = `${(index * 17 + 3) % 100}%`;
  const delay = `${(index * 0.15) % 2}s`;
  const duration = `${2.5 + (index % 3) * 0.5}s`;
  const size = 6 + (index % 4) * 2;
  const swayAmount = (index % 2 === 0 ? 1 : -1) * (20 + (index % 30));

  return (
    <div
      className="absolute rounded-full opacity-0"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        left,
        top: -10,
        animation: `confetti-fall ${duration} ${delay} linear infinite`,
        // @ts-expect-error CSS custom property for sway
        "--sway": `${swayAmount}px`,
      }}
    />
  );
}

export function RoundComplete({ matchCount, onNewRound }: RoundCompleteProps) {
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const triggeredRef = useRef(false);

  const handleNewRound = useCallback(() => {
    if (triggeredRef.current) return;
    triggeredRef.current = true;
    onNewRound();
  }, [onNewRound]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      handleNewRound();
    }
  }, [countdown, handleNewRound]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        {/* Confetti keyframes injected via style tag */}
        <style>{`
          @keyframes confetti-fall {
            0% {
              opacity: 1;
              transform: translateY(0) translateX(0) rotate(0deg);
            }
            25% {
              transform: translateY(25vh) translateX(var(--sway)) rotate(90deg);
            }
            50% {
              transform: translateY(50vh) translateX(calc(var(--sway) * -0.5)) rotate(180deg);
            }
            75% {
              transform: translateY(75vh) translateX(var(--sway)) rotate(270deg);
            }
            100% {
              opacity: 0;
              transform: translateY(100vh) translateX(0) rotate(360deg);
            }
          }
        `}</style>

        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Confetti layer */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <ConfettiDot key={i} index={i} />
          ))}
        </div>

        {/* Content card */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300, delay: 0.15 }}
          className="relative z-10 flex flex-col items-center gap-6 bg-gradient-to-b from-purple-900/95 to-purple-950/95 border border-purple-400/30 rounded-3xl px-10 py-10 shadow-2xl shadow-purple-500/20 max-w-sm mx-4 text-center"
        >
          {/* Heading */}
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 bg-clip-text text-transparent drop-shadow-lg"
          >
            Round Complete!
          </motion.h1>

          {/* Match count */}
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-purple-100"
          >
            You matched{" "}
            <span className="font-bold text-amber-400">{matchCount}</span>{" "}
            Pokemon this round!
          </motion.p>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col items-center gap-3"
          >
            <p className="text-sm text-purple-300">New Round Starting...</p>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-700/60 border border-purple-400/40">
              <motion.span
                key={countdown}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="text-xl font-bold text-amber-400"
              >
                {countdown}
              </motion.span>
            </div>
          </motion.div>

          {/* Start button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNewRound}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-purple-950 font-bold text-lg shadow-lg shadow-amber-500/25 hover:from-amber-300 hover:to-yellow-400 transition-colors cursor-pointer"
          >
            Start New Round
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
