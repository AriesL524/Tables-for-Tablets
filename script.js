const pages = [...document.querySelectorAll('.story-page')];
const pageNumber = document.querySelector('#pageNumber');
const progressBar = document.querySelector('#progressBar');
const prevButton = document.querySelector('#prevButton');
const nextButton = document.querySelector('#nextButton');
const dotNav = document.querySelector('#dotNav');
let currentPage = 0;
let savedConstellation = null;
let makerDrawing = null;
let designColor = '#e95743';
const packedItems = new Set();

function resetMarsJourney() {
  document.querySelector('#tinyRocket').classList.remove('is-home');
  document.querySelector('#completionStamp').classList.remove('show');
  document.querySelector('#marsMessage').textContent = 'the stars are waiting...';
}

const nameInput = document.querySelector('#nameInput');
const nameType = document.querySelector('#nameType');
const namedThing = document.querySelector('#namedThing');
const namedThingLabel = document.querySelector('#namedThingLabel');
const packedItemsLabel = document.querySelector('#packedItems');
const designPatch = document.querySelector('#designPatch');
const customDoodle = document.querySelector('#customDoodle');
function updateMissionCard() {
  namedThing.textContent = nameInput.value.trim() || 'Johnny';
  namedThingLabel.textContent = nameType.value;
  packedItemsLabel.textContent = packedItems.size ? `packed: ${[...packedItems].join(' · ')}` : 'empty pockets';
}
nameInput.addEventListener('input', updateMissionCard);
nameType.addEventListener('change', updateMissionCard);
document.querySelectorAll('.swatch').forEach(swatch => swatch.addEventListener('click', () => {
  designColor = swatch.dataset.color;
  document.documentElement.style.setProperty('--design-color', designColor);
  document.querySelectorAll('.swatch').forEach(item => item.classList.remove('selected'));
  swatch.classList.add('selected');
}));
document.querySelectorAll('.pack-item').forEach(item => item.addEventListener('click', () => {
  if (packedItems.has(item.dataset.pack)) { packedItems.delete(item.dataset.pack); item.classList.remove('selected'); }
  else { packedItems.add(item.dataset.pack); item.classList.add('selected'); }
  updateMissionCard();
}));

const makerCanvas = document.querySelector('#drawCanvas');
const makerContext = makerCanvas.getContext('2d');
makerContext.lineCap = 'round'; makerContext.lineJoin = 'round'; makerContext.strokeStyle = '#24333c'; makerContext.lineWidth = 3;
let makerDrawingActive = false;
makerCanvas.addEventListener('pointerdown', event => { makerDrawingActive = true; makerCanvas.setPointerCapture(event.pointerId); const box = makerCanvas.getBoundingClientRect(); makerContext.beginPath(); makerContext.moveTo(event.clientX - box.left, event.clientY - box.top); });
makerCanvas.addEventListener('pointermove', event => { if (!makerDrawingActive) return; const box = makerCanvas.getBoundingClientRect(); makerContext.lineTo(event.clientX - box.left, event.clientY - box.top); makerContext.stroke(); });
makerCanvas.addEventListener('pointerup', () => {
  makerDrawingActive = false;
  makerDrawing = makerCanvas.toDataURL('image/png');
  customDoodle.style.backgroundImage = `url(${makerDrawing})`;
  customDoodle.style.backgroundSize = '100% 100%';
  customDoodle.style.backgroundRepeat = 'no-repeat';
});
makerCanvas.addEventListener('pointercancel', () => { makerDrawingActive = false; });
document.querySelector('#clearMaker').addEventListener('click', () => { makerContext.clearRect(0,0,makerCanvas.width,makerCanvas.height); makerDrawing = null; customDoodle.style.backgroundImage = 'none'; });

pages.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = 'page-dot' + (i === 0 ? ' active' : '');
  dot.setAttribute('aria-label', `Go to page ${i + 1}`);
  dot.addEventListener('click', () => goToPage(i));
  dotNav.appendChild(dot);
});

function goToPage(index) {
  const nextIndex = Math.max(0, Math.min(pages.length - 1, index));
  if (nextIndex === currentPage && pages[currentPage].classList.contains('active')) return;
  if (currentPage === 3 && canvas.dataset.ready === 'true') saveConstellation();
  pages[currentPage].classList.remove('active');
  pages[currentPage].hidden = true;
  currentPage = nextIndex;
  pages[currentPage].hidden = false;
  pages[currentPage].classList.add('active');
  pageNumber.textContent = String(currentPage + 1).padStart(2, '0');
  progressBar.style.width = `${((currentPage + 1) / pages.length) * 100}%`;
  prevButton.disabled = currentPage === 0;
  nextButton.disabled = currentPage === pages.length - 1;
  nextButton.innerHTML = currentPage === pages.length - 1 ? 'start again <span>↻</span>' : 'next <span>→</span>';
  dotNav.querySelectorAll('.page-dot').forEach((dot, i) => dot.classList.toggle('active', i === currentPage));
  if (currentPage === 3) requestAnimationFrame(() => {
    sizeCanvas();
    restoreConstellation();
  });
}

prevButton.addEventListener('click', () => goToPage(currentPage - 1));
nextButton.addEventListener('click', () => {
  if (currentPage === pages.length - 1) resetMarsJourney();
  goToPage(currentPage === pages.length - 1 ? 0 : currentPage + 1);
});
document.querySelectorAll('.next-action').forEach(button => button.addEventListener('click', () => goToPage(Number(button.dataset.next))));
document.querySelector('#homeButton').addEventListener('click', () => goToPage(0));

