#!/bin/bash
# =====================================================
# Road-Truck - Quick Start Script
# =====================================================

echo "🚚 Road-Truck - Quick Start"
echo "============================"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check Node.js
echo "1️⃣  Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não está instalado${NC}"
    echo "   Baixe em: https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version)${NC}"

# 2. Check .env
echo ""
echo "2️⃣  Verificando .env..."
if [ ! -f "back-end/.env" ]; then
    echo -e "${YELLOW}⚠️  .env não encontrado${NC}"
    echo "   Copiando .env.example..."
    cp back-end/.env.example back-end/.env
    echo -e "${YELLOW}⚠️  IMPORTANTE: Edite back-end/.env com suas credenciais!${NC}"
    echo ""
    echo "Credenciais necessárias:"
    echo "  - FIREBASE_PROJECT_ID"
    echo "  - FIREBASE_CLIENT_EMAIL"
    echo "  - FIREBASE_PRIVATE_KEY"
    echo "  - GOOGLE_API_KEY"
    echo ""
    read -p "Pressione Enter após configurar o .env..."
else
    echo -e "${GREEN}✅ .env encontrado${NC}"
fi

# 3. Install dependencies
echo ""
echo "3️⃣  Instalando dependências..."
cd back-end
npm install
cd ..
echo -e "${GREEN}✅ Dependências instaladas${NC}"

# 4. Ready to start
echo ""
echo "============================"
echo -e "${GREEN}✅ Pronto para iniciar!${NC}"
echo ""
echo "Para começar:"
echo -e "  ${YELLOW}npm start${NC}  (de dentro de back-end/)"
echo ""
echo "Depois acesse:"
echo -e "  ${YELLOW}http://localhost:8081${NC}"
echo ""
echo "Para produção:"
echo -e "  ${YELLOW}./build-prod.sh${NC}"
echo ""
