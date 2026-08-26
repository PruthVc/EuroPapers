const scene = document.querySelector('#product-scene');
const unfolding = document.querySelector('.unfold-section');
const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const siteNavigation = document.querySelector('#site-navigation');
const pillarStage = document.querySelector('[data-pillar-stage]');
const scrollPillars = [...document.querySelectorAll('[data-scroll-pillar]')];
const pillarSources = [...document.querySelectorAll('[data-pillar-source]')];

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);

function setMenuState(isOpen) {
  if (!menuToggle || !siteNavigation || !header) return;
  header.classList.toggle('is-menu-open', isOpen);
  document.body.classList.toggle('menu-open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');

  if (isOpen) {
    requestAnimationFrame(() => siteNavigation.querySelector('a')?.focus());
  }
}

menuToggle?.addEventListener('click', () => {
  setMenuState(menuToggle.getAttribute('aria-expanded') !== 'true');
});

siteNavigation?.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenuState(false);
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenuState(false);
});

window.matchMedia('(min-width: 901px)').addEventListener('change', (event) => {
  if (event.matches) setMenuState(false);
});

function updateScrollScene() {
  header?.classList.toggle('is-scrolled', window.scrollY > 28);
  updatePillarStage();
  if (!scene || !unfolding) return;
  const start = unfolding.offsetTop;
  const distance = unfolding.offsetHeight - window.innerHeight;
  const progress = clamp((window.scrollY - start) / distance);
  scene.style.setProperty('--progress', progress.toFixed(3));
}

function updatePillarStage() {
  if (!pillarStage || !scrollPillars.length) return;

  if (window.matchMedia('(max-width: 760px)').matches) {
    pillarStage.classList.add('is-mobile');
    scrollPillars.forEach((pillar) => pillar.classList.add('is-settled'));
    return;
  }

  const distance = pillarStage.offsetHeight - window.innerHeight;
  const progress = distance > 0 ? clamp((window.scrollY - pillarStage.offsetTop) / distance) : 1;

  scrollPillars.forEach((pillar, index) => {
    const move = clamp(progress * scrollPillars.length - index);
    const flight = pillar.querySelector('.pillar-fly');
    const x = Number(flight.dataset.flightX || 0);
    const y = Number(flight.dataset.flightY || 0);
    const scale = .72 + move * .28;
    flight.style.transform = `translate(${x * (1 - move)}px, ${y * (1 - move)}px) scale(${scale})`;
    pillar.classList.toggle('is-settled', move > .94);
  });
}

function measurePillarFlights() {
  if (!pillarStage || scrollPillars.length !== pillarSources.length) return;
  if (window.matchMedia('(max-width: 760px)').matches) return;

  scrollPillars.forEach((pillar) => { pillar.querySelector('.pillar-fly').style.transform = 'none'; });
  scrollPillars.forEach((pillar, index) => {
    const flight = pillar.querySelector('.pillar-fly');
    const target = flight.getBoundingClientRect();
    const source = pillarSources[index].getBoundingClientRect();
    flight.dataset.flightX = (source.left - target.left).toFixed(2);
    flight.dataset.flightY = (source.top - target.top).toFixed(2);
  });
  pillarStage.classList.add('is-ready');
  updatePillarStage();
}

window.addEventListener('scroll', updateScrollScene, { passive: true });
window.addEventListener('resize', () => { measurePillarFlights(); updateScrollScene(); });
updateScrollScene();
requestAnimationFrame(measurePillarFlights);
window.addEventListener('load', measurePillarFlights, { once: true });

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
