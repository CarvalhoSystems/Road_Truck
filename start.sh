#!/bin/bash

echo "--- INICIANDO ROAD-TRUCK NA NUVEM ---"

# 1. Iniciar o GraphHopper (Java) em segundo plano
echo "[1/2] Iniciando Motor de Rotas (GraphHopper)..."
cd back-end/graphhopper

# Ajuste de memória para caber no plano gratuito/básico (1GB RAM)
# Se o mapa for muito grande, você precisará de um plano pago no Railway
java -Xmx1g -Xms1g -Ddw.graphhopper.datareader.file=data/brazil-latest.osm.pbf -jar *.jar server config-example.yml > graphhopper.log 2>&1 &

# Voltar para a raiz
cd ../..

# 2. Esperar 15 segundos para o Java aquecer
echo "Aguardando GraphHopper carregar..."
sleep 15

# 3. Iniciar o Site (Node.js)
echo "[2/2] Iniciando Site..."
cd back-end
npm start