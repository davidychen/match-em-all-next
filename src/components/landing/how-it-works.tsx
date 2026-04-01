"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from "framer-motion";

const steps = [
  {
    icon: "👆",
    title: "Flip Cards",
    desc: "Click any card to reveal the Pokemon hiding underneath. You can flip 2 cards at a time.",
    color: "from-purple-500 to-purple-700",
  },
  {
    icon: "✨",
    title: "Match Pairs",
    desc: "Find two cards with the same Pokemon to make a match! Matched Pokemon go to your collection.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: "🧬",
    title: "Evolve",
    desc: "Collect 3 of the same Pokemon to evolve it into its next form. Gotta catch 'em all!",
    color: "from-green-500 to-emerald-600",
  },
];

function ScrollStepCard({
  step,
  index,
  sectionProgress,
}: {
  step: (typeof steps)[number];
  index: number;
  sectionProgress: ReturnType<typeof useSpring>;
}) {
  const entryStart = 0.1 + index * 0.18;
  const entryEnd = entryStart + 0.25;

  const xDirection = index % 2 === 0 ? -1 : 1;
  const x = useTransform(sectionProgress, [entryStart, entryEnd], [120 * xDirection, 0]);
  const opacity = useTransform(sectionProgress, [entryStart, entryEnd], [0, 1]);
  const iconRotate = useTransform(sectionProgress, [entryStart, entryEnd], [-90, 0]);
  const iconScale = useTransform(sectionProgress, [entryStart, entryEnd], [0.5, 1]);

  return (
    <motion.div className="relative group" style={{ x, opacity }}>
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all hover:bg-white/15">
        <motion.div
          className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-2xl mb-4 shadow-lg`}
          style={{ rotate: iconRotate, scale: iconScale }}
        >
          {step.icon}
        </motion.div>
        <div className="text-sm text-purple-300 font-semibold mb-1">
          Step {index + 1}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
        <p className="text-purple-200 text-sm leading-relaxed">{step.desc}</p>
      </div>
    </motion.div>
  );
}

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const rm = prefersReducedMotion ?? false;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end 0.75"],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  /* Connecting line progress */
  const lineScale = useTransform(smooth, [0.15, 0.85], [0, 1]);

  return (
    <section ref={sectionRef} className="py-16 px-4">
      <motion.h2
        className="text-3xl sm:text-4xl font-bold text-center mb-4 text-white"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        How It Works
      </motion.h2>
      <p className="text-center text-purple-200 mb-12 max-w-lg mx-auto">
        Three simple steps to become a Pokemon master
      </p>

      <div className="relative max-w-4xl mx-auto">
        {/* Connecting line (desktop: horizontal, mobile: hidden) */}
        {!rm && (
          <div className="hidden md:block absolute top-[3.25rem] left-[16%] right-[16%] h-0.5 bg-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-400 via-amber-400 to-green-400 origin-left"
              style={{ scaleX: lineScale }}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rm
            ? steps.map((step, i) => (
                <motion.div
                  key={step.title}
                  className="relative group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                >
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all hover:bg-white/15">
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-2xl mb-4 shadow-lg`}
                    >
                      {step.icon}
                    </div>
                    <div className="text-sm text-purple-300 font-semibold mb-1">
                      Step {i + 1}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-purple-200 text-sm leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))
            : steps.map((step, i) => (
                <ScrollStepCard
                  key={step.title}
                  step={step}
                  index={i}
                  sectionProgress={smooth}
                />
              ))}
        </div>
      </div>
    </section>
  );
}
