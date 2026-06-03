"use client";

import React from "react";
import { Plus } from "lucide-react";

export function HeroSubtitleText() {
  return (
    <div className="mb-10 mt-4 w-full flex justify-center">
      <div className="px-2 w-full max-w-4xl">
        <div className="relative p-8 w-full border border-white/20 [mask-image:radial-gradient(200rem_16rem_at_center,white,transparent)]">
          <Plus className="absolute -left-4 -top-4 h-6 w-6 text-yellow-400" />
          <Plus className="absolute -bottom-4 -left-4 h-6 w-6 text-yellow-400" />
          <Plus className="absolute -right-4 -top-4 h-6 w-6 text-yellow-400" />
          <Plus className="absolute -bottom-4 -right-4 h-6 w-6 text-yellow-400" />

          <h2 className="tracking-tight flex select-none px-3 py-2 flex-col text-center text-3xl font-extrabold leading-relaxed sm:text-4xl md:flex-col lg:flex-row lg:justify-center lg:gap-2">

            <span
              data-content="Farm to Table."
              className="before:animate-gradient-background-1 relative before:absolute before:bottom-0 before:left-0 before:top-0 before:z-0 before:w-full before:px-2 before:content-[attr(data-content)]"
            >
              <span className="from-gradient-1-start to-gradient-1-end animate-gradient-foreground-1 bg-gradient-to-r bg-clip-text px-2 text-transparent">
                Farm to Table.
              </span>
            </span>

            <span
              data-content="Finest Grade."
              className="before:animate-gradient-background-2 relative before:absolute before:bottom-0 before:left-0 before:top-0 before:z-0 before:w-full before:px-2 before:content-[attr(data-content)]"
            >
              <span className="from-gradient-2-start to-gradient-2-end animate-gradient-foreground-2 bg-gradient-to-r bg-clip-text px-2 text-transparent">
                Finest Grade.
              </span>
            </span>

            <span
              data-content="Precision Grown."
              className="before:animate-gradient-background-3 relative before:absolute before:bottom-0 before:left-0 before:top-0 before:z-0 before:w-full before:px-2 before:content-[attr(data-content)]"
            >
              <span className="from-gradient-3-start to-gradient-3-end animate-gradient-foreground-3 bg-gradient-to-r bg-clip-text px-2 text-transparent">
                Precision Grown.
              </span>
            </span>

          </h2>


        </div>
      </div>
    </div>
  );
}
