import { AspectRatio, CameraMovement, GenerationSettings, ScriptScene, VideoStyle } from '../types';

export interface VideoProgressCallback {
  (progress: number, stageText: string, currentScene?: number, totalScenes?: number): void;
}

/**
 * Gets target width and height based on aspect ratio and quality setting.
 */
export function getResolutionDimensions(aspectRatio: AspectRatio, quality: string) {
  let baseWidth = 1280;
  let baseHeight = 720;

  if (quality === 'Full HD 1080p') {
    baseWidth = 1920;
    baseHeight = 1080;
  } else if (quality === '4K Ultra HD') {
    baseWidth = 3840;
    baseHeight = 2160;
  }

  switch (aspectRatio) {
    case '9:16':
      return { width: baseHeight, height: baseWidth };
    case '1:1':
      return { width: baseHeight, height: baseHeight };
    case '2.35:1':
      return { width: baseWidth, height: Math.round(baseWidth / 2.35) };
    case '16:9':
    default:
      return { width: baseWidth, height: baseHeight };
  }
}

/**
 * Generates audio track for the video using Web Audio API (cinematic music + optional narration synthesis).
 */
function createAudioStream(
  audioCtx: AudioContext,
  durationSeconds: number,
  settings: GenerationSettings,
  scenes: ScriptScene[]
): { mediaStream: MediaStream; stop: () => void } {
  const destination = audioCtx.createMediaStreamDestination();
  const masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0.35, audioCtx.currentTime);
  masterGain.connect(destination);

  let isPlaying = true;
  const activeSources: (OscillatorNode | AudioBufferSourceNode)[] = [];

  // Background Music Generator if enabled
  if (settings.bgMusic) {
    const musicInterval = setInterval(() => {
      if (!isPlaying || audioCtx.state === 'closed') {
        clearInterval(musicInterval);
        return;
      }
      
      const now = audioCtx.currentTime;
      // Soft Pixar-style chord progression
      const chords = [
        [261.63, 329.63, 392.00, 523.25], // C major
        [220.00, 261.63, 329.63, 440.00], // A minor
        [174.61, 220.00, 261.63, 349.23], // F major
        [196.00, 246.94, 293.66, 392.00]  // G major
      ];
      
      const chord = chords[Math.floor((now % 16) / 4)];
      chord.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.04 - idx * 0.008, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 2.0);
        activeSources.push(osc);
      });
    }, 1500);
  }

  // Optional Voiceover Narration Tone/Synthesis
  if (settings.voiceoverLang && settings.voiceoverLang !== 'No Voice') {
    const speechInterval = setInterval(() => {
      if (!isPlaying || audioCtx.state === 'closed') {
        clearInterval(speechInterval);
        return;
      }
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      
      // Friendly voice pitch simulation
      const pitch = settings.voiceoverLang === 'Urdu' ? 240 : settings.voiceoverLang === 'Hindi' ? 250 : 220;
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(pitch * 1.15, now + 0.3);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.1);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.7);
      activeSources.push(osc);
    }, 4500);
  }

  return {
    mediaStream: destination.stream,
    stop: () => {
      isPlaying = false;
      activeSources.forEach((s) => {
        try {
          s.stop();
        } catch (_) {}
      });
    }
  };
}

/**
 * Main function to generate a multi-scene long 3D movie video file.
 */
