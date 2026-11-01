import { GithubRepoInfo, GithubUserInfo, GithubReleaseInfo } from '../types/terminal';

let customGithubToken: string | null = null;

export function setGithubToken(token: string | null) {
  customGithubToken = token && token.trim().length > 0 ? token.trim() : null;
}

export function getGithubToken(): string | null {
  return customGithubToken;
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (customGithubToken) {
    headers['Authorization'] = `token ${customGithubToken}`;
  }
  return headers;
}

export async function fetchGitHubRepo(owner: string, repo: string): Promise<GithubRepoInfo> {
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Repository '${owner}/${repo}' bulunamadı (404).`);
    } else if (res.status === 403) {
      throw new Error(`GitHub API Hız Sınırı (Rate Limit) aşıldı veya erişim engellendi (403). Lütfen bir GitHub Token girin.`);
    }
    throw new Error(`GitHub API Hatası: HTTP ${res.status} ${res.statusText}`);
  }
  return await res.json();
}

export async function fetchGitHubUser(username: string): Promise<GithubUserInfo> {
  const url = `https://api.github.com/users/${encodeURIComponent(username)}`;
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Kullanıcı '${username}' bulunamadı.`);
    }
    throw new Error(`GitHub API Hatası: HTTP ${res.status}`);
  }
  return await res.json();
}

export async function fetchUserRepos(username: string, limit = 10): Promise<GithubRepoInfo[]> {
  const url = `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=${limit}`;
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) {
    throw new Error(`Kullanıcı depoları alınamadı: HTTP ${res.status}`);
  }
  return await res.json();
}

export async function fetchRepoReleases(owner: string, repo: string): Promise<GithubReleaseInfo[]> {
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/releases?per_page=5`;
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) {
    return [];
  }
  return await res.json();
}

export async function fetchRepoIssues(owner: string, repo: string, limit = 5): Promise<any[]> {
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues?state=open&per_page=${limit}`;
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) {
    return [];
  }
  return await res.json();
}

export async function fetchRateLimit(): Promise<{ limit: number; remaining: number; resetTime: string }> {
  try {
    const res = await fetch('https://api.github.com/rate_limit', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to get rate limit');
    const data = await res.json();
    const core = data.resources?.core || { limit: 60, remaining: 60, reset: Math.floor(Date.now() / 1000) + 3600 };
    const date = new Date(core.reset * 1000);
    return {
      limit: core.limit,
      remaining: core.remaining,
      resetTime: date.toLocaleTimeString(),
    };
  } catch {
    return { limit: 60, remaining: 50, resetTime: 'Bilinmiyor' };
  }
}
