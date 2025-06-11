// signature.js

function initSignaturePad(canvasId, clearBtnId, storageKey) {
  const canvas = document.getElementById(canvasId);
  const clearBtn = document.getElementById(clearBtnId);
  const ctx = canvas.getContext("2d");

  let drawing = false;
  let lastX = 0;
  let lastY = 0;

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return [clientX - rect.left, clientY - rect.top];
  }

  function startPosition(e) {
    e.preventDefault();
    drawing = true;
    [lastX, lastY] = getPos(e);
  }

  function finishedPosition(e) {
    e.preventDefault();
    drawing = false;
    ctx.beginPath();
    saveSignature();
  }

  function draw(e) {
    if (!drawing) return;
    e.preventDefault();
    const [x, y] = getPos(e);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#334e68";

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();

    lastX = x;
    lastY = y;
  }

  function saveSignature() {
    const dataURL = canvas.toDataURL();
    localStorage.setItem(storageKey, dataURL);
  }

  function loadSignature() {
    const dataURL = localStorage.getItem(storageKey);
    if (dataURL) {
      const image = new Image();
      image.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      };
      image.src = dataURL;
    }
  }

  // Mouse
  canvas.addEventListener("mousedown", startPosition);
  canvas.addEventListener("mouseup", finishedPosition);
  canvas.addEventListener("mouseout", finishedPosition);
  canvas.addEventListener("mousemove", draw);

  // Touch
  canvas.addEventListener("touchstart", startPosition, { passive: false });
  canvas.addEventListener("touchend", finishedPosition, { passive: false });
  canvas.addEventListener("touchcancel", finishedPosition, { passive: false });
  canvas.addEventListener("touchmove", draw, { passive: false });

  clearBtn.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    localStorage.removeItem(storageKey);
  });

  loadSignature();
}

document.addEventListener("DOMContentLoaded", () => {
  initSignaturePad("signature-pad-1", "clear-1", "signature1");
  initSignaturePad("signature-pad-2", "clear-2", "signature2");
});
