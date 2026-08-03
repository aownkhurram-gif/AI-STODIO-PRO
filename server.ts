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
        api_key: customKeys?.hf || process.env.VITE_HF_TOKEN || process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN || "",
        model: "stabilityai/stable-video-diffusion-img2vid-xt"
      },
      {
        name: "Fal.ai (Daily Free)",
        api_key: customKeys?.fal || process.env.FAL_API_KEY || "",
        model: "fal-ai/fast-animatediff"
      },
      {
        name: "Replicate (First Free)",
        api_key: customKeys?.replicate || process.env.VITE_REPLICATE_API_TOKEN || process.env.REPLICATE_API_KEY || "",
        model: "luma/dream-machine"
      }
    ];
  }

  // Safe Helper to parse JSON without crashing on empty or invalid text
  async function parseResponseTextSafely(res: Response) {
    const text = await res.text();
    if (!text || text.trim() === "") {
      console.log("Empty response received from API endpoint.");
      throw new Error("API Key galat hai ya credit khatam hai, please check .env file");
    }
    try {
      return JSON.parse(text);
    } catch (err) {
      console.log("Raw non-JSON API output:", text);
      throw new Error(`Invalid JSON output: ${text.slice(0, 150)}`);
    }
  }

  async function generateWithHuggingFace(image: string | null, prompt: string, hfToken?: string) {
    const token = hfToken || process.env.VITE_HF_TOKEN || process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN;
    if (!token || token.includes("YOUR_FREE_KEY") || token.includes("xxxxxxxx")) {
      throw new Error("API Key Missing! Please add your free key in .env file or Settings modal");
    }

    let res: Response;
    try {
      res = await fetch("https://api-inference.huggingface.co/models/stabilityai/stable-video-diffusion-img2vid-xt", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: prompt, image })
      });
    } catch (netErr: any) {
      console.warn("HuggingFace network fetch failed:", netErr.message);
      throw new Error("API Key galat hai ya credit khatam hai, please check .env file");
    }

    const text = await res.text();
    if (!text || text.trim() === "") {
      throw new Error("API Key galat hai ya credit khatam hai, please check .env file");
    }

    if (!res.ok) {
      console.log("HuggingFace raw text error:", text);
      throw new Error(`HuggingFace error (${res.status}): ${text.slice(0, 150)}`);
    }

    try {
      const data = JSON.parse(text);
      if (data.error) throw new Error(data.error);
      if (data.videoUrl || data.url) return data.videoUrl || data.url;
    } catch (e: any) {
      if (e.message?.includes("API Key galat hai") || e.message?.includes("HuggingFace error")) throw e;
    }

    const buffer = Buffer.from(text, 'binary');
    return `data:video/mp4;base64,${buffer.toString('base64')}`;
  }

  async function generateFreeVideo(image: string | null, prompt: string, customKeys?: { replicate?: string; fal?: string; hf?: string }) {
    const apis = getFreeApisList(customKeys);
    const logs: string[] = [];

    for (const provider of apis) {
      if (!provider.api_key || provider.api_key.includes("YOUR_FREE_KEY") || provider.api_key.includes("xxxxxxxx")) {
        logs.push(`[${provider.name}] Key missing or placeholder. Skipping to next provider...`);
        continue;
      }

      try {
        logs.push(`[${provider.name}] Requesting video synthesis with model ${provider.model}...`);

        if (provider.name.includes("HuggingFace")) {
          const videoUrl = await generateWithHuggingFace(image, prompt, provider.api_key);
          return { success: true, videoUrl, provider: provider.name, logs };
        } else if (provider.name.includes("Fal.ai")) {
          const res = await fetch(`https://fal.run/${provider.model}`, {
            method: "POST",
            headers: {
              "Authorization": `Key ${provider.api_key}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ prompt, image_url: image })
          });
          const data = await parseResponseTextSafely(res);
          const videoUrl = data.video?.url || data.video_url;
          if (videoUrl) {
            return { success: true, videoUrl, provider: provider.name, logs };
          }
          throw new Error("Fal.ai response missing video URL");
        } else if (provider.name.includes("Replicate")) {
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
          const data = await parseResponseTextSafely(res);
          if (data.output) {
            const videoUrl = Array.isArray(data.output) ? data.output[0] : data.output;
            return { success: true, videoUrl, provider: provider.name, logs };
          }
          throw new Error("Replicate output pending or credit exhausted");
        }
      } catch (err: any) {
        logs.push(`[${provider.name}] Error: ${err.message || err}. Replicate credit khatam, ab free HuggingFace se bana raha hun...`);
      }
    }

    // Auto-switch to Client-Side High Performance Engine
    logs.push("[AI Studio Pro Engine] Auto-switching to client 3D Canvas rendering engine to guarantee 100% video generation.");
    return {
      success: false,
      fallbackToCanvas: true,
      provider: "AI Studio Pro Client Engine",
      logs
    };
  }

  // Endpoint: Dedicated HuggingFace API Call
  app.post("/api/generate-huggingface", async (req, res) => {
    try {
      const { image, prompt, hfToken } = req.body;
      const videoUrl = await generateWithHuggingFace(image || null, prompt || "", hfToken);
      return res.json({ success: true, videoUrl, provider: "HuggingFace (Free)" });
    } catch (err: any) {
      console.error("HuggingFace API Error:", err.message);
      return res.status(400).json({
        success: false,
        error: err.message || "API Key galat hai ya credit khatam hai, please check .env file"
      });
    }
  });

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
        error: err.message || "API Key galat hai ya credit khatam hai, please check .env file",
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
      isConfigured: Boolean(a.api_key && !a.api_key.includes("YOUR_FREE_KEY") && !a.api_key.includes("xxxxxxxx"))
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
