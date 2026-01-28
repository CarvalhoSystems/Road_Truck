// ========================================================
// 1. IMPORTAÇÕES: SERVIÇOS FIREBASE E FUNÇÕES MODULARES V9
// ========================================================

// Importa a instância 'auth' e 'db' já inicializadas no config.js

import { auth, db } from "./config.js";

// ✅ CORREÇÃO: Importa as funções para gerenciar a persistência da sessão
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  setPersistence,
  browserSessionPersistence,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// ========================================================
// 2. VARIÁVEIS GLOBAIS E AMBIENTE (Mantidas)
// ========================================================

const appId = "routers-caminhao";
const initialAuthToken =
  typeof __initial_auth_token !== "undefined" ? __initial_auth_token : null;

// ========================================================
// 3. FUNÇÃO CENTRAL DE REDIRECIONAMENTO
//    (Caminhos ajustados para o novo server.js - CORREÇÃO ANTERIOR)
// ========================================================

// ✅ CORREÇÃO: Os caminhos foram ajustados para serem relativos à raiz do site,
// que é a pasta 'front-end', conforme configurado no server.js.
// ✅ CORREÇÃO CRÍTICA: Usar caminhos absolutos a partir da raiz do site.
// Isso evita erros de navegação, não importa de qual página o script é chamado.
const ADMIN_PAGE = "/pages/admin.html";
const CLIENT_DASHBOARD = "/pages/router.html";
const INDEX_PAGE = "/";
const PAG_ESPERA = "/pages/pending.html";

/**
 * Lida com o redirecionamento baseado no estado de login e claims.
 */
async function handleAuthRedirect(user) {
  // ✅ MELHORIA: Esconde o conteúdo e mostra o spinner por padrão.
  // A UI só será liberada quando a lógica de autenticação terminar.
  const loadingSpinner = document.getElementById("loading-spinner");
  const mainContent = document.querySelector("main");
  if (loadingSpinner) loadingSpinner.style.display = "flex";
  if (mainContent) mainContent.style.visibility = "hidden";

  // Função auxiliar para mostrar o conteúdo e esconder o spinner
  const showContent = () => {
    if (loadingSpinner) loadingSpinner.style.display = "none";
    if (mainContent) mainContent.style.visibility = "visible";
    // ✅ CORREÇÃO: Dispara um evento global quando o conteúdo se torna visível.
    // Isso permite que outros scripts (como o do mapa) reajam a essa mudança.
    console.log("Disparando evento 'contentVisible'");
    window.dispatchEvent(new Event("contentVisible"));
  };

  const currentPage = window.location.pathname;

  try {
    // --- LÓGICA PARA USUÁRIO DESLOGADO ---
    if (!user) {
      // Permitir páginas públicas sem redirecionar: raiz, página de login e página de espera.
      const PUBLIC_PAGES = ["/", "/pages/login.html", "/pages/pending.html"];
      const isPublicPage = PUBLIC_PAGES.some(
        (p) => currentPage === p || currentPage.endsWith(p),
      );

      if (!isPublicPage) {
        console.log(
          "Usuário deslogado em página protegida. Redirecionando para /",
        );
        window.location.href = INDEX_PAGE;
      } else {
        showContent(); // Se já estiver na página pública (login/pending), apenas mostra o conteúdo.
      }
      return; // Encerra a função aqui.
    }

    // --- LÓGICA PARA USUÁRIO LOGADO ---
    const idTokenResult = await user.getIdTokenResult();
    const isAdmin = idTokenResult.claims.admin === true;
    console.log("handleAuthRedirect: claims ->", idTokenResult.claims);

    // Se for admin...
    if (isAdmin) {
      // ✅ LIBERDADE PARA O ADMIN:
      // O Admin pode visitar qualquer página (Router, Pending, Admin).
      // Só redirecionamos se ele estiver na página de LOGIN (raiz), mandando para o Admin Dashboard.

      const adminEmailSpan = document.getElementById("user-email");
      if (adminEmailSpan) adminEmailSpan.textContent = user.email;

      // Se estiver na raiz ou login, vai para o Admin. Caso contrário, deixa navegar.
      if (
        currentPage === "/" ||
        currentPage.endsWith("index.html") ||
        currentPage.endsWith("login.html")
      ) {
        window.location.href = ADMIN_PAGE;
      } else {
        showContent(); // Está na página correta.
      }
    }
    // ... (dentro da handleAuthRedirect, após o check de isAdmin)
    // Se for cliente...
    else {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const status = userDoc.exists() ? userDoc.data().status : "not_found";

      // 1. VERIFICAÇÃO DE BLOQUEIO (Adicione isso aqui)
      if (status === "blocked") {
        console.log("Cliente bloqueado detectado.");

        await Swal.fire({
          icon: "error",
          title: "Acesso Suspenso",
          text: "Seu acesso foi bloqueado. Entre em contato com o administrador para mais informações.",
          confirmButtonColor: "#ef4444",
          allowOutsideClick: false,
        });

        await signOut(auth);
        window.location.href = INDEX_PAGE; // Redireciona para o login
        return;
      }

      // 2. Se o status for 'pending'...
      if (status === "pending") {
        if (!currentPage.endsWith("/pages/pending.html")) {
          window.location.href = "/pages/pending.html";
          return;
        }
      }
      // 3. Se o status for 'approved'...
      else if (status === "approved") {
        if (!currentPage.endsWith(CLIENT_DASHBOARD)) {
          window.location.href = CLIENT_DASHBOARD;
          return;
        }
      }
      // ✅ CORREÇÃO: Lida com a condição de corrida durante o cadastro.
      // Se o documento ainda não foi criado, pode ser um usuário novo.
      // Tentamos recarregar até 3 vezes. Se persistir, deslogamos para evitar loop infinito.
      else if (status === "not_found") {
        const reloadCount = parseInt(
          sessionStorage.getItem("auth_retry_count") || "0",
        );

        if (reloadCount < 3) {
          console.warn(
            `Doc não encontrado. Tentativa ${
              reloadCount + 1
            }/3. Recarregando...`,
          );
          sessionStorage.setItem(
            "auth_retry_count",
            (reloadCount + 1).toString(),
          );
          setTimeout(() => window.location.reload(), 1500);
        } else {
          console.error(
            "Doc não encontrado após várias tentativas. Deslogando por segurança.",
          );
          sessionStorage.removeItem("auth_retry_count");
          await signOut(auth);
        }
        return; // Impede a execução do resto da função.
      } else {
        // Para qualquer outro status inesperado, desloga por segurança.
        await signOut(auth);
        return;
      }

      showContent(); // Mostra o conteúdo da página atual (seja login ou router.html).
    }
  } catch (error) {
    console.error("Erro ao verificar claims ou redirecionar:", error);
    showContent(); // Mostra o conteúdo mesmo em caso de erro para não travar a UI.
    await signOut(auth);
  }
}

