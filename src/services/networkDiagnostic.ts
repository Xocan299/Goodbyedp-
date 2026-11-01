import { NetworkProbeResult } from '../types/terminal';

/**
 * Resolves DNS via Cloudflare DNS over HTTPS (CORS enabled)
 */
export async function resolveDnsCloudflare(domain: string): Promise<{ ips: string[]; ttl: number; status: string }> {
  try {
    const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=A`, {
      headers: { Accept: 'application/dns-json' },
    });
    if (!res.ok) throw new Error(`Cloudflare DoH error: ${res.status}`);
    const data = await res.json();
    const answers = data.Answer || [];
    const ips = answers.filter((a: any) => a.type === 1).map((a: any) => a.data);
    const ttl = answers.length > 0 ? answers[0].TTL : 300;
    return { ips, ttl, status: data.Status === 0 ? 'NOERROR' : `STATUS_${data.Status}` };
  } catch (err: any) {
    return { ips: [], ttl: 0, status: err.message || 'DNS_FAIL' };
  }
}

/**
 * Resolves DNS via Google Public DNS over HTTPS (CORS enabled)
 */
export async function resolveDnsGoogle(domain: string): Promise<{ ips: string[]; ttl: number; status: string }> {
  try {
    const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`);
    if (!res.ok) throw new Error(`Google DoH error: ${res.status}`);
    const data = await res.json();
    const answers = data.Answer || [];
    const ips = answers.filter((a: any) => a.type === 1).map((a: any) => a.data);
    const ttl = answers.length > 0 ? answers[0].TTL : 300;
    return { ips, ttl, status: data.Status === 0 ? 'NOERROR' : `STATUS_${data.Status}` };
  } catch (err: any) {
    return { ips: [], ttl: 0, status: err.message || 'DNS_FAIL' };
  }
}

/**
 * Probes latency to GitHub and related domains
 */
export async function probeEndpoint(host: string, label: string): Promise<NetworkProbeResult> {
  const startTime = performance.now();
  let resolvedIp = 'Bilinmiyor';
  let dohProvider = 'Cloudflare 1.1.1.1';

  try {
    // 1. Resolve DNS
    const dnsResult = await resolveDnsCloudflare(host);
    if (dnsResult.ips.length > 0) {
      resolvedIp = dnsResult.ips[0];
    } else {
      const googleDns = await resolveDnsGoogle(host);
      if (googleDns.ips.length > 0) {
        resolvedIp = googleDns.ips[0];
        dohProvider = 'Google 8.8.8.8';
      }
    }

    // 2. Measure ping via fetch head/get with cache busting
    let probeUrl = `https://${host}`;
    if (host === 'raw.githubusercontent.com') {
      probeUrl = `https://raw.githubusercontent.com/ValdikSS/GoodbyeDPI/master/README.md?t=${Date.now()}`;
    } else if (host === 'api.github.com') {
      probeUrl = `https://api.github.com/zen?t=${Date.now()}`;
    } else if (host === 'objects.githubusercontent.com') {
      probeUrl = `https://github.githubassets.com/favicons/favicon.png?t=${Date.now()}`;
    }

    let status: 'online' | 'blocked' | 'slow' | 'error' = 'online';
    let httpStatus = 200;

    try {
      const res = await fetch(probeUrl, {
        method: 'GET',
        mode: 'no-cors', // allows ping test without CORS blocking ping time
        cache: 'no-cache',
      });
      // no-cors returns opaque status 0
      httpStatus = res.status || 200;
    } catch (e: any) {
      // If blocked by ISP or network fail
      status = 'blocked';
    }

    const elapsed = Math.round(performance.now() - startTime);

    if (status !== 'blocked') {
      if (elapsed > 350) {
        status = 'slow';
      } else {
        status = 'online';
      }
    }

    return {
      host,
      label,
      status,
      latencyMs: elapsed,
      resolvedIp,
      dohProvider,
      httpStatus,
      message: status === 'online' ? 'Erişilebilir (DPI Bypass Aktif)' : status === 'slow' ? 'Yüksek Gecikme' : 'Engellendi / Filtre Algılandı',
    };
  } catch (err: any) {
    const elapsed = Math.round(performance.now() - startTime);
    return {
      host,
      label,
      status: 'error',
      latencyMs: elapsed,
      resolvedIp,
      dohProvider,
      message: err.message || 'Bağlantı Zaman Aşımı',
    };
  }
}
