#!/bin/bash

# Descargar e instalar Chrome de forma manual
mkdir -p /tmp/chrome
cd /tmp/chrome
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
ar x google-chrome-stable_current_amd64.deb
tar -xvf data.tar.xz

# Mover Chrome a una carpeta accesible
mkdir -p $HOME/chrome
mv opt/google/chrome/* $HOME/chrome

# Exportar la ruta de Chrome
export PATH=$HOME/chrome:$PATH
export PUPPETEER_EXECUTABLE_PATH="$HOME/chrome/chrome"

# Ejecutar npm install desde la raíz actual (Render ya está ahí)
npm install
