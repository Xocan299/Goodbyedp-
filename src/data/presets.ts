import { PresetConfig } from '../types/terminal';

export const PRESETS: PresetConfig[] = [
  {
    id: 1,
    name: 'Turkey Standart Preset (-9 -e 1 -q)',
    code: 'preset 1',
    ispTag: 'Genel / TTNET / Superonline',
    description: 'Türkiye için en dengeli ve tavsiye edilen standart mod. Discord, GitHub ve Raw CDN için optimize edilmiştir.',
    details: [
      'Fake TCP ClientHello paketi gönderir (TTL hop 3-4)',
      'SNI alanını iki parçaya böler (-e 1)',
      'Ekstra geçersiz TCP checksum bayrağı kullanır',
      'Quad9 / Cloudflare DoH DNS yönlendirmesi içerir'
    ],
    commandArgs: '-9 -e 1 -q --fake-gen 29 --fake-from-hex 160301ffff01 --dns-addr 77.88.8.8 --dns-port 1253',
    recommendedFor: ['Discord', 'github.com', 'raw.githubusercontent.com', 'Türk Telekom', 'Turkcell'],
    params: {
      mode: 9,
      dnsAddr: '77.88.8.8',
      dnsPort: 1253,
      sniFrag: true,
      fakeGen: 29,
      autoTtl: true,
      wrongChksum: true,
      blacklist: 'russia-blacklist.txt / turkey-blacklist.txt'
    }
  },
  {
    id: 2,
    name: 'Superonline / Turkcell DPI Bypass',
    code: 'preset 2',
    ispTag: 'Superonline Fiber & VDSL',
    description: 'Superonline DPI ve SNI filtrelerine özel parçalama. 2 byte HTTP/HTTPS split ve fake TCP paketi uygular.',
    details: [
      'SNI parçalama seviyesi: -e 2 (orta seviye)',
      'Hedef DoH adresi: 1.1.1.1 Cloudflare DNS',
      'DPI sahte paket TTL seviyesi: 29',
      'Git clone & Raw içerik indirmelerindeki kesintileri engeller'
    ],
    commandArgs: '-5 -e 2 -q --fake-gen 29 --auto-ttl 1-4 --dns-addr 1.1.1.1 --dns-port 53',
    recommendedFor: ['Turkcell Superonline', 'Git LFS', 'GitHub Releases'],
    params: {
      mode: 5,
      dnsAddr: '1.1.1.1',
      dnsPort: 53,
      sniFrag: true,
      fakeGen: 29,
      autoTtl: true,
      wrongChksum: false,
      blacklist: 'turkey-blacklist.txt'
    }
  },
  {
    id: 3,
    name: 'Türk Telekom / TTNET Agresif Mod',
    code: 'preset 3',
    ispTag: 'Türk Telekom & TTNET',
    description: 'Türk Telekom altyapısındaki derin paket incelemelerini (DPI) atlatmak için tam karmaşa ve sahte TCP başlığı.',
    details: [
      'Agresif TTL hop (1-3 arası atlama)',
      'Wrong TCP sequence & checksum kombini',
      'DNS Poisoning koruması: Quad9 (9.9.9.9) şifreli DNS',
      'raw.githubusercontent ve gist erişim engellerini aşar'
    ],
    commandArgs: '-9 -e 1 -q --wrong-chksum --wrong-seq --auto-ttl 1-3 --dns-addr 9.9.9.9 --dns-port 53',
    recommendedFor: ['Türk Telekom', 'TTNET Mobil/Ev', 'gist.github.com'],
    params: {
      mode: 9,
      dnsAddr: '9.9.9.9',
      dnsPort: 53,
      sniFrag: true,
      fakeGen: 31,
      autoTtl: true,
      wrongChksum: true,
      blacklist: 'turkey-blacklist.txt'
    }
  },
  {
    id: 4,
    name: 'Vodafone Net Hex Bölümleme',
    code: 'preset 4',
    ispTag: 'Vodafone Ev & Mobil',
    description: 'Vodafone ağında uygulanan SNI filtreleri için özel Hex bayt bölmesi ve ters sırada TCP paket iletimi.',
    details: [
      'Ters sıra paket gönderimi (--reverse-frag)',
      'DoH Adresi: Google Public DNS (8.8.8.8)',
      'GitHub Asset ve Release indirme hızını sabitler'
    ],
    commandArgs: '-7 -e 1 -s -m --fake-gen 24 --dns-addr 8.8.8.8 --dns-port 53',
    recommendedFor: ['Vodafone Ev İnterneti', 'Vodafone 4.5G/5G', 'GitHub Assets'],
    params: {
      mode: 7,
      dnsAddr: '8.8.8.8',
      dnsPort: 53,
      sniFrag: true,
      fakeGen: 24,
      autoTtl: true,
      wrongChksum: false,
      blacklist: 'turkey-blacklist.txt'
    }
  },
  {
    id: 5,
    name: 'GitHub & Raw Content Express',
    code: 'preset 5',
    ispTag: 'Tüm Sağlayıcılar (GitHub Odaklı)',
    description: 'Özellikle GitHub CLI, Git Clone, NPM paketleri ve Raw GitHub içerikleri için hafifletilmiş, düşük gecikmeli mod.',
    details: [
      'Düşük gecikme süresi (low-latency bypass)',
      'Yalnızca GitHub domainleri için WinDivert filtreleme',
      'Cloudflare 1.1.1.1 DoH ile anında IP çözümleme',
      'Git terminal SSL el sıkışma hatalarını ortadan kaldırır'
    ],
    commandArgs: '-1 -a -e 1 --dns-addr 1.1.1.1 --dns-port 53 --blacklist github-hosts.txt',
    recommendedFor: ['GitHub CLI (gh)', 'npm install', 'git clone', 'Developer Workflows'],
    params: {
      mode: 1,
      dnsAddr: '1.1.1.1',
      dnsPort: 53,
      sniFrag: true,
      fakeGen: 15,
      autoTtl: false,
      wrongChksum: false,
      blacklist: 'github-hosts.txt'
    }
  },
  {
    id: 6,
    name: 'Maksimum Parçalama & Zapret Hibrit (-9 Extreme)',
    code: 'preset 6',
    ispTag: 'Ağır Sansür & Katı Güvenlik Duvarı',
    description: 'En inatçı DPI cihazlarını dahi aldatabilen derin paket parçalama ve fake TCP başlık kombini.',
    details: [
      'Tam seviye paket parçalama (-9)',
      'DPI atlatma fake-packet jeneratörü',
      'Yandex Safe DNS veya DoH tüneli',
      'Tüm engelli GitHub, Pastebin, Discord servislerini açar'
    ],
    commandArgs: '-9 -e 1 -q --fake-gen 29 --fake-from-hex 160301ffff0101 --wrong-chksum --wrong-seq --auto-ttl 1-4',
    recommendedFor: ['Kurumsal Ağlar', 'Üniversite Ağları', 'Yüksek Sansür'],
    params: {
      mode: 9,
      dnsAddr: '77.88.8.8',
      dnsPort: 1253,
      sniFrag: true,
      fakeGen: 29,
      autoTtl: true,
      wrongChksum: true,
      blacklist: 'all-services-turkey.txt'
    }
  }
];

export const GITHUB_HOSTS_LIST = [
  'github.com',
  'api.github.com',
  'raw.githubusercontent.com',
  'gist.github.com',
  'github.githubassets.com',
  'avatars.githubusercontent.com',
  'objects.githubusercontent.com',
  'codeload.github.com'
];
