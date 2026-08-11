const scene = document.querySelector('#product-scene');
const unfolding = document.querySelector('.unfold-section');

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
function updateScrollScene() {
  const start = unfolding.offsetTop;
  const distance = unfolding.offsetHeight - window.innerHeight;
  const progress = clamp((window.scrollY - start) / distance);
  scene.style.setProperty('--progress', progress.toFixed(3));
  scene.classList.toggle('is-ready', progress > 0.72);
}

window.addEventListener('scroll', updateScrollScene, { passive: true });
window.addEventListener('resize', updateScrollScene);
updateScrollScene();
document.querySelector('#year').textContent = new Date().getFullYear();