onAuthStateChanged(auth, handleAuthRedirect);

function logout() {
  signOut(auth)
    .then(() => {
      window.location.href = INDEX_PAGE;
    })
    .catch((error) => {
      console.error("Erro ao fazer logout:", error);
    });
}

// ✅ CORREÇÃO: Exporta a função logout para ser usada em outros módulos.
export { logout };

// ========================================================
// 4. AUTHENTICATE COM TOKEN (Mantido)
// ========================================================
async function authenticateWithToken() {
  try {
    if (initialAuthToken) {
      // Lógica de autenticação
    }
  } catch (error) {
    console.error("Erro na autenticação inicial do Firebase:", error);
  }
}
authenticateWithToken();

// ========================================================
// 5. FUNÇÕES DE FEEDBACK E BOTÕES (Mantidas)
// ========================================================

function showSuccess(message) {
  Swal.fire({
    icon: "success",
    title: "Sucesso!",
    text: message,
    confirmButtonColor: "#4CAF50",
  });
}

function showError(message) {
  Swal.fire({
    icon: "error",
    title: "Erro!",
    text: message,
    confirmButtonColor: "#ef4444",
  });
}

function setButtonState(button, state) {
  button.classList.remove("btn-loading", "btn-done");
  button.disabled = false;
  button.innerHTML = button.dataset.originalText || button.innerHTML;

  if (state === "loading") {
    button.dataset.originalText = button.innerHTML;
    button.classList.add("btn-loading");
    button.innerHTML = "";
    button.disabled = true;
  } else if (state === "done") {
    button.classList.add("btn-done");
    button.innerHTML = "";
    setTimeout(() => {
      button.classList.remove("btn-done");
      button.innerHTML = button.dataset.originalText;
      button.disabled = false;
    }, 2000);
  }
}

// ========================================================
// 5.1. FUNÇÃO DE TRADUÇÃO DE ERROS
// ========================================================
function traduzirErro(error) {
  switch (error.code) {
    case "auth/email-already-in-use":
      return "Este e-mail já está em uso.";
    case "auth/user-not-found":
      return "Usuário não encontrado.";
    case "auth/wrong-password":
      return "Senha incorreta.";
    case "auth/invalid-email":
      return "E-mail inválido.";
    case "auth/user-disabled":
      return "Usuário desativado.";
    case "auth/popup-closed-by-user":
      return "Login cancelado pelo usuário.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Tente novamente mais tarde.";
    case "auth/weak-password":
      return "A senha é muito fraca.";
    default:
      return "Erro: " + error.message;
  }
}

// ========================================================
// 6. LÓGICA DE LOGIN (CORRIGIDA COM PERSISTÊNCIA)
// ========================================================

const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("login-btn");

