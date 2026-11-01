@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo GoodbyeDPI Baslatiliyor...
x86_64\goodbyedpi.exe -9 --blacklist x86_64\russia-blacklist.txt --blacklist x86_64\russia-youtube.txt --dns-addr 77.88.8.8 --dns-port 53 --dnsv6-addr 2a02:6b8::feed:bad --dnsv6-port 53

pause
