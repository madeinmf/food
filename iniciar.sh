#!/usr/bin/env bash
# Iniciar o sistema de criação e edição de cardápio mepede.ai

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "🍔 Iniciando mepede.ai · Cardápio para Foodtruck..."

if command -v node >/dev/null 2>&1; then
  node server.js
elif command -v python3 >/dev/null 2>&1; then
  echo "🚀 Servidor Python rodando em http://localhost:3000"
  open "http://localhost:3000" 2>/dev/null || true
  python3 -m http.server 3000
else
  echo "Abrindo diretamente no navegador..."
  open "index.html"
fi
