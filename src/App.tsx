import React, { useState, useEffect } from 'react';
import {
  TabType,
  GenerationSettings,
  GeneratedVideo,
  ScriptScene
} from './types';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { TabImageToVideo } from './components/TabImageToVideo';
import { TabPromptToVideo } from './components/TabPromptToVideo';
import { LoadingScreen } from './components/LoadingScreen';
import { VideoResultModal } from './components/VideoResultModal';
import { VideoGallery } from './components/VideoGallery';
import { PricingView } from './components/PricingView';
import { FaqSeoView } from './components/FaqSeoView';
import { SettingsModal } from './components/SettingsModal';
import { generate3DMovieVideo } from './utils/videoEngine';
import { Image as ImageIcon, MessageSquare, Film, AlertTriangle, Key, Sparkles } from 'lucide-react';

// Helper: Safe fetch & JSON response parser
async function parseResponseTextSafely(res: Response) {
  const text = await res.text();
  if (!text || text.trim() === '') {
    console.log('Response body is empty.');
    throw new Error('API Key galat hai ya credit khatam hai, please check .env file');
  }
  try {
    return JSON.parse(text);
  } catch (err) {
    console.log('Raw non-JSON output:', text);
    throw new Error(`Invalid JSON response: ${text.slice(0, 120)}`);
  }
}

