#!/bin/bash
# 🚀 Script de Deploy Automático para Produção

echo "🚀 RoadTruck - Deploy Automático para Produção"
echo "==============================================="
echo ""

# 1. Verificar se está em produção
if [ -z "$BACKEND_URL" ]; then
    echo "❌ Erro: Variável BACKEND_URL não definida"
    echo "Configure antes de rodar:"
    echo "  export BACKEND_URL=https://seu-backend.com/api"
    exit 1
fi

echo "✅ Backend URL: $BACKEND_URL"
echo ""

# 2. Build Frontend
echo "📦 Compilando frontend..."
cd front-end
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Erro ao compilar frontend"
    exit 1
fi
echo "✅ Frontend compilado com sucesso"
echo ""

# 3. Build Backend
echo "📦 Preparando backend..."
cd ../back-end
npm install
if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências"
    exit 1
fi
echo "✅ Backend pronto"
echo ""

# 4. Instrções de deploy
echo "🎯 Próximos Passos:"
echo ""
echo "Para Heroku:"
echo "  1. heroku login"
echo "  2. heroku create seu-app-name"
echo "  3. git push heroku main"
echo ""
echo "Para AWS/Google Cloud:"
echo "  1. Configure as credenciais"
echo "  2. Faça deploy da imagem Docker"
echo "  3. Configure variáveis de ambiente"
echo ""
echo "✅ Tudo pronto para deploy!"
