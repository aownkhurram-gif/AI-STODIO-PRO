import React, { useState } from 'react';
import { MessageSquare, Sparkles, Wand2, Loader2, Volume2 } from 'lucide-react';
import { GenerationSettings } from '../types';
import { SettingsPanel } from './SettingsPanel';

interface TabPromptToVideoProps {
  onGenerate: (prompt: string, settings: GenerationSettings) => void;
  isGenerating: boolean;
}

export const TabPromptToVideo: React.FC<TabPromptToVideoProps> = ({ onGenerate, isGenerating }) => {
  const [promptText, setPromptText] = useState<string>(
    'A cute 3D baby elephant playing in jungle with other animals, Pixar style, cinematic lighting, ultra realistic...'
  );
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [settings, setSettings] = useState<GenerationSettings>({
    style: 'Pixar 3D HD',
    lengthSeconds: 30,
    aspectRatio: '16:9',
    quality: 'Full HD 1080p',
    cameraMovement: 'Orbit',
    voiceoverLang: 'English',
    bgMusic: true
  });

  // Call Gemini API server endpoint to enhance prompt
  const handleEnhancePrompt = async () => {
    if (!promptText.trim()) return;
    setIsEnhancing(true);
    try {
      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          style: settings.style,
          lang: settings.voiceoverLang
        })
      });
      const data = await res.json();
      if (data.enhancedPrompt) {
        setPromptText(data.enhancedPrompt);
      }
    } catch (err) {
      console.error("Failed to enhance prompt:", err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) {
      alert('Meharbani karke apna idea prompt likhein!');
      return;
    }
    onGenerate(promptText, settings);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Section (Col 7) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <span>Apna Koi Bhi Idea Likho...</span>
              </label>
              <span className="text-xs text-zinc-400">Describe your 3D cartoon movie scene</span>
            </div>

            <div className="relative">
              <textarea
                rows={7}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="A cute 3D baby elephant playing in jungle with other animals, Pixar style, cinematic lighting, ultra realistic..."
                className="w-full bg-[#18181b] text-zinc-100 placeholder-zinc-500 text-sm rounded-2xl p-4 border border-[#27272a] focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none pr-36"
                required
              />

              {/* Prompt Enhancer Button */}
              <button
                type="button"
                onClick={handleEnhancePrompt}
                disabled={isEnhancing || !promptText.trim()}
                className="absolute bottom-3 right-3 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {isEnhancing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>AI Enhancing...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5 text-amber-300" />
                    <span>Prompt ko AI se Behtar Karo</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Prompt Ideas */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-zinc-400 custom-scrollbar">
              <span className="flex-shrink-0 text-purple-400 font-semibold">Try Ideas:</span>
              {[
                'Pakistani boy flying superhero cape in Lahore streets 3D Pixar',
                'Cute cat driving futuristic red sports car 3D Disney cartoon',
                'Little girl exploring magical candy forest with talking dragon 3D'
              ].map((idea, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPromptText(idea)}
                  className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-zinc-300 hover:text-white transition-colors truncate max-w-[220px]"
                >
                  {idea}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section (Col 5) */}
        <div className="lg:col-span-5 space-y-5">
          <SettingsPanel settings={settings} setSettings={setSettings} showAudioOptions={true} />
        </div>

      </div>

      {/* Submit Generate Button */}
      <button
        type="submit"
        disabled={isGenerating}
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-base shadow-xl shadow-purple-600/30 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
      >
        <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
        <span>Generate 3D Animation Movie 🚀</span>
      </button>
    </form>
  );
};
