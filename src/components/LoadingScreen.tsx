import React from 'react';
import { Film, Sparkles, Loader2, Video, Clapperboard } from 'lucide-react';

interface LoadingScreenProps {
  progress: number; // 0 to 100
  stageText: string;
  currentScene?: number;
  totalScenes?: number;
}

const ANIMATION_TIPS = [
  "💡 Tip: Pixar 3D style uses volumetric subsurface scattering for soft, glowing skin lighting.",
  "💡 Tip: Long Movie Mode divides your 5-minute story into continuous 5-second scenes for smooth character continuity.",
  "💡 Tip: Camera orbit and zoom add depth to 3D cartoon animations.",
  "💡 Tip: 4K Ultra HD setting renders ultra-vivid textures and vibrant colors.",
  "💡 Tip: You can download your MP4 video completely watermark-free for YouTube and Reels!"
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  progress,
  stageText,
  currentScene,
  totalScenes
}) => {
  const currentTip = ANIMATION_TIPS[Math.floor((progress / 20) % ANIMATION_TIPS.length)];

  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-8 max-w-2xl mx-auto my-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
      
      {/* Background Animated Glow */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-purple-600/20 blur-3xl rounded-full pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-600/20 blur-3xl rounded-full pointer-events-none"></div>

      {/* Animated Icon Header */}
      <div className="relative inline-block">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-500 p-1 mx-auto shadow-xl shadow-purple-500/30 animate-pulse">
          <div className="w-full h-full bg-[#09090b] rounded-xl flex items-center justify-center">
            <Clapperboard className="w-9 h-9 text-purple-400 animate-bounce" />
          </div>
        </div>
        <Sparkles className="w-6 h-6 text-amber-300 absolute -top-2 -right-2 animate-spin" />
      </div>

      {/* Main Status Heading */}
      <div className="space-y-2">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
          Aapki 3D Cartoon Movie Ban Rahi Hai...
        </h3>
        <p className="text-sm text-zinc-400">{stageText}</p>
      </div>

      {/* Progress Bar & Percentage */}
      <div className="space-y-2 max-w-lg mx-auto">
        <div className="flex justify-between items-center text-xs font-bold">
          <span className="text-purple-400 flex items-center gap-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Generating Frames
          </span>
          <span className="text-xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            {progress}%
          </span>
        </div>

        <div className="w-full h-4 bg-[#09090b] rounded-full p-0.5 border border-[#27272a] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 via-blue-500 to-indigo-500 rounded-full transition-all duration-300 relative"
            style={{ width: `${Math.max(5, progress)}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Scene counter if in Long Movie Mode */}
      {currentScene && totalScenes && totalScenes > 1 && (
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/30 text-purple-300 text-xs font-semibold">
          <Film className="w-4 h-4 text-purple-400" />
          <span>Multi-Scene Stitching: Scene {currentScene} of {totalScenes}</span>
        </div>
      )}

      {/* Tips Section */}
      <div className="p-4 rounded-xl bg-[#09090b]/80 border border-[#27272a] text-xs text-zinc-300 text-left max-w-md mx-auto space-y-1">
        <p className="font-semibold text-purple-400 flex items-center gap-1">
          <Video className="w-3.5 h-3.5" />
          3D Rendering Insight:
        </p>
        <p className="text-zinc-400 leading-relaxed">{currentTip}</p>
      </div>

    </div>
  );
};
