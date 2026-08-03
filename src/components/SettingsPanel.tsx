import React from 'react';
import {
  VideoStyle,
  AspectRatio,
  Quality,
  CameraMovement,
  VoiceoverLanguage,
  GenerationSettings
} from '../types';
import { Sliders, Clock, Maximize as AspectIcon, Camera, Mic, Music, Layers } from 'lucide-react';

interface SettingsPanelProps {
  settings: GenerationSettings;
  setSettings: React.Dispatch<React.SetStateAction<GenerationSettings>>;
  showAudioOptions?: boolean;
}

const VIDEO_STYLES: VideoStyle[] = [
  'Pixar 3D HD',
  'Disney Cartoon',
  'Anime Cartoon',
  'Realistic Animation',
  'Claymation',
  '3D Long Movie Story'
];

const ASPECT_RATIOS: { id: AspectRatio; label: string; ratioText: string }[] = [
  { id: '16:9', label: 'YouTube / TV', ratioText: '16:9' },
  { id: '9:16', label: 'TikTok / Reels', ratioText: '9:16' },
  { id: '1:1', label: 'Instagram', ratioText: '1:1' },
  { id: '2.35:1', label: 'Cinema Scope', ratioText: '2.35:1' }
];

const QUALITIES: Quality[] = ['HD 720p', 'Full HD 1080p', '4K Ultra HD'];

const CAMERA_MOVEMENTS: CameraMovement[] = [
  'Static',
  'Zoom In',
  'Zoom Out',
  'Pan Left',
  'Pan Right',
  'Orbit'
];

const VOICEOVER_LANGUAGES: VoiceoverLanguage[] = ['No Voice', 'Urdu', 'English', 'Hindi'];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  setSettings,
  showAudioOptions = false
}) => {
  const estimatedScenes = Math.ceil(settings.lengthSeconds / 5);

  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-[#27272a]">
        <div className="flex items-center gap-2 text-zinc-100 font-semibold">
          <Sliders className="w-5 h-5 text-purple-400" />
          <span>Animation & Movie Settings</span>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">
          3D Engine v3.0
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* A) Video Style */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Video Style</span>
          </label>
          <select
            value={settings.style}
            onChange={(e) => setSettings({ ...settings, style: e.target.value as VideoStyle })}
            className="w-full bg-[#09090b] text-zinc-100 text-sm rounded-xl px-3.5 py-2.5 border border-[#27272a] focus:outline-none focus:border-purple-500 transition-colors"
          >
            {VIDEO_STYLES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* B) Video Length (Slider 3s to 300s - Long Movie Mode) */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>Video Length: <span className="text-purple-400 font-bold">{settings.lengthSeconds} Seconds</span></span>
            </label>
            <span className="text-xs px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-bold border border-purple-800">
              {settings.lengthSeconds > 15 ? `🎬 Long Movie Mode (${estimatedScenes} Scenes)` : 'Short Clip'}
            </span>
          </div>
          <input
            type="range"
            min={3}
            max={300}
            step={settings.lengthSeconds > 30 ? 15 : 3}
            value={settings.lengthSeconds}
            onChange={(e) => setSettings({ ...settings, lengthSeconds: parseInt(e.target.value, 10) })}
            className="w-full accent-purple-500 bg-[#09090b] rounded-lg h-2 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-zinc-400">
            <span>3 Sec</span>
            <span>60 Sec (1 Min)</span>
            <span>300 Sec (5 Min Movie)</span>
          </div>
        </div>

        {/* C) Aspect Ratio */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <AspectIcon className="w-4 h-4 text-purple-400" />
            <span>Aspect Ratio</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ASPECT_RATIOS.map((ar) => (
              <button
                key={ar.id}
                type="button"
                onClick={() => setSettings({ ...settings, aspectRatio: ar.id })}
                className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-medium border transition-all ${
                  settings.aspectRatio === ar.id
                    ? 'bg-purple-600/20 border-purple-500 text-white shadow-sm'
                    : 'bg-[#09090b] border-[#27272a] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span className="font-bold">{ar.ratioText}</span>
                <span className="text-[10px] text-zinc-400">{ar.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* D) Quality */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-purple-400" />
            <span>Quality</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {QUALITIES.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setSettings({ ...settings, quality: q })}
                className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                  settings.quality === q
                    ? 'bg-purple-600/20 border-purple-500 text-white font-semibold'
                    : 'bg-[#09090b] border-[#27272a] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* E) Camera Movement */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-purple-400" />
            <span>Camera Movement</span>
          </label>
          <select
            value={settings.cameraMovement}
            onChange={(e) => setSettings({ ...settings, cameraMovement: e.target.value as CameraMovement })}
            className="w-full bg-[#09090b] text-zinc-100 text-sm rounded-xl px-3.5 py-2.5 border border-[#27272a] focus:outline-none focus:border-purple-500 transition-colors"
          >
            {CAMERA_MOVEMENTS.map((cam) => (
              <option key={cam} value={cam}>
                {cam}
              </option>
            ))}
          </select>
        </div>

        {/* Audio options for Tab 2 / Prompt to Video */}
        {showAudioOptions && (
          <>
            {/* F) Voiceover Language */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-purple-400" />
                <span>Voiceover Language</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {VOICEOVER_LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setSettings({ ...settings, voiceoverLang: lang })}
                    className={`py-2 px-2.5 rounded-xl text-xs font-medium border transition-all ${
                      settings.voiceoverLang === lang
                        ? 'bg-purple-600/20 border-purple-500 text-white font-semibold'
                        : 'bg-[#09090b] border-[#27272a] text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* G) Background Music */}
            <div className="space-y-2 flex items-center justify-between pt-4 sm:pt-6">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-purple-400" />
                <div>
                  <p className="text-sm font-medium text-zinc-200">Background Music</p>
                  <p className="text-xs text-zinc-400">Pixar-style orchestral melody</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, bgMusic: !settings.bgMusic })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  settings.bgMusic ? 'bg-purple-600' : 'bg-zinc-800'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.bgMusic ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
