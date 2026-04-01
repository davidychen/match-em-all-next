"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { getAnimatedSpriteUrl } from "@/lib/game/constants";

const previewCards = [
  { id: null, matched: false },
  { id: 25, matched: true, name: "Pikachu" },
  { id: null, matched: false },
  { id: 6, matched: false, name: "Charizard", flipped: true },
  { id: 25, matched: true, name: "Pikachu" },
  { id: null, matched: false },
  { id: null, matched: false },
  { id: 6, matched: false, name: "Charizard", flipped: true },
  { id: null, matched: false },
];

function MiniPokeball() {
  return (
    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
      <div className="relative w-6 h-6">
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-b from-red-500 to-red-600"
          style={{ clipPath: "inset(0 0 50% 0)" }}
        />
        <div
          className="absolute inset-0 rounded-full bg-white"
          style={{ clipPath: "inset(50% 0 0 0)" }}
        />
        <div className="absolute top-1/2 left-0 right-0 h-[1px] -translate-y-1/2 bg-gray-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-700 flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-white" />
        </div>
      </div>
    </div>
  );
}

function ScrollCard({
  card,
  index,
  sectionProgress,
}: {
  card: (typeof previewCards)[number];
  index: number;
  sectionProgress: ReturnType<typeof useSpring>;
}) {
  /* Stagger: each card flips at a different point in the scroll */
  const cardStart = 0.15 + (index / previewCards.length) * 0.4;
  const cardEnd = cardStart + 0.2;

  /* Cards with a pokemon get a flip; pokeball cards just fade in */
  const flipAngle = useTransform(
    sectionProgress,
    [cardStart, cardEnd],
    card.id ? [0, 180] : [0, 0]
  );
  const cardOpacity = useTransform(sectionProgress, [cardStart - 0.05, cardStart + 0.05], [0.4, 1]);
  const cardScale = useTransform(sectionProgress, [cardStart, cardEnd], [0.85, 1]);

  return (
    <motion.div
      className="relative aspect-square rounded-lg overflow-hidden shadow-lg"
      style={{
        perspective: "400px",
        opacity: cardOpacity,
        scale: cardScale,
      }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          rotateY: flipAngle,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Back face — Pokeball (visible at rotateY 0) */}
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: "hidden" }}
        >
          <MiniPokeball />
        </div>

        {/* Front face — Pokemon (visible at rotateY 180) */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {card.id ? (
            <div
              className={`absolute inset-0 rounded-lg flex items-center justify-center p-1 bg-white border-2 ${
                card.matched
                  ? "border-green-400 shadow-green-400/30 shadow-md"
                  : "border-purple-400"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getAnimatedSpriteUrl(card.id)}
                alt={card.name ?? ""}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <MiniPokeball />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function MiniBoardPreview() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const rm = prefersReducedMotion ?? false;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end 0.6"],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  /* Board container transforms */
  const boardScale = useTransform(smooth, [0, 0.3], [0.8, 1]);
  const boardRotateX = useTransform(smooth, [0, 0.35], [12, 0]);
  const boardOpacity = useTransform(smooth, [0, 0.15], [0, 1]);

  /* Title transforms */
  const titleY = useTransform(smooth, [0, 0.2], [30, 0]);
  const titleOpacity = useTransform(smooth, [0, 0.2], [0, 1]);

  if (rm) {
    /* Reduced motion: original simple animation */
    return (
      <div ref={sectionRef}>
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            See It In Action
          </h2>
          <p className="text-purple-200 mb-10 max-w-md mx-auto">
            Flip pokeball cards to reveal Pokemon. Match pairs to add them to
            your collection!
          </p>
          <motion.div
            className="grid grid-cols-3 gap-1.5 w-48 mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            {previewCards.map((card, i) => (
              <div
                key={i}
                className="relative aspect-square rounded-lg overflow-hidden shadow-lg"
              >
                {card.id ? (
                  <div
                    className={`absolute inset-0 rounded-lg flex items-center justify-center p-1 bg-white border-2 ${
                      card.matched
                        ? "border-green-400 shadow-green-400/30 shadow-md"
                        : "border-purple-400"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getAnimatedSpriteUrl(card.id)}
                      alt={card.name ?? ""}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <MiniPokeball />
                )}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={sectionRef}>
      <motion.div className="max-w-4xl mx-auto text-center">
        <motion.h2
          className="text-3xl sm:text-4xl font-bold mb-4"
          style={{ y: titleY, opacity: titleOpacity }}
        >
          See It In Action
        </motion.h2>
        <motion.p
          className="text-purple-200 mb-10 max-w-md mx-auto"
          style={{ y: titleY, opacity: titleOpacity }}
        >
          Flip pokeball cards to reveal Pokemon. Match pairs to add them to your
          collection!
        </motion.p>

        <motion.div
          className="grid grid-cols-3 gap-1.5 w-48 mx-auto"
          style={{
            scale: boardScale,
            rotateX: boardRotateX,
            opacity: boardOpacity,
            perspective: "800px",
          }}
        >
          {previewCards.map((card, i) => (
            <ScrollCard
              key={i}
              card={card}
              index={i}
              sectionProgress={smooth}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
