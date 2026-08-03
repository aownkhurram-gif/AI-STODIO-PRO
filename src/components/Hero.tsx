import React from 'react';
import { Sparkles, Film, ShieldCheck, Zap, Video } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden pt-8 pb-6 px-4 text-center">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>

      <div className="max-w-4xl mx-auto space-y-4">
        {/* Top Feature Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-semibold shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
          <span>Google AI Studio 3D Animation Generator Engine v3.0</span>
        </div>

        {/* H1 Heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
          Image & Prompt to <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
            3D Cartoon Movie
          </span>
        </h1>

        {/* H2 Subheading */}
        <h2 className="text-base sm:text-xl font-medium text-zinc-300 max-w-2xl mx-auto">
          Free, HD, Long Video, No Watermark - Best Google AI Studio Alternative
        </h2>

        {/* Highlight Pills */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm font-medium text-zinc-300">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#18181b] border border-[#27272a]">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>100% Free Model</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#18181b] border border-[#27272a]">
            <Film className="w-4 h-4 text-purple-400" />
            <span>Up to 5 Min Long Movie</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#18181b] border border-[#27272a]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>No Watermark</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#18181b] border border-[#27272a]">
            <Video className="w-4 h-4 text-blue-400" />
            <span>Direct MP4 Download</span>
          </div>
        </div>
      </div>
    </section>
  );
};
