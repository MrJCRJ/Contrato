class SimpleSignaturePad {
  constructor(canvasId, clearBtnId, storageKey) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error(`Canvas não encontrado: ${canvasId}`);
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.clearBtn = document.getElementById(clearBtnId);
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;
    this.storageKey = storageKey || `signature_${canvasId}`;

    this.setupCanvas();
    this.setupEventListeners();
    this.loadSignature();
  }

  setupCanvas() {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const width = this.canvas.offsetWidth;
    const height = this.canvas.offsetHeight;

    // Ajusta o tamanho para mobile
    const isMobile = window.matchMedia("(max-width: 640px)").matches;
    const lineWidth = isMobile ? 1.5 : 2;

    this.canvas.width = width * ratio;
    this.canvas.height = height * ratio;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.scale(ratio, ratio);
    this.ctx.lineWidth = lineWidth; // Linha mais fina em mobile
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = '#334e68';
    this.ctx.fillStyle = '#f0f4f8';
    this.ctx.fillRect(0, 0, width, height);
  }

  setupEventListeners() {
    if (!this.canvas) return;

    // Mouse events
    this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
    this.canvas.addEventListener('mousemove', this.draw.bind(this));
    this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
    this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));

    // Touch events
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.canvas.addEventListener('touchend', this.stopDrawing.bind(this), { passive: false });

    // Clear button
    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', this.clear.bind(this));
    }
  }

  startDrawing(e) {
    this.isDrawing = true;
    [this.lastX, this.lastY] = this.getPosition(e);
  }

  draw(e) {
    if (!this.isDrawing || !this.canvas) return;

    e.preventDefault();
    const [x, y] = this.getPosition(e);

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();

    [this.lastX, this.lastY] = [x, y];
    this.saveSignature();
  }

  handleTouchStart(e) {
    if (!this.canvas) return;
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    this.canvas.dispatchEvent(mouseEvent);
  }

  handleTouchMove(e) {
    if (!this.canvas) return;
    e.preventDefault();

    // Aumenta a sensibilidade para dispositivos móveis
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();

    // Adiciona pontos intermediários para linhas mais suaves
    if (this.lastTouch) {
      const midX = (this.lastTouch.clientX + touch.clientX) / 2;
      const midY = (this.lastTouch.clientY + touch.clientY) / 2;

      const midEvent = new MouseEvent('mousemove', {
        clientX: midX,
        clientY: midY
      });
      this.canvas.dispatchEvent(midEvent);
    }

    this.lastTouch = touch;

    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    this.canvas.dispatchEvent(mouseEvent);
  }

  stopDrawing() {
    this.isDrawing = false;
    this.saveSignature();
  }

  clear() {
    if (!this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    localStorage.removeItem(this.storageKey);
  }

  saveSignature() {
    if (!this.canvas) return;
    const signatureData = this.canvas.toDataURL();
    localStorage.setItem(this.storageKey, signatureData);
  }

  loadSignature() {
    if (!this.canvas) return;
    const savedSignature = localStorage.getItem(this.storageKey);
    if (savedSignature) {
      const img = new Image();
      img.onload = () => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
      };
      img.src = savedSignature;
    }
  }

  getPosition(e) {
    if (!this.canvas) return [0, 0];
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    if (clientX === undefined || clientY === undefined) return [0, 0];

    return [
      clientX - rect.left,
      clientY - rect.top
    ];
  }
}