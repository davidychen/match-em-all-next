"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import type { MotionValue } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FloatingPokemon } from "@/components/landing/floating-pokemon";
import { FlyingSkyBackground } from "@/components/landing/flying-sky-bg";
import { HowItWorks } from "@/components/landing/how-it-works";
import { MiniBoardPreview } from "@/components/landing/mini-board-preview";
import { Badge } from "@/components/ui/badge";

const generations = [
  { gen: "I", region: "Kanto", color: "bg-red-500" },
  { gen: "II", region: "Johto", color: "bg-yellow-500" },
  { gen: "III", region: "Hoenn", color: "bg-green-500" },
  { gen: "IV", region: "Sinnoh", color: "bg-blue-500" },
  { gen: "V", region: "Unova", color: "bg-gray-500" },
  { gen: "VI", region: "Kalos", color: "bg-pink-500" },
  { gen: "VII", region: "Alola", color: "bg-orange-500" },
  { gen: "VIII", region: "Galar", color: "bg-purple-500" },
  { gen: "IX", region: "Paldea", color: "bg-cyan-500" },
];

/* ─── Scroll Progress Bar ─── */
function ScrollProgressBar({ scaleX }: { scaleX: MotionValue<number> }) {
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 z-50 origin-left bg-gradient-to-r from-yellow-400 to-amber-500"
      style={{ scaleX }}
    />
  );
}

/* ─── Sparkles ─── */
function Sparkles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white/30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Scroll-linked Generation Badge ─── */
function ScrollBadge({
  g,
  index,
  total,
  sectionProgress,
}: {
  g: { gen: string; region: string; color: string };
  index: number;
  total: number;
  sectionProgress: MotionValue<number>;
}) {
  const entryStart = (index / total) * 0.4;
  const entryEnd = entryStart + 0.35;

  const badgeScale = useTransform(sectionProgress, [entryStart, entryEnd], [0, 1]);
  const badgeOpacity = useTransform(sectionProgress, [entryStart, entryEnd], [0, 1]);
  const badgeRotate = useTransform(sectionProgress, [entryStart, entryEnd], [-15, 0]);
  const badgeY = useTransform(sectionProgress, [entryStart, entryEnd], [30, 0]);

  return (
    <motion.div style={{ scale: badgeScale, opacity: badgeOpacity, rotate: badgeRotate, y: badgeY }}>
      <Badge
        className={`${g.color} text-white px-3 py-1.5 text-sm font-semibold`}
      >
        Gen {g.gen} · {g.region}
      </Badge>
    </motion.div>
  );
}

