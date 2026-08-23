const scene = document.querySelector('#product-scene');
const unfolding = document.querySelector('.unfold-section');
const header = document.querySelector('[data-header]');

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);

function updateScrollScene() {
  header?.classList.toggle('is-scrolled', window.scrollY > 28);
  if (!scene || !unfolding) return;
  const start = unfolding.offsetTop;
  const distance = unfolding.offsetHeight - window.innerHeight;
  const progress = clamp((window.scrollY - start) / distance);
  scene.style.setProperty('--progress', progress.toFixed(3));
}

window.addEventListener('scroll', updateScrollScene, { passive: true });
window.addEventListener('resize', updateScrollScene);
updateScrollScene();

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  document.querySelectorAll('[data-reveal]').forEach((element) => revealObserver.observe(element));
} else {
  document.querySelectorAll('[data-reveal]').forEach((element) => element.classList.add('is-visible'));
}

document.querySelector('#year').textContent = new Date().getFullYear();
