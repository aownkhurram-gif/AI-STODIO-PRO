import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Sparkles, X, Check, Wand2 } from 'lucide-react';
import { GenerationSettings } from '../types';
import { SettingsPanel } from './SettingsPanel';
import { SAMPLE_IMAGES } from '../data/samples';

interface TabImageToVideoProps {
  onGenerate: (image: string, prompt: string, settings: GenerationSettings) => void;
  isGenerating: boolean;
}

export const TabImageToVideo: React.FC<TabImageToVideoProps> = ({ onGenerate, isGenerating }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(SAMPLE_IMAGES[0].url);
  const [motionPrompt, setMotionPrompt] = useState<string>(
    'boy is running in a lush colorful Pixar 3D park, smiling, camera zoom in, cinematic 4K lighting'
  );
  const [settings, setSettings] = useState<GenerationSettings>({
    style: 'Pixar 3D HD',
    lengthSeconds: 15,
    aspectRatio: '16:9',
    quality: 'Full HD 1080p',
    cameraMovement: 'Zoom In',
    voiceoverLang: 'No Voice',
    bgMusic: true
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setSelectedImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setSelectedImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) {
      alert('Meharbani karke pehle ek Image upload karein ya Sample Image select karein!');
      return;
    }
    onGenerate(selectedImage, motionPrompt, settings);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Input Section (Col 7) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Drag & Drop Upload Box */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-400" />
                <span>Upload Image for Animation</span>
              </label>
              <span className="text-xs text-zinc-400">JPG, PNG, WebP up to 10MB</span>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="relative group border-2 border-dashed border-[#27272a] hover:border-purple-500/60 bg-[#18181b] hover:bg-[#1f1f23] rounded-2xl p-6 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[210px]"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />

              {selectedImage ? (
                <div className="relative w-full max-w-sm rounded-xl overflow-hidden border border-[#27272a] group-hover:scale-[1.01] transition-transform">
                  <img
                    src={selectedImage}
                    alt="Uploaded Preview"
                    className="w-full h-44 object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg shadow">
                      Change Image
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(null);
                      }}
                      className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-100">
                      Yahan Image Drop Karo ya Click karke Upload Karo
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">
                      Drag and drop your image or browse from device
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Preset Sample Images */}
            <div className="space-y-2 pt-1">
              <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Or test with 1-Click 3D Sample Images:</span>
              </p>
              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {SAMPLE_IMAGES.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => {
                      setSelectedImage(sample.url);
                      setSettings((prev) => ({ ...prev, style: sample.style }));
                    }}
                    className={`flex-shrink-0 relative rounded-xl overflow-hidden border-2 transition-all w-20 h-20 group ${
                      selectedImage === sample.url
                        ? 'border-purple-500 ring-2 ring-purple-500/30'
                        : 'border-[#27272a] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={sample.url}
                      alt={sample.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                    {selectedImage === sample.url && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                    <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[9px] text-white text-center py-0.5 truncate px-1 font-medium">
                      {sample.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Motion Prompt Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Motion Prompt</span>
            </label>
            <input
              type="text"
              value={motionPrompt}
              onChange={(e) => setMotionPrompt(e.target.value)}
              placeholder="e.g., boy is running, camera zoom in, Pixar 3D style, smiling..."
              className="w-full bg-[#18181b] text-zinc-100 placeholder-zinc-500 text-sm rounded-xl px-4 py-3 border border-[#27272a] focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              required
            />
          </div>

        </div>

        {/* Right Settings Section (Col 5) */}
        <div className="lg:col-span-5 space-y-5">
          <SettingsPanel settings={settings} setSettings={setSettings} showAudioOptions={false} />
        </div>

      </div>

      {/* Submit Generate Button */}
      <button
        type="submit"
        disabled={isGenerating}
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-base shadow-xl shadow-purple-600/30 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
      >
        <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
        <span>Generate Animation Video ✨</span>
      </button>
    </form>
  );
};