export async function generate3DMovieVideo(
  prompt: string,
  settings: GenerationSettings,
  sourceImage: string | null,
  scenes: ScriptScene[],
  onProgress: VideoProgressCallback
): Promise<{ videoUrl: string; duration: number; scenesCount: number }> {
  const { width, height } = getResolutionDimensions(settings.aspectRatio, settings.quality);
  
  // Create offscreen render canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error("Could not initialize 2D rendering context.");

  // Pre-load source image if provided
  let loadedImage: HTMLImageElement | null = null;
  if (sourceImage) {
    onProgress(5, "Source Image Load Ho Rahi Hai...", 1, scenes.length);
    loadedImage = new Image();
    loadedImage.crossOrigin = 'anonymous';
    await new Promise((resolve) => {
      if (!loadedImage) return resolve(false);
      loadedImage.onload = () => resolve(true);
      loadedImage.onerror = () => resolve(false);
      loadedImage.src = sourceImage;
    });
  }

  // Setup Canvas Stream + Audio Stream + MediaRecorder
  const canvasStream = canvas.captureStream(30); // 30 FPS
  
  let audioCtx: AudioContext | null = null;
  let audioStreamObj: { mediaStream: MediaStream; stop: () => void } | null = null;
  
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      audioStreamObj = createAudioStream(audioCtx, settings.lengthSeconds, settings, scenes);
      
      audioStreamObj.mediaStream.getAudioTracks().forEach((track) => {
        canvasStream.addTrack(track);
      });
    }
  } catch (e) {
    console.warn("Audio Context setup skipped or unsupported:", e);
  }

  // MediaRecorder setup with supported mimeType
  let options: MediaRecorderOptions = { mimeType: 'video/webm;codecs=vp9' };
  if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
    options = { mimeType: 'video/webm;codecs=vp8' };
    if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
      options = { mimeType: 'video/webm' };
      if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
        options = {};
      }
    }
  }

  const mediaRecorder = new MediaRecorder(canvasStream, options);
  const chunks: Blob[] = [];

  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  const recordingPromise = new Promise<string>((resolve, reject) => {
    mediaRecorder.onstop = () => {
      try {
        const mime = options.mimeType || 'video/webm';
        const blob = new Blob(chunks, { type: mime });
        const url = URL.createObjectURL(blob);
        resolve(url);
      } catch (err) {
        reject(err);
      }
    };
    mediaRecorder.onerror = (e: any) => reject(e.error || e);
  });

  mediaRecorder.start(100);

  // LONG VIDEO MULTI-SCENE CONTINUITY RENDER LOOP
  const fps = 30;
  const sceneDuration = 5; // 5s per scene
  const framesPerScene = sceneDuration * fps;
  const totalScenes = scenes.length;
  const totalFrames = totalScenes * framesPerScene;

  // Visual parameters for style
  const styleHueMap: Record<VideoStyle, { bg1: string; bg2: string; accent: string }> = {
    'Pixar 3D HD': { bg1: '#1e1b4b', bg2: '#312e81', accent: '#a855f7' },
    'Disney Cartoon': { bg1: '#0284c7', bg2: '#0369a1', accent: '#f43f5e' },
    'Anime Cartoon': { bg1: '#4c1d95', bg2: '#581c87', accent: '#ec4899' },
    'Realistic Animation': { bg1: '#0f172a', bg2: '#1e293b', accent: '#3b82f6' },
    'Claymation': { bg1: '#78350f', bg2: '#451a03', accent: '#f59e0b' },
    '3D Long Movie Story': { bg1: '#111827', bg2: '#1f2937', accent: '#10b981' }
  };

  const styleColors = styleHueMap[settings.style] || styleHueMap['Pixar 3D HD'];

  let globalFrame = 0;

  for (let s = 0; s < totalScenes; s++) {
    const currentScene = scenes[s] || {
      sceneNumber: s + 1,
      description: `Scene ${s + 1}`,
      cameraNote: settings.cameraMovement,
      duration: 5
    };

    const sceneStartFrame = s * framesPerScene;

    for (let f = 0; f < framesPerScene; f++) {
      globalFrame++;
      const sceneProgress = f / framesPerScene; // 0.0 to 1.0
      const overallProgressPercent = Math.min(99, Math.round((globalFrame / totalFrames) * 90) + 5);

      if (f % 10 === 0) {
        onProgress(
          overallProgressPercent,
          `Rendering Scene ${s + 1}/${totalScenes}: "${currentScene.description.slice(0, 35)}..."`,
          s + 1,
          totalScenes
        );
        // Allow UI to breathe
        await new Promise((r) => setTimeout(r, 8));
      }

      // CLEAR CANVAS
      ctx.clearRect(0, 0, width, height);

      // CAMERA MOVEMENT TRANSFORMATIONS
      ctx.save();
      const cameraType = currentScene.cameraNote || settings.cameraMovement;
      let scale = 1.0;
      let transX = 0;
      let transY = 0;

      const t = (f + sceneStartFrame) * 0.02;

      switch (cameraType) {
        case 'Zoom In':
          scale = 1.0 + sceneProgress * 0.18;
          break;
        case 'Zoom Out':
          scale = 1.18 - sceneProgress * 0.18;
          break;
        case 'Pan Left':
          transX = -sceneProgress * (width * 0.12);
          break;
        case 'Pan Right':
          transX = sceneProgress * (width * 0.12);
          break;
        case 'Orbit':
          transX = Math.sin(t) * 20;
          transY = Math.cos(t) * 15;
          scale = 1.02 + Math.sin(t * 0.5) * 0.03;
          break;
        case 'Static':
        default:
          break;
      }

      // Apply Camera Transform
      ctx.translate(width / 2, height / 2);
      ctx.scale(scale, scale);
      ctx.translate(-width / 2 + transX, -height / 2 + transY);

      // BACKGROUND - DYNAMIC 3D GRADIENT WITH CONTINUITY
      const grad = ctx.createRadialGradient(
        width * 0.5 + Math.sin(t * 0.5) * 100,
        height * 0.4 + Math.cos(t * 0.5) * 80,
        50,
        width * 0.5,
        height * 0.5,
        width * 0.8
      );
      grad.addColorStop(0, styleColors.bg2);
      grad.addColorStop(1, styleColors.bg1);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // DRAW SOURCE IMAGE IF AVAILABLE WITH 3D MOTION & DEPTH
      if (loadedImage) {
        const imgAspect = loadedImage.width / loadedImage.height;
        const canvasAspect = width / height;
        let dw = width;
        let dh = height;
        if (imgAspect > canvasAspect) {
          dh = height;
          dw = height * imgAspect;
        } else {
          dw = width;
          dh = width / imgAspect;
        }
        const dx = (width - dw) / 2 + Math.sin(t) * 15;
        const dy = (height - dh) / 2 + Math.cos(t * 0.8) * 10;

        ctx.globalAlpha = 0.88;
        ctx.drawImage(loadedImage, dx, dy, dw, dh);
        ctx.globalAlpha = 1.0;
      }

      // 3D ENVIRONMENT ELEMENTS & PARTICLES (Pixar / Disney / Anime style elements)
      // Floating 3D Sparkles & Bokeh
      for (let p = 0; p < 30; p++) {
        const px = (Math.sin(p * 99 + t * 0.4) * 0.5 + 0.5) * width;
        const py = ((p * 45 + globalFrame * 1.5) % height);
        const radius = Math.sin(p + t) * 6 + 10;

        const pGrad = ctx.createRadialGradient(px, py, 0, px, py, radius);
        pGrad.addColorStop(0, styleColors.accent);
        pGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3D ANIMATED HERO CHARACTER ILLUMINATION (Continuity Sphere / Figure)
      const heroX = width * 0.5 + Math.sin(t * 1.2) * 60;
      const heroY = height * 0.58 + Math.cos(t * 1.5) * 20;
      const heroRadius = Math.min(width, height) * 0.16;

      // Volumetric Glow Shadow
      const glowGrad = ctx.createRadialGradient(
        heroX,
        heroY + heroRadius * 0.8,
        10,
        heroX,
        heroY + heroRadius * 0.8,
        heroRadius * 1.8
      );
      glowGrad.addColorStop(0, 'rgba(0,0,0,0.4)');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.ellipse(heroX, heroY + heroRadius * 0.85, heroRadius * 1.2, heroRadius * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();

      // 3D Character Head/Body Core
      const charGrad = ctx.createRadialGradient(
        heroX - heroRadius * 0.3,
        heroY - heroRadius * 0.3,
        heroRadius * 0.1,
        heroX,
        heroY,
        heroRadius
      );
      charGrad.addColorStop(0, '#ffffff');
      charGrad.addColorStop(0.3, styleColors.accent);
      charGrad.addColorStop(1, '#1e1b4b');

      ctx.fillStyle = charGrad;
      ctx.beginPath();
      ctx.arc(heroX, heroY, heroRadius, 0, Math.PI * 2);
      ctx.fill();

      // Expressive 3D Animated Eyes (Blinking & Looking)
      const isBlinking = (globalFrame % 90) > 82;
      const eyeOffset = heroRadius * 0.35;
      const eyeY = heroY - heroRadius * 0.15;

      ctx.fillStyle = '#ffffff';
      if (!isBlinking) {
        // Left Eye
        ctx.beginPath();
        ctx.arc(heroX - eyeOffset, eyeY, heroRadius * 0.22, 0, Math.PI * 2);
        ctx.fill();
        // Right Eye
        ctx.beginPath();
        ctx.arc(heroX + eyeOffset, eyeY, heroRadius * 0.22, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        const pupilDx = Math.sin(t * 2) * 5;
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(heroX - eyeOffset + pupilDx, eyeY, heroRadius * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(heroX + eyeOffset + pupilDx, eyeY, heroRadius * 0.1, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Blinking arc
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(heroX - eyeOffset, eyeY, heroRadius * 0.18, 0, Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(heroX + eyeOffset, eyeY, heroRadius * 0.18, 0, Math.PI);
        ctx.stroke();
      }

      // Smiling mouth
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(heroX, heroY + heroRadius * 0.15, heroRadius * 0.3, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();

      // SCENE OVERLAY TITLE / SUBTITLE
      ctx.restore(); // Restore camera transform for UI overlay

      // Subtitle Bar (Scene Narrative)
      const barHeight = 60;
      ctx.fillStyle = 'rgba(9, 9, 11, 0.75)';
      ctx.fillRect(0, height - barHeight - 20, width, barHeight);

      ctx.fillStyle = '#f4f4f5';
      ctx.font = `600 ${Math.max(16, Math.round(width * 0.022))}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const sceneText = `Scene ${s + 1}/${totalScenes}: ${currentScene.description}`;
      ctx.fillText(
        sceneText.length > 70 ? sceneText.slice(0, 70) + '...' : sceneText,
        width / 2,
        height - barHeight / 2 - 20
      );

      // AI Studio Pro Watermark-Free Badge in corner
      ctx.fillStyle = 'rgba(147, 51, 234, 0.85)';
      ctx.font = `bold ${Math.max(12, Math.round(width * 0.015))}px system-ui, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(`✨ AI STUDIO PRO 3D MOVIE`, 20, 30);
    }
  }

  // STOP RECORDING & AUDIO
  onProgress(98, "Processing Final Video File & Stitching HD Audio...", totalScenes, totalScenes);
  mediaRecorder.stop();
  if (audioStreamObj) audioStreamObj.stop();
  if (audioCtx) audioCtx.close();

  const videoUrl = await recordingPromise;
  onProgress(100, "Movie Ready!", totalScenes, totalScenes);

  return {
    videoUrl,
    duration: settings.lengthSeconds,
    scenesCount: totalScenes
  };
}
