export type ThemeType = 'green' | 'cyan' | 'amber' | 'purple' | 'matrix';

export interface TerminalEntry {
  id: string;
  timestamp: string;
  type: 'cmd' | 'output' | 'error' | 'success' | 'info' | 'warn' | 'ascii' | 'table';
  content: string;
  rawCommand?: string;
  tableData?: { headers: string[]; rows: string[][] };
}

export interface PresetConfig {
  id: number;
  name: string;
  code: string;
  ispTag: string;
  description: string;
  details: string[];
  commandArgs: string;
  recommendedFor: string[];
  params: {
    mode: number;
    dnsAddr: string;
    dnsPort: number;
    sniFrag: boolean;
    fakeGen: number;
    autoTtl: boolean;
    wrongChksum: boolean;
    blacklist: string;
  };
}

export interface GithubRepoInfo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  default_branch: string;
  updated_at: string;
  topics: string[];
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
}

export interface GithubUserInfo {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
  company: string | null;
  location: string | null;
}

export interface GithubReleaseInfo {
  tag_name: string;
  name: string;
  published_at: string;
  body: string;
  html_url: string;
  assets: {
    name: string;
    size: number;
    download_count: number;
    browser_download_url: string;
  }[];
}

export interface NetworkProbeResult {
  host: string;
  label: string;
  status: 'pending' | 'online' | 'blocked' | 'slow' | 'error';
  latencyMs: number | null;
  resolvedIp: string | null;
  dohProvider: string;
  httpStatus?: number;
  message?: string;
}

export interface CustomCommand {
  id: string;
  category: 'gh' | 'goodypi' | 'git' | 'diag' | 'system';
  command: string;
  title: string;
  description: string;
}
