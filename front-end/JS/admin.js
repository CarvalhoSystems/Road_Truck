/**
 * admin.js
 * * Este script lida com a autenticação e o painel de gerenciamento de clientes
 * * do lado do administrador, usando o Firebase Modular SDK (V9) e as rotas seguras do backend.
 */

// =======================================================
// IMPORTS DO FIREBASE (MODULAR V9)
// =======================================================
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import {
  collection,
  query,
  where,
  onSnapshot,
  collectionGroup, // ADICIONADO: Necessário para a consulta de grupo de coleções.
  setDoc,
  serverTimestamp,
  doc, // Adicionado para setDoc
  orderBy,
  updateDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js"; // Importa as instâncias já inicializadas
import { auth, db } from "./config.js"; // Importa as instâncias de auth e db
import { logout } from "./auth.js"; // ✅ CORREÇÃO: O caminho correto é relativo, pois ambos estão na pasta JS.

// =======================================================
// INICIALIZAÇÃO APÓS O CARREGAMENTO DO DOM
// =======================================================
document.addEventListener("DOMContentLoaded", () => {
  // =======================================================
  // VARIÁVEIS GLOBAIS E DOM
  // =======================================================

  // Elementos do DOM
  // CORREÇÃO: O elemento 'auth-section' não existe em admin.html, sua referência causa um erro.
  // const authSection = document.getElementById("auth-section");
  const dashboardSection = document.getElementById("dashboard-section");
  const authInfo = document.getElementById("auth-info");
  const userEmailSpan = document.getElementById("user-email");
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const clientsList = document.getElementById("clients-list");
  const pendingClientsCount = document.getElementById("pending-clients-count");
  const noClientsMessage = document.getElementById("no-clients-message");
  // ✅ NOVO: Elementos para a lista de clientes aprovados
  const approvedClientsList = document.getElementById("approved-clients-list");
  const approvedClientsCount = document.getElementById(
    "approved-clients-count"
  );
  const noApprovedClientsMessage = document.getElementById(
    "no-approved-clients-message"
  );
  // CORREÇÃO: O ID correto em admin.html é 'message-box-dashboard'.
  const messageBox = document.getElementById("message-box-dashboard");

  // O controle de visibilidade agora é feito pelo auth.js para evitar conflitos.
  const mainContainer = document.querySelector("main");
  // if (mainContainer) mainContainer.style.visibility = "hidden";

  // =======================================================
  // UTILS
  // =======================================================

  /**
   * Exibe uma mensagem de sucesso ou erro na tela (substituindo o SweetAlert).
   * @param {string} message A mensagem a ser exibida.
   * @param {string} type O tipo de mensagem ('success' ou 'error').
   */
  function showMessage(message, type) {
    // Adiciona uma verificação para garantir que o elemento existe antes de usá-lo.
    if (!messageBox) return;
    messageBox.textContent = message;
    messageBox.className = `message-box ${type}`;
    messageBox.style.display = "block";
    // Limpa a mensagem após 5 segundos
    setTimeout(() => {
      messageBox.style.display = "none";
    }, 3000);
  }

  /**
   * Obtém o ID Token do usuário logado (necessário para autenticação no Backend).
   * @returns {Promise<string|null>} O ID Token ou null.
   */
  async function getIdToken() {
    const user = auth.currentUser;
    if (user) {
      // Apenas retorna o token atual. A atualização será forçada no onAuthStateChanged.
      return user.getIdToken();
    }
    return null;
  }

  /**
   * Controla qual seção principal é exibida.
   * @param {'dashboard' | 'none'} sectionName
   */
  function showMainSection(sectionName) {
    if (dashboardSection) {
      dashboardSection.style.display =
        sectionName === "dashboard" ? "block" : "none";
    }
  }

  // Inicialmente, esconde as duas seções até que o auth state seja resolvido.
  if (dashboardSection) dashboardSection.style.display = "none";
  if (mainContainer) mainContainer.style.visibility = "hidden"; // Garante que a tela comece oculta

  // =======================================================
  // AUTENTICAÇÃO (MODULAR V9)
  // =======================================================
  // O listener onAuthStateChanged foi removido daqui.
  // A lógica de redirecionamento e verificação de claims agora é 100% controlada pelo auth.js,
  // que é a fonte única de verdade para o roteamento.
  // Se este script (admin.js) está sendo executado, auth.js já garantiu que o usuário é um admin.

  // Mostra o painel e busca os dados.
  showMainSection("dashboard");
  if (authInfo && auth.currentUser) {
    authInfo.style.display = "flex";
    userEmailSpan.textContent = auth.currentUser.email;
  }
  listenForPendingClients();
  // ✅ NOVO: Chama a função para escutar os clientes aprovados
  listenForApprovedClients();
  // if (mainContainer) mainContainer.style.visibility = "visible";

  // Listener para Cadastro (Admin)
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("signup-email").value;
      const password = document.getElementById("signup-password").value;
      const btn = document.getElementById("signup-btn");
      btn.classList.add("btn-loading");

      try {
        // 1. Cria o usuário no Auth (Modular createUserWithEmailAndPassword)
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const uid = userCredential.user.uid;

        // 2. Registra o Admin no Firestore (Modular setDoc)
        await setDoc(doc(db, "administradores", uid), {
          email: email,
          dataCriacao: serverTimestamp(), // Modular serverTimestamp
        });

        // Desloga o usuário recém-criado para que ele possa logar após o claim ser aplicado
        await signOut(auth); // Modular signOut

        showMessage(
          `Usuário Admin "${email}" cadastrado. ATENÇÃO: O Custom Claim 'admin: true' deve ser aplicado no backend para liberar o acesso.`,
          "warning"
        );
      } catch (error) {
        console.error("Erro de Cadastro:", error);
        let msg =
          "Erro ao cadastrar. A senha deve ter no mínimo 6 caracteres ou o email já está em uso.";
        showMessage(msg, "error");
      } finally {
        btn.classList.remove("btn-loading");
      }
    });
  }

  // ✅ CORREÇÃO: Adiciona o listener para o botão de logout.
  // A função `logout` já foi importada do auth.js no topo do arquivo.
  const logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout); // Associa a função de logout ao clique.
  }

  /**
   * ===================================================================
   * Inicia o listener do Firestore para clientes com status "PENDENTE".
   * ===================================================================
   */
  function listenForPendingClients() {
    const sidebarPendingBadge = document.getElementById(
      "sidebar-pending-badge"
    );
    const dashboardMetricCount = document.getElementById(
      "pending-clients-count"
    );
    const clientsList = document.getElementById("clients-list");

    const clientsQuery = query(
      collection(db, "users"),
      where("status", "==", "pending")
    );

    onSnapshot(
      clientsQuery,
      (snapshot) => {
        // CORREÇÃO 1: Inicializar o array clients corretamente
        const clients = [];
        snapshot.forEach((doc) => {
          clients.push({ id: doc.id, ...doc.data() });
        });

        const totalPendentes = clients.length;

        // --- ATUALIZAÇÃO DOS CONTADORES (Sempre acontece) ---
        if (dashboardMetricCount) {
          dashboardMetricCount.textContent = totalPendentes;
        }
        if (sidebarPendingBadge) {
          sidebarPendingBadge.textContent = totalPendentes;
          totalPendentes > 0
            ? sidebarPendingBadge.classList.remove("hidden")
            : sidebarPendingBadge.classList.add("hidden");
        }

        // --- RENDERIZAÇÃO DA LISTA (Apenas se a aba de pendentes existir e estiver visível) ---
        const viewPending = document.getElementById("view-pending");

        // CORREÇÃO 2: Só manipula o DOM da lista se o container existir
        if (clientsList && viewPending) {
          clientsList.innerHTML = "";

          if (totalPendentes === 0) {
            if (noClientsMessage) noClientsMessage.style.display = "block";
          } else {
            if (noClientsMessage) noClientsMessage.style.display = "none";

            // Renderiza apenas se a aba NÃO estiver oculta (opcional, para performance)
            clients.forEach((client) => {
              clientsList.appendChild(createClientItem(client, "pending"));
            });
          }
        }
      },
      (error) => {
        console.error("Erro no Snapshot:", error);
      }
    );
  }

  /**
   * =============================================================================
   * ✅ NOVO: Inicia o listener do Firestore para clientes com status "approved".
   * =============================================================================
   */
  function listenForApprovedClients() {
    const approvedList = document.getElementById("approved-clients-list");
    const approvedCountBadge = document.getElementById(
      "approved-clients-count"
    );

    if (!approvedList) return;

    const q = query(collection(db, "users"), where("status", "==", "approved"));

    onSnapshot(q, (snapshot) => {
      approvedList.innerHTML = "";
      const clients = [];

      snapshot.forEach((doc) => {
        clients.push({ id: doc.id, ...doc.data() });
      });

      if (approvedCountBadge) {
        approvedCountBadge.textContent = `${clients.length} cliente(s) ativo(s).`;
      }

      const noMsg = document.getElementById("no-approved-clients-message");
      if (clients.length === 0) {
        if (noMsg) noMsg.style.display = "block";
      } else {
        if (noMsg) noMsg.style.display = "none";
        clients.forEach((client) => {
          approvedList.appendChild(createClientItem(client, "approved"));
        });
      }
    });
  }

  // =================================================
  // FUNÇÕES DE RENDERIZAÇÃO DE BLOCK E UNBLOCK DE USER
  // =================================================

  /**
   * Cria o elemento HTML para um cliente.
   * @param {object} client - O objeto do cliente.
   * @param {'pending' | 'approved'} context - O contexto para renderizar os botões corretos.
   */
  function createClientItem(client, context = "pending") {
    const item = document.createElement("div");
    item.className = "client-item";
    item.dataset.uid = client.id;

    const date =
      client.dataCadastro && client.dataCadastro.toDate
        ? client.dataCadastro.toDate().toLocaleDateString("pt-BR")
        : "N/A";

    // Define os botões aparece em qual aba
    let actionButtons = "";
    let statusLabel = "";
    if (context === "pending") {
      actionButtons = `<button class="btn btn-success text-xs approve-btn">Aprovar</button>`;
    } else if (context === "approved") {
      actionButtons = `<button class="btn btn-warning text-xs block-btn">Bloquear</button>`;
    } else if (context === "blocked") {
      actionButtons = `<button class="btn btn-success text-xs unblock-btn">Desbloquear</button>`;
    }

    // Botão de excluir comum a todos
    actionButtons += `<button class="btn btn-danger text-xs delete-btn">Excluir</button>`;

    // 2. Monta o HTML interno
    item.innerHTML = `
        <div class="client-info">
            <strong>${client.email}</strong>
            <div class="flex items-center gap-2 mt-1">
                ${statusLabel}
                <span class="text-[10px] text-gray-500">${date}</span>
            </div>
        </div>
        <div class="client-actions">
            ${actionButtons}
        </div>
    `;

    // 3. Adiciona os Event Listeners (Somente se o botão existir no HTML acima)
    const approveBtn = item.querySelector(".approve-btn");
    if (approveBtn)
      approveBtn.addEventListener("click", () =>
        approveClient(client.id, approveBtn)
      );

    const blockBtn = item.querySelector(".block-btn");
    if (blockBtn)
      blockBtn.addEventListener("click", () =>
        updateClientStatus(client.id, "blocked")
      );

    const unblockBtn = item.querySelector(".unblock-btn");
    if (unblockBtn)
      unblockBtn.addEventListener("click", () =>
        updateClientStatus(client.id, "approved")
      );

    const deleteBtn = item.querySelector(".delete-btn");
    if (deleteBtn)
      deleteBtn.addEventListener("click", () =>
        deleteClient(client.id, deleteBtn)
      );

    return item;
  }

  // Função auxiliar para atualizar status (coloque fora da createClientItem)
  async function updateClientStatus(uid, newStatus) {
    if (!confirm(`Deseja alterar o status para ${newStatus}?`)) return;
    try {
      await updateDoc(doc(db, "users", uid), { status: newStatus });
      showMessage("Status atualizado!", "success");
    } catch (error) {
      console.error(error);
      showMessage("Erro ao atualizar status", "error");
    }
  }

  /*
  =============================
  =============================
  */

  async function approveClient(clienteUid, button) {
    // SUBSTITUIÇÃO DE CONFIRM() POR MODAL PERSONALIZADO (Aviso: Uso de confirm() é proibido em iframes)
    // Para fins de teste, mantendo o fluxo atual, mas ciente da limitação:
    if (
      !window.confirm(
        `Tem certeza que deseja APROVAR o cliente com UID: ${clienteUid}?`
      )
    )
      return;

    button.classList.add("btn-loading"); // Inicia o Loading
    const token = await getIdToken();
    if (!token) {
      showMessage("Sua sessão expirou. Faça login novamente.", "error");
      button.classList.remove("btn-loading");
      return;
    }

    try {
      const response = await fetch("/api/approve-client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ clienteUid }),
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error(
          `Erro na API (Status ${response.status}). Verifique se o backend está rodando.`
        );
      }

      if (response.ok) {
        button.classList.add("btn-done"); // Exibe o Done State (✓)
        showMessage(data.message, "success");
      } else {
        showMessage(`Falha na aprovação: ${data.message}`, "error");
      }
    } catch (error) {
      console.error("Erro ao chamar API de aprovação:", error);
      showMessage(error.message, "error");
    } finally {
      button.classList.remove("btn-loading");
      setTimeout(() => button.classList.remove("btn-done"), 2000); // Remove o estado 'done' após 2s
    }
  }

  //=====================================
  // DELETAR OS CLIENTES !!
  //=====================================

  async function deleteClient(clienteUid, button) {
    // SUBSTITUIÇÃO DE CONFIRM() POR MODAL PERSONALIZADO (Aviso: Uso de confirm() é proibido em iframes)
    // Para fins de teste, mantendo o fluxo atual, mas ciente da limitação:
    if (
      !window.confirm(
        `AVISO: Esta ação é PERMANENTE. Deseja realmente EXCLUIR o cliente com UID: ${clienteUid} (Auth e Firestore)?`
      )
    )
      return;

    button.classList.add("btn-loading"); // Inicia o Loading
    const token = await getIdToken();
    if (!token) {
      showMessage("Sua sessão expirou. Faça login novamente.", "error");
      button.classList.remove("btn-loading");
      return;
    }

    try {
      const response = await fetch("/api/delete-client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ clienteUid }),
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error(
          `Erro na API (Status ${response.status}). Verifique se o backend está rodando.`
        );
      }

      if (response.ok) {
        button.classList.add("btn-done"); // Exibe o Done State (✓)
        showMessage(data.message, "success");
      } else {
        showMessage(`Falha na exclusão: ${data.message}`, "error");
      }
    } catch (error) {
      console.error("Erro ao chamar API de exclusão:", error);
      showMessage(error.message, "error");
    } finally {
      button.classList.remove("btn-loading");
      setTimeout(() => button.classList.remove("btn-done"), 2000); // Remove o estado 'done' após 2s
    }
  }

  /**
   * Chama o backend seguro para definir o Custom Claim 'admin: true' para um email.
   */
  async function promoteAdmin(email, button) {
    button.classList.add("btn-loading"); // Inicia o Loading

    try {
      // Rota de Cloud Function SEGURA que criamos
      const response = await fetch("/api/make-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getIdToken()}`, // Token do Admin logado
        },
        body: JSON.stringify({ email: email }), // Enviando o email para promoção
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error(
          `Erro na API (Status ${response.status}). Verifique se o backend está rodando.`
        );
      }

      if (response.ok) {
        button.classList.add("btn-done");
        showMessage(
          data.message +
            " O usuário deve fazer login/logout para o claim entrar em vigor.",
          "success"
        );
        // Limpa o campo após o sucesso
        document.getElementById("new-admin-email").value = "";
      } else {
        // Exibe a mensagem de erro que vem do backend (ex: usuário não encontrado)
        showMessage(`Falha na promoção: ${data.message}`, "error");
      }
    } catch (error) {
      console.error("Erro ao chamar API de promoção:", error);
      showMessage(error.message, "error");
    } finally {
      // Remove o done state após um tempo ou sempre
      button.classList.remove("btn-loading");
      setTimeout(() => button.classList.remove("btn-done"), 2000);
    }
  }

  // =======================================================
  // GERENCIAMENTO DE ADMINS
  // =======================================================

  const promoteAdminForm = document.getElementById("promote-admin-form");

  if (promoteAdminForm) {
    promoteAdminForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("new-admin-email").value;
      const button = document.getElementById("promote-admin-btn");

      // SUBSTITUIÇÃO DE CONFIRM() POR MODAL PERSONALIZADO (Aviso: Uso de confirm() é proibido em iframes)
      // Para fins de teste, mantendo o fluxo atual, mas ciente da limitação:
      if (
        window.confirm(
          `Tem certeza que deseja promover o usuário ${email} a Administrador?`
        )
      ) {
        await promoteAdmin(email, button);
      }
    });
  }

  // =======================================================
  // LÓGICA DE NAVEGAÇÃO SPA (SINGLE PAGE APPLICATION)
  // =======================================================
  const sidebarLinks = document.querySelectorAll(".sidebar-nav a");
  const contentViews = document.querySelectorAll(".content-view");

  sidebarLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      if (link.getAttribute("href") === "#") {
        e.preventDefault();
        sidebarLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
        contentViews.forEach((view) => view.classList.add("hidden"));

        const linkText = link.textContent.trim().toLowerCase();

        if (linkText.includes("dashboard")) {
          document.getElementById("view-dashboard").classList.remove("hidden");
        } else if (linkText.includes("pendentes")) {
          document.getElementById("view-pending").classList.remove("hidden");
        } else if (linkText.includes("ativos")) {
          document.getElementById("view-active").classList.remove("hidden");
        } else if (linkText.includes("bloqueados")) {
          document.getElementById("view-blocked").classList.remove("hidden");
        } else if (linkText.includes("gerenciamento")) {
          document.getElementById("view-admins").classList.remove("hidden");
        } else if (
          linkText.includes("mensagem") ||
          linkText.includes("suporte")
        ) {
          // ✅ GARANTA QUE O ID NO HTML SEJA 'view-mensagens-clientes'
          document
            .getElementById("view-mensagens-clientes")
            ?.classList.remove("hidden");
        }
      }
    });
  });

  // =======================================================
  // CENTRAL DE MENSAGENS (SUPORTE)
  // =======================================================

  function listenForMessages() {
    const msgList = document.getElementById("mensagens-recebidas-list");
    const msgBadgeCentral = document.getElementById("msg-badge-count"); // Badge da tela central
    const msgBadgeSidebar = document.getElementById("sidebar-msg-badge"); // Badge da barra lateral

    if (!msgList) return;

    const q = query(
      collection(db, "suporte_mensagens"),
      orderBy("dataEnvio", "desc")
    );

    onSnapshot(q, (snapshot) => {
      let count = 0;

      // Limpa e Reconstrói a lista (seu código original)
      msgList.innerHTML = "";

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (!data.lida) count++;
        msgList.appendChild(createMessageElement(docSnap.id, data));
      });

      // --- ATUALIZAÇÃO DOS BADGES ---

      // 1. Atualiza o badge da Central (dentro da view)
      if (msgBadgeCentral) msgBadgeCentral.textContent = count;

      // 2. Atualiza o badge da Sidebar (o iconezinho vermelho)
      if (msgBadgeSidebar) {
        msgBadgeSidebar.textContent = count;
        if (count > 0) {
          msgBadgeSidebar.classList.remove("hidden");
        } else {
          msgBadgeSidebar.classList.add("hidden");
        }
      }
    });
  }

  function createMessageElement(id, data) {
    const div = document.createElement("div");
    div.className = `client-item ${
      data.lida ? "" : "border-l-4 border-primary-color"
    }`;

    const dataFormatada = data.dataEnvio?.toDate
      ? data.dataEnvio.toDate().toLocaleString("pt-BR")
      : "Agora mesmo";

    div.innerHTML = `
        <div class="client-info">
            <strong class="flex items-center gap-2">
                ${data.clienteEmail} 
                ${!data.lida ? '<span class="badge-new">NOVA</span>' : ""}
            </strong>
            <span class="text-xs text-muted italic">${dataFormatada}</span>
            <div class="font-bold text-sm mt-1 text-primary-color">Assunto: ${
              data.assunto || "Sem Assunto"
            }</div>
            <p class="mt-2 text-text-light bg-black/5 p-2 rounded shadow-inner">
                ${data.mensagem}
            </p>
        </div>
        <div class="client-actions">
            ${
              !data.lida
                ? `<button class="btn btn-success text-xs mark-read-btn">Lida</button>`
                : ""
            }
            <button class="btn btn-danger text-xs delete-msg-btn"><i class="fas fa-trash"></i></button>
        </div>
    `;

    // Listeners corrigidos
    div
      .querySelector(".delete-msg-btn")
      .addEventListener("click", () => deleteMessage(id));
    const markBtn = div.querySelector(".mark-read-btn");
    if (markBtn) {
      markBtn.addEventListener("click", () => markAsRead(id));
    }

    return div;
  }

  async function markAsRead(id) {
    try {
      await updateDoc(doc(db, "suporte_mensagens", id), { lida: true });
    } catch (error) {
      console.error("Erro ao ler:", error);
    }
  }

  async function deleteMessage(id) {
    if (confirm("Excluir mensagem permanentemente?")) {
      try {
        await deleteDoc(doc(db, "suporte_mensagens", id));
      } catch (error) {
        console.error("Erro ao deletar:", error);
      }
    }
  }

  // ✅ INICIALIZAÇÃO: Chama a função para começar a ouvir as mensagens
  listenForMessages();

  function requesstNotificationPermission() {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }
  requesstNotificationPermission();

  //============================
  // CLIENTES BLOQUEADOS
  //============================
  function listenForBlockedClients() {
    const blockedList = document.getElementById("blocked-clients-list");
    const noBlockedMsg = document.getElementById("no-blocked-clients-message");

    if (!blockedList) return;

    const q = query(collection(db, "users"), where("status", "==", "blocked"));

    onSnapshot(q, (snapshot) => {
      blockedList.innerHTML = "";

      if (snapshot.empty) {
        if (noBlockedMsg) {
          noBlockedMsg.style.display = "block";
          noBlockedMsg.classList.remove("hidden");
        } else {
          blockedList.innerHTML =
            "<p class='p-4 text-muted'>Nenhum cliente bloqueado.</p>";
        }
        return;
      }

      if (noBlockedMsg) {
        noBlockedMsg.style.display = "none";
        noBlockedMsg.classList.add("hidden");
      }

      snapshot.forEach((doc) => {
        const client = { id: doc.id, ...doc.data() };
        // Criamos o item passando o contexto 'blocked'
        blockedList.appendChild(createClientItem(client, "blocked"));
      });
    });
  }

  // Não esqueça de chamar a função no início do script!
  listenForBlockedClients();
});

// ========================================================
// Fecha o listener DOMContentLoaded
// ========================================================
// FIM DO ARQUIVO admin.js
