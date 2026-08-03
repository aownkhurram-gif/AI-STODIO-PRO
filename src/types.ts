export type TabType = 'img2vid' | 'prompt2vid' | 'my-videos' | 'pricing' | 'faq';

export type VideoStyle = 
  | 'Pixar 3D HD'
  | 'Disney Cartoon'
  | 'Anime Cartoon'
  | 'Realistic Animation'
  | 'Claymation'
  | '3D Long Movie Story';

export type AspectRatio = '16:9' | '9:16' | '1:1' | '2.35:1';

export type Quality = 'HD 720p' | 'Full HD 1080p' | '4K Ultra HD';

export type CameraMovement = 
  | 'Static'
  | 'Zoom In'
  | 'Zoom Out'
  | 'Pan Left'
  | 'Pan Right'
  | 'Orbit';

export type VoiceoverLanguage = 'No Voice' | 'Urdu' | 'English' | 'Hindi';

export interface GenerationSettings {
  style: VideoStyle;
  lengthSeconds: number; // 3 to 300
  aspectRatio: AspectRatio;
  quality: Quality;
  cameraMovement: CameraMovement;
  voiceoverLang: VoiceoverLanguage;
  bgMusic: boolean;
}

export interface GeneratedVideo {
  id: string;
  title: string;
  prompt: string;
  style: VideoStyle;
  durationSeconds: number;
  aspectRatio: AspectRatio;
  quality: Quality;
  videoUrl: string;
  thumbnailUrl: string;
  createdAt: string;
  sourceType: 'image' | 'prompt';
  sourceImage?: string;
  scenesCount: number;
}

export interface SampleImage {
  id: string;
  title: string;
  style: VideoStyle;
  url: string;
}

export interface ScriptScene {
  sceneNumber: number;
  description: string;
  cameraNote: string;
  voiceoverText?: string;
  duration: number;
}
