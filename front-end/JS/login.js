document.addEventListener("DOMContentLoaded", () => {
  /*
  ====================================
  1. SELETORES DE ELEMENTOS
  ====================================
  */
  const toggleCheckbox = document.getElementById("signup_toggle");
  const loginCard = document.getElementById("login-card");
  const registerCard = document.getElementById("register-card");

  // Garante que os elementos do toggle existam antes de adicionar o listener
  if (toggleCheckbox && loginCard && registerCard) {
    /*
    ====================================
    2. LÓGICA PARA ALTERNAR FORMULÁRIOS
    ====================================
    */
    toggleCheckbox.addEventListener("change", (e) => {
      // Aplica um efeito de fade-out para uma transição suave
      loginCard.style.opacity = "0";
      registerCard.style.opacity = "0";

      // Aguarda o fim da transição para trocar a visibilidade e aplicar o fade-in
      setTimeout(() => {
        loginCard.style.display = e.target.checked ? "none" : "block";
        registerCard.style.display = e.target.checked ? "block" : "none";

        loginCard.style.opacity = "1";
        registerCard.style.opacity = "1";
      }, 200); // Este tempo deve ser similar à transição definida no seu CSS
    });
  }
  //=================================================
  // Mensagem para o cliente se ele estiver Bloqueado
  //=================================================
  function showBlockedMessage() {
    const messageBox = document.getElementById("message-box");
    if (
      userEmailSpan.status === "blocked" &&
      userEmaiDoc.status === "blocked"
    ) {
      Swal.fire({
        icon: "warning",
        title: "Atenção",
        text: "Seu acesso foi bloqueado. Entre em contato com o administrador.",
      });
    }
  }
});
