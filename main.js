// main.js atualizado para trabalhar com os novos estilos
document.addEventListener('DOMContentLoaded', function () {
  // Carrega os componentes estáticos
  loadComponent('header-container', 'header.html');
  loadComponent('intro-container', 'intro.html');
  loadComponent('signatures-container', 'signatures.html');
  loadComponent('footer-container', 'footer.html');

  // Carrega as cláusulas dinamicamente
  const clauses = [
    { id: 'clause-1', title: 'Respeito Mútuo', file: 'clause-1.html' },
    // Adicione mais cláusulas aqui conforme necessário
  ];

  loadClauses(clauses);

  // Configura o botão de voltar ao topo
  setupBackToTop();
});

function loadComponent(containerId, filePath) {
  fetch(filePath)
    .then(response => response.text())
    .then(data => {
      document.getElementById(containerId).innerHTML = data;
    })
    .catch(error => console.error('Error loading component:', error));
}

function loadClauses(clauses) {
  const container = document.getElementById('clauses-container');
  const navContainer = document.getElementById('clauses-nav').querySelector('div');

  clauses.forEach((clause, index) => {
    // Adiciona link de navegação
    const navLink = document.createElement('a');
    navLink.href = `#${clause.id}`;
    navLink.textContent = clause.title;
    navLink.className = 'whitespace-nowrap px-4 py-2 bg-white rounded-full text-romantic-700 font-medium shadow-romantic-md hover:bg-romantic-100 transition-colors';
    navContainer.appendChild(navLink);

    // Adiciona espaço entre os links (exceto após o último)
    if (index < clauses.length - 1) {
      navContainer.appendChild(document.createTextNode(' '));
    }

    // Carrega o conteúdo da cláusula
    fetch(clause.file)
      .then(response => response.text())
      .then(data => {
        const clauseElement = document.createElement('div');
        clauseElement.id = clause.id;
        clauseElement.className = 'clause-animate clause-card bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300';
        clauseElement.innerHTML = data;
        container.appendChild(clauseElement);
      })
      .catch(error => console.error('Error loading clause:', error));
  });
}

function setupBackToTop() {
  const backToTopButton = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      backToTopButton.classList.add('visible');
    } else {
      backToTopButton.classList.remove('visible');
    }
  });

  backToTopButton.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}