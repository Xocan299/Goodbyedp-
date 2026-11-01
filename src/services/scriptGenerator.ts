import { PresetConfig } from '../types/terminal';

export function generateWindowsCmd(preset: PresetConfig, targetHosts: string[]): string {
  return `@echo off
chcp 65001 >nul
:: ==============================================================
:: GH-DPI // GitHub & GoodbyeDPI Turkey Command Launcher
:: Mod: ${preset.name} (${preset.ispTag})
:: Parametreler: ${preset.commandArgs}
:: ==============================================================

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [HATA] Bu betik yonetici haklari gerektirir!
    echo Lutfen saga tiklayip "Yonetici olarak calistir" secenegini secin.
    pause
    exit /b 1
)

echo [1/4] DNS Onbellegi temizleniyor...
ipconfig /flushdns >nul 2>&1

echo [2/4] Eski WinDivert veya GoodbyeDPI surecleri sonlandiriliyor...
taskkill /IM goodbyedpi.exe /F >nul 2>&1
sc stop "GoodbyeDPI" >nul 2>&1

echo [3/4] GitHub Parametreleri Yukleniyor:
echo      Hedef: ${preset.code}
echo      Args : ${preset.commandArgs}
echo.

cd /d "%~dp0"
if exist "goodbyedpi.exe" (
    echo [4/4] GoodbyeDPI Servisi Baslatiliyor...
    start "" goodbyedpi.exe ${preset.commandArgs}
) else if exist "x86_64\\goodbyedpi.exe" (
    echo [4/4] GoodbyeDPI x86_64 Servisi Baslatiliyor...
    start "" x86_64\\goodbyedpi.exe ${preset.commandArgs}
) else (
    echo [BILGI] goodbyedpi.exe bulunamadi. Lutfen bu dosyayi GoodbyeDPI klasorune atin.
    echo Calistirilacak komut:
    echo goodbyedpi.exe ${preset.commandArgs}
)

echo.
echo ==============================================================
echo [BASARILI] GH-DPI Servisi Arka Planda Calisiyor!
echo GitHub.com, Raw CDN ve Discord erisimleri artik DPI bypass aktif.
echo Bu pencereyi kapatabilirsiniz.
echo ==============================================================
timeout /t 5 >nul
`;
}

export function generateBashScript(preset: PresetConfig): string {
  return `#!/usr/bin/env bash
# ==============================================================
# GH-DPI // GitHub & Zapret / ByeDPI Linux/macOS Launcher
# Preset: ${preset.name}
# ==============================================================

if [ "$EUID" -ne 0 ]; then
  echo "[UYARI] Bazi DPI kurallari icin sudo / root izni gereklidir."
fi

echo "--> [1] DNS ve DoH Ayarlari yapilandiriliyor (Cloudflare 1.1.1.1)..."
echo "--> [2] Git HTTP Buffer Genisletiliyor..."
git config --global http.postBuffer 524288000
git config --global http.lowSpeedLimit 0
git config --global http.lowSpeedTime 999999

echo "--> [3] DPI Atlatma Parametreleri:"
echo "    Args: ${preset.commandArgs}"

if command -v ciadpi >/dev/null 2>&1; then
    echo "--> ByeDPI (ciadpi) baslatiliyor..."
    ciadpi --port 1080 --split 1 --disoob 1 --fake -1 &
elif command -v zapret >/dev/null 2>&1; then
    echo "--> Zapret baslatiliyor..."
    systemctl start zapret
else
    echo "[BILGI] Linux/macOS icin ciadpi (ByeDPI) veya Zapret onerilir."
    echo "SOCKS5 Proxy: 127.0.0.1:1080 uzerinden calisabilir."
fi

echo "[TAMAMLANDI] GitHub baglanti ayarlari uygulandi."
`;
}

export function generateGitConfigCommands(): string {
  return `:: Git CLI Hizlandirma ve DPI Hata Giderici Komutlar
:: Terminalde veya Komut Satirinda (CMD) calistirin:

:: 1. Buyuk dosya yukleme / klonlama bellek boyutunu 500MB'a cikarir:
git config --global http.postBuffer 524288000

:: 2. Yavas baglantilarda zaman asimina ugramayi engeller:
git config --global http.lowSpeedLimit 0
git config --global http.lowSpeedTime 999999

:: 3. SSL yeniden deneme ve dogrulama ayarlari:
git config --global http.sslVerify true
git config --global http.version HTTP/1.1

:: 4. Windows Schannel / OpenSSL gecis ayari (Sertifika hatasi yasayanlar icin):
git config --global http.sslBackend schannel

:: Kaldirip varsayilana donmek icin:
:: git config --global --unset http.postBuffer
:: git config --global --unset http.lowSpeedLimit
`;
}

export function generateHostsFileContent(resolvedIps: Record<string, string>): string {
  return `# ==============================================================
# GH-DPI // Temiz GitHub IP Adresleri (DNS Zehirlenmesi Cozumu)
# Windows: C:\\Windows\\System32\\drivers\\etc\\hosts
# Linux/Mac: /etc/hosts
# ==============================================================

${resolvedIps['github.com'] || '140.82.121.3'}  github.com
${resolvedIps['api.github.com'] || '140.82.121.6'}  api.github.com
${resolvedIps['raw.githubusercontent.com'] || '185.199.108.133'}  raw.githubusercontent.com
${resolvedIps['gist.github.com'] || '140.82.121.4'}  gist.github.com
${resolvedIps['github.githubassets.com'] || '185.199.108.154'}  github.githubassets.com
${resolvedIps['avatars.githubusercontent.com'] || '185.199.108.133'}  avatars.githubusercontent.com
${resolvedIps['objects.githubusercontent.com'] || '185.199.108.133'}  objects.githubusercontent.com
${resolvedIps['codeload.github.com'] || '140.82.121.9'}  codeload.github.com
`;
}

export function triggerDownload(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
