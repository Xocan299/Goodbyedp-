import React, { useState, useEffect } from 'react';
import { TerminalHeader } from './components/TerminalHeader';
import { TerminalView } from './components/TerminalView';
import { PresetManager } from './components/PresetManager';
import { GitHubExplorer } from './components/GitHubExplorer';
import { NetworkDiagnosticsView } from './components/NetworkDiagnosticsView';
import { ScriptGeneratorView } from './components/ScriptGeneratorView';
import { CommandCheatsheet } from './components/CommandCheatsheet';
import { TerminalEntry, ThemeType, PresetConfig } from './types/terminal';
import { PRESETS } from './data/presets';
import { sounds } from './services/soundEffects';
import { 
  fetchGitHubRepo, 
  fetchGitHubUser, 
  fetchUserRepos, 
  fetchRepoReleases, 
  fetchRepoIssues,
  fetchRateLimit 
} from './services/githubApi';
import { probeEndpoint, resolveDnsCloudflare } from './services/networkDiagnostic';
import { generateWindowsCmd, triggerDownload } from './services/scriptGenerator';

const ASCII_BANNER = `
  ██████╗ ██╗  ██╗       ██████╗  ██████╗ ██╗
 ██╔════╝ ██║  ██║       ██╔══██╗██╔══██╗██║
 ██║  ███╗███████║█████╗ ██║  ██║██████╔╝██║
 ██║   ██║██╔══██║╚════╝ ██║  ██║██╔═══╝ ██║
 ╚██████╔╝██║  ██║       ██████╔╝██║     ██║
  ╚═════╝ ╚═╝  ╚═╝       ╚═════╝ ╚═╝     ╚═╝
========================================================================
 GH-DPI // GITHUB TERMINAL & KOMUT YÖNETİM SİSTEMİ (v2.8)
 GoodbyeDPI Turkey Altyapısı | WinDivert Core | DoH DNS Entegrasyonu
========================================================================
 [*] Menüyü görüntülemek için: 'menu' yazın veya doğrudan [1]-[8] tuşlayın.
 [*] Komut yardımı için: 'help' yazın.
 [*] Hızlı test için: 'test' yazın.
`;

const MENU_TEXT = `========================================================================
              GH-DPI // İNTERAKTİF KOMUT & YÖNETİM MENÜSÜ
========================================================================
  [1] Hizmeti Başlat (Standard Turkey Preset #1: -9 -e 1 -q --fake-gen 29)
  [2] Hizmeti Durdur / WinDivert Filtrelerini Kapat
  [3] Hızlı GitHub Ağ & DNS Tanılama Testi (DoH Ping / Latency)
  [4] cagritaskn/GoodbyeDPI-Turkey Deposunu Sorgula (Yıldızlar, Forklar)
  [5] Son GitHub Sürümlerini & İndirilebilir Paketleri Listele
  [6] Git CLI İçin 500MB PostBuffer & SSL Bypass Ayarlarını Uygula
  [7] Windows İçin .cmd Başlatıcı Betiğini Üret ve İndir
  [8] Ekranı Temizle (cls / clear)
========================================================================
>> Komut satırına doğrudan menü numarasını (1-8) veya komut adını yazabilirsiniz.`;

