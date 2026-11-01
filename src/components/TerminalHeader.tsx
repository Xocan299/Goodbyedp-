import React from 'react';
import { 
  Terminal, 
  Cpu, 
  Layers, 
  Github, 
  Activity, 
  FileCode2, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Tv, 
  Palette,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { ThemeType, PresetConfig } from '../types/terminal';

interface TerminalHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activePreset: PresetConfig;
  isEngineRunning: boolean;
  theme: ThemeType;
  setTheme: (t: ThemeType) => void;
  crtEffect: boolean;
  setCrtEffect: (val: boolean) => void;
  isMuted: boolean;
  toggleMute: () => void;
  lastPingMs: number | null;
}

export const TerminalHeader: React.FC<TerminalHeaderProps> = ({
  activeTab,
  setActiveTab,
  activePreset,
  isEngineRunning,
  theme,
  setTheme,
  crtEffect,
  setCrtEffect,
  isMuted,
  toggleMute,
  lastPingMs
}) => {
  const themes: { id: ThemeType; label: string; color: string }[] = [
    { id: 'green', label: 'Matrix Yeşil', color: '#22c55e' },
    { id: 'cyan', label: 'Siber Camgöbeği', color: '#06b6d4' },
    { id: 'amber', label: 'Retro Amber', color: '#f59e0b' },
    { id: 'purple', label: 'Neon Mor', color: '#a855f7' },
    { id: 'matrix', label: 'Koyu Monokrom', color: '#94a3b8' },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur select-none">
      {/* Top telemetry and status bar */}
      <div className="px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isEngineRunning ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="font-bold tracking-wider text-slate-200">
              GH-DPI // GITHUB TERMINAL v2.8
            </span>
          </div>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Motor:</span>
            <span className={isEngineRunning ? 'text-emerald-400 font-semibold' : 'text-rose-400'}>
              {isEngineRunning ? 'WinDivert / Bypass Aktif' : 'Durduruldu'}
            </span>
          </div>
          <span className="text-slate-600 hidden md:inline">|</span>
          <div className="hidden md:flex items-center gap-1 text-slate-400">
            <span>Aktif Preset:</span>
            <span className="text-cyan-400 font-mono">#{activePreset.id} ({activePreset.params.mode} Modu)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Latency badge */}
          <div className="flex items-center gap-1 text-slate-400">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>GitHub Ping:</span>
            <span className="font-mono font-medium text-slate-200">
              {lastPingMs !== null ? `${lastPingMs}ms` : '~42ms'}
            </span>
          </div>

          <span className="text-slate-700">|</span>

          {/* Sound toggle */}
          <button
            onClick={toggleMute}
            title={isMuted ? 'Sesi Aç (Mekanik Tuş Sesleri)' : 'Sesi Kapat'}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          {/* CRT scanlines toggle */}
          <button
            onClick={() => setCrtEffect(!crtEffect)}
            title={`CRT Scanline Efekti: ${crtEffect ? 'Açık' : 'Kapalı'}`}
            className={`p-1 rounded transition-colors ${crtEffect ? 'text-emerald-400 bg-emerald-950/40' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Tv className="w-3.5 h-3.5" />
          </button>

          {/* Theme switcher */}
          <div className="flex items-center gap-1">
            <Palette className="w-3 h-3 text-slate-500 mr-0.5" />
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                title={t.label}
                className={`w-3.5 h-3.5 rounded-full border transition-transform ${
                  theme === t.id ? 'scale-125 border-white ring-1 ring-white/50' : 'border-slate-700 opacity-60 hover:opacity-100'
                }`}
                style={{ backgroundColor: t.color }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main navigation tabs */}
      <div className="px-4 flex items-center gap-1 overflow-x-auto text-xs py-1.5 scrollbar-none">
        <button
          onClick={() => setActiveTab('terminal')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
            activeTab === 'terminal'
              ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span>Terminal [CLI]</span>
        </button>

        <button
          onClick={() => setActiveTab('presets')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
            activeTab === 'presets'
              ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>Preset & Parametreler</span>
        </button>

        <button
          onClick={() => setActiveTab('github')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
            activeTab === 'github'
              ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Github className="w-3.5 h-3.5 text-purple-400" />
          <span>GitHub Depoları & Araçlar</span>
        </button>

        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
            activeTab === 'diagnostics'
              ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-amber-400" />
          <span>Ağ & DoH Tanılama</span>
        </button>

        <button
          onClick={() => setActiveTab('scripts')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
            activeTab === 'scripts'
              ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <FileCode2 className="w-3.5 h-3.5 text-rose-400" />
          <span>Betik (.cmd / .sh) Üretici</span>
        </button>

        <button
          onClick={() => setActiveTab('cheatsheet')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
            activeTab === 'cheatsheet'
              ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
          <span>Komut Kılavuzu</span>
        </button>
      </div>
    </header>
  );
};
