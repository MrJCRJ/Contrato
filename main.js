document.addEventListener('DOMContentLoaded', function () {
  // Verifica se há um contrato salvo
  const savedContract = checkForSavedContract();

  // Mostra/oculta o botão de deletar
  document.addEventListener('DOMContentLoaded', function () {
    // Oculta o botão de deletar inicialmente
    const deleteBtn = document.getElementById('delete-contract');
    if (deleteBtn) {
      deleteBtn.style.display = 'none';
    }

    if (savedContract) {
      loadSavedContract(savedContract);
    }
  });
  // Carrega os componentes estáticos
  loadComponent('header-container', 'header.html');
  loadComponent('intro-container', 'intro.html');
  loadComponent('signatures-container', 'signatures.html');
  loadComponent('footer-container', 'footer.html');

  // Lista de cláusulas
  const clauses = [
    { id: 'clause-1', title: 'Respeito Mútuo', file: 'clause-1.html' },
    // Adicione mais cláusulas conforme necessário
  ];

  loadClauses(clauses);
  setupBackToTop();

  // Se houver um contrato salvo, carrega os dados
  if (savedContract) {
    document.addEventListener('signaturesLoaded', () => {
      loadSavedContract(savedContract);
    });
  }
});

function loadSavedContract(contractData) {
  // Esta função será chamada após as assinaturas serem inicializadas
  const canvas1 = document.getElementById('signature-pad-1');
  const canvas2 = document.getElementById('signature-pad-2');
  const dateInput = document.querySelector('input[type="date"]');

  if (dateInput && contractData.date) {
    dateInput.value = contractData.date;
  }

  if (canvas1 && contractData.signatures?.partner1) {
    const img1 = new Image();
    img1.onload = function () {
      const ctx1 = canvas1.getContext('2d');
      ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
      ctx1.drawImage(img1, 0, 0, canvas1.width, canvas1.height);
    };
    img1.src = contractData.signatures.partner1;
  }

  if (canvas2 && contractData.signatures?.partner2) {
    const img2 = new Image();
    img2.onload = function () {
      const ctx2 = canvas2.getContext('2d');
      ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
      ctx2.drawImage(img2, 0, 0, canvas2.width, canvas2.height);
    };
    img2.src = contractData.signatures.partner2;
  }
}

function loadComponent(containerId, filePath) {
  fetch(filePath)
    .then(response => response.text())
    .then(data => {
      document.getElementById(containerId).innerHTML = data;

      // Dispara evento quando as assinaturas são carregadas
      if (containerId === 'signatures-container') {
        initializeSignaturePads();
        document.dispatchEvent(new Event('signaturesLoaded'));
      }
    })
    .catch(error => console.error(`Erro ao carregar ${filePath}:`, error));
}

function loadClauses(clauses) {
  const container = document.getElementById('clauses-container');
  const navContainer = document.getElementById('clauses-nav').querySelector('div');

  clauses.forEach((clause, index) => {
    // Navegação (menu superior)
    const navLink = document.createElement('a');
    navLink.href = `#${clause.id}`;
    navLink.textContent = clause.title;
    navLink.className = `
      whitespace-nowrap px-4 py-2
      bg-white rounded-full
      text-neutralblue-700 font-medium
      shadow-neutral-md
      hover:bg-neutralblue-100
      transition-colors duration-200
    `.trim();
    navContainer.appendChild(navLink);

    // Espaço entre links (opcional)
    if (index < clauses.length - 1) {
      navContainer.appendChild(document.createTextNode(' '));
    }

    // Carrega o conteúdo da cláusula
    fetch(clause.file)
      .then(response => response.text())
      .then(data => {
        const clauseElement = document.createElement('div');
        clauseElement.id = clause.id;
        clauseElement.className = `
          clause-animate clause-card
          bg-white rounded-lg
          shadow-neutral-md
          overflow-hidden
          transition-all duration-300
          p-4
        `.trim();
        clauseElement.innerHTML = data;
        container.appendChild(clauseElement);
      })
      .catch(error => console.error(`Erro ao carregar ${clause.file}:`, error));
  });
}

