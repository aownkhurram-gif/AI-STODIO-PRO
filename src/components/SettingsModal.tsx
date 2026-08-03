import React, { useState, useEffect } from 'react';
import { Settings, Key, X, Check, ShieldCheck, Cpu, RefreshCw, Zap } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [hfKey, setHfKey] = useState('');
  const [falKey, setFalKey] = useState('');
  const [replicateKey, setReplicateKey] = useState('');
  const [useExternalApi, setUseExternalApi] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const savedHf = localStorage.getItem('hf_api_key') || '';
    const savedFal = localStorage.getItem('fal_api_key') || '';
    const savedRep = localStorage.getItem('replicate_api_key') || '';
    const savedExt = localStorage.getItem('use_external_api') === 'true';
    setHfKey(savedHf);
    setFalKey(savedFal);
    setReplicateKey(savedRep);
    setUseExternalApi(savedExt);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('hf_api_key', hfKey);
    localStorage.setItem('fal_api_key', falKey);
    localStorage.setItem('replicate_api_key', replicateKey);
    localStorage.setItem('use_external_api', useExternalApi ? 'true' : 'false');

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#18181b] border border-[#27272a] rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#27272a]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">3 API Rotation System & Keys</h3>
              <p className="text-xs text-zinc-400">Automatic credit failover for 100% uptime</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#09090b] text-zinc-400 hover:text-white border border-[#27272a]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 API Rotation Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 to-blue-950/60 border border-purple-500/40 space-y-3">
          <div className="flex items-center gap-2 font-bold text-xs text-purple-300 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-amber-300" />
            <span>Automatic Failover Chain</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Agar ek API ka credit khatam ho jaye to dusri auto chalegi. If all external APIs fail, AI Studio Pro switches to the client 3D engine.
          </p>
          <div className="grid grid-cols-3 gap-2 text-[10px] pt-1">
            <div className="p-2 rounded-xl bg-[#09090b]/80 border border-purple-500/30 text-center space-y-1">
              <span className="font-bold text-purple-300 block">1. HuggingFace</span>
              <span className="text-emerald-400 font-semibold">Unlimited Free</span>
            </div>
            <div className="p-2 rounded-xl bg-[#09090b]/80 border border-blue-500/30 text-center space-y-1">
              <span className="font-bold text-blue-300 block">2. Fal.ai</span>
              <span className="text-amber-300 font-semibold">Daily Free</span>
            </div>
            <div className="p-2 rounded-xl bg-[#09090b]/80 border border-indigo-500/30 text-center space-y-1">
              <span className="font-bold text-indigo-300 block">3. Replicate</span>
              <span className="text-purple-300 font-semibold">$10 Free</span>
            </div>
          </div>
        </div>

        {/* HuggingFace API Key Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Key className="w-4 h-4 text-purple-400" />
              <span>1. HuggingFace API Key</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold">Unlimited Free</span>
          </label>
          <input
            type="password"
            value={hfKey}
            onChange={(e) => setHfKey(e.target.value)}
            placeholder="hf_..."
            className="w-full bg-[#09090b] text-zinc-100 placeholder-zinc-600 text-xs font-mono rounded-xl px-3.5 py-2.5 border border-[#27272a] focus:outline-none focus:border-purple-500"
          />
          <p className="text-[11px] text-zinc-500">
            Model: <code className="text-purple-300">stabilityai/stable-video-diffusion-img2vid-xt</code>
          </p>
        </div>

        {/* Fal.ai API Key Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-blue-400" />
              <span>2. Fal.ai API Key</span>
            </span>
            <span className="text-[10px] text-amber-300 font-semibold">Daily Free</span>
          </label>
          <input
            type="password"
            value={falKey}
            onChange={(e) => setFalKey(e.target.value)}
            placeholder="fal_..."
            className="w-full bg-[#09090b] text-zinc-100 placeholder-zinc-600 text-xs font-mono rounded-xl px-3.5 py-2.5 border border-[#27272a] focus:outline-none focus:border-purple-500"
          />
          <p className="text-[11px] text-zinc-500">
            Model: <code className="text-blue-300">fal-ai/fast-animatediff</code>
          </p>
        </div>

        {/* Replicate API Key Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Key className="w-4 h-4 text-indigo-400" />
              <span>3. Replicate API Key</span>
            </span>
            <span className="text-[10px] text-purple-300 font-semibold">$10 First Free</span>
          </label>
          <input
            type="password"
            value={replicateKey}
            onChange={(e) => setReplicateKey(e.target.value)}
            placeholder="r8_..."
            className="w-full bg-[#09090b] text-zinc-100 placeholder-zinc-600 text-xs font-mono rounded-xl px-3.5 py-2.5 border border-[#27272a] focus:outline-none focus:border-purple-500"
          />
          <p className="text-[11px] text-zinc-500">
            Model: <code className="text-indigo-300">luma/dream-machine</code>
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-[#27272a]">
          <div>
            <p className="text-xs font-bold text-zinc-200">Enable 3 API Auto Rotation</p>
            <p className="text-[11px] text-zinc-400">Automatically failover if credits exhaust</p>
          </div>
          <button
            type="button"
            onClick={() => setUseExternalApi(!useExternalApi)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              useExternalApi ? 'bg-purple-600' : 'bg-zinc-800'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                useExternalApi ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Action Button */}
        <button
          onClick={handleSave}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Rotation System & Keys Saved!</span>
            </>
          ) : (
            <span>Save Rotation Settings</span>
          )}
        </button>

      </div>
    </div>
  );
};
