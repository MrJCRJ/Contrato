document.addEventListener('DOMContentLoaded', function () {
  // Verifica se há um contrato salvo
  const savedContract = checkForSavedContract();

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

  if (!canvas1 || !canvas2 || !clear1 || !clear2) {
    console.error("Elementos de assinatura não encontrados!");
    return;
  }

  // Inicializa as assinaturas
  try {
    new SimpleSignaturePad('signature-pad-1', 'clear-1');
    new SimpleSignaturePad('signature-pad-2', 'clear-2');

    // Configura o botão de salvar se existir
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        alert('Contrato assinado com sucesso!');
      });
    }
  } catch (error) {
    console.error("Erro ao inicializar assinaturas:", error);
  }
}

function initializeSignaturePads() {
  // Verifica se os elementos existem
  const canvas1 = document.getElementById('signature-pad-1');
  const canvas2 = document.getElementById('signature-pad-2');
  const clear1 = document.getElementById('clear-1');
  const clear2 = document.getElementById('clear-2');
  const saveBtn = document.getElementById('save-contract');
  const dateInput = document.querySelector('input[type="date"]');

  if (!canvas1 || !canvas2 || !clear1 || !clear2) {
    console.error("Elementos de assinatura não encontrados!");
    return;
  }

  // Configura data atual como padrão
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.max = today; // Não permite datas futuras
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
          clauses: [] // Você pode adicionar os dados das cláusulas aqui
        };

        // Salva localmente
        localStorage.setItem('saved_contract', JSON.stringify(contractData));

        try {
          // Simula envio para um backend (substitua por uma chamada real)
          const contractId = await simulateBackendSave(contractData);

          // Gera link único para compartilhamento
          const shareLink = `${window.location.origin}${window.location.pathname}?contract=${contractId}`;

          alert(`Contrato assinado com sucesso!\n\nLink para compartilhamento:\n${shareLink}`);
        } catch (error) {
          console.error("Erro ao salvar contrato:", error);
          alert("Contrato salvo localmente, mas houve um erro ao compartilhar.");
        }
      });
    }
  } catch (error) {
    console.error("Erro ao inicializar assinaturas:", error);
  }
}

// Função simulada para salvar no backend
async function simulateBackendSave(contractData) {
  // Em uma implementação real, você faria uma chamada fetch() para seu backend
  return new Promise((resolve) => {
    setTimeout(() => {
      // Gera um ID aleatório para simular
      const contractId = 'contrato-' + Math.random().toString(36).substring(2, 9);
      // Salva no localStorage para simular um backend
      localStorage.setItem(`contract_${contractId}`, JSON.stringify(contractData));
      resolve(contractId);
    }, 1000);
  });
}

// Verifica se há um contrato para carregar
function checkForSavedContract() {
  // Verifica se há um ID de contrato na URL
  const urlParams = new URLSearchParams(window.location.search);
  const contractId = urlParams.get('contract');

  if (contractId) {
    // Carrega o contrato do "backend" (localStorage simulando)
    const savedContract = localStorage.getItem(`contract_${contractId}`);
    if (savedContract) {
      return JSON.parse(savedContract);
    }
  }

  // Tenta carregar do localStorage local
  const localContract = localStorage.getItem('saved_contract');
  return localContract ? JSON.parse(localContract) : null;
}