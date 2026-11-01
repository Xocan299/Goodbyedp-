import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Terminal as TerminalIcon, 
  Trash2, 
  Copy, 
  Check, 
  Download, 
  Play, 
  ChevronRight,
  Sparkles,
  Command
} from 'lucide-react';
import { TerminalEntry, ThemeType, PresetConfig } from '../types/terminal';
import { sounds } from '../services/soundEffects';

interface TerminalViewProps {
  entries: TerminalEntry[];
  onExecuteCommand: (command: string) => void;
  onClear: () => void;
  activePreset: PresetConfig;
  theme: ThemeType;
  crtEffect: boolean;
  isEngineRunning: boolean;
}

export const TerminalView: React.FC<TerminalViewProps> = ({
  entries,
  onExecuteCommand,
  onClear,
  activePreset,
  theme,
  crtEffect,
  isEngineRunning,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new entries
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  // Keep focus on input on click
  const handleTerminalContainerClick = () => {
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    sounds.playKeyClick();

    if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = inputVal.trim();
      if (!cmd) return;

      sounds.playEnterChime();
      setCommandHistory((prev) => [cmd, ...prev.filter((c) => c !== cmd)]);
      setHistoryIndex(-1);
      setInputVal('');
      onExecuteCommand(cmd);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIndex = historyIndex + 1 < commandHistory.length ? historyIndex + 1 : historyIndex;
      setHistoryIndex(nextIndex);
      setInputVal(commandHistory[nextIndex] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInputVal(commandHistory[nextIndex] || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Auto-complete suggestion
      const current = inputVal.toLowerCase().trim();
      const candidates = [
        'help',
        'menu',
        'status',
        'preset 1',
        'preset 2',
        'preset 3',
        'preset 4',
        'preset 5',
        'preset 6',
        'test',
        'ping api.github.com',
        'ping raw.githubusercontent.com',
        'dns github.com',
        'gh repo cagritaskn/GoodbyeDPI-Turkey',
        'gh release cagritaskn/GoodbyeDPI-Turkey',
        'gh user cagritaskn',
        'git status',
        'git config bypass on',
        'script cmd',
        'clear'
      ];
      const match = candidates.find((c) => c.startsWith(current));
      if (match) {
        setInputVal(match);
      }
    }
  };

  const copyEntryText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const themeStyles: Record<ThemeType, { prompt: string; accent: string; text: string; glow: string; border: string }> = {
    green: {
      prompt: 'text-emerald-400',
      accent: 'text-emerald-300',
      text: 'text-emerald-200',
      glow: 'text-glow-green',
      border: 'border-emerald-500/30',
    },
    cyan: {
      prompt: 'text-cyan-400',
      accent: 'text-cyan-300',
      text: 'text-cyan-200',
      glow: 'text-glow-cyan',
      border: 'border-cyan-500/30',
    },
    amber: {
      prompt: 'text-amber-400',
      accent: 'text-amber-300',
      text: 'text-amber-200',
      glow: 'text-glow-amber',
      border: 'border-amber-500/30',
    },
    purple: {
      prompt: 'text-purple-400',
      accent: 'text-purple-300',
      text: 'text-purple-200',
      glow: '',
      border: 'border-purple-500/30',
    },
    matrix: {
      prompt: 'text-slate-300',
      accent: 'text-slate-200',
      text: 'text-slate-100',
      glow: '',
      border: 'border-slate-700',
    },
  };

  const currentTheme = themeStyles[theme];

  return (
    <div 
      className={`relative flex flex-col h-[calc(100vh-130px)] min-h-[550px] bg-[#080b0e] text-slate-200 font-mono ${crtEffect ? 'crt-overlay' : ''}`}
      onClick={handleTerminalContainerClick}
    >
      {/* Terminal Titlebar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-900 bg-slate-950/70 select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs text-slate-400 font-semibold ml-2">
            gh-dpi@turkey-cli: ~ / (WinDivert {isEngineRunning ? 'ACTIVE' : 'IDLE'})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExecuteCommand('menu');
            }}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-xs text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 hover:bg-cyan-900/50 transition-colors"
            title="İnteraktif Menüyü Göster"
          >
            <Command className="w-3 h-3" />
            <span>Menü</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Terminali Temizle"
          >
            <Trash2 className="w-3 h-3" />
            <span>Temizle</span>
          </button>
        </div>
      </div>

      {/* Terminal Output Scroll Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 text-xs md:text-sm leading-relaxed scrollbar-thin">
        {entries.map((entry) => {
          if (entry.type === 'ascii') {
            return (
              <pre
                key={entry.id}
                className={`text-[10px] sm:text-xs leading-none font-mono whitespace-pre overflow-x-auto ${currentTheme.prompt} ${currentTheme.glow} my-2 py-2`}
              >
                {entry.content}
              </pre>
            );
          }

          if (entry.type === 'cmd') {
            return (
              <div key={entry.id} className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-900/80">
                <span className={`${currentTheme.prompt} font-bold flex items-center gap-1 select-none`}>
                  <ChevronRight className="w-4 h-4 inline" />
                  <span>gh-dpi@terminal:~$</span>
                </span>
                <span className="text-white font-semibold font-mono tracking-wide">{entry.content}</span>
              </div>
            );
          }

          if (entry.type === 'table' && entry.tableData) {
            return (
              <div key={entry.id} className="overflow-x-auto my-2 border border-slate-800 rounded bg-slate-950/60 p-2">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      {entry.tableData.headers.map((h, i) => (
                        <th key={i} className="py-1 px-2 font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {entry.tableData.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="border-b border-slate-900/50 hover:bg-slate-900/30">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="py-1 px-2 text-slate-300">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          const typeStyles: Record<string, string> = {
            error: 'text-rose-400 bg-rose-950/20 border-l-2 border-rose-500 pl-3 py-1',
            success: 'text-emerald-400 pl-3 py-0.5',
            warn: 'text-amber-300 pl-3 py-0.5',
            info: 'text-cyan-300 pl-3 py-0.5',
            output: 'text-slate-300 pl-3 py-0.5 whitespace-pre-wrap',
          };

          return (
            <div key={entry.id} className="group relative">
              <div className={`font-mono ${typeStyles[entry.type] || typeStyles.output}`}>
                {entry.content}
              </div>

              {/* Quick copy button on hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyEntryText(entry.id, entry.content);
                }}
                className="absolute right-2 top-0 opacity-0 group-hover:opacity-100 p-1 rounded bg-slate-800/80 text-slate-400 hover:text-white transition-opacity text-xs"
                title="Metni Kopyala"
              >
                {copiedId === entry.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          );
        })}
        <div ref={terminalEndRef} />
      </div>

      {/* Quick Action Chips Bar */}
      <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-900 flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none select-none">
        <span className="text-slate-500 text-[11px] font-semibold flex items-center gap-1 whitespace-nowrap mr-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          Hızlı Tuşlar:
        </span>
        <button
          onClick={() => onExecuteCommand('1')}
          className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors whitespace-nowrap"
        >
          [1] Başlat (-9)
        </button>
        <button
          onClick={() => onExecuteCommand('2')}
          className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors whitespace-nowrap"
        >
          [2] Durdur
        </button>
        <button
          onClick={() => onExecuteCommand('3')}
          className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors whitespace-nowrap"
        >
          [3] Ağ & DoH Testi
        </button>
        <button
          onClick={() => onExecuteCommand('gh repo cagritaskn/GoodbyeDPI-Turkey')}
          className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 hover:border-slate-700 transition-colors whitespace-nowrap"
        >
          [4] GoodbyeDPI-Turkey Repo
        </button>
        <button
          onClick={() => onExecuteCommand('gh release cagritaskn/GoodbyeDPI-Turkey')}
          className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-purple-300 border border-slate-800 hover:border-slate-700 transition-colors whitespace-nowrap"
        >
          [5] Son Sürümler
        </button>
        <button
          onClick={() => onExecuteCommand('git config bypass on')}
          className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-800 hover:border-slate-700 transition-colors whitespace-nowrap"
        >
          [6] Git 500MB Ayarı
        </button>
        <button
          onClick={() => onExecuteCommand('script cmd')}
          className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-rose-300 border border-slate-800 hover:border-slate-700 transition-colors whitespace-nowrap"
        >
          [7] .cmd Betiği
        </button>
        <button
          onClick={() => onExecuteCommand('help')}
          className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-800 hover:border-slate-700 transition-colors whitespace-nowrap"
        >
          [?] Yardım
        </button>
      </div>

      {/* Terminal Input Prompt Bar */}
      <div className="p-3 bg-slate-950 border-t border-slate-900 flex items-center gap-2">
        <div className={`flex items-center gap-1.5 ${currentTheme.prompt} font-bold text-xs select-none pl-1`}>
          <span>gh-dpi@terminal:~$</span>
        </div>
        <div className="flex-1 relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Komut veya menü numarası girin (örn: 'menu', '1', 'gh repo cagritaskn/GoodbyeDPI-Turkey', 'test')..."
            className={`w-full bg-transparent text-slate-100 placeholder-slate-600 focus:outline-none text-xs md:text-sm font-mono caret-emerald-400`}
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <button
          onClick={() => {
            const cmd = inputVal.trim();
            if (!cmd) return;
            sounds.playEnterChime();
            setCommandHistory((prev) => [cmd, ...prev.filter((c) => c !== cmd)]);
            setHistoryIndex(-1);
            setInputVal('');
            onExecuteCommand(cmd);
          }}
          disabled={!inputVal.trim()}
          className="p-1.5 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:hover:bg-emerald-600 text-slate-950 font-bold transition-colors"
          title="Komutu Çalıştır (Enter)"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
