// =======================================================
// CONFIGURAÇÃO DO FIREBASE (MODULAR V9)
// ⚠️ IMPORTANTE: Credenciais Firebase no front-end são PÚBLICAS por design.
// Não coloque chaves sensíveis aqui. Use Firebase Security Rules para proteger dados.
// =======================================================

// Importa as bibliotecas Firebase SDK v9
import {
  initializeApp,
  getApps,
  getApp,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Configuração explícita do Firebase
// NOTA: Essas credenciais são públicas e seguras para usar no front-end.
// O projeto Firebase deve ter Security Rules configuradas corretamente.
const firebaseConfig = {
  apiKey: "AIzaSyCQOqhSEfsU0ZxHyPMtqe8yJp1xSsyrhwY",
  authDomain: "routers-caminhao.firebaseapp.com",
  projectId: "routers-caminhao",
  storageBucket: "routers-caminhao.appspot.com",
  messagingSenderId: "1099946320141",
  appId: "1:1099946320141:web:2f0af2a29432bb1e2bc19b",
};

// Inicializa o Firebase e obtém as instâncias
// Verifica se já existe uma instância para evitar o erro de "app duplicado".
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// =======================================================
// EXPORTAÇÕES
// =======================================================

export { auth, db };
