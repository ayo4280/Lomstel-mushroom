"use client";

import React from "react";
import { Plus } from "lucide-react";

const phrases = [
  { text: "Farm to Table.", from: "#FFD700", to: "#FFA500" },
  { text: "Finest Grade.",  from: "#74C69D", to: "#2D9B6B" },
  { text: "Precision Grown.", from: "#FFA07A", to: "#C85A3C" },
];

export function HeroSubtitleText() {
  return (
    <div className="w-full flex justify-center mb-8 mt-2">
      <div className="relative w-full max-w-3xl px-6 py-8 border border-white/20"
        style={{ maskImage: "radial-gradient(60rem 18rem at center, white, transparent)" }}>

        {/* Corner markers */}
        <Plus className="absolute -left-4 -top-4 h-6 w-6 text-yellow-400 opacity-80" />
        <Plus className="absolute -bottom-4 -left-4 h-6 w-6 text-yellow-400 opacity-80" />
        <Plus className="absolute -right-4 -top-4 h-6 w-6 text-yellow-400 opacity-80" />
        <Plus className="absolute -bottom-4 -right-4 h-6 w-6 text-yellow-400 opacity-80" />

        {/* Animated phrase row */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 text-center">
          {phrases.map(({ text, from, to }, i) => (
            <span
              key={text}
              style={{
                position: "relative",
                display: "inline-block",
                fontSize: "clamp(1.6rem, 4vw, 2.5rem)",
                fontWeight: 900,
                letterSpacing: "-0.02em",
                animationName: `subtitle-cycle-${i + 1}`,
                animationDuration: "9s",
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
                background: `linear-gradient(to right, ${from}, ${to})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {text}
            </span>
          ))}
        </div>

        {/* Static subtitle */}
        <p className="text-center text-white/75 text-lg font-medium mt-4 leading-relaxed" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
          Experience the highest grade wet and dry oyster mushrooms<br className="hidden sm:block" />
          powered by data-driven, precision agriculture.
        </p>
      </div>

      {/* Keyframe styles injected via style tag */}
      <style>{`
        @keyframes subtitle-cycle-1 {
          0%, 100%    { opacity: 1;   transform: translateY(0px); }
          33%, 66%    { opacity: 0.3; transform: translateY(-4px); }
        }
        @keyframes subtitle-cycle-2 {
          0%, 100%    { opacity: 0.3; transform: translateY(-4px); }
          33%         { opacity: 1;   transform: translateY(0px); }
          66%         { opacity: 0.3; transform: translateY(-4px); }
        }
        @keyframes subtitle-cycle-3 {
          0%, 33%     { opacity: 0.3; transform: translateY(-4px); }
          66%, 100%   { opacity: 1;   transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
}
