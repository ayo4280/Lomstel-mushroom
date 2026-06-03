"use client";

import React from "react";
import { Plus } from "lucide-react";

const phrases = ["Farm to Table.", "Finest Grade.", "Precision Grown."];

export function HeroSubtitleText() {
  return (
    <div className="w-full flex justify-center mb-10 mt-4">
      <div className="relative w-full max-w-4xl px-4 py-8 border border-white/20"
        style={{ maskImage: "radial-gradient(100rem 18rem at center, white, transparent)" }}>

        {/* Corner markers */}
        <Plus className="absolute -left-4 -top-4 h-6 w-6 text-yellow-400 opacity-80" />
        <Plus className="absolute -bottom-4 -left-4 h-6 w-6 text-yellow-400 opacity-80" />
        <Plus className="absolute -right-4 -top-4 h-6 w-6 text-yellow-400 opacity-80" />
        <Plus className="absolute -bottom-4 -right-4 h-6 w-6 text-yellow-400 opacity-80" />

        {/* Animated phrase row */}
        <h2 className="flex flex-col sm:flex-row justify-center items-center gap-4 text-center">
          {phrases.map((text, i) => (
            <span
              key={text}
              style={{
                display: "inline-block",
                fontSize: "clamp(1.5rem, 4vw, 2.8rem)",
                fontWeight: 900,
                letterSpacing: "-0.02em",
                color: "#FFFFFF", /* Glowing White */
                textShadow: "0 0 15px rgba(255, 255, 255, 0.8), 0 4px 20px rgba(0,0,0,0.8)",
                animationName: `pulse-${i + 1}`,
                animationDuration: "9s",
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
              }}
            >
              {text}
            </span>
          ))}
        </h2>
      </div>

      {/* Keyframe styles injected via style tag for reliable animation */}
      <style>{`
        @keyframes pulse-1 {
          0%, 100%    { opacity: 1;   transform: scale(1.05); text-shadow: 0 0 25px rgba(255,255,255,1), 0 4px 20px rgba(0,0,0,0.9); }
          33%, 66%    { opacity: 0.4; transform: scale(1);    text-shadow: 0 0 10px rgba(255,255,255,0.4), 0 4px 20px rgba(0,0,0,0.9); }
        }
        @keyframes pulse-2 {
          0%, 100%    { opacity: 0.4; transform: scale(1);    text-shadow: 0 0 10px rgba(255,255,255,0.4), 0 4px 20px rgba(0,0,0,0.9); }
          33%         { opacity: 1;   transform: scale(1.05); text-shadow: 0 0 25px rgba(255,255,255,1), 0 4px 20px rgba(0,0,0,0.9); }
          66%         { opacity: 0.4; transform: scale(1);    text-shadow: 0 0 10px rgba(255,255,255,0.4), 0 4px 20px rgba(0,0,0,0.9); }
        }
        @keyframes pulse-3 {
          0%, 33%     { opacity: 0.4; transform: scale(1);    text-shadow: 0 0 10px rgba(255,255,255,0.4), 0 4px 20px rgba(0,0,0,0.9); }
          66%, 100%   { opacity: 1;   transform: scale(1.05); text-shadow: 0 0 25px rgba(255,255,255,1), 0 4px 20px rgba(0,0,0,0.9); }
        }
      `}</style>
    </div>
  );
}
