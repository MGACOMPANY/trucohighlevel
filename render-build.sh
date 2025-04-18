#!/bin/bash

# Descargar e instalar Chrome
wget -q -O chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
dpkg -i chrome.deb || apt-get -f install -y
rm chrome.deb

# Establecer ruta del ejecutable para Puppeteer/WPPConnect
export PUPPETEER_EXECUTABLE_PATH=$(which google-chrome)
