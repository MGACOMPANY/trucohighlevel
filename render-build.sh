#!/bin/bash

# Descargar Chrome en carpeta temporal
mkdir -p /tmp/chrome
cd /tmp/chrome
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
ar x google-chrome-stable_current_amd64.deb
tar -xvf data.tar.xz

# Mover Chrome a carpeta accesible
mkdir -p $HOME/chrome
mv opt/google/chrome/* $HOME/chrome

# Volver a la raíz del proyecto
cd "$RENDER_ROOT" || cd "$HOME/project" || cd "$HOME" || exit 1

# Exportar variable para Puppeteer
export PATH=$HOME/chrome:$PATH
export PUPPETEER_EXECUTABLE_PATH="$HOME/chrome/chrome"

# Instalar dependencias de Node
npm install
