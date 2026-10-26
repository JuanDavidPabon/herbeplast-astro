/**
 * HERBEPLAST LANDING - metrics.js
 * Sistema de tracking de eventos y analítica
 */

export const Metrics = (function() {
  'use strict';

  let isInitialized = false;
  let sessionStartTime = Date.now();
  let scrollDepthTracked = {
	25: false,
	50: false,
	75: false,
	100: false
  };

  function init() {
	if (isInitialized) return;

	// Inicializar tracking
	initScrollDepthTracking();
	initEngagementTracking();
	initClickTracking();
	initErrorTracking();

	isInitialized = true;
	console.log('✅ Metrics: Sistema de tracking inicializado');
  }

  /**
   * Track de evento genérico
   */
  function track(eventName, properties = {}) {
	const eventData = {
	  event: eventName,
	  timestamp: new Date().toISOString(),
	  page: window.location.pathname,
	  sessionTime: Math.round((Date.now() - sessionStartTime) / 1000),
	  ...properties
	};

	console.log('📊 Metric:', eventData);

	// Integración con Google Analytics 4
	if (typeof gtag !== 'undefined') {
	  gtag('event', eventName.replace('.', '_'), properties);
	}

	// Integración con dataLayer (GTM)
	if (typeof window.dataLayer !== 'undefined') {
	  window.dataLayer.push(eventData);
	}

	// Enviar a tu propio endpoint si tienes uno
	// sendToAnalyticsEndpoint(eventData);
  }

  /**
   * Tracking de profundidad de scroll
   */
  function initScrollDepthTracking() {
	let ticking = false;

	function checkScrollDepth() {
	  const windowHeight = window.innerHeight;
	  const documentHeight = document.documentElement.scrollHeight;
	  const scrollTop = window.scrollY;
	  const scrollPercent = ((scrollTop + windowHeight) / documentHeight) * 100;

	  // Track cada milestone una sola vez
	  Object.keys(scrollDepthTracked).forEach(milestone => {
		const threshold = parseInt(milestone);
		if (scrollPercent >= threshold && !scrollDepthTracked[milestone]) {
		  scrollDepthTracked[milestone] = true;
		  track('scroll.depth', {
			depth: threshold,
			section: getCurrentSection()
		  });
		}
	  });

	  ticking = false;
	}

	function requestTick() {
	  if (!ticking) {
		requestAnimationFrame(checkScrollDepth);
		ticking = true;
	  }
	}

	window.addEventListener('scroll', requestTick, { passive: true });
  }

  /**
   * Tracking de engagement
   */
  function initEngagementTracking() {
	let engagementTime = 0;
	let isEngaged = true;

	// Track tiempo en página cada 30 segundos
	setInterval(() => {
	  if (isEngaged && !document.hidden) {
		engagementTime += 30;
		track('engagement.time', {
		  seconds: engagementTime,
		  engaged: true
		});
	  }
	}, 30000);

	// Detectar inactividad
	let inactivityTimer;

	function resetInactivity() {
	  isEngaged = true;
	  clearTimeout(inactivityTimer);
	  inactivityTimer = setTimeout(() => {
		isEngaged = false;
	  }, 60000); // 1 minuto de inactividad
	}

	['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
	  document.addEventListener(event, resetInactivity, { passive: true });
	});

	resetInactivity();
  }

  /**
   * Tracking de clicks importantes
   */
  function initClickTracking() {
	// CTAs principales
	document.addEventListener('click', (e) => {
	  const target = e.target.closest('a, button');
	  if (!target) return;

	  // WhatsApp links
	  if (target.href && target.href.includes('wa.me')) {
		const context = target.dataset.context || 'unknown';
		const sector = target.dataset.sector || null;

		track('cta.whatsapp', {
		  context,
		  sector,
		  text: target.textContent.trim()
		});
	  }

	  // Botones del carrusel
	  if (target.classList.contains('carousel-control')) {
		track('carousel.control', {
		  action: target.classList.contains('carousel-prev') ? 'prev' : 'next'
		});
	  }

	  // Enlaces de navegación
	  if (target.closest('.nav-menu')) {
		track('navigation.menu', {
		  item: target.textContent.trim(),
		  href: target.href
		});
	  }

	  // Otros CTAs
	  if (target.classList.contains('btn')) {
		track('button.click', {
		  type: target.className,
		  text: target.textContent.trim()
		});
	  }
	}, true);
  }

  /**
   * Tracking de errores
   */
  function initErrorTracking() {
	// Errores de JavaScript
	window.addEventListener('error', (e) => {
	  track('error.javascript', {
		message: e.message,
		source: e.filename,
		line: e.lineno,
		column: e.colno
	  });
	});

	// Errores de recursos
	window.addEventListener('error', (e) => {
	  if (e.target !== window) {
		track('error.resource', {
		  type: e.target.tagName,
		  source: e.target.src || e.target.href,
		  message: 'Resource failed to load'
		});
	  }
	}, true);
  }

  /**
   * Obtener sección actual
   */
  function getCurrentSection() {
	const sections = document.querySelectorAll('section[id]');
	const scrollPosition = window.scrollY + 100;

	for (let section of sections) {
	  const top = section.offsetTop;
	  const height = section.offsetHeight;

	  if (scrollPosition >= top && scrollPosition < top + height) {
		return section.id;
	  }
	}

	return 'unknown';
  }

  /**
   * Track de salida
   */
  window.addEventListener('beforeunload', () => {
	const sessionDuration = Math.round((Date.now() - sessionStartTime) / 1000);
	const maxScrollDepth = Object.keys(scrollDepthTracked)
	  .filter(key => scrollDepthTracked[key])
	  .map(Number)
	  .sort((a, b) => b - a)[0] || 0;

	track('session.end', {
	  duration: sessionDuration,
	  maxScrollDepth,
	  lastSection: getCurrentSection()
	});
  });

  // API pública
  return {
	init,
	track
  };

})();
