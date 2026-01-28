# Usar uma imagem base que tenha Java (necessário para o GraphHopper)
FROM eclipse-temurin:17-jdk-focal

# Instalar Node.js (necessário para o site)
RUN apt-get update && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean

# Definir pasta de trabalho
WORKDIR /app

# Copiar arquivos do projeto
COPY . .

# Instalar dependências do Node.js
RUN cd back-end && npm install

# --- CONFIGURAÇÃO DO MAPA ---
# Se você não conseguiu subir o arquivo .pbf para o GitHub (por ser >100MB),
# descomente a linha abaixo para baixar o mapa do Brasil automaticamente na hora do deploy:
# RUN curl -L -o back-end/graphhopper/data/brazil-latest.osm.pbf http://download.geofabrik.de/south-america/brazil-latest.osm.pbf

# Dar permissão de execução ao script de start
RUN chmod +x start.sh

# Variáveis de Ambiente Padrão
ENV PORT=8081

# Expor a porta do Node.js
EXPOSE 8081

# Comando para iniciar tudo
CMD ["./start.sh"]