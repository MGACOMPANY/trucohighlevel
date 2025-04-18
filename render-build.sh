#!/bin/bash

# Descargar Chrome
mkdir -p /tmp/chrome
cd /tmp/chrome
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
ar x google-chrome-stable_current_amd64.deb
tar -xf data.tar.xz

# Mover Chrome a una carpeta accesible para Puppeteer
mkdir -p $HOME/chrome
mv opt/google/chrome/* $HOME/chrome

# Volver a la carpeta raíz del proyecto
cd "$HOME/render/project/src" || exit 1

# Exportar la ruta del Chrome instalado
export PATH=$HOME/chrome:$PATH
export PUPPETEER_EXECUTABLE_PATH="$HOME/chrome/chrome"

# Instalar dependencias
npm install
