#!/bin/bash

# Descargar e instalar Chrome
mkdir -p /opt/chrome
curl -sSL https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb -o chrome.deb
dpkg -x chrome.deb /opt/chrome
rm chrome.deb

# Setear path para Puppeteer/WPPConnect
echo "export PUPPETEER_EXECUTABLE_PATH=/opt/chrome/opt/google/chrome/google-chrome" >> $HOME/.bashrc
