const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const siteNavigation = document.querySelector('#site-navigation');
const pillarStage = document.querySelector('[data-pillar-stage]');
const scrollPillars = [...document.querySelectorAll('[data-scroll-pillar]')];
const pillarSources = [...document.querySelectorAll('[data-pillar-source]')];
const packTransformation = document.querySelector('[data-pack-transform]');
const packScene = packTransformation?.querySelector('.pack-transformation');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let packScrollProgress = 0;
let packTargetProgress = 0;
let packAnimationFrame = 0;

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
  updatePackTransformation();
}

function progressBetween(value, start, end) {
  return clamp((value - start) / (end - start));
}

function smoothStep(value) {
  const clamped = clamp(value);
  return clamped * clamped * (3 - 2 * clamped);
}

function renderPackTransformation() {
  packAnimationFrame = 0;
  // This scene is scrubbed by the document scroll position. Keeping the value
  // direct (rather than playing a timed sequence) makes every point reversible.
  packScrollProgress = packTargetProgress;

  const progress = packScrollProgress;
  const fold = smoothStep(progressBetween(progress, .08, .49));
  const parentFade = smoothStep(progressBetween(progress, .38, .53));
  const tissueIn = smoothStep(progressBetween(progress, .30, .49));
  const tissueOut = smoothStep(progressBetween(progress, .71, .87));
  const tissueTravel = smoothStep(progressBetween(progress, .53, .78));
  const packageIn = smoothStep(progressBetween(progress, .70, .98));

  packScene.style.setProperty('--parent-scale', (1 - (.9 * fold)).toFixed(4));
  packScene.style.setProperty('--parent-y', (-38 * fold).toFixed(2));
  packScene.style.setProperty('--parent-rotation', (-8 - 10 * fold).toFixed(2));
  packScene.style.setProperty('--parent-opacity', (1 - parentFade).toFixed(4));
  packScene.style.setProperty('--tissue-scale', (.1 + .05 * tissueIn).toFixed(4));
  packScene.style.setProperty('--tissue-y', (-65 * tissueTravel).toFixed(2));
  packScene.style.setProperty('--tissue-rotation', (-8 + 98 * tissueTravel).toFixed(2));
  packScene.style.setProperty('--tissue-opacity', (tissueIn * (1 - tissueOut)).toFixed(4));
  packScene.style.setProperty('--package-scale', (.1 + .86 * packageIn).toFixed(4));
  packScene.style.setProperty('--package-y', (-65 + 65 * packageIn).toFixed(2));
  packScene.style.setProperty('--package-rotation', (90 - 97 * packageIn).toFixed(2));
  packScene.style.setProperty('--package-opacity', packageIn.toFixed(4));
}

function updatePackTransformation() {
  if (!packTransformation || !packScene || prefersReducedMotion.matches) return;

  const scrollDistance = packTransformation.offsetHeight - window.innerHeight;
  packTargetProgress = scrollDistance > 0
    ? clamp((window.scrollY - packTransformation.offsetTop) / scrollDistance)
    : 1;

  if (!packAnimationFrame) packAnimationFrame = requestAnimationFrame(renderPackTransformation);
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

if (packScene && !prefersReducedMotion.matches) {
  document.documentElement.classList.add('js');
  packScene.classList.add('is-scroll-driven');
  updatePackTransformation();
}
