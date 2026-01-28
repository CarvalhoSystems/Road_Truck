# Dockerfile para o back-end Node.js (Road-Truck)
FROM node:18-alpine

# Cria diretório de trabalho
WORKDIR /usr/src/app

# Copia package.json e package-lock.json (se houver) e instala dependências
COPY package*.json ./
RUN npm ci --only=production

# Copia o restante do código
COPY . .

# Porta padrão
EXPOSE 8081

# Variáveis de ambiente já devem ser fornecidas no runtime
CMD ["node", "server.js"]
