# Road-Truck — Deploy e Testes Rápidos

Este arquivo descreve como testar localmente e preparar deploy automático via GitHub Actions + GHCR.

## Testes locais

1. Configure `.env` na raiz do repositório (exemplo):

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-client-email@...iam.gserviceaccount.com
GOOGLE_API_KEY=your-google-api-key
GH_SERVER_URL=http://localhost:8989
PORT=8081
NODE_ENV=development
```

2. Instale dependências e rode o back-end:

```powershell
cd "f:\Projetos 2025 - 2026\Road-Truck\back-end"
npm ci
$env:NODE_ENV='development'; node server.js
```

3. Abra o front-end:

Visite: `https://localhost:8081/` (aceite certificado autoassinado se necessário)

## Criar primeiro admin manualmente (bootstrap)

1. Cadastre um usuário normalmente via formulário de cadastro.
2. No terminal, rode (com `.env` configurado):

```powershell
cd back-end
node set-admin.js seu-email@exemplo.com
```

Isso definirá `custom claim admin: true` e atualizará o documento em `users` para `status: approved`.

## Deploy automático (pré-requisitos)

- Crie repositório no GitHub e faça push do código.
- Defina secret `GHCR_TOKEN` com um token com permissão para publicar no GitHub Container Registry.

O workflow `.github/workflows/ci-deploy.yml` irá buildar e publicar a imagem Docker do `back-end` para `ghcr.io/<owner>/<repo>:latest` quando você fizer push na branch `main`.

## Observações

- Não posso publicar para você sem credenciais; gere os secrets no GitHub e o workflow fará o resto.
- Posso ajudar a ajustar o workflow para Docker Hub, AWS ECR, ou outro provedor se preferir.
