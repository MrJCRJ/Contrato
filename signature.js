// signature.js - Versão alternativa sem biblioteca externa

class SimpleSignaturePad {
  constructor(canvasId, clearBtnId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.clearBtn = document.getElementById(clearBtnId);
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;

    this.setupCanvas();
    this.setupEventListeners();
  }

  setupCanvas() {
    const ratio = window.devicePixelRatio || 1;
    const width = this.canvas.offsetWidth;
    const height = this.canvas.offsetHeight;

    this.canvas.width = width * ratio;
    this.canvas.height = height * ratio;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.scale(ratio, ratio);
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = '#334e68';
    this.ctx.fillStyle = '#f0f4f8';
    this.ctx.fillRect(0, 0, width, height);
  }

  setupEventListeners() {
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
    this.clearBtn?.addEventListener('click', this.clear.bind(this));
  }

  startDrawing(e) {
    this.isDrawing = true;
    [this.lastX, this.lastY] = this.getPosition(e);
  }

  draw(e) {
    if (!this.isDrawing) return;

    e.preventDefault();
    const [x, y] = this.getPosition(e);

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();

    [this.lastX, this.lastY] = [x, y];
  }

  handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    this.canvas.dispatchEvent(mouseEvent);
  }

  handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    this.canvas.dispatchEvent(mouseEvent);
  }

  stopDrawing() {
    this.isDrawing = false;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  getPosition(e) {
    const rect = this.canvas.getBoundingClientRect();
    return [
      e.clientX - rect.left,
      e.clientY - rect.top
    ];
  }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  new SimpleSignaturePad('signature-pad-1', 'clear-1');
  new SimpleSignaturePad('signature-pad-2', 'clear-2');
});