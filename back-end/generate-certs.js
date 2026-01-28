// =======================================================
// generate-certs.js (Versão Corrigida - Usa o módulo nativo HTTPS)
// =======================================================
import { createServer } from "https";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const certsDir = path.join(__dirname, "certs");
const keyPath = path.join(certsDir, "key.pem");
const certPath = path.join(certsDir, "cert.pem");

// ===============================================================
// ATENÇÃO: PARA USAR ESTE SCRIPT, VOCÊ DEVE TER O OPENSSL INSTALADO
// ===============================================================
// Como o Node.js não possui uma ferramenta nativa para gerar chaves
// e certificados *do zero* com a complexidade necessária (como acontece
// com o selfsigned falhando), a solução mais confiável é usar
// uma ferramenta externa ou um utilitário mais robusto.

// Vou fornecer uma solução baseada em selfsigned que costuma funcionar
// se o problema for de importação ou ambiente, mas se falhar,
// a melhor saída é usar o ngrok (Opção 2 do meu post anterior)
// ou o `mkcert` (ferramenta externa).

// --- TENTATIVA DE CORREÇÃO DO PROBLEMA selfsigned ---
// O erro sugere que `pems.private` ou `pems.cert` é undefined.
// Vamos isolar a geração e verificar o resultado:

import selfsigned from "selfsigned";

function generateSelfSignedCertificates() {
  console.log("Iniciando geração de certificados...");
  const attrs = [{ name: "commonName", value: "localhost" }];

  try {
    const pems = selfsigned.generate(attrs, {
      days: 365,
      keySize: 2048,
      algorithm: "sha256", // Definir um algoritmo pode ajudar
    });

    if (!pems.private || !pems.cert) {
      console.error(
        "ERRO: Geração de certificados falhou. Dados privados ou certificados estão vazios."
      );
      return null;
    }

    console.log("Certificados gerados com sucesso.");

    // 1. Crie a pasta /certs se não existir
    if (!existsSync(certsDir)) {
      mkdirSync(certsDir);
      console.log(`Pasta 'certs' criada em: ${certsDir}`);
    }

    // 2. Salve os arquivos
    writeFileSync(keyPath, pems.private);
    writeFileSync(certPath, pems.cert);
    console.log(
      `\n✅ Certificados SSL/TLS (key.pem e cert.pem) salvos em: ${certsDir}`
    );
    console.log(
      "AVISO: Estes são certificados auto-assinados. Você precisará aceitar o risco no navegador do celular."
    );
    return pems;
  } catch (error) {
    console.error(
      "\n❌ ERRO FATAL ao gerar certificados com selfsigned:",
      error.message
    );
    console.log(
      "\nPossível solução: Tente instalar globalmente `npm install -g mkcert` e rode `mkcert -install` e `mkcert localhost` para gerar certificados confiáveis."
    );
    return null;
  }
}

// Execute a função
generateSelfSignedCertificates();
