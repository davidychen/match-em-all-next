"use client";

import { motion, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { getAnimatedSpriteUrl } from "@/lib/game/constants";

/* Pokemon that orbit the Pokeball */
const ORBIT_POKEMON = [
  { id: 25, name: "Pikachu", orbitRadius: 140, startAngle: 0, speed: 1 },
  { id: 6, name: "Charizard", orbitRadius: 160, startAngle: 120, speed: 0.8 },
  { id: 150, name: "Mewtwo", orbitRadius: 150, startAngle: 240, speed: 1.2 },
];

/**
 * Orbiting Pokemon sprite — traces a 3D-looking elliptical path around the Pokeball.
 * The orbit angle is linked to scroll progress so sprites circle as you scroll.
 */
function OrbitingPokemon({
  pokemon,
  scrollProgress,
}: {
  pokemon: (typeof ORBIT_POKEMON)[number];
  scrollProgress: MotionValue<number>;
}) {
  /* Map scroll 0→1 to full rotation (startAngle → startAngle + 360°) */
  const angle = useTransform(
    scrollProgress,
    [0, 1],
    [pokemon.startAngle, pokemon.startAngle + 360 * pokemon.speed]
  );

  /* Convert polar to cartesian — elliptical orbit for 3D feel */
  const x = useTransform(angle, (a) => {
    const rad = (a * Math.PI) / 180;
    return Math.cos(rad) * pokemon.orbitRadius;
  });
  const y = useTransform(angle, (a) => {
    const rad = (a * Math.PI) / 180;
    return Math.sin(rad) * pokemon.orbitRadius * 0.35; /* squash Y for ellipse */
  });

  /* Scale based on position in orbit — behind = smaller, front = larger */
  const scale = useTransform(angle, (a) => {
    const rad = (a * Math.PI) / 180;
    return 0.5 + Math.sin(rad) * 0.25; /* 0.25 → 0.75 */
  });

  /* Opacity: dimmer when "behind" the ball */
  const opacity = useTransform(angle, (a) => {
    const rad = (a * Math.PI) / 180;
    return 0.4 + Math.sin(rad) * 0.4; /* 0.0 → 0.8 */
  });

  /* z-index via a separate layer: items with positive sin are in front */
  const zIndex = useTransform(angle, (a) => {
    const rad = (a * Math.PI) / 180;
    return Math.sin(rad) > 0 ? 20 : 5;
  });

  return (
    <motion.div
      className="absolute w-12 h-12 sm:w-14 sm:h-14"
      style={{
        x,
        y,
        scale,
        opacity,
        zIndex,
        /* Center on the pokeball */
        left: "50%",
        top: "50%",
        marginLeft: "-24px",
        marginTop: "-24px",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={getAnimatedSpriteUrl(pokemon.id)}
        alt={pokemon.name}
        className="w-full h-full object-contain drop-shadow-lg"
        draggable={false}
      />
    </motion.div>
  );
}

/**
 * A CSS 3D Pokeball with:
 * - Full X/Y/Z rotation linked to scroll
 * - Moving specular highlight
 * - Dynamic shadow
 * - Orbiting Pokemon sprites
 */
export function Pokeball3D({
  scrollProgress,
}: {
  scrollProgress: MotionValue<number>;
}) {
  /* Rotation on all three axes, different speeds for natural tumble */
  const rotateX = useTransform(scrollProgress, [0, 1], [0, 180]);
  const rotateY = useTransform(scrollProgress, [0, 1], [0, 540]);
  const rotateZ = useTransform(scrollProgress, [0, 1], [0, 90]);

  /* Specular highlight shifts as ball rotates */
  const highlightX = useTransform(scrollProgress, [0, 1], ["30%", "70%"]);
  const highlightY = useTransform(scrollProgress, [0, 1], ["20%", "60%"]);

  /* Shadow shifts opposite to rotation */
  const shadowX = useTransform(scrollProgress, [0, 0.5, 1], [0, 15, -10]);
  const shadowY = useTransform(scrollProgress, [0, 0.5, 1], [20, 30, 15]);
  const shadowBlur = useTransform(scrollProgress, [0, 0.5, 1], [30, 50, 35]);

  /* Ball scale — subtle breathing */
  const scale = useTransform(scrollProgress, [0, 0.25, 0.5, 0.75, 1], [1, 1.03, 0.98, 1.02, 1]);

  /* Fade out as hero scrolls away */
  const opacity = useTransform(scrollProgress, [0.6, 0.9], [1, 0]);

  return (
    <motion.div
      className="relative"
      style={{ opacity }}
    >
      {/* Orbiting Pokemon */}
      {ORBIT_POKEMON.map((p) => (
        <OrbitingPokemon key={p.id} pokemon={p} scrollProgress={scrollProgress} />
      ))}

      {/* 3D Pokeball */}
      <motion.div
        className="relative w-40 h-40 sm:w-52 sm:h-52"
        style={{
          perspective: "800px",
          scale,
        }}
      >
        {/* Dynamic drop shadow */}
        <motion.div
          className="absolute -bottom-6 left-1/2 w-32 h-6 sm:w-40 sm:h-8 rounded-full bg-black/30 blur-xl"
          style={{
            x: shadowX,
            y: shadowY,
            marginLeft: "-64px",
            filter: useTransform(shadowBlur, (b) => `blur(${b}px)`),
          }}
        />

        {/* Rotating ball container */}
        <motion.div
          className="relative w-full h-full"
          style={{
            transformStyle: "preserve-3d",
            rotateX,
            rotateY,
            rotateZ,
          }}
        >
          {/* ── Front face ── */}
          <div
            className="absolute inset-0 rounded-full overflow-hidden border-[5px] border-gray-800"
            style={{
              backfaceVisibility: "hidden",
              background: "linear-gradient(to bottom, #ef4444 0%, #dc2626 48%, #1f2937 48%, #1f2937 52%, #ffffff 52%, #f9fafb 100%)",
            }}
          >
            {/* Center button */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-800 border-4 border-gray-600 flex items-center justify-center z-10">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border-2 border-gray-300 shadow-inner" />
            </div>
          </div>

          {/* ── Back face ── */}
          <div
            className="absolute inset-0 rounded-full overflow-hidden border-[5px] border-gray-800"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: "linear-gradient(to bottom, #ef4444 0%, #dc2626 48%, #1f2937 48%, #1f2937 52%, #ffffff 52%, #f9fafb 100%)",
            }}
          >
            {/* Back has no center button — just the seam */}
            <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-gray-700" />
          </div>
        </motion.div>

        {/* Specular highlight (floats above the ball, not affected by rotation) */}
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none overflow-hidden"
          style={{ zIndex: 15 }}
        >
          <motion.div
            className="absolute w-[60%] h-[40%] rounded-full"
            style={{
              left: highlightX,
              top: highlightY,
              background: "radial-gradient(ellipse at center, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 70%)",
              filter: "blur(8px)",
              transform: "translate(-50%, -50%)",
            }}
          />
        </motion.div>

        {/* Rim light */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)",
            zIndex: 14,
          }}
        />
      </motion.div>
    </motion.div>
  );
}

/**
 * Reduced-motion fallback — simple bouncing Pokeball without scroll linking.
 */
export function Pokeball3DFallback() {
  return (
    <motion.div
      className="w-28 h-28 sm:w-36 sm:h-36 rounded-full relative flex items-center justify-center shadow-2xl shadow-purple-500/40"
      animate={{ y: [0, -10, 0], rotate: [0, 5, 0, -5, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="absolute inset-0 rounded-full overflow-hidden border-4 border-gray-800">
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-red-500 to-red-600" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-white" />
        <div className="absolute top-1/2 left-0 right-0 h-1.5 -translate-y-1/2 bg-gray-800" />
      </div>
      <div className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-800 flex items-center justify-center border-4 border-gray-700">
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white" />
      </div>
    </motion.div>
  );
}
