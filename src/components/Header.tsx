import React, { useState } from 'react';
import { Sparkles, Video, Crown, Settings, Menu, X, HelpCircle, Film } from 'lucide-react';
import { TabType } from '../types';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  savedVideosCount: number;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  savedVideosCount,
  onOpenSettings,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'img2vid', label: 'Generator', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'my-videos', label: 'My Videos', icon: <Film className="w-4 h-4" />, badge: savedVideosCount },
    { id: 'pricing', label: 'Pricing', icon: <Crown className="w-4 h-4 text-amber-400" /> },
    { id: 'faq', label: 'FAQ & SEO', icon: <HelpCircle className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#09090b]/90 backdrop-blur-md border-b border-[#27272a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left Side Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setActiveTab('img2vid')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 p-0.5 shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300">
            <div className="w-full h-full bg-[#09090b] rounded-[10px] flex items-center justify-center">
              <Video className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-white via-zinc-200 to-purple-400 bg-clip-text text-transparent">
                AI STUDIO PRO
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                3D Movie
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">Google AI Studio Alternative</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-[#18181b] p-1.5 rounded-xl border border-[#27272a]">
          {navItems.map((item) => {
            const isActive = activeTab === item.id || (activeTab === 'prompt2vid' && item.id === 'img2vid');
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md shadow-purple-500/20'
                    : 'text-zinc-400 hover:text-white hover:bg-[#27272a]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-purple-500/30 text-purple-300 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-[#18181b] text-zinc-300 hover:text-white hover:bg-[#27272a] border border-[#27272a] transition-colors relative group"
            title="Settings & API Keys"
          >
            <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-semibold shadow-lg shadow-purple-600/25 transition-all hover:scale-[1.02]"
          >
            <Crown className="w-4 h-4 text-amber-300" />
            <span>Go Unlimited</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-[#18181b] text-zinc-300 border border-[#27272a]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#27272a] bg-[#09090b] px-4 py-3 space-y-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'text-zinc-300 bg-[#18181b]'
                }`}
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-purple-950 text-purple-300 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
