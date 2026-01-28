// =======================================================
// CONFIGURAÇÃO DE AMBIENTE
// =======================================================

/**
 * Detecta automaticamente a URL do backend baseado no ambiente
 */
const getBackendUrl = () => {
  // Desenvolvimento local
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    return `http://${window.location.hostname}:8081/api`;
  }

  // Produção
  const protocol = window.location.protocol;
  const host = window.location.hostname;
  const port = window.location.port ? `:${window.location.port}` : "";
  return `${protocol}//${host}${port}/api`;
};

// Exporta para uso global
window.BACKEND_CONFIG = {
  apiUrl: getBackendUrl(),
  timeout: 120000,
};

console.log("✅ Backend URL configurada:", window.BACKEND_CONFIG.apiUrl);
