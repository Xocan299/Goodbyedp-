import { CustomCommand } from '../types/terminal';

export const COMMAND_PALETTE: CustomCommand[] = [
  // GoodbyeDPI Presets
  {
    id: 'preset-1',
    category: 'goodypi',
    command: 'preset 1',
    title: 'Standart Türkiye Modu (-9 -e 1 -q)',
    description: 'En stabil Discord & GitHub bypass modu. Sahte paket ve SNI bölme uygular.',
  },
  {
    id: 'preset-2',
    category: 'goodypi',
    command: 'preset 2',
    title: 'Superonline Modu (-5 -e 2)',
    description: 'Turkcell Superonline DPI filtreleri ve yüksek boyutlu indirmeler için optimize.',
  },
  {
    id: 'preset-3',
    category: 'goodypi',
    command: 'preset 3',
    title: 'Türk Telekom / TTNET Agresif (-9)',
    description: 'Türk Telekom katı paket denetimi ve wrong checksum bypass.',
  },
  {
    id: 'preset-4',
    category: 'goodypi',
    command: 'preset 4',
    title: 'Vodafone Hex Bölümleme (-7)',
    description: 'Vodafone altyapısı için SNI Hex split ve ters paket iletimi.',
  },
  {
    id: 'preset-5',
    category: 'goodypi',
    command: 'preset 5',
    title: 'GitHub Express Modu (-1)',
    description: 'Düşük gecikmeli, sadece GitHub ve Raw CDN hedefli hafif mod.',
  },
  {
    id: 'preset-6',
    category: 'goodypi',
    command: 'preset 6',
    title: 'Maksimum Parçalama (-9 Extreme)',
    description: 'En inatçı sansür mekanizmaları için çift katmanlı sahte paket.',
  },
  {
    id: 'status',
    category: 'goodypi',
    command: 'status',
    title: 'Servis ve Motor Durumu',
    description: 'Aktif DPI modu, WinDivert simülasyonu ve bağlantı metriklerini gösterir.',
  },
  {
    id: 'goodypi-stop',
    category: 'goodypi',
    command: 'stop',
    title: 'DPI Servisini Durdur',
    description: 'Filtrelemeyi ve sahte paket enjeksiyonunu devre dışı bırakır.',
  },

  // GitHub Commands
  {
    id: 'gh-view-turkey',
    category: 'gh',
    command: 'gh repo cagritaskn/GoodbyeDPI-Turkey',
    title: 'GoodbyeDPI-Turkey Deposunu İncele',
    description: 'Türkiye için popüler GoodbyeDPI reposunun yıldız, fork ve release bilgilerini çeker.',
  },
  {
    id: 'gh-view-original',
    category: 'gh',
    command: 'gh repo ValdikSS/GoodbyeDPI',
    title: 'Orijinal ValdikSS/GoodbyeDPI Reposu',
    description: 'Orijinal GoodbyeDPI C kaynak kod deposunu ve sürümlerini sorgular.',
  },
  {
    id: 'gh-releases',
    category: 'gh',
    command: 'gh release cagritaskn/GoodbyeDPI-Turkey',
    title: 'Son Sürümleri ve İndirme Linklerini Getir',
    description: 'cagritaskn/GoodbyeDPI-Turkey deposunun en son .zip / .cmd paketlerini listeler.',
  },
  {
    id: 'gh-user-cagri',
    category: 'gh',
    command: 'gh user cagritaskn',
    title: 'Geliştirici Profilini Sorgula',
    description: 'Geliştiricinin herkese açık GitHub istatistiklerini ve repolarını görüntüler.',
  },
  {
    id: 'gh-repo-list',
    category: 'gh',
    command: 'gh repo list cagritaskn',
    title: 'Kullanıcının Repolarını Listele',
    description: 'Kullanıcının en son güncellenen açık kaynak projelerini listeler.',
  },
  {
    id: 'gh-issues',
    category: 'gh',
    command: 'gh issue list cagritaskn/GoodbyeDPI-Turkey',
    title: 'Açık Sorunları (Issues) Listele',
    description: 'Topluluk tarafından açılan güncel hata bildirimleri ve çözümleri listeler.',
  },

  // Diagnostics & Network
  {
    id: 'test-all',
    category: 'diag',
    command: 'test',
    title: 'Tüm GitHub Ağını Test Et',
    description: 'github.com, raw.githubusercontent.com, api.github.com gecikme ve DNS testi.',
  },
  {
    id: 'dns-gh',
    category: 'diag',
    command: 'dns github.com',
    title: 'GitHub.com DNS Sorgula (DoH)',
    description: 'Cloudflare DoH 1.1.1.1 üzerinden temiz IP adreslerini çözer.',
  },
  {
    id: 'dns-raw',
    category: 'diag',
    command: 'dns raw.githubusercontent.com',
    title: 'Raw Content DNS Sorgula',
    description: 'raw.githubusercontent.com IP adreslerini ve TTL değerini listeler.',
  },
  {
    id: 'ping-api',
    category: 'diag',
    command: 'ping api.github.com',
    title: 'GitHub API Ping / Gecikme Ölç',
    description: 'API sunucusuna yapılan çağrının milisaniye cinsinden yanıt süresini hesaplar.',
  },

  // Git Tools
  {
    id: 'git-config-bypass',
    category: 'git',
    command: 'git config bypass on',
    title: 'Git Buffer ve Zaman Aşımı Ayarla',
    description: 'Git HTTP buffer boyutunu 500MB yapar ve düşük hız zaman aşımını kaldırır.',
  },
  {
    id: 'git-status',
    category: 'git',
    command: 'git status',
    title: 'Git Çalışma Alanı Durumu',
    description: 'Yerel Git deposunun durumunu, branch bilgisini ve değişiklikleri listeler.',
  },
  {
    id: 'git-log',
    category: 'git',
    command: 'git log --graph',
    title: 'Git Commit Ağacı (Graph)',
    description: 'Terminal üzerinde renkli ASCII grafik ile commit geçmişini görüntüler.',
  },

  // System
  {
    id: 'menu',
    category: 'system',
    command: 'menu',
    title: 'GoodbyeDPI İnteraktif Numaralı Menü',
    description: 'Klasik [1] [2] [3] GoodbyeDPI konsol menüsünü terminale yazdırır.',
  },
  {
    id: 'help',
    category: 'system',
    command: 'help',
    title: 'Tüm Komutlar ve Klavye Kısayolları',
    description: 'Sistemdeki desteklenen komutların tam kılavuzunu görüntüler.',
  },
  {
    id: 'script-cmd',
    category: 'system',
    command: 'script cmd',
    title: 'Windows .cmd Başlatıcı Betiği Üret',
    description: 'Tek tıkla çalıştırılabilir GoodbyeDPI Turkey batch dosyasını hazırlar.',
  },
  {
    id: 'clear',
    category: 'system',
    command: 'clear',
    title: 'Ekranı Temizle (cls)',
    description: 'Terminal tamponunu sıfırlar.',
  }
];