// Fallback Function: 100% Free HuggingFace API
async function generateWithHuggingFace(image: string | null, prompt: string, customHfToken?: string) {
  const hfToken = customHfToken || import.meta.env.VITE_HF_TOKEN || localStorage.getItem('hf_api_key') || '';
  
  const res = await fetch('/api/generate-huggingface', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image, prompt, hfToken })
  });

  const data = await parseResponseTextSafely(res);
  if (!data.success || !data.videoUrl) {
    throw new Error(data.error || 'API Key galat hai ya credit khatam hai, please check .env file');
  }
  return data.videoUrl;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('img2vid');
  const [activeGeneratorTab, setActiveGeneratorTab] = useState<'img2vid' | 'prompt2vid'>('img2vid');
  
  // State for Video Generation
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [stageText, setStageText] = useState<string>('');
  const [currentSceneNum, setCurrentSceneNum] = useState<number>(1);
  const [totalScenesNum, setTotalScenesNum] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Saved Videos & Current Result
  const [savedVideos, setSavedVideos] = useState<GeneratedVideo[]>([]);
  const [currentVideoResult, setCurrentVideoResult] = useState<GeneratedVideo | null>(null);

  // Settings Modal
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);

  // Load saved videos from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ai_studio_pro_saved_videos');
      if (stored) {
        setSavedVideos(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load saved videos:", e);
    }
  }, []);

  // Check API keys status
  const checkApiKeyConfig = () => {
    const repToken = import.meta.env.VITE_REPLICATE_API_TOKEN || localStorage.getItem('replicate_api_key') || '';
    const hfToken = import.meta.env.VITE_HF_TOKEN || localStorage.getItem('hf_api_key') || '';
    
    const isRepValid = Boolean(repToken && !repToken.includes('xxxxxxxx') && !repToken.includes('YOUR_FREE_KEY'));
    const isHfValid = Boolean(hfToken && !hfToken.includes('xxxxxxxx') && !hfToken.includes('YOUR_FREE_KEY'));

    return {
      isRepValid,
      isHfValid,
      hasAnyKey: isRepValid || isHfValid,
      repToken,
      hfToken
    };
  };

  // Save videos to LocalStorage on update
  const saveVideosToStorage = (videos: GeneratedVideo[]) => {
    setSavedVideos(videos);
    try {
      localStorage.setItem('ai_studio_pro_saved_videos', JSON.stringify(videos));
    } catch (e) {
      console.warn("Storage quota full, keeping in memory:", e);
    }
  };

  // Handle Tab 1 Image to Video Generation
  const handleGenerateFromImage = async (
    image: string,
    prompt: string,
    settings: GenerationSettings
  ) => {
    setErrorMessage(null);
    setIsGenerating(true);
    setProgress(2);
    setStageText('API Key & Credit Validation Checking...');

    const keys = checkApiKeyConfig();
    if (!keys.hasAnyKey) {
      setErrorMessage("API Key Missing! Please add your free key in .env file or Settings modal");
    }

    try {
      const customKeys = {
        hf: keys.hfToken || undefined,
        replicate: keys.repToken || undefined,
      };

      let videoUrl: string | null = null;
      let usedProvider = "AI Studio Pro Client Engine";

      // 1. Attempt Replicate / Auto API System
      try {
        setStageText('Connecting to Replicate API...');
        const autoRes = await fetch('/api/generate-video-auto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image, prompt, customKeys })
        });

        const autoData = await parseResponseTextSafely(autoRes);
        if (autoData.success && autoData.videoUrl) {
          videoUrl = autoData.videoUrl;
          usedProvider = autoData.provider || "3 API Rotation System";
          setProgress(95);
          setStageText(`Generated via ${usedProvider}!`);
        } else {
          throw new Error(autoData.error || "Replicate credit khatam");
        }
      } catch (repErr: any) {
        console.warn("Replicate API skipped or credit exhausted:", repErr.message);
        setStageText("Replicate credit khatam, ab free HuggingFace se bana raha hun...");

        // 2. Fallback to Free HuggingFace API
        try {
          videoUrl = await generateWithHuggingFace(image, prompt, keys.hfToken);
          usedProvider = "HuggingFace (Free)";
          setProgress(95);
          setStageText("Generated via HuggingFace Free Endpoint!");
        } catch (hfErr: any) {
          console.warn("HuggingFace API fallback failed:", hfErr.message);
          setErrorMessage("API Key galat hai ya credit khatam hai, please check .env file");
        }
      }

      // 3. Fetch Multi-Scene Script Breakdown
      const scriptRes = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          style: settings.style,
          durationSeconds: settings.lengthSeconds,
          lang: settings.voiceoverLang
        })
      });

      let scenes: ScriptScene[] = [];
      try {
        const scriptData = await parseResponseTextSafely(scriptRes);
        scenes = scriptData.scenes || [];
      } catch (e) {
        console.warn("Script breakdown warning:", e);
      }
      setTotalScenesNum(scenes.length || 1);

      // If external APIs failed or returned empty, synthesize using 3D Canvas engine
      let scenesCount = scenes.length || 1;
      if (!videoUrl) {
        setStageText('Auto Failover: Generating 3D Movie via High-Performance Client Engine...');
        const result = await generate3DMovieVideo(
          prompt,
          settings,
          image,
          scenes,
          (prog, text, cScene, tScenes) => {
            setProgress(prog);
            setStageText(text);
            if (cScene) setCurrentSceneNum(cScene);
            if (tScenes) setTotalScenesNum(tScenes);
          }
        );
        videoUrl = result.videoUrl;
        scenesCount = result.scenesCount;
      }

      // 4. Create GeneratedVideo Object
      const newVideo: GeneratedVideo = {
        id: 'vid_' + Date.now(),
        title: prompt.slice(0, 45) + (prompt.length > 45 ? '...' : ''),
        prompt,
        style: settings.style,
        durationSeconds: settings.lengthSeconds,
        aspectRatio: settings.aspectRatio,
        quality: settings.quality,
        videoUrl: videoUrl,
        thumbnailUrl: image,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sourceType: 'image',
        sourceImage: image,
        scenesCount: scenesCount
      };

      const updatedList = [newVideo, ...savedVideos];
      saveVideosToStorage(updatedList);
      setCurrentVideoResult(newVideo);
    } catch (err: any) {
      console.error("Video Generation Error:", err);
      setErrorMessage(err.message || "API Key galat hai ya credit khatam hai, please check .env file");
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Tab 2 Prompt to Video Generation
  const handleGenerateFromPrompt = async (
    prompt: string,
    settings: GenerationSettings
  ) => {
    setErrorMessage(null);
    setIsGenerating(true);
    setProgress(2);
    setStageText('API Key & Credit Validation Checking...');

    const keys = checkApiKeyConfig();
    if (!keys.hasAnyKey) {
      setErrorMessage("API Key Missing! Please add your free key in .env file or Settings modal");
    }

    try {
      const customKeys = {
        hf: keys.hfToken || undefined,
        replicate: keys.repToken || undefined,
      };

      let videoUrl: string | null = null;
      let usedProvider = "AI Studio Pro Client Engine";

      // 1. Attempt Replicate / Auto API System
      try {
        setStageText('Connecting to Replicate API...');
        const autoRes = await fetch('/api/generate-video-auto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, customKeys })
        });

        const autoData = await parseResponseTextSafely(autoRes);
        if (autoData.success && autoData.videoUrl) {
          videoUrl = autoData.videoUrl;
          usedProvider = autoData.provider || "3 API Rotation System";
          setProgress(95);
          setStageText(`Generated via ${usedProvider}!`);
        } else {
          throw new Error(autoData.error || "Replicate credit khatam");
        }
      } catch (repErr: any) {
        console.warn("Replicate API skipped or credit exhausted:", repErr.message);
        setStageText("Replicate credit khatam, ab free HuggingFace se bana raha hun...");

        // 2. Fallback to Free HuggingFace API
        try {
          videoUrl = await generateWithHuggingFace(null, prompt, keys.hfToken);
          usedProvider = "HuggingFace (Free)";
          setProgress(95);
          setStageText("Generated via HuggingFace Free Endpoint!");
        } catch (hfErr: any) {
          console.warn("HuggingFace API fallback failed:", hfErr.message);
          setErrorMessage("API Key galat hai ya credit khatam hai, please check .env file");
        }
      }

      // 3. Fetch Multi-Scene Script Breakdown
      const scriptRes = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          style: settings.style,
          durationSeconds: settings.lengthSeconds,
          lang: settings.voiceoverLang
        })
      });

      let scenes: ScriptScene[] = [];
      try {
        const scriptData = await parseResponseTextSafely(scriptRes);
        scenes = scriptData.scenes || [];
      } catch (e) {
        console.warn("Script breakdown warning:", e);
      }
      setTotalScenesNum(scenes.length || 1);

      // If external APIs failed or returned empty, synthesize using 3D Canvas engine
      let scenesCount = scenes.length || 1;
      if (!videoUrl) {
        setStageText('Auto Failover: Generating 3D Pixar Animation Movie via Client Engine...');
        const result = await generate3DMovieVideo(
          prompt,
          settings,
          null,
          scenes,
          (prog, text, cScene, tScenes) => {
            setProgress(prog);
            setStageText(text);
            if (cScene) setCurrentSceneNum(cScene);
            if (tScenes) setTotalScenesNum(tScenes);
          }
        );
        videoUrl = result.videoUrl;
        scenesCount = result.scenesCount;
      }

      // 4. Create GeneratedVideo Object
      const newVideo: GeneratedVideo = {
        id: 'vid_' + Date.now(),
        title: prompt.slice(0, 45) + (prompt.length > 45 ? '...' : ''),
        prompt,
        style: settings.style,
        durationSeconds: settings.lengthSeconds,
        aspectRatio: settings.aspectRatio,
        quality: settings.quality,
        videoUrl: videoUrl,
        thumbnailUrl: '',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sourceType: 'prompt',
        scenesCount: scenesCount
      };

      const updatedList = [newVideo, ...savedVideos];
      saveVideosToStorage(updatedList);
      setCurrentVideoResult(newVideo);
    } catch (err: any) {
      console.error("Video Generation Error:", err);
      setErrorMessage(err.message || "API Key galat hai ya credit khatam hai, please check .env file");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteVideo = (id: string) => {
    const filtered = savedVideos.filter((v) => v.id !== id);
    saveVideosToStorage(filtered);
    if (currentVideoResult?.id === id) {
      setCurrentVideoResult(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      
      {/* Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedVideosCount={savedVideos.length}
        onOpenSettings={() => setSettingsModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-8">
        
        {/* API Error Box Banner */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl animate-fade-in">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-sm text-white">API Key / Generation Notice</p>
                <p className="text-rose-300 font-medium">{errorMessage}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSettingsModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Configure Keys</span>
              </button>
              <button
                onClick={() => setErrorMessage(null)}
                className="px-3 py-2 rounded-xl bg-rose-900/60 hover:bg-rose-900 text-rose-300 font-bold text-xs"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Render Views based on activeTab */}
        {activeTab === 'pricing' ? (
          <PricingView onSelectPlan={() => setActiveTab('img2vid')} />
        ) : activeTab === 'faq' ? (
          <FaqSeoView />
        ) : activeTab === 'my-videos' ? (
          <VideoGallery
            videos={savedVideos}
            onSelectVideo={(v) => setCurrentVideoResult(v)}
            onDeleteVideo={handleDeleteVideo}
          />
        ) : (
          <>
            {/* Hero Section */}
            <Hero />

            {/* Loading Screen during active video rendering */}
            {isGenerating ? (
              <LoadingScreen
                progress={progress}
                stageText={stageText}
                currentScene={currentSceneNum}
                totalScenes={totalScenesNum}
              />
            ) : (
              <div className="bg-[#18181b]/80 border border-[#27272a] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-md">
                
                {/* 2 BIG TABS (Image to Video vs Prompt to Video) */}
                <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-[#09090b] border border-[#27272a]">
                  
                  {/* Tab 1: Image to Video */}
                  <button
                    type="button"
                    onClick={() => setActiveGeneratorTab('img2vid')}
                    className={`flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 ${
                      activeGeneratorTab === 'img2vid'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-600/25 scale-[1.01]'
                        : 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
                    }`}
                  >
                    <ImageIcon className="w-5 h-5" />
                    <span>Image to Video</span>
                  </button>

                  {/* Tab 2: Prompt to Video */}
                  <button
                    type="button"
                    onClick={() => setActiveGeneratorTab('prompt2vid')}
                    className={`flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 ${
                      activeGeneratorTab === 'prompt2vid'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-600/25 scale-[1.01]'
                        : 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
                    }`}
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>Prompt to Video</span>
                  </button>
                </div>

                {/* Tab Forms */}
                {activeGeneratorTab === 'img2vid' ? (
                  <TabImageToVideo
                    onGenerate={handleGenerateFromImage}
                    isGenerating={isGenerating}
                  />
                ) : (
                  <TabPromptToVideo
                    onGenerate={handleGenerateFromPrompt}
                    isGenerating={isGenerating}
                  />
                )}

              </div>
            )}

            {/* Gallery of Saved Videos */}
            <VideoGallery
              videos={savedVideos}
              onSelectVideo={(v) => setCurrentVideoResult(v)}
              onDeleteVideo={handleDeleteVideo}
            />

            {/* FAQ Section on main page */}
            <FaqSeoView />

            {/* Bottom Status & Preview Banner */}
            <div className="w-full flex flex-col sm:flex-row items-center justify-between bg-[#18181b] px-6 py-4 rounded-2xl border border-[#27272a] gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#09090b] rounded-xl border border-[#27272a] flex items-center justify-center text-purple-400">
                  <Film className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Latest Generation Status</p>
                  <p className="text-[11px] text-zinc-400">
                    {savedVideos.length > 0
                      ? `Latest Video: "${savedVideos[0].title}" (${savedVideos[0].durationSeconds}s)`
                      : 'Aapki 3D Cartoon Movie yahan dikhegi...'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {savedVideos.length > 0 ? (
                  <button
                    onClick={() => setCurrentVideoResult(savedVideos[0])}
                    className="px-4 py-2 text-xs bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-md transition-all"
                  >
                    Play Latest Movie
                  </button>
                ) : (
                  <button className="px-4 py-2 text-xs bg-[#27272a] rounded-xl text-zinc-500 font-semibold cursor-not-allowed">
                    No Video Yet
                  </button>
                )}
              </div>
            </div>
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full px-8 py-4 bg-[#18181b] border-t border-[#27272a] text-[11px] text-zinc-500 flex flex-col sm:flex-row justify-between items-center gap-2">
        <p>© {new Date().getFullYear()} AI STUDIO PRO - Best Free AI Video Generator Alternative. No Watermark.</p>
        <div className="flex space-x-4 text-purple-400/80 font-medium">
          <span>#free ai video generator</span>
          <span>#img to video ai free</span>
          <span>#3d animation generator</span>
        </div>
      </footer>

      {/* Video Result & Download Modal */}
      {currentVideoResult && (
        <VideoResultModal
          video={currentVideoResult}
          onClose={() => setCurrentVideoResult(null)}
          onDelete={handleDeleteVideo}
        />
      )}

      {/* Settings Modal (Replicate & Fal API Keys) */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />

    </div>
  );
}