document.querySelectorAll('.tool').forEach(tool => {
  const wake = () => {
    tool.classList.add('is-tapped');
    const bubble = document.querySelector('#workshopBubble');
    const words = { hammer: 'Nice and sturdy!', tape: 'Stick with it!', star: 'A shiny idea!' };
    bubble.innerHTML = words[tool.dataset.tool] || 'Psst!<br /><strong>let\'s build.</strong>';
    tool.animate([{ transform: 'scale(1) rotate(0)' }, { transform: 'scale(1.28) rotate(-12deg)' }, { transform: 'scale(1) rotate(0)' }], { duration: 420, easing: 'ease-out' });
  };
  tool.addEventListener('click', wake);
  tool.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); wake(); } });
});

const dragJohnny = document.querySelector('#dragJohnny');
const launchTarget = document.querySelector('#launchTarget');
const launchMessage = document.querySelector('#launchMessage');
let dragging = false;
function dragMove(event) {
  if (!dragging) return;
  const scene = document.querySelector('#launchScene').getBoundingClientRect();
  const point = event.touches ? event.touches[0] : event;
  const x = Math.max(20, Math.min(scene.width - 90, point.clientX - scene.left - 44));
  const y = Math.max(10, Math.min(scene.height - 160, point.clientY - scene.top - 74));
  dragJohnny.style.left = `${x}px`; dragJohnny.style.bottom = 'auto'; dragJohnny.style.top = `${y}px`;
  const target = launchTarget.getBoundingClientRect();
  const actor = dragJohnny.getBoundingClientRect();
  const close = Math.abs((actor.left + actor.width / 2) - (target.left + target.width / 2)) < 85 && Math.abs((actor.top + actor.height / 2) - (target.top + target.height / 2)) < 100;
  launchTarget.classList.toggle('is-ready', close);
  launchMessage.textContent = close ? 'yes! let it fly!' : 'steady... steady...';
}
function dragEnd() {
  if (!dragging) return;
  dragging = false;
  if (launchTarget.classList.contains('is-ready')) {
    launchMessage.textContent = 'WHOOSH!';
    dragJohnny.animate([{ transform:'scale(1)' }, { transform:'scale(1.15) translateY(-10px)' }, { transform:'scale(1)' }], { duration:600 });
  }
}
dragJohnny.addEventListener('pointerdown', e => { dragging = true; dragJohnny.setPointerCapture(e.pointerId); });
dragJohnny.addEventListener('pointermove', dragMove); dragJohnny.addEventListener('pointerup', dragEnd); dragJohnny.addEventListener('pointercancel', dragEnd);

const canvas = document.querySelector('#constellationCanvas');
const canvasContext = canvas.getContext('2d');
let drawing = false;
function saveConstellation() {
  savedConstellation = canvas.toDataURL('image/png');
}
function restoreConstellation() {
  if (!savedConstellation) return;
  const image = new Image();
  image.onload = () => {
    const rect = canvas.getBoundingClientRect();
    canvasContext.drawImage(image, 0, 0, rect.width, rect.height);
  };
  image.src = savedConstellation;
}
function sizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  const hadSize = canvas.dataset.ready === 'true';
  const snapshot = hadSize ? document.createElement('canvas') : null;
  if (snapshot) {
    snapshot.width = canvas.width;
    snapshot.height = canvas.height;
    snapshot.getContext('2d').drawImage(canvas, 0, 0);
  }
  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  canvasContext.setTransform(ratio,0,0,ratio,0,0);
  canvasContext.lineCap = 'round';
  canvasContext.lineJoin = 'round';
  if (snapshot) canvasContext.drawImage(snapshot, 0, 0, rect.width, rect.height);
  canvas.dataset.ready = 'true';
}
function drawAt(e) { if (!drawing) return; const rect = canvas.getBoundingClientRect(); const point = e.touches ? e.touches[0] : e; canvasContext.lineTo(point.clientX - rect.left, point.clientY - rect.top); canvasContext.stroke(); }
canvas.addEventListener('pointerdown', e => { drawing = true; canvas.setPointerCapture(e.pointerId); const rect = canvas.getBoundingClientRect(); canvasContext.beginPath(); canvasContext.moveTo(e.clientX - rect.left, e.clientY - rect.top); canvasContext.strokeStyle = '#ffd15c'; canvasContext.lineWidth = 3; });
canvas.addEventListener('pointermove', drawAt); canvas.addEventListener('pointerup', () => drawing = false); canvas.addEventListener('pointercancel', () => drawing = false);
document.querySelector('#clearDrawing').addEventListener('click', () => { canvasContext.clearRect(0,0,canvas.width,canvas.height); savedConstellation = null; });
window.addEventListener('resize', () => { if (currentPage === 3) sizeCanvas(); });

const marsSun = document.querySelector('#marsSun');
const marsScene = document.querySelector('#marsScene');
let holdTimer;
function startCharge() { marsSun.classList.add('is-charging'); marsScene.classList.add('is-charging'); document.querySelector('#marsMessage').textContent = 'powering up...'; holdTimer = setTimeout(() => { document.querySelector('#tinyRocket').classList.add('is-home'); document.querySelector('#marsMessage').textContent = 'home, sweet home!'; document.querySelector('#completionStamp').classList.add('show'); }, 1300); }
function stopCharge() { clearTimeout(holdTimer); marsSun.classList.remove('is-charging'); marsScene.classList.remove('is-charging'); }
marsSun.addEventListener('pointerdown', startCharge); marsSun.addEventListener('pointerup', stopCharge); marsSun.addEventListener('pointerleave', stopCharge); marsSun.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startCharge(); } }); marsSun.addEventListener('keyup', stopCharge);
document.querySelector('#resetRocket').addEventListener('click', resetMarsJourney);

goToPage(0);