/* ─── Main Landing Page ─── */
export default function LandingPage() {
  const prefersReducedMotion = useReducedMotion();

  /* Page-level scroll (for progress bar + flying sky) */
  const { scrollYProgress: pageProgress } = useScroll();
  const pageSmooth = useSpring(pageProgress, { stiffness: 80, damping: 25, restDelta: 0.001 });
  const progressBarScale = useSpring(pageProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  /* Section refs */
  const heroRef = useRef<HTMLElement>(null);
  const genRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  /* Hero scroll tracking */
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroSmooth = useSpring(heroProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  /* Hero transforms */
  const titleY = useTransform(heroSmooth, [0, 1], [0, -80]);
  const titleOpacity = useTransform(heroSmooth, [0.4, 0.9], [1, 0]);
  const statsY = useTransform(heroSmooth, [0, 1], [0, -40]);

  /* Generations scroll tracking */
  const { scrollYProgress: genProgress } = useScroll({
    target: genRef,
    offset: ["start end", "end 0.7"],
  });
  const genSmooth = useSpring(genProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  /* Final CTA scroll tracking */
  const { scrollYProgress: ctaProgress } = useScroll({
    target: ctaRef,
    offset: ["start end", "center center"],
  });
  const ctaSmooth = useSpring(ctaProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const ctaScale = useTransform(ctaSmooth, [0, 1], [0.9, 1]);
  const ctaOpacity = useTransform(ctaSmooth, [0, 0.6], [0.3, 1]);
  const ctaButtonGlow = useTransform(ctaSmooth, [0.5, 1], [
    "drop-shadow(0 0 0px rgba(250, 204, 21, 0.6))",
    "drop-shadow(0 0 25px rgba(250, 204, 21, 0.6))",
  ]);

  /* Reduced motion: skip scroll-linked, keep simple fades */
  const rm = prefersReducedMotion ?? false;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0a0118] via-[#110225] to-[#060118] text-white overflow-hidden relative">
      {/* Flying Sky Background — full-page parallax Pokemon & clouds */}
      {!rm && <FlyingSkyBackground scrollProgress={pageSmooth} />}

      {/* Scroll Progress Bar */}
      {!rm && <ScrollProgressBar scaleX={progressBarScale} />}

      {/* Sparkle particles */}
      <Sparkles />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <span className="text-lg font-bold tracking-tight">
          Match &apos;Em All
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

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative flex-1 flex flex-col items-center justify-center px-6 text-center py-16 sm:py-24"
      >
        <FloatingPokemon scrollYProgress={rm ? undefined : heroSmooth} />

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-8">
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
              <motion.div
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={rm ? undefined : { y: titleY, opacity: titleOpacity }}
          >
            Match
            <br />
            <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
              &apos;Em All!
            </span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl text-purple-200 max-w-lg leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={rm ? undefined : { y: titleY, opacity: titleOpacity }}
          >
            The multiplayer Pokemon card matching game. Flip cards, find
            matching pairs, build your collection, and evolve your Pokemon.
          </motion.p>

          {/* Stats */}
          <motion.div
            className="flex flex-wrap justify-center gap-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={rm ? undefined : { y: statsY }}
          >
            <div>
              <div className="text-3xl font-bold text-yellow-400">1,025</div>
              <div className="text-xs text-purple-300">Pokemon Species</div>
            </div>
            <div className="w-px bg-purple-600" />
            <div>
              <div className="text-3xl font-bold text-yellow-400">36</div>
              <div className="text-xs text-purple-300">Cards Per Round</div>
            </div>
            <div className="w-px bg-purple-600" />
            <div>
              <div className="text-3xl font-bold text-yellow-400">9</div>
              <div className="text-xs text-purple-300">Generations</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link href="/register">
              <Button
                size="lg"
                className="bg-gradient-to-r from-yellow-400 to-amber-500 text-purple-900 hover:from-yellow-300 hover:to-amber-400 font-bold text-lg px-10 h-14 shadow-xl shadow-yellow-500/25 rounded-full"
              >
                Start Playing — It&apos;s Free
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <HowItWorks />

      {/* Live Preview Section */}
      <section className="py-16 px-4">
        <MiniBoardPreview />
      </section>

      {/* Generations Section */}
      <section ref={genRef} className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            All 9 Generations
          </motion.h2>
          <p className="text-purple-200 mb-8 max-w-md mx-auto">
            From Kanto to Paldea — every region, every Pokemon
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {rm
              ? generations.map((g, i) => (
                  <motion.div
                    key={g.gen}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Badge
                      className={`${g.color} text-white px-3 py-1.5 text-sm font-semibold`}
                    >
                      Gen {g.gen} · {g.region}
                    </Badge>
                  </motion.div>
                ))
              : generations.map((g, i) => (
                  <ScrollBadge
                    key={g.gen}
                    g={g}
                    index={i}
                    total={generations.length}
                    sectionProgress={genSmooth}
                  />
                ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section ref={ctaRef} className="py-20 px-4">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          style={
            rm
              ? undefined
              : { scale: ctaScale, opacity: ctaOpacity }
          }
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Catch &apos;Em All?
          </h2>
          <p className="text-purple-200 mb-8">
            Join players from around the world. Free to play, no download
            required.
          </p>
          <Link href="/register">
            <motion.div
              className="inline-block"
              style={rm ? undefined : { filter: ctaButtonGlow }}
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-yellow-400 to-amber-500 text-purple-900 hover:from-yellow-300 hover:to-amber-400 font-bold text-lg px-10 h-14 shadow-xl shadow-yellow-500/25 rounded-full"
              >
                Create Free Account
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 border-t border-white/10">
        <p className="text-purple-400 text-sm">
          Match &apos;Em All · A multiplayer Pokemon matching game
        </p>
      </footer>
    </div>
  );
}
