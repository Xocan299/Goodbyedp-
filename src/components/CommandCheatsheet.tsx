import React, { useState } from 'react';
import { 
  HelpCircle, 
  Terminal, 
  Copy, 
  Check, 
  Play, 
  Search, 
  Layers, 
  Cpu, 
  Github, 
  Activity,
  Keyboard
} from 'lucide-react';
import { COMMAND_PALETTE } from '../data/customCommands';
import { sounds } from '../services/soundEffects';

interface CommandCheatsheetProps {
  onExecuteCommand: (cmd: string) => void;
}

export const CommandCheatsheet: React.FC<CommandCheatsheetProps> = ({ onExecuteCommand }) => {
  const [filter, setFilter] = useState<'all' | 'goodypi' | 'gh' | 'git' | 'diag'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const filteredCommands = COMMAND_PALETTE.filter((item) => {
    const matchCategory = filter === 'all' || item.category === filter;
    const matchSearch =
      item.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleCopy = (cmd: string) => {
    sounds.playKeyClick();
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            <span>Terminal Komut Kılavuzu & Kısayollar (CheatSheet)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            GH-DPI terminalinde çalıştırabileceğiniz tüm GitHub API, GoodbyeDPI, Git ve Ağ tanılama komutları.
          </p>
        </div>

        {/* Keyboard shortcut tips */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-black/40 p-2 rounded border border-slate-800">
          <Keyboard className="w-4 h-4 text-slate-400" />
          <span>[Yukarı/Aşağı] Geçmiş · [Tab] Tamamlama · [Enter] Çalıştır</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tümü ({COMMAND_PALETTE.length})
          </button>
          <button
            onClick={() => setFilter('goodypi')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === 'goodypi' ? 'bg-slate-800 text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            GoodbyeDPI
          </button>
          <button
            onClick={() => setFilter('gh')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === 'gh' ? 'bg-slate-800 text-purple-300 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            GitHub CLI
          </button>
          <button
            onClick={() => setFilter('git')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === 'git' ? 'bg-slate-800 text-emerald-300 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Git Araçları
          </button>
          <button
            onClick={() => setFilter('diag')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === 'diag' ? 'bg-slate-800 text-amber-300 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Ağ & Ping
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Komut ara..."
            className="w-full bg-slate-950 border border-slate-700 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>
      </div>

      {/* Commands List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredCommands.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-slate-700 flex flex-col justify-between space-y-2 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-slate-100">{item.title}</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  {item.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{item.description}</p>
            </div>

            <div className="p-2 rounded bg-black/70 border border-slate-800/80 flex items-center justify-between gap-2">
              <code className="font-mono text-xs text-emerald-400 truncate">{item.command}</code>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleCopy(item.command)}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Kopyala"
                >
                  {copiedCmd === item.command ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => {
                    sounds.playEnterChime();
                    onExecuteCommand(item.command);
                  }}
                  className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors"
                  title="Terminale Gönder ve Çalıştır"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Çalıştır</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
