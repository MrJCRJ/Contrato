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
    { id: 'clause-2', title: 'Comunicação Transparente', file: 'clause-2.html' },
    { id: 'clause-3', title: 'Dedicação Total', file: 'clause-3.html' },
    { id: 'clause-4', title: 'Apoio Mútuo', file: 'clause-4.html' },
    { id: 'clause-5', title: 'Afeto e Intimidade', file: 'clause-5.html' },
    { id: 'clause-6', title: 'Crescimento em Dupla', file: 'clause-6.html' },
    { id: 'clause-7', title: 'Brigas Construtivas', file: 'clause-7.html' },
    { id: 'clause-8', title: 'Fidelidade e Confiança', file: 'clause-8.html' },
    { id: 'clause-9', title: 'Liberdade e Individualidade', file: 'clause-9.html' }

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

function toggleAccordion(id) {
  const header = document.querySelector(`#${id} .accordion-header`);
  const content = document.getElementById(`${id}-content`);

  header.classList.toggle('active');
  content.classList.toggle('open');
}

function loadComponent(containerId, filePath) {
  fetch(filePath)
    .then(response => response.text())
    .then(data => {
      if (containerId === 'signatures-container') {
        // Adiciona a estrutura de acordeão para as assinaturas
        document.getElementById(containerId).innerHTML = `
          <div class="accordion-header p-4 flex justify-between items-center bg-white rounded-t-lg shadow-neutral-md" data-target="signatures-content">
            <h2 class="text-xl sm:text-2xl font-bold text-neutralblue-800">Assinaturas</h2>
            <svg class="accordion-arrow w-5 h-5 text-neutralblue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div id="signatures-content" class="accordion-content bg-white rounded-b-lg shadow-neutral-md">
            ${data}
          </div>
        `;

        // Adiciona o evento de clique ao cabeçalho das assinaturas
        const header = document.querySelector('#signatures-container .accordion-header');
        header.addEventListener('click', () => {
          header.classList.toggle('active');
          const content = document.getElementById('signatures-content');
          content.classList.toggle('open');
        });

        initializeSignaturePads();
        document.dispatchEvent(new Event('signaturesLoaded'));
      } else {
        document.getElementById(containerId).innerHTML = data;
      }
    })
    .catch(error => console.error(`Erro ao carregar ${filePath}:`, error));
}

async function loadClauses(clauses) {
  const container = document.getElementById('clauses-container');
  const navContainer = document.getElementById('clauses-nav').querySelector('div');

  // Limpa os containers antes de carregar
  container.innerHTML = '';
  navContainer.innerHTML = '';
  navContainer.className = 'flex overflow-x-auto space-x-2 py-2 clause-nav';

  // Carrega as cláusulas em série para manter a ordem
  for (const [index, clause] of clauses.entries()) {
    // Adiciona link de navegação
    const navLink = document.createElement('a');
    navLink.href = `#${clause.id}`;
    navLink.textContent = clause.title;
    navLink.className = 'clause-nav-link whitespace-nowrap px-4 py-2 bg-white rounded-full text-neutralblue-700 font-medium shadow-neutral-md hover:bg-neutralblue-100 transition-colors duration-200';
    navLink.dataset.clauseId = clause.id;
    navContainer.appendChild(navLink);

    try {
      const response = await fetch(clause.file);
      const data = await response.text();

      const clauseElement = document.createElement('div');
      clauseElement.id = clause.id;
      clauseElement.className = 'clause-animate clause-card bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 mb-6';

      clauseElement.innerHTML = `
        <button class="accordion-header w-full p-6 flex justify-between items-center text-left" 
                aria-expanded="false" 
                aria-controls="${clause.id}-content"
                data-clause-id="${clause.id}">
          <h3 class="text-xl font-semibold text-neutralblue-700">${clause.title}</h3>
          <svg class="accordion-arrow w-6 h-6 text-neutralblue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div id="${clause.id}-content" class="accordion-content" aria-hidden="true">
          <div class="p-6 pt-0">
            ${data}
          </div>
        </div>
      `;

      container.appendChild(clauseElement);

      // Adiciona eventos
      const header = clauseElement.querySelector('.accordion-header');
      header.addEventListener('click', () => toggleClause(clause.id));
    } catch (error) {
      console.error(`Erro ao carregar ${clause.file}:`, error);
      // Fallback para cláusula não carregada
      container.innerHTML += `
        <div id="${clause.id}" class="bg-white rounded-2xl shadow-md p-6 text-center">
          <p class="text-neutralblue-500">Não foi possível carregar esta cláusula.</p>
        </div>
      `;
    }
  }

  // Configura observador de interseção para highlight na navegação
  setupIntersectionObserver(clauses);
}

