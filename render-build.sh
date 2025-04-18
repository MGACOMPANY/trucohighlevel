#!/bin/bash

# Instala Chrome directamente sin apt-get
mkdir -p /tmp/chrome
cd /tmp/chrome
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
ar x google-chrome-stable_current_amd64.deb
tar -xvf data.tar.xz

# Mueve Chrome a una carpeta accesible
mkdir -p $HOME/chrome
mv opt/google/chrome/* $HOME/chrome

# Exporta la ruta de Chrome
export PATH=$HOME/chrome:$PATH
export PUPPETEER_EXECUTABLE_PATH="$HOME/chrome/chrome"

# Instala las dependencias de Node
npm install
