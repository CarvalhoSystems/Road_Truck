#!/bin/bash
#
# =====================================================
# Road-Truck - Production Build & Deploy Script
# =====================================================
# Este script prepara o projeto para produção
#

set -e  # Exit on error

echo "🚀 Road-Truck Production Build"
echo "========================================"

# 1. Verificar Node.js
echo "✅ Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado!"
    exit 1
fi
echo "   Node.js $(node --version)"
echo "   npm $(npm --version)"

# 2. Verificar arquivo .env
echo ""
echo "✅ Verificando configurações..."
if [ ! -f "back-end/.env" ]; then
    echo "❌ Arquivo .env não encontrado em back-end/"
    echo "   Copie back-end/.env.example para back-end/.env"
    echo "   e preencha com suas credenciais"
    exit 1
fi

# 3. Instalar dependências do backend
echo ""
echo "✅ Instalando dependências do backend..."
cd back-end
npm ci --only=production
cd ..

# 4. Verificar variáveis críticas
echo ""
echo "✅ Validando variáveis de ambiente..."
source back-end/.env

if [ -z "$FIREBASE_PROJECT_ID" ] || [ -z "$FIREBASE_PRIVATE_KEY" ] || [ -z "$GOOGLE_API_KEY" ]; then
    echo "❌ Variáveis críticas não configuradas no .env"
    echo "   Verifique FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, GOOGLE_API_KEY"
    exit 1
fi

# 5. Minificar frontend (opcional)
echo ""
echo "✅ Frontend pronto (estaticamente servido pelo backend)"

# 6. Log final
echo ""
echo "========================================"
echo "✅ Build Production Concluído!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Deploy Docker:"
echo "      docker build -t road-truck . && docker run -p 8081:8081 road-truck"
echo ""
echo "   2. Deploy em Cloud (Railway, Render, Fly.io):"
echo "      git push"
echo ""
echo "   3. Verifique os logs após deploy"
echo ""
