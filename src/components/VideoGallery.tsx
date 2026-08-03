import React from 'react';
import { Film, Play, Download, Trash2, Clock, Sparkles } from 'lucide-react';
import { GeneratedVideo } from '../types';

interface VideoGalleryProps {
  videos: GeneratedVideo[];
  onSelectVideo: (video: GeneratedVideo) => void;
  onDeleteVideo: (id: string) => void;
}

export const VideoGallery: React.FC<VideoGalleryProps> = ({
  videos,
  onSelectVideo,
  onDeleteVideo,
}) => {
  if (videos.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4 pt-6 border-t border-[#27272a]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-bold text-white">Aapki Bani Hui Videos</h2>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-950 text-purple-300 border border-purple-800">
            {videos.length} Saved
          </span>
        </div>
        <p className="text-xs text-zinc-400 hidden sm:block">Saved in browser's LocalStorage</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((vid) => (
          <div
            key={vid.id}
            className="group bg-[#18181b] border border-[#27272a] hover:border-purple-500/50 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between"
          >
            {/* Thumbnail / Video Preview Box */}
            <div
              className="relative aspect-video bg-black cursor-pointer overflow-hidden"
              onClick={() => onSelectVideo(vid)}
            >
              <video
                src={vid.videoUrl}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                muted
                onMouseOver={(e) => (e.target as HTMLVideoElement).play().catch(() => {})}
                onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 fill-current ml-1" />
                </div>
              </div>

              {/* Badges */}
              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-purple-950/90 text-purple-300 border border-purple-800/80">
                  {vid.style}
                </span>
              </div>

              <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-bold text-zinc-200">
                <Clock className="w-3 h-3 text-purple-400" />
                <span>{vid.durationSeconds}s</span>
              </div>
            </div>

            {/* Content & Actions */}
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-sm text-zinc-100 line-clamp-1 group-hover:text-purple-300 transition-colors">
                  {vid.title}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                  {vid.prompt}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#27272a] text-xs">
                <button
                  onClick={() => onSelectVideo(vid)}
                  className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Play Movie</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const a = document.createElement('a');
                      a.href = vid.videoUrl;
                      a.download = `ai-studio-pro-${vid.id}.mp4`;
                      a.click();
                    }}
                    className="p-1.5 rounded-lg bg-[#09090b] text-emerald-400 hover:bg-emerald-950/50 border border-[#27272a]"
                    title="Download Video"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this video?')) onDeleteVideo(vid.id);
                    }}
                    className="p-1.5 rounded-lg bg-[#09090b] text-rose-400 hover:bg-rose-950/50 border border-[#27272a]"
                    title="Delete Video"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
