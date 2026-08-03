import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));
  const PORT = 3000;

  // Initialize Gemini AI SDK (Server-Side)
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey
    ? new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      })
    : null;

  // API Route: Enhance Prompt ("Prompt ko AI se Behtar Karo")
  app.post("/api/enhance-prompt", async (req, res) => {
    try {
      const { prompt, style, lang } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      if (!ai) {
        // Fallback enhancement if API key not present
        const enhanced = `[Enhanced Pixar 3D Cinematic] ${prompt}. Stylized high-detail 3D cartoon animation, volumetric soft lighting, vibrant color palette, expressive animated eyes, subsurface scattering, 8k resolution, cinematic camera depth of field.`;
        return res.json({ enhancedPrompt: enhanced });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `You are a master 3D animation director at Pixar & Disney. The user has provided a short prompt idea: "${prompt}".
Target Animation Style: ${style || 'Pixar 3D HD'}.
Target Language context: ${lang || 'English'}.

Task: Expand and enhance this prompt into an ultra-vivid, highly detailed 3D cartoon scene description suitable for AI video generation. Include details about lighting, camera angle, character expressions, color palette, texture, and motion.
Keep it under 90 words, direct, concise, and optimized for 3D cartoon video synthesis.
Output ONLY the enhanced prompt string.`,
      });

      const enhancedText = response.text?.trim() || prompt;
      return res.json({ enhancedPrompt: enhancedText });
    } catch (error: any) {
      console.error("Enhance prompt error:", error);
      return res.status(500).json({ error: error.message || "Failed to enhance prompt" });
    }
  });

  // API Route: Generate Long Movie Script / Storyboard Breakdown
  app.post("/api/generate-script", async (req, res) => {
    try {
      const { prompt, style, durationSeconds, lang } = req.body;
      const totalScenes = Math.ceil((durationSeconds || 15) / 5);

      if (!ai) {
        // Generate fallback multi-scene script
        const scenes = [];
        for (let i = 1; i <= totalScenes; i++) {
          scenes.push({
            sceneNumber: i,
            description: `Scene ${i}/${totalScenes}: ${prompt} - Part ${i} of 3D animated movie continuation.`,
            cameraNote: i % 2 === 0 ? "Slow Zoom In" : "Pan Right",
            voiceoverText: lang && lang !== 'No Voice' ? `Part ${i} of the 3D cartoon story.` : undefined,
            duration: 5,
          });
        }
        return res.json({ scenes });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Break down the following animation idea into ${totalScenes} continuous 5-second scenes for a long 3D movie story.
User Idea: "${prompt}"
Style: ${style || 'Pixar 3D HD'}
Language for Voiceover: ${lang || 'English'}

For each scene (from 1 to ${totalScenes}), provide JSON format array:
[
  {
    "sceneNumber": 1,
    "description": "Visual scene description...",
    "cameraNote": "Camera movement like Zoom In, Pan Left, etc.",
    "voiceoverText": "Narrator line in ${lang || 'English'}"
  }
]
Output ONLY valid JSON array. No markdown formatting or extra code block tags.`,
      });

      let scenes = [];
      try {
        const cleanedText = (response.text || '')
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
        scenes = JSON.parse(cleanedText);
      } catch (e) {
        console.warn("Script parsing failed, using fallback script:", e);
        for (let i = 1; i <= totalScenes; i++) {
          scenes.push({
            sceneNumber: i,
            description: `Scene ${i}: Continuation of ${prompt}`,
            cameraNote: "Cinematic Zoom",
            voiceoverText: lang && lang !== 'No Voice' ? `Chapter ${i}` : undefined,
            duration: 5,
          });
        }
      }

      return res.json({ scenes });
    } catch (error: any) {
      console.error("Script generation error:", error);
      return res.status(500).json({ error: error.message || "Failed to generate script" });
    }
  });

  // FREE CREDIT LOGIC - 3 API ROTATION SYSTEM
// Agar ek API ka credit khatam ho jaye to dusri auto chale

interface ApiProvider {
  name: string;
  api_key: string;
  model: string;
}

function getFreeApisList(customKeys?: { replicate?: string; fal?: string; hf?: string }): ApiProvider[] {
  return [
    {
      name: "HuggingFace (Unlimited Free)",
      api_key: customKeys?.hf || process.env.HUGGINGFACE_API_KEY || "hf_YOUR_FREE_KEY", // huggingface.co se free
      model: "stabilityai/stable-video-diffusion-img2vid-xt"
    },
    {
      name: "Fal.ai (Daily Free)",
      api_key: customKeys?.fal || process.env.FAL_API_KEY || "fal_YOUR_FREE_KEY", // fal.ai se $1 daily free
      model: "fal-ai/fast-animatediff"
    },
    {
      name: "Replicate (First Free)",
      api_key: customKeys?.replicate || process.env.REPLICATE_API_KEY || "r8_YOUR_FREE_KEY", // replicate.com se $10 free
      model: "luma/dream-machine"
    }
  ];
}

async function generateFreeVideo(image: string | null, prompt: string, customKeys?: { replicate?: string; fal?: string; hf?: string }) {
  const apis = getFreeApisList(customKeys);
  const logs: string[] = [];

  for (const provider of apis) {
    // Check if key is a placeholder or empty
    if (!provider.api_key || provider.api_key.includes("YOUR_FREE_KEY")) {
      logs.push(`[${provider.name}] Key missing or placeholder. Skipping to next free provider...`);
      continue;
    }

    try {
      logs.push(`[${provider.name}] Requesting video synthesis with model ${provider.model}...`);

      if (provider.name.includes("HuggingFace")) {
        // HuggingFace Inference Call
        const res = await fetch(`https://api-inference.huggingface.co/models/${provider.model}`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${provider.api_key}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ inputs: prompt, image })
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`HuggingFace HTTP ${res.status}: ${errText.slice(0, 100)}`);
        }
        const blob = await res.blob();
        const buffer = await blob.arrayBuffer();
        const base64Video = `data:video/mp4;base64,${Buffer.from(buffer).toString('base64')}`;
        return { success: true, videoUrl: base64Video, provider: provider.name, logs };
      } else if (provider.name.includes("Fal.ai")) {
        // Fal.ai Inference Call
        const res = await fetch(`https://fal.run/${provider.model}`, {
          method: "POST",
          headers: {
            "Authorization": `Key ${provider.api_key}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ prompt, image_url: image })
        });
        if (!res.ok) {
          throw new Error(`Fal.ai HTTP ${res.status}`);
        }
        const data = await res.json();
        const videoUrl = data.video?.url || data.video_url;
        if (videoUrl) {
          return { success: true, videoUrl, provider: provider.name, logs };
        }
        throw new Error("Fal.ai response missing video URL");
      } else if (provider.name.includes("Replicate")) {
        // Replicate Inference Call
        const res = await fetch("https://api.replicate.com/v1/predictions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${provider.api_key}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            version: "stability-ai/stable-video-diffusion-img2vid-xt",
            input: { input_image: image, prompt }
          })
        });
        if (!res.ok) {
          throw new Error(`Replicate HTTP ${res.status}`);
        }
        const data = await res.json();
        if (data.output) {
          const videoUrl = Array.isArray(data.output) ? data.output[0] : data.output;
          return { success: true, videoUrl, provider: provider.name, logs };
        }
        throw new Error("Replicate output pending or quota exceeded");
      }
    } catch (err: any) {
      logs.push(`[${provider.name}] Failed or credit exhausted: ${err.message || err}. Auto switching...`);
    }
  }

  // If all 3 external APIs fail or are unconfigured, auto-switch to Client-Side High Performance Engine
  logs.push("[AI Studio Pro Engine] Auto-switching to client 3D Canvas rendering engine to guarantee 100% video generation.");
  return {
    success: false,
    fallbackToCanvas: true,
    provider: "AI Studio Pro Client Engine",
    logs
  };
}

  // API Endpoint: 3 API Rotation Video Auto Generator
  app.post("/api/generate-video-auto", async (req, res) => {
    try {
      const { image, prompt, customKeys } = req.body;
      const result = await generateFreeVideo(image || null, prompt || "", customKeys);
      return res.json(result);
    } catch (err: any) {
      console.error("3 API Rotation Error:", err);
      return res.status(500).json({
        success: false,
        fallbackToCanvas: true,
        error: err.message,
        provider: "AI Studio Pro Client Engine"
      });
    }
  });

  // API Endpoint: Get Status of 3 Free API Rotations
  app.get("/api/free-apis-status", (req, res) => {
    const apis = getFreeApisList();
    const status = apis.map(a => ({
      name: a.name,
      model: a.model,
      isConfigured: Boolean(a.api_key && !a.api_key.includes("YOUR_FREE_KEY"))
    }));
    return res.json({ apis: status });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Studio Pro Server running on http://localhost:${PORT}`);
  });
}

startServer();