export default function App() {
  const [activeTab, setActiveTab] = useState('terminal');
  const [theme, setTheme] = useState<ThemeType>('green');
  const [crtEffect, setCrtEffect] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isEngineRunning, setIsEngineRunning] = useState(true);
  const [activePreset, setActivePreset] = useState<PresetConfig>(PRESETS[0]);
  const [lastPingMs, setLastPingMs] = useState<number | null>(42);

  const [entries, setEntries] = useState<TerminalEntry[]>([]);

  // Startup banner and menu
  useEffect(() => {
    const startupEntries: TerminalEntry[] = [
      {
        id: 'banner',
        timestamp: new Date().toLocaleTimeString(),
        type: 'ascii',
        content: ASCII_BANNER,
      },
      {
        id: 'init-info-1',
        timestamp: new Date().toLocaleTimeString(),
        type: 'success',
        content: `[BAŞLATILDI] GH-DPI Motoru Aktif: Preset #1 (Turkey Standart Preset: -9 -e 1 -q)`,
      },
      {
        id: 'init-info-2',
        timestamp: new Date().toLocaleTimeString(),
        type: 'info',
        content: `[AĞ BİLGİSİ] DoH Sağlayıcı: Yandex/Cloudflare (77.88.8.8:1253) | WinDivert: ÇALIŞIYOR`,
      },
      {
        id: 'init-menu',
        timestamp: new Date().toLocaleTimeString(),
        type: 'output',
        content: MENU_TEXT,
      },
    ];
    setEntries(startupEntries);
  }, []);

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    sounds.setMuted(newMuted);
  };

  const addEntry = (type: TerminalEntry['type'], content: string, tableData?: TerminalEntry['tableData']) => {
    const newEntry: TerminalEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      type,
      content,
      tableData,
    };
    setEntries((prev) => [...prev, newEntry]);
  };

  // Main Command Processor
  const handleExecuteCommand = async (rawCommand: string) => {
    const trimmed = rawCommand.trim();
    if (!trimmed) return;

    // Echo executed command
    addEntry('cmd', trimmed);

    // If current tab is not terminal, switch back to terminal when executing
    if (activeTab !== 'terminal') {
      setActiveTab('terminal');
    }

    const lower = trimmed.toLowerCase();
    const parts = trimmed.split(' ').filter(Boolean);
    const cmd = parts[0]?.toLowerCase();
    const arg1 = parts[1];
    const arg2 = parts[2];

    // Numbered menu shortcuts [1] - [8]
    if (trimmed === '1') {
      setIsEngineRunning(true);
      setActivePreset(PRESETS[0]);
      sounds.playSuccessTone();
      addEntry('success', `[OK] Hizmet Başlatıldı: ${PRESETS[0].name}`);
      addEntry('info', `[INFO] Parametreler: goodbyedpi.exe ${PRESETS[0].commandArgs}`);
      addEntry('output', `[INFO] WinDivert sürücüsü yüklendi (Simulated PID: 3412). DPI engelleri ve SNI filtreleri bypass ediliyor.`);
      return;
    }

    if (trimmed === '2') {
      setIsEngineRunning(false);
      sounds.playKeyClick();
      addEntry('warn', `[DURDURULDU] WinDivert filtresi ve GoodbyeDPI motoru durduruldu.`);
      addEntry('output', `[BILGI] Ağ paketleri doğrudan servis sağlayıcınıza yönlendiriliyor. Yeniden başlatmak için '1' veya 'preset 1' yazın.`);
      return;
    }

    if (trimmed === '3' || lower === 'test') {
      addEntry('info', `[TEST] GitHub ağ servisleri ve DoH DNS gecikme testi başlatılıyor...`);
      try {
        const targets = ['github.com', 'raw.githubusercontent.com', 'api.github.com'];
        const rows: string[][] = [];

        for (const t of targets) {
          const res = await probeEndpoint(t, t);
          if (t === 'github.com' && res.latencyMs !== null) {
            setLastPingMs(res.latencyMs);
          }
          rows.push([
            t,
            res.status === 'online' ? 'ERİŞİLEBİLİR' : res.status.toUpperCase(),
            res.latencyMs ? `${res.latencyMs} ms` : 'N/A',
            res.resolvedIp || 'Bilinmiyor',
            res.dohProvider,
          ]);
        }

        addEntry('table', 'Test Sonuçları:', {
          headers: ['Hedef Host', 'Durum', 'Gecikme (Ping)', 'Çözümlenen IP', 'DoH Sağlayıcı'],
          rows,
        });
        sounds.playSuccessTone();
        addEntry('success', `[TAMAMLANDI] GitHub servisleri başarıyla yanıt verdi. DPI bypass aktif.`);
      } catch (err: any) {
        sounds.playErrorTone();
        addEntry('error', `[HATA] Test esnasında hata: ${err.message}`);
      }
      return;
    }

    if (trimmed === '4') {
      await handleExecuteCommand('gh repo cagritaskn/GoodbyeDPI-Turkey');
      return;
    }

    if (trimmed === '5') {
      await handleExecuteCommand('gh release cagritaskn/GoodbyeDPI-Turkey');
      return;
    }

    if (trimmed === '6') {
      await handleExecuteCommand('git config bypass on');
      return;
    }

    if (trimmed === '7') {
      await handleExecuteCommand('script cmd');
      return;
    }

    if (trimmed === '8' || lower === 'clear' || lower === 'cls') {
      setEntries([]);
      sounds.playKeyClick();
      return;
    }

    // Command: menu
    if (lower === 'menu') {
      sounds.playKeyClick();
      addEntry('output', MENU_TEXT);
      return;
    }

    // Command: banner
    if (lower === 'banner') {
      sounds.playKeyClick();
      addEntry('ascii', ASCII_BANNER);
      return;
    }

    // Command: help or ?
    if (lower === 'help' || lower === '?') {
      sounds.playKeyClick();
      addEntry('info', `=== GH-DPI KOMUT LİSTESİ ===`);
      addEntry('table', 'Komutlar:', {
        headers: ['Komut', 'Açıklama', 'Örnek'],
        rows: [
          ['menu', 'İnteraktif numaralı konsol menüsünü yazdırır', 'menu'],
          ['preset <1-6>', 'GoodbyeDPI Turkey profilini aktif eder', 'preset 1'],
          ['status', 'Mevcut motor ve ağ durumunu gösterir', 'status'],
          ['stop', 'DPI filtresini ve WinDivert motorunu durdurur', 'stop'],
          ['test', 'Tüm GitHub servislerine canlı ping/DNS testi yapar', 'test'],
          ['ping <host>', 'Belirtilen adrese latency ölçümü yapar', 'ping api.github.com'],
          ['dns <domain>', 'Cloudflare DoH ile IP çözümlemesi yapar', 'dns github.com'],
          ['gh repo <sahip/depo>', 'Canlı GitHub repo verilerini ve istatistikleri çeker', 'gh repo cagritaskn/GoodbyeDPI-Turkey'],
          ['gh release <sahip/depo>', 'Son sürümleri ve indirme linklerini listeler', 'gh release cagritaskn/GoodbyeDPI-Turkey'],
          ['gh user <kullanici>', 'Kullanıcı profilini ve açık depoları sorgular', 'gh user cagritaskn'],
          ['git config bypass on', 'Git CLI 500MB buffer ve timeout ayarlarını üretir', 'git config bypass on'],
          ['git status', 'Simüle edilmiş yerel repo durumunu görüntüler', 'git status'],
          ['script <cmd|sh>', 'Hazır başlatıcı batch / bash dosyasını indirir', 'script cmd'],
          ['theme <renk>', 'Terminal rengini değiştirir (green/cyan/amber/purple)', 'theme cyan'],
          ['clear / cls', 'Terminal ekranını temizler', 'clear'],
        ],
      });
      return;
    }

    // Command: status
    if (lower === 'status') {
      sounds.playKeyClick();
      addEntry('info', `=== GH-DPI MOTOR & SİSTEM METRİKLERİ ===`);
      addEntry('output', `  Durum              : ${isEngineRunning ? 'ÇALIŞIYOR (ACTIVE)' : 'DURDURULDU (STOPPED)'}`);
      addEntry('output', `  Aktif Preset       : #${activePreset.id} - ${activePreset.name}`);
      addEntry('output', `  Hedef ISS Profili  : ${activePreset.ispTag}`);
      addEntry('output', `  CLI Parametreleri  : goodbyedpi.exe ${activePreset.commandArgs}`);
      addEntry('output', `  DoH DNS Sunucusu   : ${activePreset.params.dnsAddr}:${activePreset.params.dnsPort}`);
      addEntry('output', `  Fake Gen Bayt      : ${activePreset.params.fakeGen}`);
      addEntry('output', `  SNI Parçalama      : ${activePreset.params.sniFrag ? 'Açık (-e 1)' : 'Kapalı'}`);
      addEntry('output', `  Son GitHub Ping    : ${lastPingMs !== null ? `${lastPingMs} ms` : '~42 ms'}`);
      return;
    }

    // Command: preset <num>
    if (cmd === 'preset') {
      const pNum = parseInt(arg1, 10);
      const found = PRESETS.find((p) => p.id === pNum);
      if (found) {
        setActivePreset(found);
        setIsEngineRunning(true);
        sounds.playSuccessTone();
        addEntry('success', `[OK] Preset #${found.id} uygulandı: ${found.name}`);
        addEntry('info', `[KOMUT] goodbyedpi.exe ${found.commandArgs}`);
        addEntry('output', `[DETAY] ${found.description}`);
      } else {
        sounds.playErrorTone();
        addEntry('error', `[HATA] Geçersiz preset numarası '${arg1}'. Lütfen 1 ile 6 arasında bir sayı girin (örn: preset 1)`);
      }
      return;
    }

    // Command: ping <host>
    if (cmd === 'ping') {
      const host = arg1 || 'github.com';
      addEntry('info', `[PING] ${host} adresine DoH ve HTTP probe başlatılıyor...`);
      try {
        const res = await probeEndpoint(host, host);
        if (host === 'github.com' && res.latencyMs !== null) {
          setLastPingMs(res.latencyMs);
        }
        sounds.playSuccessTone();
        addEntry(
          res.status === 'online' ? 'success' : 'warn',
          `[SONUÇ] ${host} -> Gecikme: ${res.latencyMs}ms | Durum: ${res.status.toUpperCase()} | Çözümlenen IP: ${res.resolvedIp} (${res.dohProvider})`
        );
      } catch (err: any) {
        sounds.playErrorTone();
        addEntry('error', `[HATA] Ping başarısız: ${err.message}`);
      }
      return;
    }

    // Command: dns <domain>
    if (cmd === 'dns') {
      const domain = arg1 || 'github.com';
      addEntry('info', `[DNS] Cloudflare DoH 1.1.1.1 üzerinden '${domain}' A kaydı sorgulanıyor...`);
      try {
        const res = await resolveDnsCloudflare(domain);
        if (res.ips.length > 0) {
          sounds.playSuccessTone();
          addEntry('success', `[DNS YANITI] Durum: ${res.status} | TTL: ${res.ttl}s`);
          addEntry('output', `IP Adresleri:\n${res.ips.map((ip) => `  -> ${ip}`).join('\n')}`);
        } else {
          sounds.playErrorTone();
          addEntry('error', `[DNS HATA] IP adresi çözümlenemedi veya DNS filtresi aktif.`);
        }
      } catch (err: any) {
        sounds.playErrorTone();
        addEntry('error', `[HATA] DoH sorgusu başarısız: ${err.message}`);
      }
      return;
    }

    // Command: gh repo <owner/repo>
    if (cmd === 'gh' && parts[1]?.toLowerCase() === 'repo') {
      const target = parts[2] || 'cagritaskn/GoodbyeDPI-Turkey';
      addEntry('info', `[GITHUB API] '${target}' deposu sorgulanıyor...`);
      try {
        const cleanTarget = target.replace(/^https?:\/\/github\.com\//, '');
        const [owner, repo] = cleanTarget.split('/');
        if (!owner || !repo) {
          throw new Error("Lütfen 'kullanici/depo' şeklinde girin.");
        }

        const data = await fetchGitHubRepo(owner, repo);
        sounds.playSuccessTone();

        addEntry('success', `=== [GITHUB REPO] ${data.full_name} ===`);
        addEntry('output', `  Açıklama     : ${data.description || 'Açıklama yok'}`);
        addEntry('output', `  Yıldız (★)   : ${data.stargazers_count.toLocaleString()} | Fork (⑂): ${data.forks_count.toLocaleString()}`);
        addEntry('output', `  Açık Sorunlar: ${data.open_issues_count}`);
        addEntry('output', `  Ana Dil      : ${data.language || 'Belirtilmemiş'}`);
        addEntry('output', `  Klonlama     : git clone ${data.html_url}.git`);
        addEntry('output', `  GitHub URL   : ${data.html_url}`);
      } catch (err: any) {
        sounds.playErrorTone();
        addEntry('error', `[GITHUB HATA] ${err.message}`);
      }
      return;
    }

    // Command: gh release <owner/repo>
    if (cmd === 'gh' && parts[1]?.toLowerCase() === 'release') {
      const target = parts[2] || 'cagritaskn/GoodbyeDPI-Turkey';
      addEntry('info', `[GITHUB API] '${target}' sürüm paketleri çekiliyor...`);
      try {
        const cleanTarget = target.replace(/^https?:\/\/github\.com\//, '');
        const [owner, repo] = cleanTarget.split('/');
        const releases = await fetchRepoReleases(owner, repo);
        if (releases.length === 0) {
          addEntry('warn', `Bu depoya ait yayınlanmış release bulunamadı.`);
          return;
        }

        sounds.playSuccessTone();
        const latest = releases[0];
        addEntry('success', `=== [SON SÜRÜM] ${latest.name || latest.tag_name} (${latest.tag_name}) ===`);
        addEntry('output', `  Tarih : ${new Date(latest.published_at).toLocaleDateString('tr-TR')}`);
        addEntry('output', `  Link  : ${latest.html_url}`);

        if (latest.assets.length > 0) {
          const rows = latest.assets.map((a) => [
            a.name,
            `${(a.size / (1024 * 1024)).toFixed(2)} MB`,
            a.download_count.toString(),
            a.browser_download_url,
          ]);
          addEntry('table', 'İndirilebilir Dosyalar:', {
            headers: ['Dosya Adı', 'Boyut', 'İndirilme Sayısı', 'İndirme Bağlantısı'],
            rows,
          });
        }
      } catch (err: any) {
        sounds.playErrorTone();
        addEntry('error', `[HATA] Sürümler alınamadı: ${err.message}`);
      }
      return;
    }

    // Command: gh user <username>
    if (cmd === 'gh' && parts[1]?.toLowerCase() === 'user') {
      const user = parts[2] || 'cagritaskn';
      addEntry('info', `[GITHUB API] Kullanıcı '${user}' sorgulanıyor...`);
      try {
        const u = await fetchGitHubUser(user);
        sounds.playSuccessTone();
        addEntry('success', `=== [KULLANICI] ${u.name || u.login} (@${u.login}) ===`);
        addEntry('output', `  Bio        : ${u.bio || 'Yok'}`);
        addEntry('output', `  Açık Depo  : ${u.public_repos} repo`);
        addEntry('output', `  Takipçiler : ${u.followers} takipçi`);
        addEntry('output', `  Konum      : ${u.location || 'Belirtilmemiş'}`);
        addEntry('output', `  Profil     : ${u.html_url}`);
      } catch (err: any) {
        sounds.playErrorTone();
        addEntry('error', `[HATA] Kullanıcı bulunamadı: ${err.message}`);
      }
      return;
    }

    // Command: git config bypass on
    if (cmd === 'git' && parts[1]?.toLowerCase() === 'config') {
      sounds.playSuccessTone();
      addEntry('success', `[OK] Git CLI Performans ve Hata Giderici Ayarları:`);
      addEntry('output', `git config --global http.postBuffer 524288000`);
      addEntry('output', `git config --global http.lowSpeedLimit 0`);
      addEntry('output', `git config --global http.lowSpeedTime 999999`);
      addEntry('output', `git config --global http.sslVerify true`);
      addEntry('info', `[İPUCU] Bu ayarlar büyük depolardaki (Git LFS / NPM) 'RPC failed; curl 56' ve zaman aşımı hatalarını çözer.`);
      return;
    }

    // Command: git status
    if (cmd === 'git' && parts[1]?.toLowerCase() === 'status') {
      sounds.playKeyClick();
      addEntry('output', `On branch main\nYour branch is up to date with 'origin/main'.\n\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n\n\tmodified:   goodbyedpi/turkey_preset.cmd\n\tmodified:   git_config_speedup.bat\n\nno changes added to commit (use "git add")`);
      return;
    }

    // Command: git log
    if (cmd === 'git' && parts[1]?.toLowerCase() === 'log') {
      sounds.playKeyClick();
      addEntry('output', `* f7a91b2 (HEAD -> main, origin/main) feat: add GoodbyeDPI Turkey preset -9 -e 1 -q\n* 3c48d21 feat: implement DoH 1.1.1.1 fallback resolver\n* 9e1028a fix: resolve raw.githubusercontent.com TLS fragmentation\n* 18f50c4 init: initial repository setup`);
      return;
    }

    // Command: script cmd or script sh
    if (cmd === 'script') {
      const type = (arg1 || 'cmd').toLowerCase();
      sounds.playSuccessTone();
      if (type === 'cmd' || type === 'bat') {
        const content = generateWindowsCmd(activePreset, ['github.com', 'raw.githubusercontent.com']);
        triggerDownload(content, `goodbyedpi_turkey_preset_${activePreset.id}.cmd`);
        addEntry('success', `[İNDİRİLDİ] 'goodbyedpi_turkey_preset_${activePreset.id}.cmd' dosyası tarayıcınıza indirildi.`);
        addEntry('info', `[ÇALIŞTIRMA] Dosyaya sağ tıklayıp 'Yönetici Olarak Çalıştır' seçin.`);
      } else {
        addEntry('info', `[BİLGİ] 'Betik Üretici' sekmesine geçiş yapabilirsiniz.`);
        setActiveTab('scripts');
      }
      return;
    }

    // Command: theme <color>
    if (cmd === 'theme') {
      const color = arg1?.toLowerCase() as ThemeType;
      if (['green', 'cyan', 'amber', 'purple', 'matrix'].includes(color)) {
        setTheme(color);
        sounds.playSuccessTone();
        addEntry('success', `[TEMA] Terminal teması '${color}' olarak değiştirildi.`);
      } else {
        addEntry('warn', `Geçersiz tema. Seçenekler: green, cyan, amber, purple, matrix`);
      }
      return;
    }

    // Command: sound on/off
    if (cmd === 'sound') {
      const state = arg1?.toLowerCase();
      if (state === 'off') {
        setIsMuted(true);
        sounds.setMuted(true);
        addEntry('output', `[SES] Ses efektleri kapatıldı.`);
      } else {
        setIsMuted(false);
        sounds.setMuted(false);
        sounds.playSuccessTone();
        addEntry('output', `[SES] Ses efektleri açıldı.`);
      }
      return;
    }

    // Unknown command fallback
    sounds.playErrorTone();
    addEntry('error', `Bilinmeyen komut: '${trimmed}'. Desteklenen komutları görmek için 'help' veya 'menu' yazın.`);
  };

  return (
    <div className="min-h-screen bg-[#080b0e] text-slate-200 flex flex-col font-mono selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Telemetry and Navigation Bar */}
      <TerminalHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activePreset={activePreset}
        isEngineRunning={isEngineRunning}
        theme={theme}
        setTheme={setTheme}
        crtEffect={crtEffect}
        setCrtEffect={setCrtEffect}
        isMuted={isMuted}
        toggleMute={toggleMute}
        lastPingMs={lastPingMs}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'terminal' && (
          <TerminalView
            entries={entries}
            onExecuteCommand={handleExecuteCommand}
            onClear={() => setEntries([])}
            activePreset={activePreset}
            theme={theme}
            crtEffect={crtEffect}
            isEngineRunning={isEngineRunning}
          />
        )}

        {activeTab === 'presets' && (
          <PresetManager
            activePreset={activePreset}
            onSelectPreset={setActivePreset}
            onExecuteCommand={handleExecuteCommand}
            isEngineRunning={isEngineRunning}
          />
        )}

        {activeTab === 'github' && (
          <GitHubExplorer onExecuteCommand={handleExecuteCommand} />
        )}

        {activeTab === 'diagnostics' && (
          <NetworkDiagnosticsView
            onExecuteCommand={handleExecuteCommand}
            onUpdateLastPing={(ms) => setLastPingMs(ms)}
          />
        )}

        {activeTab === 'scripts' && (
          <ScriptGeneratorView
            activePreset={activePreset}
            onExecuteCommand={handleExecuteCommand}
          />
        )}

        {activeTab === 'cheatsheet' && (
          <CommandCheatsheet onExecuteCommand={handleExecuteCommand} />
        )}
      </main>
    </div>
  );
}
