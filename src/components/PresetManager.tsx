import React, { useState } from 'react';
import { 
  Cpu, 
  Check, 
  Copy, 
  Play, 
  Download, 
  Sliders, 
  Shield, 
  Terminal, 
  Settings2,
  Sparkles,
  Zap,
  Globe
} from 'lucide-react';
import { PresetConfig } from '../types/terminal';
import { PRESETS } from '../data/presets';
import { generateWindowsCmd, triggerDownload } from '../services/scriptGenerator';
import { sounds } from '../services/soundEffects';

interface PresetManagerProps {
  activePreset: PresetConfig;
  onSelectPreset: (preset: PresetConfig) => void;
  onExecuteCommand: (command: string) => void;
  isEngineRunning: boolean;
}

export const PresetManager: React.FC<PresetManagerProps> = ({
  activePreset,
  onSelectPreset,
  onExecuteCommand,
  isEngineRunning,
}) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Custom fine-tuning state based on active preset
  const [customMode, setCustomMode] = useState<number>(activePreset.params.mode);
  const [customDns, setCustomDns] = useState<string>(activePreset.params.dnsAddr);
  const [customPort, setCustomPort] = useState<number>(activePreset.params.dnsPort);
  const [customFakeGen, setCustomFakeGen] = useState<number>(activePreset.params.fakeGen);
  const [customSniFrag, setCustomSniFrag] = useState<boolean>(activePreset.params.sniFrag);
  const [customAutoTtl, setCustomAutoTtl] = useState<boolean>(activePreset.params.autoTtl);
  const [customWrongChk, setCustomWrongChk] = useState<boolean>(activePreset.params.wrongChksum);

  const handleCopy = (id: number, text: string) => {
    sounds.playKeyClick();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadCmd = (preset: PresetConfig) => {
    sounds.playSuccessTone();
    const cmdContent = generateWindowsCmd(preset, ['github.com', 'raw.githubusercontent.com']);
    triggerDownload(cmdContent, `goodbyedpi_turkey_preset_${preset.id}.cmd`);
  };

  const computedCustomArgs = `-${customMode} ${customSniFrag ? '-e 1' : ''} -q --fake-gen ${customFakeGen} ${
    customAutoTtl ? '--auto-ttl 1-4' : ''
  } ${customWrongChk ? '--wrong-chksum --wrong-seq' : ''} --dns-addr ${customDns} --dns-port ${customPort}`;

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-slate-900/80 border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span>GoodbyeDPI Turkey & GitHub Parametre Yönetimi</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Türkiye internet servis sağlayıcıları (Türk Telekom, Superonline, Vodafone) ve GitHub/Discord için optimize edilmiş DPI atlatma profilleri.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-[11px] text-slate-500 block">Şu Anki Profil</span>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              #{activePreset.id} - {activePreset.name.split('(')[0]}
            </span>
          </div>
          <button
            onClick={() => onExecuteCommand(`preset ${activePreset.id}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-colors shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Terminale Uygula</span>
          </button>
        </div>
      </div>

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PRESETS.map((p) => {
          const isActive = activePreset.id === p.id;

          return (
            <div
              key={p.id}
              className={`flex flex-col justify-between p-4 rounded-lg border transition-all ${
                isActive
                  ? 'bg-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-950/20 ring-1 ring-emerald-500/30'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                      PRESET #{p.id}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {p.ispTag}
                    </span>
                  </div>

                  {isActive && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                      <Check className="w-3 h-3" />
                      Aktif
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-100 mt-2">
                  {p.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {p.description}
                </p>

                {/* Technical highlights */}
                <ul className="mt-3 space-y-1 text-[11px] text-slate-300">
                  {p.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 text-xs">›</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>

                {/* Command preview box */}
                <div className="mt-3 p-2 rounded bg-black/60 border border-slate-800/80 font-mono text-[11px] text-slate-300 break-all select-all">
                  <span className="text-slate-500 text-[10px] block mb-0.5">CLI Parametreleri:</span>
                  goodbyedpi.exe {p.commandArgs}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopy(p.id, `goodbyedpi.exe ${p.commandArgs}`)}
                    className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Komutu Kopyala"
                  >
                    {copiedId === p.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDownloadCmd(p)}
                    className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Bu Preset için .cmd İndir"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    sounds.playEnterChime();
                    onSelectPreset(p);
                    onExecuteCommand(`preset ${p.id}`);
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-slate-300 border border-slate-700'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold'
                  }`}
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{isActive ? 'Yeniden Çalıştır' : 'Profili Seç'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Advanced Custom Parameter Configurator */}
      <div className="p-4 md:p-6 rounded-lg bg-slate-900/60 border border-slate-800">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-2">
          <Settings2 className="w-4 h-4 text-cyan-400" />
          <span>Özel Parametre Oluşturucu (Custom Fine-Tuning)</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          DPI modunu, fake paket genliğini ve şifreli DNS sunucusunu doğrudan özelleştirin.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Mode Slider */}
          <div className="space-y-1.5 p-3 rounded bg-slate-950/60 border border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Bypass Modu (-1 ila -9):</span>
              <span className="text-cyan-400 font-bold font-mono">Mod -{customMode}</span>
            </div>
            <input
              type="range"
              min={1}
              max={9}
              value={customMode}
              onChange={(e) => setCustomMode(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <span className="text-[10px] text-slate-500 block">
              1: En hafif, 5: Dengeli, 9: Tam parçalama
            </span>
          </div>

          {/* Fake Packet Gen */}
          <div className="space-y-1.5 p-3 rounded bg-slate-950/60 border border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Fake-Gen Baytı:</span>
              <span className="text-emerald-400 font-bold font-mono">--fake-gen {customFakeGen}</span>
            </div>
            <input
              type="range"
              min={10}
              max={40}
              value={customFakeGen}
              onChange={(e) => setCustomFakeGen(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <span className="text-[10px] text-slate-500 block">
              Türkiye için önerilen: 29 (standart paket boyutu)
            </span>
          </div>

          {/* DNS Provider Selector */}
          <div className="space-y-1.5 p-3 rounded bg-slate-950/60 border border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Şifreli DNS (DoH / Proxy):</span>
              <span className="text-purple-400 font-bold font-mono">{customDns}:{customPort}</span>
            </div>
            <select
              value={`${customDns}:${customPort}`}
              onChange={(e) => {
                const [addr, port] = e.target.value.split(':');
                setCustomDns(addr);
                setCustomPort(Number(port));
              }}
              className="w-full text-xs bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-1.5 focus:outline-none"
            >
              <option value="77.88.8.8:1253">Yandex Safe DNS (77.88.8.8:1253)</option>
              <option value="1.1.1.1:53">Cloudflare DNS (1.1.1.1:53)</option>
              <option value="9.9.9.9:53">Quad9 Güvenli DNS (9.9.9.9:53)</option>
              <option value="8.8.8.8:53">Google Public DNS (8.8.8.8:53)</option>
            </select>
            <span className="text-[10px] text-slate-500 block">
              Port 1253 ISP DNS yönlendirmesini (DNS Hijack) engeller.
            </span>
          </div>
        </div>

        {/* Toggles */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={customSniFrag}
              onChange={(e) => setCustomSniFrag(e.target.checked)}
              className="accent-cyan-500"
            />
            <span>SNI Parçalama (-e 1)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={customAutoTtl}
              onChange={(e) => setCustomAutoTtl(e.target.checked)}
              className="accent-cyan-500"
            />
            <span>Otomatik TTL Hop (--auto-ttl 1-4)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={customWrongChk}
              onChange={(e) => setCustomWrongChk(e.target.checked)}
              className="accent-cyan-500"
            />
            <span>Geçersiz Checksum & Sequence</span>
          </label>
        </div>

        {/* Custom Command Box */}
        <div className="mt-4 p-3 rounded bg-black/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="font-mono text-xs text-emerald-400 break-all select-all">
            goodbyedpi.exe {computedCustomArgs}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleCopy(999, `goodbyedpi.exe ${computedCustomArgs}`)}
              className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1 transition-colors"
            >
              {copiedId === 999 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>Kopyala</span>
            </button>
            <button
              onClick={() => {
                sounds.playEnterChime();
                onExecuteCommand(`goodbyedpi ${computedCustomArgs}`);
              }}
              className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-slate-950 flex items-center gap-1 transition-colors"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Terminale Gönder</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
