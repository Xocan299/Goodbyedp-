import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Globe, 
  ShieldCheck, 
  Terminal, 
  Download, 
  Copy, 
  Check,
  Server,
  Zap
} from 'lucide-react';
import { NetworkProbeResult } from '../types/terminal';
import { GITHUB_HOSTS_LIST } from '../data/presets';
import { probeEndpoint } from '../services/networkDiagnostic';
import { generateHostsFileContent, triggerDownload } from '../services/scriptGenerator';
import { sounds } from '../services/soundEffects';

interface NetworkDiagnosticsViewProps {
  onExecuteCommand: (cmd: string) => void;
  onUpdateLastPing: (ms: number) => void;
}

export const NetworkDiagnosticsView: React.FC<NetworkDiagnosticsViewProps> = ({
  onExecuteCommand,
  onUpdateLastPing,
}) => {
  const [probes, setProbes] = useState<NetworkProbeResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [copiedHosts, setCopiedHosts] = useState(false);

  const runFullProbe = async () => {
    sounds.playKeyClick();
    setIsRunning(true);

    const initial: NetworkProbeResult[] = GITHUB_HOSTS_LIST.map((h) => ({
      host: h,
      label: h,
      status: 'pending',
      latencyMs: null,
      resolvedIp: null,
      dohProvider: 'Cloudflare DoH',
    }));
    setProbes(initial);

    const results: NetworkProbeResult[] = [];
    for (const host of GITHUB_HOSTS_LIST) {
      const res = await probeEndpoint(host, host);
      results.push(res);
      setProbes([...results, ...initial.slice(results.length)]);
      if (host === 'github.com' && res.latencyMs !== null) {
        onUpdateLastPing(res.latencyMs);
      }
    }

    sounds.playSuccessTone();
    setIsRunning(false);
  };

  useEffect(() => {
    runFullProbe();
  }, []);

  const resolvedIpsMap = probes.reduce<Record<string, string>>((acc, curr) => {
    if (curr.resolvedIp && curr.resolvedIp !== 'Bilinmiyor') {
      acc[curr.host] = curr.resolvedIp;
    }
    return acc;
  }, {});

  const hostsContent = generateHostsFileContent(resolvedIpsMap);

  const handleCopyHosts = () => {
    sounds.playKeyClick();
    navigator.clipboard.writeText(hostsContent);
    setCopiedHosts(true);
    setTimeout(() => setCopiedHosts(false), 2000);
  };

  const handleDownloadHosts = () => {
    sounds.playSuccessTone();
    triggerDownload(hostsContent, 'github_clean_hosts.txt');
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-slate-900/80 border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-400" />
            <span>GitHub Canlı Ağ & DNS (DoH) Tanılama Matrisi</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            GitHub servislerinin Türkiye ISS filtreleri altındaki durumunu, şifreli DNS (DoH) çözümleme sürelerini ve canlı gecikme (latency) değerlerini test edin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={runFullProbe}
            disabled={isRunning}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Tanılama Yapılıyor...' : 'Testi Yeniden Başlat'}</span>
          </button>
        </div>
      </div>

      {/* Probes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {probes.map((probe) => {
          let badgeColor = 'bg-slate-800 text-slate-400 border-slate-700';
          let icon = <Activity className="w-4 h-4 text-slate-500 animate-pulse" />;
          let statusText = 'Sorgulanıyor...';

          if (probe.status === 'online') {
            badgeColor = 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60';
            icon = <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
            statusText = 'Erişilebilir';
          } else if (probe.status === 'slow') {
            badgeColor = 'bg-amber-950/60 text-amber-300 border-amber-800/60';
            icon = <AlertTriangle className="w-4 h-4 text-amber-400" />;
            statusText = 'Yavaş / Throttled';
          } else if (probe.status === 'blocked' || probe.status === 'error') {
            badgeColor = 'bg-rose-950/60 text-rose-400 border-rose-800/60';
            icon = <XCircle className="w-4 h-4 text-rose-400" />;
            statusText = 'Engelli / DPI';
          }

          return (
            <div
              key={probe.host}
              className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-xs font-bold text-slate-200 truncate" title={probe.host}>
                    {probe.host}
                  </span>
                  <div className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border ${badgeColor}`}>
                    {icon}
                    <span>{statusText}</span>
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Gecikme (Ping):</span>
                    <span className="text-white font-semibold">
                      {probe.latencyMs !== null ? `${probe.latencyMs} ms` : '...'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Çözümlenen IP:</span>
                    <span className="text-cyan-400 truncate max-w-[130px]" title={probe.resolvedIp || '...'}>
                      {probe.resolvedIp || '...'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>DoH Servisi:</span>
                    <span className="text-slate-500">{probe.dohProvider}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onExecuteCommand(`ping ${probe.host}`)}
                className="w-full py-1 text-[11px] rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-center transition-colors font-mono"
              >
                Terminale Ping Gönder
              </button>
            </div>
          );
        })}
      </div>

      {/* Clean Hosts Generator Card */}
      <div className="p-5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>Temiz GitHub Hosts Dosyası (DNS Zehirlenmesi Çözümü)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              ISP DNS zehirlenmesi veya engellemesi durumunda işletim sistemi hosts dosyasına temiz IP'leri ekleyerek anında bypass sağlayabilirsiniz.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyHosts}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copiedHosts ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Kopyala</span>
            </button>
            <button
              onClick={handleDownloadHosts}
              className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>hosts.txt İndir</span>
            </button>
          </div>
        </div>

        <pre className="p-3 rounded bg-black/80 border border-slate-800 text-slate-300 font-mono text-xs overflow-x-auto max-h-48 scrollbar-thin select-all">
          {hostsContent}
        </pre>
      </div>
    </div>
  );
};
