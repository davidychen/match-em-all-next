"use client";

import { useMemo } from "react";
import { motion, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { getAnimatedSpriteUrl } from "@/lib/game/constants";

/* ─── Seed-based deterministic random (avoid hydration mismatch) ─── */
function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

/* ─── Pokemon that fly past in the background ─── */
const FLYING_POKEMON = [
  // Near layer (large, fast, blurry)
  { id: 6, name: "Charizard", layer: 0 },
  { id: 384, name: "Rayquaza", layer: 0 },
  { id: 149, name: "Dragonite", layer: 0 },
  // Mid layer
  { id: 25, name: "Pikachu", layer: 1 },
  { id: 448, name: "Lucario", layer: 1 },
  { id: 658, name: "Greninja", layer: 1 },
  { id: 130, name: "Gyarados", layer: 1 },
  { id: 150, name: "Mewtwo", layer: 1 },
  // Far layer (small, slow, crisp)
  { id: 249, name: "Lugia", layer: 2 },
  { id: 250, name: "Ho-Oh", layer: 2 },
  { id: 493, name: "Arceus", layer: 2 },
  { id: 643, name: "Reshiram", layer: 2 },
  { id: 644, name: "Zekrom", layer: 2 },
  { id: 718, name: "Zygarde", layer: 2 },
  { id: 792, name: "Lunala", layer: 2 },
  { id: 898, name: "Calyrex", layer: 2 },
];

const LAYER_CONFIG = [
  { speed: 2500, sizeMin: 70, sizeMax: 110, opacity: 0.25, blur: 4, glow: 8 },  // near — big, fast, diffuse glow
  { speed: 1500, sizeMin: 40, sizeMax: 70, opacity: 0.35, blur: 2, glow: 5 },   // mid
  { speed: 800, sizeMin: 22, sizeMax: 40, opacity: 0.50, blur: 0, glow: 3 },    // far — small, slow, crisp stars
];

/* ─── Single flying Pokemon sprite ─── */
function FlyingSprite({
  pokemon,
  index,
  scrollProgress,
}: {
  pokemon: (typeof FLYING_POKEMON)[number];
  index: number;
  scrollProgress: MotionValue<number>;
}) {
  const config = LAYER_CONFIG[pokemon.layer];

  /* Deterministic placement per sprite */
  const seed = pokemon.id * 100 + index;
  const xPos = seededRandom(seed) * 100;           // 0-100% horizontal
  const startOffset = seededRandom(seed + 1) * 100; // stagger vertical start
  const size = config.sizeMin + seededRandom(seed + 2) * (config.sizeMax - config.sizeMin);
  const flipX = seededRandom(seed + 3) > 0.5;

  /* Scroll → vertical movement: sprites fly upward as user scrolls down */
  const y = useTransform(
    scrollProgress,
    [0, 1],
    [startOffset + 50, startOffset + 50 - config.speed]
  );

  /* Slight horizontal drift */
  const x = useTransform(
    scrollProgress,
    [0, 1],
    [0, (seededRandom(seed + 4) - 0.5) * 200]
  );

  /* Gentle rotation as they fly */
  const rotate = useTransform(
    scrollProgress,
    [0, 1],
    [0, (seededRandom(seed + 5) - 0.5) * 40]
  );

  /* Star-like filter: desaturate → crank brightness → add glow halo */
  const starFilter = [
    "saturate(0)",
    "brightness(3)",
    config.blur > 0 ? `blur(${config.blur}px)` : "",
    `drop-shadow(0 0 ${config.glow}px rgba(200, 180, 255, 0.8))`,
    `drop-shadow(0 0 ${config.glow * 2}px rgba(140, 120, 255, 0.4))`,
  ].filter(Boolean).join(" ");

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${xPos}%`,
        top: "0%",
        y,
        x,
        rotate,
        width: size,
        height: size,
        opacity: config.opacity,
        filter: starFilter,
        transform: flipX ? "scaleX(-1)" : undefined,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={getAnimatedSpriteUrl(pokemon.id)}
        alt=""
        className="w-full h-full object-contain"
        loading="lazy"
        draggable={false}
      />
    </motion.div>
  );
}

/* ─── Cloud layers ─── */
function CloudLayer({
  scrollProgress,
  index,
}: {
  scrollProgress: MotionValue<number>;
  index: number;
}) {
  const speed = 300 + index * 200;
  const y = useTransform(scrollProgress, [0, 1], [0, -speed]);
  const opacity = 0.05 + index * 0.03;
  const top = `${20 + index * 30}%`;

  return (
    <motion.div
      className="absolute left-0 right-0 pointer-events-none"
      style={{ top, y }}
    >
      <div
        className="mx-auto rounded-full"
        style={{
          width: `${60 + index * 15}%`,
          height: `${80 + index * 40}px`,
          background: `radial-gradient(ellipse at center, rgba(255,255,255,${opacity}) 0%, transparent 70%)`,
          filter: `blur(${30 + index * 10}px)`,
        }}
      />
    </motion.div>
  );
}

/* ─── Speed lines (motion blur streaks) ─── */
function SpeedLines({
  scrollProgress,
}: {
  scrollProgress: MotionValue<number>;
}) {
  const lines = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      x: seededRandom(i * 7) * 100,
      startY: seededRandom(i * 7 + 1) * 100,
      length: 40 + seededRandom(i * 7 + 2) * 120,
      speed: 600 + seededRandom(i * 7 + 3) * 1800,
      width: 1 + seededRandom(i * 7 + 4) * 1.5,
      opacity: 0.05 + seededRandom(i * 7 + 5) * 0.1,
    }));
  }, []);

  return (
    <>
      {lines.map((line, i) => (
        <SpeedLine key={i} line={line} scrollProgress={scrollProgress} />
      ))}
    </>
  );
}

function SpeedLine({
  line,
  scrollProgress,
}: {
  line: { x: number; startY: number; length: number; speed: number; width: number; opacity: number };
  scrollProgress: MotionValue<number>;
}) {
  const y = useTransform(scrollProgress, [0, 1], [line.startY, line.startY - line.speed]);

  return (
    <motion.div
      className="absolute pointer-events-none rounded-full"
      style={{
        left: `${line.x}%`,
        top: "0%",
        y,
        width: `${line.width}px`,
        height: `${line.length}px`,
        background: `linear-gradient(to bottom, transparent, rgba(200, 180, 255, ${line.opacity}), transparent)`,
      }}
    />
  );
}

/* ─── Main background component ─── */
export function FlyingSkyBackground({
  scrollProgress,
}: {
  scrollProgress: MotionValue<number>;
}) {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Sky gradient that shifts as you scroll */}
      <SkyGradient scrollProgress={scrollProgress} />

      {/* Speed lines */}
      <SpeedLines scrollProgress={scrollProgress} />

      {/* Cloud layers */}
      {[0, 1, 2].map((i) => (
        <CloudLayer key={i} scrollProgress={scrollProgress} index={i} />
      ))}

      {/* Flying Pokemon — rendered back-to-front by layer */}
      {FLYING_POKEMON.map((p, i) => (
        <FlyingSprite key={p.id} pokemon={p} index={i} scrollProgress={scrollProgress} />
      ))}
    </div>
  );
}

/* ─── Sky gradient that deepens as you "ascend" ─── */
function SkyGradient({
  scrollProgress,
}: {
  scrollProgress: MotionValue<number>;
}) {
  /* Shift the background from deep purple to darker space-like as you scroll */
  const bgOpacity = useTransform(scrollProgress, [0, 0.5, 1], [0, 0.15, 0.3]);

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        background: "radial-gradient(ellipse at 50% 30%, rgba(88, 28, 135, 0.4) 0%, transparent 70%)",
        opacity: bgOpacity,
      }}
    />
  );
}
