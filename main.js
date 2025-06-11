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
  const container1 = document.getElementById('signature-container-1');
  const container2 = document.getElementById('signature-container-2');
  const img1 = document.getElementById('signature-image-1');
  const img2 = document.getElementById('signature-image-2');
  const dateInput = document.getElementById('contract-date');
  const timeElapsed = document.getElementById('time-elapsed');

  if (dateInput && contractData.date) {
    dateInput.value = contractData.date;
    dateInput.classList.add('hidden');
    timeElapsed.classList.remove('hidden');
    startTimeCounter(contractData.date, timeElapsed);
  }

  if (img1 && contractData.signatures?.partner1) {
    img1.src = contractData.signatures.partner1;
    container1.classList.add('has-signature');
  }

  if (img2 && contractData.signatures?.partner2) {
    img2.src = contractData.signatures.partner2;
    container2.classList.add('has-signature');
  }

  const deleteBtn = document.getElementById('delete-contract');
  const saveBtn = document.getElementById('save-contract');
  if (deleteBtn) {
    deleteBtn.classList.remove('hidden');
    deleteBtn.classList.add('block');
  }
  if (saveBtn) saveBtn.classList.add('hidden');
}

function startTimeCounter(signedDate, element) {
  function updateCounter() {
    const now = new Date();
    const signed = new Date(signedDate);
    const diff = Math.abs(now - signed);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    element.textContent = `Assinado há ${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  updateCounter();
  setInterval(updateCounter, 1000);
}

function loadComponent(containerId, filePath) {
  fetch(filePath)
    .then(response => response.text())
    .then(data => {
      document.getElementById(containerId).innerHTML = data;
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
    const navLink = document.createElement('a');
    navLink.href = `#${clause.id}`;
    navLink.textContent = clause.title;
    navLink.className = 'whitespace-nowrap px-4 py-2 bg-white rounded-full text-neutralblue-700 font-medium shadow-neutral-md hover:bg-neutralblue-100 transition-colors duration-200';
    navContainer.appendChild(navLink);

    if (index < clauses.length - 1) {
      navContainer.appendChild(document.createTextNode(' '));
    }

    fetch(clause.file)
      .then(response => response.text())
      .then(data => {
        const clauseElement = document.createElement('div');
        clauseElement.id = clause.id;
        clauseElement.className = 'clause-animate clause-card bg-white rounded-lg shadow-neutral-md overflow-hidden transition-all duration-300 p-4';
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initializeSignaturePads() {
  const canvas1 = document.getElementById('signature-pad-1');
  const canvas2 = document.getElementById('signature-pad-2');
  const clear1 = document.getElementById('clear-1');
  const clear2 = document.getElementById('clear-2');
  const saveBtn = document.getElementById('save-contract');
  const deleteBtn = document.getElementById('delete-contract');
  const dateInput = document.getElementById('contract-date');

  if (!canvas1 || !canvas2 || !clear1 || !clear2) {
    console.error("Elementos de assinatura não encontrados!");
    return;
  }

  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.max = today;
  }

  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      if (confirm('Tem certeza que deseja deletar este contrato? Esta ação não pode ser desfeita.')) {
        deleteSavedContract();
      }
    });
  }

  try {
    const signaturePad1 = new SimpleSignaturePad('signature-pad-1', 'clear-1', 'signature_partner1');
    const signaturePad2 = new SimpleSignaturePad('signature-pad-2', 'clear-2', 'signature_partner2');

    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        if (signaturePad1.isEmpty() || signaturePad2.isEmpty()) {
          alert("Ambos os parceiros devem assinar o contrato!");
          return;
        }

        const contractData = {
          signatures: {
            partner1: signaturePad1.canvas.toDataURL(),
            partner2: signaturePad2.canvas.toDataURL()
          },
          date: dateInput?.value || new Date().toISOString().split('T')[0],
          clauses: []
        };

        localStorage.setItem('saved_contract', JSON.stringify(contractData));

        try {
          await simulateBackendSave(contractData);

          const container1 = document.getElementById('signature-container-1');
          const container2 = document.getElementById('signature-container-2');
          const img1 = document.getElementById('signature-image-1');
          const img2 = document.getElementById('signature-image-2');
          const timeElapsed = document.getElementById('time-elapsed');

          img1.src = contractData.signatures.partner1;
          container1.classList.add('has-signature');

          img2.src = contractData.signatures.partner2;
          container2.classList.add('has-signature');

          dateInput.classList.add('hidden');
          timeElapsed.classList.remove('hidden');
          startTimeCounter(contractData.date, timeElapsed);

          saveBtn.classList.add('hidden');
          deleteBtn.classList.remove('hidden');
          deleteBtn.classList.add('block');

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
      const contractId = 'current_contract';
      localStorage.setItem(`contract_${contractId}`, JSON.stringify(contractData));
      resolve(contractId);
    }, 1000);
  });
}

function checkForSavedContract() {
  const fixedContractId = 'current_contract';
  const savedContract = localStorage.getItem(`contract_${fixedContractId}`);
  if (savedContract) return JSON.parse(savedContract);

  const localContract = localStorage.getItem('saved_contract');
  return localContract ? JSON.parse(localContract) : null;
}

function deleteSavedContract() {
  localStorage.removeItem('contract_current_contract');
  localStorage.removeItem('saved_contract');
  localStorage.removeItem('signature_partner1');
  localStorage.removeItem('signature_partner2');
  window.location.href = window.location.pathname;
}