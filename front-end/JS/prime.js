//===========================================
// SELECIONA AS TABELAS DE PREÇOS
//===========================================
const pricingCards = document.querySelectorAll(".pricing-card");

// Adiciona um evento de clique para cada cartão
pricingCards.forEach((clickedCard) => {
  clickedCard.addEventListener("click", () => {
    // 1. Remove a classe 'destaque' de todos os cartões
    pricingCards.forEach((card) => {
      card.classList.remove("destaque");
    });

    // 2. Adiciona a classe 'destaque' apenas ao cartão que foi clicado
    clickedCard.classList.add("destaque");
  });
});

//==================================
// MODAL DO FINAL DA PAGINA
//==================================

document.addEventListener("DOMContentLoaded", function () {
  // 1. Obter elementos
  var modal = document.getElementById("contact-modal");
  var btn = document.getElementById("open-modal-btn-nav"); // Botão corrigido para abrir o modal
  var span = document.getElementsByClassName("close-button")[0];
  var btnClose = document.getElementById("close-button");
  var btnFaleConosco = document.getElementById("open-modal-btn-footer");

  // 2. Quando o usuário clica no botão, abre o SweetAlert (Chat)
  if (btn) {
    btn.onclick = async function () {
      // modal.style.display = "block"; // Substituído pelo Swal

      const { value: formValues } = await Swal.fire({
        title: "💬 Fale Conosco",
        html:
          '<input id="swal-nome" class="swal2-input" placeholder="Seu Nome">' +
          '<input id="swal-email" class="swal2-input" placeholder="Seu E-mail">' +
          '<input id="swal-telefone" class="swal2-input" placeholder="Seu Telefone">' +
          '<input id="swal-assunto" class="swal2-input" placeholder="Assunto da Mensagem">' +
          '<textarea id="swal-mensagem" class="swal2-textarea" placeholder="Digite sua mensagem aqui..."></textarea>',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Enviar Mensagem 🚀",
        cancelButtonText: "Cancelar",
        preConfirm: () => {
          return {
            nome: document.getElementById("swal-nome").value,
            email: document.getElementById("swal-email").value,
            assunto: document.getElementById("swal-assunto").value,
            mensagem: document.getElementById("swal-mensagem").value,
          };
        },
      });

      if (formValues) {
        if (!formValues.email || !formValues.mensagem) {
          Swal.fire(
            "Atenção",
            "E-mail e Mensagem são obrigatórios!",
            "warning",
          );
          return;
        }

        try {
          const resp = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formValues),
          });

          if (resp.ok) {
            Swal.fire(
              "Sucesso!",
              "Sua mensagem foi enviada para nosso suporte.",
              "success",
            );
          } else {
            Swal.fire("Erro", "Não foi possível enviar a mensagem.", "error");
          }
        } catch (err) {
          console.error(err);
          Swal.fire("Erro", "Erro de conexão.", "error");
        }
      }
    };
  }

  // 3. Quando o usuário clica no 'x', fecha o modal
  if (span) {
    span.onclick = function () {
      modal.style.display = "none";
    };
  }

  // 4. Quando o usuário clica fora do modal, fecha o modal
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  // 5. Submissão AJAX do formulário de contato (evita reload)
  var contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      var nome = document.getElementById("nome").value;
      var email = document.getElementById("email").value;
      var assunto = document.getElementById("assunto").value;
      var mensagem = document.getElementById("mensagem").value;
      var contatoTelefone = document.getElementById("contato").value;

      try {
        const resp = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome, email, assunto, mensagem }),
        });

        if (resp.ok) {
          // Mensagem de sucesso simples
          Swal.fire(
            "Sucesso!",
            "Sua mensagem foi enviada para nosso suporte.",
            "success",
          );
          // Limpa os campos do formulário
          contactForm.reset();
          modal.style.display = "none";
        } else {
          const data = await resp.json().catch(() => ({}));
          alert(
            "Erro ao enviar mensagem: " + (data.message || resp.statusText),
          );
        }
      } catch (err) {
        console.error("Erro ao enviar contato:", err);
        alert("Erro de rede ao enviar a mensagem. Tente novamente mais tarde.");
      }
      if (btnClose) {
        btnClose.onclick();
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  // 1. Obter elementos
  const btnQuemSomos = document.getElementById("id-modal-btn");
  const modalQuemSomos = document.getElementById("modal-quem-somos");
  const spanClose = document.getElementsByClassName(
    "close-button-quem-somos",
  )[0];
  const btnCloseQuemSomos = document.getElementById("close-button-quem-somos");
  // 2. Quando o usuário clica no botão, abre o modal Quem Somos
  if (btnQuemSomos) {
    btnQuemSomos.onclick = function () {
      Swal.fire({
        title: "Quem Somos",
        html: `
          <p>Somos a Road-Truck, uma plataforma dedicada a conectar motoristas de caminhão com oportunidades de trabalho em todo o país. Nossa missão é facilitar a vida dos caminhoneiros, oferecendo uma interface simples e eficiente para encontrar cargas e rotas que atendam às suas necessidades.</p>
          <p>Com a Road-Truck, você pode:</p>
          <ul>
            <li>Encontrar cargas de forma rápida e segura</li>
            <li>Planejar rotas otimizadas para caminhões</li>
            <li>Gerenciar seu tempo e custos com eficiência</li>
          </ul>
        `,
        showCloseButton: true,
        confirmButtonText: "Fechar",
      });
      modalQuemSomos.style.display = "block";
    };
  }
  // 3. Quando o usuário clica no 'x', fecha o modal Quem Somos
  if (spanClose) {
    spanClose.onclick = function () {
      modalQuemSomos.style.display = "none";
    };
  }
  // 4. Quando o usuário clica fora do modal, fecha o modal Quem Somos
  window.onclick = function (event) {
    if (event.target == modalQuemSomos) {
      modalQuemSomos.style.display = "none";
    }
  };
  // 5. Botão de fechar do modal Quem Somos
  if (btnCloseQuemSomos) {
    btnCloseQuemSomos.onclick = function () {
      modalQuemSomos.style.display = "none";
    };
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const btnComoFunciona = document.getElementById("id-modal-btn-2");
  const modalComoFunciona = document.getElementById("modal-como-funciona");
  const spanClose = document.getElementsByClassName("close-button-2")[0];
  const btnCloseComoFunciona = document.getElementById("close-button-2");

  if (btnComoFunciona) {
    btnComoFunciona.onclick = function () {
      Swal.fire({
        title: "Como Funciona",
        html: `
          <p>Road-Truck é um app aonde você pode encontrar Rotas de caminhões de forma rápida e segura. O usuario ira colocar o endereço de partida e o endereço de destino e o app irá encontrar as melhores rotas para você.</p>
          colocando as especificações do caminhão e o app irá lhe retornar as melhores rotas para você.<p>`,
        showCloseButton: true,
        confirmButtonText: "Fechar",
      });
      modalComoFunciona.style.display = "block";
    };
  }
});
//==================================
// CONTROLE DO MENU HAMBÚRGUER (MOBILE)
//==================================
document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.querySelector(".menu-toggle");
  const configPanel = document.getElementById("config-panel");

  // Criar o fundo escuro dinamicamente
  const backdrop = document.createElement("div");
  backdrop.className = "menu-backdrop";
  document.body.appendChild(backdrop);

  if (menuToggle && configPanel) {
    // Abrir/Fechar ao clicar no botão
    menuToggle.addEventListener("click", function () {
      configPanel.classList.toggle("active");
      backdrop.classList.toggle("active");
    });

    // Fechar ao clicar no fundo escuro (fora do menu)
    backdrop.addEventListener("click", function () {
      configPanel.classList.remove("active");
      backdrop.classList.remove("active");
    });

    // Fechar ao clicar em algum botão de ação dentro do menu (opcional)
    const btnCalcular = configPanel.querySelector(".btn-primary");
    if (btnCalcular) {
      btnCalcular.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
          configPanel.classList.remove("active");
          backdrop.classList.remove("active");
        }
      });
    }
  }
});
