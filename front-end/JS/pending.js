// ========================================================
// 1. IMPORTAÇÕES NECESSÁRIAS
// ========================================================

// Importa a instância 'auth' e 'db' já inicializadas no config.js
import { auth, db } from "./config.js";

// Importa as funções de autenticação
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// Importa as funções do Firestore, incluindo onSnapshot
import {
  doc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// ========================================================
// 2. CONSTANTES DE REDIRECIONAMENTO
// ========================================================

const CLIENT_DASHBOARD = "/pages/router.html";
const ADMIN_PAGE = "/pages/admin.html"; // Para prevenção
const INDEX_PAGE = "/";

// ========================================================
// 3. FUNÇÃO CENTRAL: MONITORAMENTO DE STATUS
// ========================================================

/**
 * Cria um listener em tempo real para monitorar o status do usuário no Firestore.
 * Redireciona para o dashboard assim que o status mudar para 'approved'.
 */
function monitorUserStatus(user) {
  // 1. Define a referência do documento do usuário
  const userDocRef = doc(db, "users", user.uid);

  // 2. Inicia o monitoramento em tempo real (onSnapshot)
  // A função 'unsubscribe' permite parar o monitoramento quando não for mais necessário.
  const unsubscribe = onSnapshot(
    userDocRef,
    (docSnap) => {
      // Se o documento não existir, algo deu errado. Desloga.
      if (!docSnap.exists()) {
        console.error("Documento do usuário não encontrado. Deslogando.");
        signOut(auth);
        return;
      }

      const userData = docSnap.data();
      const status = userData.status;
      const role = userData.role;

      console.log(`[Pending Monitor] Status atual do usuário: ${status}`);

      // --- LÓGICA DE REDIRECIONAMENTO ---

      // A) APROVADO: Redireciona para o Dashboard do Cliente
      if (status === "approved") {
        // Interrompe o monitoramento imediatamente
        unsubscribe();

        // Notifica e redireciona
        Swal.fire({
          icon: "success",
          title: "Sua solicitação foi aprovada!",
          text: "Você será redirecionado para o Dashboard.",
          confirmButtonColor: "#4CAF50",
        });
        window.location.href = CLIENT_DASHBOARD;
        return;
      }

      // B) ADMIN: Se for admin e por algum motivo estiver aqui, redireciona para a página dele
      if (role === "admin" && !window.location.pathname.endsWith(ADMIN_PAGE)) {
        unsubscribe();
        window.location.href = ADMIN_PAGE;
        return;
      }

      // C) NEGADO: Se o status for 'denied', você pode deslogar ou mostrar uma mensagem
      if (status === "denied") {
        unsubscribe();
        Swal.fire({
          icon: "error",
          title: "Sua solicitação foi negada!",
          text: "Entre em contato para mais detalhes.",
          confirmButtonColor: "#ef4444",
        });

        signOut(auth);
        // Redireciona o usuário deslogado para a página inicial/login
        window.location.href = INDEX_PAGE;
        return;
      }

      // D) PENDENTE: Permanece na página de espera.
    },
    (error) => {
      // Trata erros de leitura do Firestore (ex: permissão negada)
      console.error("Erro ao monitorar o status:", error);
    }
  );
}

// ========================================================
// 4. INICIALIZAÇÃO: Verifica o estado de autenticação
// ========================================================

/**
 * Listener principal para verificar se o usuário está logado e iniciar a monitorização.
 * Este listener é ativado assim que o script é carregado.
 */
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Usuário logado: Inicia a monitorização do status
    monitorUserStatus(user);
  } else {
    // Usuário deslogado: Redireciona para a página de login
    console.log("[Pending Monitor] Usuário deslogado. Redirecionando.");
    window.location.href = INDEX_PAGE;
  }
});

// ========================================================
// 5. EVENTOS DA UI (Logout)
// ========================================================
document.getElementById("btn-logout").addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = INDEX_PAGE;
  } catch (error) {
    console.error("Erro ao sair:", error);
  }
});
