import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles, ShieldCheck } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  keywords: string[];
}

const FAQS: FAQItem[] = [
  {
    question: "What is AI Studio Pro and how does the free ai video generator work?",
    answer: "AI Studio Pro is the leading free ai video generator and top Google AI Studio alternative. It transforms text prompts or uploaded images into full 3D Pixar & Disney style cartoon animation movies using advanced AI video synthesis algorithms.",
    keywords: ["free ai video generator", "google ai studio alternative"]
  },
  {
    question: "How do I convert img to video ai free without watermark?",
    answer: "Simply navigate to the 'Image to Video' tab, drag & drop your image, set your motion prompt and camera style, and click Generate. Our img to video ai free engine creates high-definition 1080p and 4K animation videos with 100% free direct MP4 downloads and no watermarks.",
    keywords: ["img to video ai free"]
  },
  {
    question: "Can I generate long 5-minute prompt to cartoon movie animations?",
    answer: "Yes! AI Studio Pro features a unique Long Movie Mode. When you select video lengths up to 300 seconds (5 minutes), our engine breaks down your prompt into continuous 5-second scene storyboards, maintains character and lighting continuity across scenes, and stitches them together seamlessly.",
    keywords: ["prompt to cartoon movie", "3d animation generator"]
  },
  {
    question: "Why is AI Studio Pro the best google ai studio alternative?",
    answer: "Unlike standard text-to-video generators, AI Studio Pro provides direct client-side stitching, multi-scene continuity, localized voiceovers in Urdu, Hindi, and English, customizable camera angles (Zoom, Orbit, Pan), and zero mandatory subscription fees.",
    keywords: ["google ai studio alternative", "3d animation generator"]
  },
  {
    question: "Are the generated 3D animation videos free to download and share?",
    answer: "Yes, 100%! Every generated 3D cartoon video features a direct green 'Download HD Video - Free' button that saves the MP4/WebM file straight to your phone or computer for instant uploading to TikTok, YouTube Reels, or Instagram.",
    keywords: ["free ai video generator", "3d animation generator"]
  }
];

export const FaqSeoView: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-10">
      
      {/* Title */}
      <div className="text-center space-y-3">
        <span className="px-3 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-xs font-bold uppercase tracking-wider">
          Frequently Asked Questions
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Everything You Need to Know About AI Studio Pro
        </h2>
        <p className="text-zinc-400 text-xs sm:text-sm">
          Learn how to generate free 3D cartoon movies from images and prompts.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-[#18181b] border border-[#27272a] rounded-2xl overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-zinc-100 hover:text-purple-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span>{faq.question}</span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-zinc-400 transition-transform duration-200 flex-shrink-0 ${
                    isOpen ? 'rotate-180 text-purple-400' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-[#27272a]/50 pt-3 space-y-2">
                  <p>{faq.answer}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {faq.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 text-[10px] font-semibold border border-purple-800/50"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer SEO Indexing Text */}
      <div className="p-6 rounded-2xl bg-[#09090b] border border-[#27272a] text-xs text-zinc-500 space-y-3 leading-relaxed">
        <div className="flex items-center gap-2 font-bold text-zinc-400">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>SEO Metadata & Keywords Index</span>
        </div>
        <p>
          AI Studio Pro is an advanced <strong>free ai video generator</strong> and <strong>img to video ai free</strong> platform designed for creators, animators, and digital storytellers. As the premier <strong>google ai studio alternative</strong>, our platform offers a state-of-the-art <strong>prompt to cartoon movie</strong> and <strong>3d animation generator</strong> engine capable of rendering Pixar 3D HD, Disney Cartoon, and Claymation movies in 1080p and 4K Ultra HD resolution without watermarks.
        </p>
        <p className="text-[11px] text-zinc-600">
          © {new Date().getFullYear()} AI Studio Pro Inc. All rights reserved. Optimized for high-speed rendering across Pakistan, India, USA, and worldwide.
        </p>
      </div>

    </div>
  );
};
