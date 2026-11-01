import React, { useState } from 'react';
import { 
  FileCode2, 
  Download, 
  Copy, 
  Check, 
  Terminal, 
  Play, 
  Layers, 
  ShieldAlert, 
  Sparkles,
  Laptop
} from 'lucide-react';
import { PresetConfig } from '../types/terminal';
import { 
  generateWindowsCmd, 
  generateBashScript, 
  generateGitConfigCommands, 
  generateHostsFileContent,
  triggerDownload 
} from '../services/scriptGenerator';
import { sounds } from '../services/soundEffects';

interface ScriptGeneratorViewProps {
  activePreset: PresetConfig;
  onExecuteCommand: (cmd: string) => void;
}

export const ScriptGeneratorView: React.FC<ScriptGeneratorViewProps> = ({
  activePreset,
  onExecuteCommand,
}) => {
  const [selectedScriptType, setSelectedScriptType] = useState<'windows' | 'linux' | 'git' | 'hosts'>('windows');
  const [copied, setCopied] = useState(false);

  const windowsCmd = generateWindowsCmd(activePreset, ['github.com', 'raw.githubusercontent.com']);
  const linuxSh = generateBashScript(activePreset);
  const gitConfigCmd = generateGitConfigCommands();
  const hostsTxt = generateHostsFileContent({});

  let currentContent = windowsCmd;
  let currentFilename = `goodbyedpi_turkey_${activePreset.code.replace(' ', '_')}.cmd`;

  if (selectedScriptType === 'linux') {
    currentContent = linuxSh;
    currentFilename = 'github_bypass_linux.sh';
  } else if (selectedScriptType === 'git') {
    currentContent = gitConfigCmd;
    currentFilename = 'git_config_speedup.cmd';
  } else if (selectedScriptType === 'hosts') {
    currentContent = hostsTxt;
    currentFilename = 'hosts_github.txt';
  }

  const handleCopy = () => {
    sounds.playKeyClick();
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    sounds.playSuccessTone();
    triggerDownload(currentContent, currentFilename);
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-rose-400" />
            <span>Otomatik Betik & Başlatıcı (.cmd / .sh) Üretici</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Bilgisayarınızda doğrudan çalıştırabileceğiniz hazır GoodbyeDPI Turkey batch dosyaları, Linux kabuk betikleri ve Git hızlandırma komutları.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Kodu Kopyala</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Dosyayı İndir ({currentFilename})</span>
          </button>
        </div>
      </div>

      {/* Script Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => {
            sounds.playKeyClick();
            setSelectedScriptType('windows');
          }}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            selectedScriptType === 'windows'
              ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60 shadow-sm'
              : 'text-slate-400 hover:bg-slate-900'
          }`}
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>Windows .cmd Başlatıcı (Yönetici)</span>
        </button>

        <button
          onClick={() => {
            sounds.playKeyClick();
            setSelectedScriptType('linux');
          }}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            selectedScriptType === 'linux'
              ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60 shadow-sm'
              : 'text-slate-400 hover:bg-slate-900'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Linux / macOS .sh (Zapret / ByeDPI)</span>
        </button>

        <button
          onClick={() => {
            sounds.playKeyClick();
            setSelectedScriptType('git');
          }}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            selectedScriptType === 'git'
              ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60 shadow-sm'
              : 'text-slate-400 hover:bg-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Git CLI 500MB Buffer & Ayarlar</span>
        </button>

        <button
          onClick={() => {
            sounds.playKeyClick();
            setSelectedScriptType('hosts');
          }}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            selectedScriptType === 'hosts'
              ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60 shadow-sm'
              : 'text-slate-400 hover:bg-slate-900'
          }`}
        >
          <span>Temiz Hosts Dosyası</span>
        </button>
      </div>

      {/* Instruction alert box */}
      <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1">
        {selectedScriptType === 'windows' && (
          <div className="flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300">Nasıl Kullanılır:</span> Bu indirilen{' '}
              <code className="text-cyan-400 font-mono">.cmd</code> dosyasını GoodbyeDPI veya GoodbyeDPI-Turkey klasörünüze atın.
              Üzerine sağ tıklayıp <strong>"Yönetici olarak çalıştır"</strong> deyin. WinDivert servisini otomatik ayağa kaldıracaktır.
            </div>
          </div>
        )}
        {selectedScriptType === 'linux' && (
          <div className="flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-cyan-300">Nasıl Kullanılır:</span> Linux veya macOS terminalinde{' '}
              <code className="text-emerald-400 font-mono">chmod +x github_bypass_linux.sh && ./github_bypass_linux.sh</code> komutuyla çalıştırın.
            </div>
          </div>
        )}
        {selectedScriptType === 'git' && (
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-300">Git Performans Çözümü:</span> Git klonlama esnasında{' '}
              <code className="text-rose-400 font-mono">RPC failed; curl 56 OpenSSL SSL_read</code> veya zaman aşımı alanlar için buffer boyutunu 500MB'a çıkarır.
            </div>
          </div>
        )}
        {selectedScriptType === 'hosts' && (
          <div>
            <span className="font-bold text-purple-300">Hosts Dosyası Konumu:</span> Windows:{' '}
            <code className="text-slate-200 font-mono">C:\Windows\System32\drivers\etc\hosts</code> | Linux/Mac:{' '}
            <code className="text-slate-200 font-mono">/etc/hosts</code>
          </div>
        )}
      </div>

      {/* Code Editor Preview Window */}
      <div className="rounded-lg bg-black/90 border border-slate-800 overflow-hidden shadow-2xl">
        <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="font-mono text-slate-400">{currentFilename}</span>
          <span className="text-[11px] text-slate-500">UTF-8 No-BOM</span>
        </div>
        <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto max-h-[460px] leading-relaxed scrollbar-thin select-all">
          {currentContent}
        </pre>
      </div>
    </div>
  );
};
