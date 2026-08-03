import React, { useState } from 'react';
import { Download, Share2, Trash2, Check, Sparkles, Film, X } from 'lucide-react';
import { GeneratedVideo } from '../types';

interface VideoResultModalProps {
  video: GeneratedVideo;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const VideoResultModal: React.FC<VideoResultModalProps> = ({
  video,
  onClose,
  onDelete
}) => {
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  // Direct 100% working download trigger using Blob URL
  const handleDownload = () => {
    try {
      const a = document.createElement('a');
      a.href = video.videoUrl;
      const fileName = `ai-studio-pro-${video.style.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.mp4`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error("Download failed, opening video in new tab fallback:", e);
      window.open(video.videoUrl, '_blank');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
    setShareOpen(!shareOpen);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#18181b] border border-[#27272a] rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-2xl relative my-8">
        
        {/* Header & Close Button */}
        <div className="flex items-center justify-between pb-4 border-b border-[#27272a]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white line-clamp-1">{video.title}</h2>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="text-purple-400 font-semibold">{video.style}</span>
                <span>•</span>
                <span>{video.durationSeconds} Seconds</span>
                <span>•</span>
                <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 font-bold">{video.quality}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#09090b] text-zinc-400 hover:text-white border border-[#27272a]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big HTML5 Video Player */}
        <div className="relative rounded-2xl overflow-hidden bg-black border border-[#27272a] shadow-inner max-h-[480px] flex items-center justify-center">
          <video
            src={video.videoUrl}
            controls
            autoPlay
            loop
            playsInline
            className="w-full h-full max-h-[460px] object-contain rounded-2xl"
          />
        </div>

        {/* 3 BUTTONS IN A ROW (Download, Share, Delete) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          
          {/* 1. Main Button (Green): Download HD Video - Free */}
          <button
            onClick={handleDownload}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="w-5 h-5" />
            <span>⬇ Download HD Video - Free</span>
          </button>

          {/* 2. Button 2: Share Video */}
          <button
            onClick={handleShare}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#09090b] hover:bg-[#27272a] text-zinc-100 font-bold text-sm border border-[#27272a] flex items-center justify-center gap-2 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-5 h-5 text-purple-400" />
                <span>Share Video</span>
              </>
            )}
          </button>

          {/* 3. Button 3: Delete */}
          <button
            onClick={() => {
              if (confirm('Kya aap is video ko delete karna chahte hain?')) {
                onDelete(video.id);
                onClose();
              }
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold text-sm border border-rose-800/40 flex items-center justify-center gap-2 transition-all"
          >
            <Trash2 className="w-5 h-5" />
            <span>Delete</span>
          </button>

        </div>

        {/* Share Options Drawer */}
        {shareOpen && (
          <div className="p-4 rounded-2xl bg-[#09090b] border border-[#27272a] space-y-3 text-xs text-zinc-300">
            <p className="font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Share your 3D Cartoon Movie on Social Media:
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent('Check out my 3D cartoon movie generated on AI Studio Pro!')}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 font-semibold border border-emerald-800"
              >
                WhatsApp
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Created a 3D animation movie using AI Studio Pro!')}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-sky-950 text-sky-300 font-semibold border border-sky-800"
              >
                Twitter / X
              </a>
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 rounded-lg bg-purple-950 text-purple-300 font-semibold border border-purple-800"
              >
                Upload to TikTok / YouTube Shorts
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
