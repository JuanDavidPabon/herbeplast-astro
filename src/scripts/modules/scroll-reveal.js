/**
 * HERBEPLAST LANDING - scroll-reveal.js
 * Animaciones de aparición al hacer scroll (IntersectionObserver)
 */

export const ScrollReveal = (function() {
  'use strict';

  let observer;
  let isInitialized = false;

  const config = {
	threshold: 0.08,
	rootMargin: '200px 0px'
  };

  function init() {
	if (isInitialized) return;

	// Verificar soporte de IntersectionObserver
	if (!('IntersectionObserver' in window)) {
	  console.warn('⚠️ ScrollReveal: IntersectionObserver no soportado');
	  revealAll();
	  return;
	}

	// Verificar prefers-reduced-motion
	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (prefersReducedMotion) {
	  console.log('♿ ScrollReveal: Motion reducido activado');
	  revealAll();
	  return;
	}

	// Inicializar observer
	observer = new IntersectionObserver(handleIntersection, config);

	// Seleccionar elementos para observar
	const selectors = [
	  '.reveal',
	  '.valor-content',
	  '.section-title',
	  '.section-subtitle',
	  '.card-content',
	  '.certification-item',
	  '.clients-block',
	  '.trust-section'
	];

	const elements = document.querySelectorAll(selectors.join(', '));

	elements.forEach(el => {
	  if (!el.classList.contains('reveal')) {
		el.classList.add('reveal');
	  }
	  observer.observe(el);
	});

	isInitialized = true;
	console.log(`✅ ScrollReveal: Observando ${elements.length} elementos`);
  }

  /**
   * Callback de IntersectionObserver
   */
  function handleIntersection(entries) {
	entries.forEach(entry => {
	  if (entry.isIntersecting) {
		// Añadir delay escalonado para elementos múltiples
		const siblings = entry.target.parentElement?.querySelectorAll('.reveal');
		let delay = 0;

		if (siblings && siblings.length > 1) {
		  const index = Array.from(siblings).indexOf(entry.target);
		  delay = index * 20;
		}

		setTimeout(() => {
		  entry.target.classList.add('active');
		}, delay);

		// Dejar de observar después de revelar
		observer.unobserve(entry.target);
	  }
	});
  }

  /**
   * Revelar todos los elementos sin animación
   */
  function revealAll() {
	const elements = document.querySelectorAll('.reveal');
	elements.forEach(el => {
	  el.classList.add('active');
	  el.style.opacity = '1';
	  el.style.transform = 'none';
	  el.style.transition = 'none';
	});
  }

  /**
   * Destruir observer
   */
  function destroy() {
	if (observer) {
	  observer.disconnect();
	  observer = null;
	}
	isInitialized = false;
	console.log('🧹 ScrollReveal: Observer destruido');
  }

  // API pública
  return {
	init,
	destroy,
	revealAll
  };

})();