function setupBackToTop() {
  const button = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    button.classList.toggle('visible', window.pageYOffset > 300);
  });

  button.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

function initializeSignaturePads() {
  // Verifica se os elementos existem
  const canvas1 = document.getElementById('signature-pad-1');
  const canvas2 = document.getElementById('signature-pad-2');
  const clear1 = document.getElementById('clear-1');
  const clear2 = document.getElementById('clear-2');
  const saveBtn = document.getElementById('save-contract');
  const deleteBtn = document.getElementById('delete-contract');
  const dateInput = document.querySelector('input[type="date"]');

  if (!canvas1 || !canvas2 || !clear1 || !clear2) {
    console.error("Elementos de assinatura não encontrados!");
    return;
  }

  // Configura data atual como padrão
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.max = today;
  }

  // Configura o botão de deletar
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      if (confirm('Tem certeza que deseja deletar este contrato? Esta ação não pode ser desfeita.')) {
        deleteSavedContract();
      }
    });
    // Esconde inicialmente
    deleteBtn.style.display = 'none';
  }

  // Inicializa as assinaturas
  try {
    const signaturePad1 = new SimpleSignaturePad('signature-pad-1', 'clear-1', 'signature_partner1');
    const signaturePad2 = new SimpleSignaturePad('signature-pad-2', 'clear-2', 'signature_partner2');

    // Configura o botão de salvar
    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        if (signaturePad1.isEmpty() || signaturePad2.isEmpty()) {
          alert("Ambos os parceiros devem assinar o contrato!");
          return;
        }

        // Cria objeto com os dados do contrato
        const contractData = {
          signatures: {
            partner1: signaturePad1.canvas.toDataURL(),
            partner2: signaturePad2.canvas.toDataURL()
          },
          date: dateInput?.value || new Date().toISOString().split('T')[0],
          clauses: []
        };

        // Salva localmente (mantemos isso para compatibilidade)
        localStorage.setItem('saved_contract', JSON.stringify(contractData));

        try {
          // Salva no "backend" com ID fixo
          const contractId = await simulateBackendSave(contractData);

          // Mostra o botão de deletar após salvar
          if (deleteBtn) {
            deleteBtn.style.display = 'block';
          }

          alert("Contrato assinado com sucesso!");
        } catch (error) {
          console.error("Erro ao salvar contrato:", error);
          alert("Erro ao salvar o contrato.");
        }
      });
    }
  } catch (error) {
    console.error("Erro ao inicializar assinaturas:", error);
  }
}

async function simulateBackendSave(contractData) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Usamos um ID fixo para garantir que sempre haverá apenas um contrato
      const contractId = 'current_contract';
      localStorage.setItem(`contract_${contractId}`, JSON.stringify(contractData));
      resolve(contractId);
    }, 1000);
  });
}

// Verifica se há um contrato para carregar
function checkForSavedContract() {
  // Verifica primeiro se há um contrato com ID fixo
  const fixedContractId = 'current_contract';
  const savedContract = localStorage.getItem(`contract_${fixedContractId}`);

  if (savedContract) {
    return JSON.parse(savedContract);
  }

  // Se não encontrar, verifica o localStorage local como fallback
  const localContract = localStorage.getItem('saved_contract');
  return localContract ? JSON.parse(localContract) : null;
}

function deleteSavedContract() {
  // Remove o contrato com ID fixo
  localStorage.removeItem('contract_current_contract');

  // Remove o contrato local antigo (para compatibilidade)
  localStorage.removeItem('saved_contract');

  // Remove as assinaturas individuais
  localStorage.removeItem('signature_partner1');
  localStorage.removeItem('signature_partner2');

  // Recarrega a página para limpar tudo
  window.location.href = window.location.pathname;
}