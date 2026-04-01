"use client";

import { motion, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { getAnimatedSpriteUrl } from "@/lib/game/constants";

const FEATURED_POKEMON = [
  { id: 25, name: "Pikachu", x: 8, y: 15, depth: 0.8 },
  { id: 6, name: "Charizard", x: 78, y: 8, depth: 0.5 },
  { id: 150, name: "Mewtwo", x: 88, y: 55, depth: 0.3 },
  { id: 384, name: "Rayquaza", x: 5, y: 60, depth: 0.6 },
  { id: 658, name: "Greninja", x: 70, y: 75, depth: 0.2 },
  { id: 448, name: "Lucario", x: 15, y: 80, depth: 0.7 },
];

function ParallaxPokemon({
  p,
  index,
  scrollYProgress,
}: {
  p: (typeof FEATURED_POKEMON)[number];
  index: number;
  scrollYProgress: MotionValue<number>;
}) {
  const y = useTransform(scrollYProgress, [0, 1], [0, -p.depth * 250]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9 + p.depth * 0.15]);

  return (
    <motion.div
      className="absolute w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 opacity-20 sm:opacity-25"
      style={{
        left: `${p.x}%`,
        top: `${p.y}%`,
        y,
        scale,
      }}
      animate={{
        rotate: [0, 3, 0, -3, 0],
      }}
      transition={{
        duration: 5 + index * 0.7,
        repeat: Infinity,
        ease: "easeInOut",
        delay: index * 0.4,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={getAnimatedSpriteUrl(p.id)}
        alt={p.name}
        className="w-full h-full object-contain drop-shadow-lg"
      />
    </motion.div>
  );
}

function StaticPokemon({
  p,
  index,
}: {
  p: (typeof FEATURED_POKEMON)[number];
  index: number;
}) {
  return (
    <motion.div
      className="absolute w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 opacity-20 sm:opacity-25"
      style={{ left: `${p.x}%`, top: `${p.y}%` }}
      animate={{
        y: [0, -15, 0, 10, 0],
        rotate: [0, 3, 0, -3, 0],
      }}
      transition={{
        duration: 5 + index * 0.7,
        repeat: Infinity,
        ease: "easeInOut",
        delay: index * 0.4,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={getAnimatedSpriteUrl(p.id)}
        alt={p.name}
        className="w-full h-full object-contain drop-shadow-lg"
      />
    </motion.div>
  );
}

export function FloatingPokemon({
  scrollYProgress,
}: {
  scrollYProgress?: MotionValue<number>;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {FEATURED_POKEMON.map((p, i) =>
        scrollYProgress ? (
          <ParallaxPokemon
            key={p.id}
            p={p}
            index={i}
            scrollYProgress={scrollYProgress}
          />
        ) : (
          <StaticPokemon key={p.id} p={p} index={i} />
        )
      )}
    </div>
  );
}
