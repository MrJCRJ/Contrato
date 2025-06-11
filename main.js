document.addEventListener('DOMContentLoaded', function () {
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
});

function loadComponent(containerId, filePath) {
  fetch(filePath)
    .then(response => response.text())
    .then(data => {
      document.getElementById(containerId).innerHTML = data;
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
