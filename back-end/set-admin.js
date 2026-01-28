/**
 * Script Node.js para configurar a Custom Claim 'admin: true' para um usuário específico.
 *
 * PRÉ-REQUISITO: O usuário com o e-mail especificado JÁ DEVE ESTAR CADASTRADO no Firebase Authentication.
 *
 * INSTRUÇÕES DE USO:
 * 1. Baixe o arquivo JSON da Service Account Key do seu projeto Firebase.
 * 2. Renomeie-o para 'serviceAccountKey.json' e coloque-o na mesma pasta deste script.
 * 3. Instale o Firebase Admin SDK: npm install firebase-admin
 * 4. Execute no terminal, passando o email do usuário como argumento:
 *    node set-admin.js seu-email@exemplo.com
 */
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import admin from "firebase-admin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// O e-mail do administrador agora é lido a partir dos argumentos da linha de comando.
const ADMIN_EMAIL = process.argv[2];

if (!ADMIN_EMAIL) {
  console.error("❌ ERRO: Nenhum e-mail foi fornecido.");
  console.error("Uso correto: node set-admin.js <email-do-usuario>");
  process.exit(1);
}

// 1. Carrega as variáveis de ambiente do arquivo .env na raiz do projeto
dotenv.config({ path: path.join(__dirname, "../.env") });

// 2. Monta o objeto de credenciais a partir das variáveis de ambiente
const serviceAccountConfig = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

// Validação para garantir que as variáveis foram carregadas
if (!serviceAccountConfig.project_id || !serviceAccountConfig.private_key) {
  console.error("❌ ERRO: Variáveis de ambiente do Firebase não encontradas.");
  console.error(
    "Certifique-se de que o arquivo .env existe na raiz do projeto e contém as chaves FIREBASE_*."
  );
  process.exit(1);
}

// 3. Inicializa o Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountConfig),
});

// Acesso fácil ao Firestore
const db = admin.firestore();

console.log(`🔄 Buscando UID para o email: ${ADMIN_EMAIL}...`);

async function setAdminClaim() {
  try {
    // 3. Busca o usuário pelo e-mail
    const user = await admin.auth().getUserByEmail(ADMIN_EMAIL);

    // 4. Define a Custom Claim 'admin: true' no Firebase Auth
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });

    // 5. ✅ NOVO: Atualiza o status do usuário no Firestore para 'approved'
    // Isso garante que a lógica de redirecionamento do front-end não o prenda na página 'pending'.
    const userDocRef = db.collection("users").doc(user.uid);
    await userDocRef.set(
      { status: "approved", role: "admin" },
      { merge: true }
    );

    console.log("------------------------------------------------");
    console.log(`✅ SUCESSO! A claim 'admin: true' foi definida para:`);
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   UID: ${user.uid}`);
    console.log(`   Status no Firestore atualizado para 'approved'.`);
    console.log("------------------------------------------------");
    console.log(
      "Atenção: Você deve fazer LOGOUT e LOG IN novamente no seu navegador para que a mudança seja aplicada (o token JWT será atualizado)."
    );
  } catch (error) {
    console.error("------------------------------------------------");
    console.error("❌ ERRO AO DEFINIR A CLAIM DE ADMIN:");
    if (error.code === "auth/user-not-found") {
      console.error(
        `O usuário com o email '${ADMIN_EMAIL}' não foi encontrado no Firebase Auth.`
      );
      console.error(
        "Lembre-se: você precisa primeiro se cadastrar na aplicação com este e-mail antes de torná-lo admin."
      );
    } else {
      console.error("Detalhes do erro:", error.message);
    }
    console.error("------------------------------------------------");
  }
}

setAdminClaim();
