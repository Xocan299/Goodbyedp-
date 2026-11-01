import React, { useState, useEffect } from 'react';
import { 
  Github, 
  Search, 
  Star, 
  GitFork, 
  AlertCircle, 
  ExternalLink, 
  Download, 
  Terminal, 
  Copy, 
  Check, 
  Key, 
  Loader2,
  Tag,
  GitBranch,
  Activity,
  User,
  BookOpen
} from 'lucide-react';
import { 
  fetchGitHubRepo, 
  fetchRepoReleases, 
  fetchRepoIssues, 
  fetchGitHubUser,
  setGithubToken,
  getGithubToken,
  fetchRateLimit
} from '../services/githubApi';
import { GithubRepoInfo, GithubReleaseInfo } from '../types/terminal';
import { sounds } from '../services/soundEffects';

interface GitHubExplorerProps {
  onExecuteCommand: (command: string) => void;
}

export const GitHubExplorer: React.FC<GitHubExplorerProps> = ({ onExecuteCommand }) => {
  const [repoQuery, setRepoQuery] = useState('cagritaskn/GoodbyeDPI-Turkey');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentRepo, setCurrentRepo] = useState<GithubRepoInfo | null>(null);
  const [releases, setReleases] = useState<GithubReleaseInfo[]>([]);
  const [issues, setIssues] = useState<any[]>([]);

  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState(getGithubToken() || '');
  const [tokenSaved, setTokenSaved] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ limit: number; remaining: number; resetTime: string } | null>(null);

  // Quick repository links
  const featuredRepos = [
    { label: 'GoodbyeDPI-Turkey', path: 'cagritaskn/GoodbyeDPI-Turkey', desc: 'Türkiye için popüler Discord/GitHub bypass' },
    { label: 'GoodbyeDPI (Orijinal)', path: 'ValdikSS/GoodbyeDPI', desc: 'ValdikSS açık kaynak DPI atlatma motoru' },
    { label: 'GitHub CLI (gh)', path: 'cli/cli', desc: 'Resmi GitHub komut satırı aracı' },
    { label: 'Zapret', path: 'bol-van/zapret', desc: 'Linux & Router için DPI atlatıcı' },
  ];

  const loadRepository = async (path: string) => {
    sounds.playKeyClick();
    const cleanPath = path.trim().replace(/^https?:\/\/github\.com\//, '');
    const parts = cleanPath.split('/');
    if (parts.length < 2) {
      setError("Lütfen 'kullanici/depo' formatında girin (örn: cagritaskn/GoodbyeDPI-Turkey)");
      sounds.playErrorTone();
      return;
    }

    const [owner, repo] = parts;
    setLoading(true);
    setError(null);

    try {
      const [repoData, releasesData, issuesData] = await Promise.all([
        fetchGitHubRepo(owner, repo),
        fetchRepoReleases(owner, repo),
        fetchRepoIssues(owner, repo, 5),
      ]);

      setCurrentRepo(repoData);
      setReleases(releasesData);
      setIssues(issuesData);
      sounds.playSuccessTone();

      // Refresh rate limits
      const rl = await fetchRateLimit();
      setRateLimitInfo(rl);
    } catch (err: any) {
      setError(err.message || 'Depo bilgileri alınırken hata oluştu.');
      sounds.playErrorTone();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRepository('cagritaskn/GoodbyeDPI-Turkey');
  }, []);

  const handleCopy = (text: string) => {
    sounds.playKeyClick();
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSaveToken = () => {
    sounds.playKeyClick();
    setGithubToken(tokenInput);
    setTokenSaved(true);
    setTimeout(() => setTokenSaved(false), 2000);
    fetchRateLimit().then(setRateLimitInfo);
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* Search Header */}
      <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Github className="w-5 h-5 text-purple-400" />
              <span>GitHub Depoları & Canlı API Araçları</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              İstediğiniz GitHub deposunu sorgulayın, son sürümleri inceleyin ve klonlama komutlarını terminale aktarın.
            </p>
          </div>

          {/* Rate limit badge */}
          {rateLimitInfo && (
            <div className="text-right text-xs">
              <span className="text-slate-500 block">GitHub API Kotası:</span>
              <span className={`font-mono font-bold ${rateLimitInfo.remaining < 10 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {rateLimitInfo.remaining} / {rateLimitInfo.limit} istek
              </span>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={repoQuery}
              onChange={(e) => setRepoQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadRepository(repoQuery)}
              placeholder="kullanici/depo-adi (örn: cagritaskn/GoodbyeDPI-Turkey veya cli/cli)..."
              className="w-full bg-slate-950 border border-slate-700 rounded-md pl-9 pr-3 py-2 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <button
            onClick={() => loadRepository(repoQuery)}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-md text-xs font-bold flex items-center justify-center gap-2 transition-colors shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Depoyu Sorgula</span>
          </button>
        </div>

        {/* Quick Featured Repo Chips */}
        <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
          <span className="text-slate-500 text-[11px] font-medium">Önerilen Depolar:</span>
          {featuredRepos.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                setRepoQuery(item.path);
                loadRepository(item.path);
              }}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Repository Details Container */}
      {currentRepo && (
        <div className="space-y-6">
          {/* Main Repo Card */}
          <div className="p-5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={currentRepo.owner.avatar_url}
                  alt={currentRepo.owner.login}
                  className="w-12 h-12 rounded-full border border-slate-700 bg-slate-800"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white font-mono">
                      {currentRepo.full_name}
                    </h3>
                    <a
                      href={currentRepo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-white"
                      title="GitHub'da Aç"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {currentRepo.description || 'Açıklama belirtilmemiş.'}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3 text-xs font-mono">
                <div className="flex items-center gap-1 text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded border border-amber-800/40">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{currentRepo.stargazers_count.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1 text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded border border-cyan-800/40">
                  <GitFork className="w-3.5 h-3.5" />
                  <span>{currentRepo.forks_count.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1 text-rose-400 bg-rose-950/40 px-2.5 py-1 rounded border border-rose-800/40">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{currentRepo.open_issues_count} sorun</span>
                </div>
              </div>
            </div>

            {/* Topics */}
            {currentRepo.topics && currentRepo.topics.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {currentRepo.topics.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-purple-300 border border-slate-700"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Quick Action Commands */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded bg-black/60 border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Git Clone (HTTPS):</span>
                  <button
                    onClick={() => handleCopy(`git clone ${currentRepo.html_url}.git`)}
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                  >
                    {copiedText === `git clone ${currentRepo.html_url}.git` ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>Kopyala</span>
                  </button>
                </div>
                <div className="font-mono text-xs text-emerald-400 break-all select-all">
                  git clone {currentRepo.html_url}.git
                </div>
              </div>

              <div className="p-3 rounded bg-black/60 border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">GitHub CLI (gh clone):</span>
                  <button
                    onClick={() => handleCopy(`gh repo clone ${currentRepo.full_name}`)}
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                  >
                    {copiedText === `gh repo clone ${currentRepo.full_name}` ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>Kopyala</span>
                  </button>
                </div>
                <div className="font-mono text-xs text-cyan-400 break-all select-all">
                  gh repo clone {currentRepo.full_name}
                </div>
              </div>
            </div>

            {/* Terminal Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
              <button
                onClick={() => onExecuteCommand(`gh repo ${currentRepo.full_name}`)}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Terminale Yazdır</span>
              </button>

              <button
                onClick={() => onExecuteCommand(`test`)}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span>Erişim & DNS Testi Başlat</span>
              </button>

              <button
                onClick={() => onExecuteCommand(`gh user ${currentRepo.owner.login}`)}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-purple-400" />
                <span>Geliştirici Profilini Çek</span>
              </button>
            </div>
          </div>

          {/* Releases Section */}
          <div className="p-5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Son Sürümler & İndirilebilir Dosyalar (Releases)</span>
            </h3>

            {releases.length === 0 ? (
              <p className="text-xs text-slate-400">Bu depoya ait yayınlanmış resmi bir sürüm bulunamadı.</p>
            ) : (
              <div className="space-y-3">
                {releases.map((rel) => (
                  <div key={rel.tag_name} className="p-3 rounded bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-mono text-xs font-bold text-white">{rel.name || rel.tag_name}</span>
                        <span className="text-[11px] text-slate-500">({rel.tag_name})</span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(rel.published_at).toLocaleDateString('tr-TR')}
                      </span>
                    </div>

                    {/* Assets list */}
                    {rel.assets.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                          İndirilebilir Paketler:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {rel.assets.map((asset) => (
                            <a
                              key={asset.name}
                              href={asset.browser_download_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 hover:text-emerald-400 transition-colors"
                            >
                              <span className="font-mono truncate">{asset.name}</span>
                              <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                                {(asset.size / (1024 * 1024)).toFixed(1)} MB
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* GitHub Token Config Box */}
      <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800 space-y-2">
        <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2">
          <Key className="w-3.5 h-3.5 text-amber-400" />
          <span>İsteğe Bağlı: GitHub Personal Access Token (PAT)</span>
        </h3>
        <p className="text-[11px] text-slate-400">
          Token girmeden de saatte 60 herkese açık istek yapabilirsiniz. Yüksek hacimli depolar için kendi token'ınızı girebilirsiniz.
        </p>
        <div className="flex gap-2 max-w-md pt-1">
          <input
            type="password"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            className="flex-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
          />
          <button
            onClick={handleSaveToken}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded transition-colors flex items-center gap-1"
          >
            {tokenSaved ? <Check className="w-3 h-3 text-emerald-400" /> : null}
            <span>Kaydet</span>
          </button>
        </div>
      </div>
    </div>
  );
};
