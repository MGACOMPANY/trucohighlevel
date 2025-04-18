#!/bin/bash

# Descargar e instalar Google Chrome
mkdir -p /opt/chrome
curl -sSL https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb -o chrome.deb
dpkg -x chrome.deb /opt/chrome
rm chrome.deb

# Exportar la ruta para Puppeteer/WPPConnect
export PUPPETEER_EXECUTABLE_PATH="/opt/chrome/opt/google/chrome/google-chrome"
echo "✅ Chrome instalado correctamente en $PUPPETEER_EXECUTABLE_PATH"
