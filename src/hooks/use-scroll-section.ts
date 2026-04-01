"use client";

import { useRef } from "react";
import { useScroll, useTransform, useSpring, useReducedMotion } from "framer-motion";
import type { MotionValue } from "framer-motion";

const DEFAULT_OFFSET = ["start end", "end start"] as const;

/**
 * Track scroll progress of a section through the viewport.
 * Returns a ref to attach to the section, the raw progress (0→1),
 * and a spring-smoothed version for buttery animations.
 */
export function useScrollSection(offset: readonly string[] = DEFAULT_OFFSET) {
  const ref = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    offset: offset as any,
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return {
    ref,
    scrollYProgress,
    smoothProgress,
    prefersReducedMotion,
  };
}

/**
 * Helper: create multiple useTransform values from a single progress.
 * Avoids repetitive useTransform calls in components.
 */
export function useParallax(
  scrollYProgress: MotionValue<number>,
  distance: number
) {
  return useTransform(scrollYProgress, [0, 1], [-distance, distance]);
}