// Nova função para alternar cláusulas
function toggleClause(clauseId, scrollIntoView = false) {
  const header = document.querySelector(`[data-clause-id="${clauseId}"]`);
  const content = document.getElementById(`${clauseId}-content`);
  const isOpening = !header.classList.contains('active');

  // Fecha todos os outros accordions se estiver abrindo este
  if (isOpening) {
    document.querySelectorAll('.accordion-content.open').forEach(el => {
      if (el.id !== `${clauseId}-content`) {
        el.classList.remove('open');
        el.setAttribute('aria-hidden', 'true');
        const otherHeader = document.querySelector(`[data-clause-id="${el.id.replace('-content', '')}"]`);
        otherHeader.classList.remove('active');
        otherHeader.setAttribute('aria-expanded', 'false');
      }
    });
  }

  header.classList.toggle('active');
  content.classList.toggle('open');

  // Atualiza atributos ARIA
  const isExpanded = header.classList.contains('active');
  header.setAttribute('aria-expanded', isExpanded);
  content.setAttribute('aria-hidden', !isExpanded);

  // Atualiza navegação
  updateNavHighlight(clauseId);

  // Scroll para visualização se necessário
  if (scrollIntoView && isOpening) {
    setTimeout(() => {
      header.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  }
}

// Configura observador de interseção para highlight na navegação
function setupIntersectionObserver(clauses) {
  const options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const clauseId = entry.target.id;
        updateNavHighlight(clauseId);
      }
    });
  }, options);

  clauses.forEach(clause => {
    const element = document.getElementById(clause.id);
    if (element) observer.observe(element);
  });
}

// Atualiza destaque na navegação
function updateNavHighlight(clauseId) {
  document.querySelectorAll('.clause-nav-link').forEach(link => {
    if (link.dataset.clauseId === clauseId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Modifique a função loadComponent para usar o novo accordion
function loadComponent(containerId, filePath) {
  fetch(filePath)
    .then(response => response.text())
    .then(data => {
      if (containerId === 'signatures-container') {
        document.getElementById(containerId).innerHTML = `
          <button class="accordion-header w-full p-6 flex justify-between items-center text-left bg-white rounded-t-2xl shadow-md"
                  aria-expanded="false" 
                  aria-controls="signatures-content"
                  data-target="signatures">
            <h2 class="text-xl sm:text-2xl font-bold text-neutralblue-800">Assinaturas</h2>
            <svg class="accordion-arrow w-6 h-6 text-neutralblue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div id="signatures-content" class="accordion-content bg-white rounded-b-2xl shadow-md" aria-hidden="true">
            <div class="p-6 pt-0">
              ${data}
            </div>
          </div>
        `;

        const header = document.querySelector('#signatures-container .accordion-header');
        header.addEventListener('click', () => {
          const content = document.getElementById('signatures-content');
          const isExpanded = header.getAttribute('aria-expanded') === 'true';

          header.setAttribute('aria-expanded', !isExpanded);
          content.setAttribute('aria-hidden', isExpanded);
          header.classList.toggle('active');
          content.classList.toggle('open');
        });

        initializeSignaturePads();
        document.dispatchEvent(new Event('signaturesLoaded'));
      } else {
        document.getElementById(containerId).innerHTML = data;
      }
    })
    .catch(error => console.error(`Erro ao carregar ${filePath}:`, error));
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