// ✅ CORREÇÃO: Adiciona o listener apenas se o formulário de login existir na página.
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginSenha").value;

    setButtonState(loginBtn, "loading");

    try {
      // Define a persistência da sessão antes de logar.
      await setPersistence(auth, browserSessionPersistence);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // ✅ MELHORIA: A página não precisa ser recarregada.
      // O onAuthStateChanged (que já está escutando) vai pegar o novo estado de login
      // e fazer o redirecionamento correto com base no status do usuário (pending, approved, admin).
      // Apenas deixamos o botão em estado de "loading" enquanto o redirecionamento acontece.
    } catch (error) {
      showError(traduzirErro(error));
      setButtonState(loginBtn, null);
      console.error("Erro no Login:", error);
    }
  });
}

// ================================================================================
// 7. LÓGICA DE CADASTRO (Mantida, mas a persistência deve ser definida como NONE)
// ================================================================================

const registerForm = document.getElementById("registerForm");
const registerBtn = document.getElementById("register-btn");

// ✅ CORREÇÃO: Adiciona o listener apenas se o formulário de cadastro existir na página.
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerSenha").value;
    const confirmPassword = document.getElementById(
      "registerConfirmSenha",
    ).value;

    if (password !== confirmPassword) {
      showError("As senhas não coincidem!");
      return;
    }

    setButtonState(registerBtn, "loading");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      // 1. Primeiro, cria o documento do usuário no Firestore.
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        name: name,
        email: email,
        status: "pending",
        role: "client",
        createdAt: new Date().toISOString(),
      });

      // 2. Somente após o sucesso da escrita no banco, mostramos a mensagem e deslogamos.
      setButtonState(registerBtn, "done");
      showSuccess(
        "Cadastro realizado com sucesso! Aguarde a aprovação de um administrador para poder acessar.",
      );

      //3. Usuario e enviado a pagina de Espera
      window.location.href = PAG_ESPERA;
    } catch (error) {
      showError(traduzirErro(error));
      setButtonState(registerBtn, null);
      console.error("Erro no Cadastro:", error);
    }
  });
}

// ========================================================
// 8. LOGIN COM GOOGLE (CORREÇÃO SOLICITADA)
// ========================================================
const googleBtn = document.getElementById("btn-google");
if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();

    provider.setCustomParameters({
      prompt: "select_account",
    });

    try {
      console.log("🔐 Iniciando Google Sign-in...");
      setButtonState(googleBtn, "loading");

      await setPersistence(auth, browserSessionPersistence);

      console.log("📱 Abrindo popup Google...");
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log("✅ Usuário autenticado no Firebase:", user.email);

      // Verifica se o usuário já existe no Firestore
      const userDocRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDocRef);

      if (!docSnap.exists()) {
        // Se não existir, cria o documento com status 'pending'
        console.log("📝 Criando novo documento para usuário Google");

        await new Promise((resolve) => setTimeout(resolve, 1000));

        await setDoc(userDocRef, {
          name: user.displayName || "Usuário Google",
          email: user.email,
          status: "pending",
          role: "client",
          createdAt: new Date().toISOString(),
          photoURL: user.photoURL || "",
          loginProvider: "google",
          authUid: user.uid,
        });

        console.log(
          "✅ Documento criado no Firestore para novo usuário Google:",
          user.uid,
        );

        showSuccess(
          "Cadastro Google realizado! Redirecionando para página de aprovação...",
        );

        setTimeout(() => {
          console.log("🔄 Redirecionando para página de espera...");
          setButtonState(googleBtn, null);
          window.location.href = PAG_ESPERA;
        }, 2000);
      } else {
        console.log("✅ Usuário Google já existe no Firestore");
        showSuccess("Bem-vindo de volta!");
        setButtonState(googleBtn, null);
      }
    } catch (error) {
      console.error("❌ Erro no Google Login:", error);
      console.error("Código de erro:", error.code);
      console.error("Mensagem:", error.message);

      let errorMsg = "Erro ao fazer login com Google.";

      if (error.code === "auth/popup-closed-by-user") {
        errorMsg = "Popup foi fechado. Tente novamente.";
        console.warn("⚠️ Usuário fechou o popup do Google");
      } else if (error.code === "auth/cancelled-popup-request") {
        errorMsg = "Requisição foi cancelada. Tente novamente.";
        console.warn("⚠️ Popup cancelado");
      } else if (error.code === "auth/popup-blocked") {
        errorMsg =
          "Pop-up foi bloqueado. Verifique as configurações do navegador.";
        console.warn("⚠️ Popup bloqueado pelo navegador");
      } else if (error.code === "auth/network-request-failed") {
        errorMsg = "Erro de conexão. Verifique sua internet.";
        console.warn("⚠️ Erro de rede");
      } else {
        errorMsg = traduzirErro(error);
      }

      showError(errorMsg);
      setButtonState(googleBtn, null);
    }
  });
}
//=================================================
// Mensagem para o cliente se ele estiver Bloqueado
//=================================================
function showBlockedMessage() {
  const messageBox = document.getElementById("message-box");
  if (userDoc.status === "blocked") {
    Swal.fire({
      icon: "warning",
      title: "Atenção",
      text: "Seu acesso foi bloqueado. Entre em contato com o administrador.",
    });
  }
}
