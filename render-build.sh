#!/bin/bash

# Guardar ruta actual (raíz del proyecto)
ROOT_PATH=$(pwd)

# Descargar Chrome en carpeta temporal
mkdir -p /tmp/chrome
cd /tmp/chrome
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
ar x google-chrome-stable_current_amd64.deb
tar -xvf data.tar.xz

# Mover Chrome a una carpeta accesible
mkdir -p $HOME/chrome
mv opt/google/chrome/* $HOME/chrome

# Volver a la raíz del proyecto
cd "$ROOT_PATH" || exit 1

# Exportar ruta para Puppeteer
export PATH=$HOME/chrome:$PATH
export PUPPETEER_EXECUTABLE_PATH="$HOME/chrome/chrome"

# Instalar dependencias desde la raíz correcta
npm install
