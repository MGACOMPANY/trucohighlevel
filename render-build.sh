#!/bin/bash

# Descargar Chrome
mkdir -p /tmp/chrome
cd /tmp/chrome
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
ar x google-chrome-stable_current_amd64.deb
tar -xvf data.tar.xz

# Mover Chrome a una carpeta accesible
mkdir -p $HOME/chrome
mv opt/google/chrome/* $HOME/chrome

# Volver a raíz del proyecto automáticamente (Render ya lo hace por defecto)
cd $RENDER_PROJECT_ROOT || exit 1

# Exportar ruta de Chrome
export PATH=$HOME/chrome:$PATH
export PUPPETEER_EXECUTABLE_PATH="$HOME/chrome/chrome"

# Instalar dependencias de Node.js
npm install
