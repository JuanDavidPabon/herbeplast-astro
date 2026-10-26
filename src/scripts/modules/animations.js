export const Animations = (function() {
  'use strict';

  let initialized = false;

  function init() {
	if (initialized) return;

	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (prefersReducedMotion) return;

	initParallax();
	initTilt();
	initFloatEffect();
	initAuroraEffect();

	initialized = true;
	console.log('✅ Animations iniciado');
  }

  function initParallax() {
	const isMobile = window.innerWidth < 768;
	if (isMobile) {
	  console.log('📱 Mobile: parallax OFF');
	  return;
	}

	const heroImage = document.querySelector('.hero-background picture img') ||
	  document.querySelector('.hero-image');

	if (!heroImage) {
	  console.error('❌ No se encontró .hero-image');
	  return;
	}

	const hero = document.querySelector('.hero');
	console.log('✅ Hero image encontrada');

	// Configuración según dispositivo
	const isTablet = window.innerWidth >= 768 && window.innerWidth < 992;

	// PÍXELES en lugar de porcentajes para movimiento VISIBLE
	const maxMovement = isTablet ? 120 : 250; // Tablet: 60px, Desktop: 120px
	const speed = isTablet ? 0.8 : 1.2;

	console.log('📐 Max movement:', maxMovement, 'Speed:', speed);

	let ticking = false;

	function update() {
	  const scrollY = window.pageYOffset;
	  const heroHeight = hero.offsetHeight;

	  if (scrollY > heroHeight) {
		ticking = false;
		return;
	  }

	  // Progreso de 0 a 1
	  const progress = Math.min(scrollY / heroHeight, 1);

	  // Movimiento en PÍXELES (mucho más visible)
	  const translateY = progress * maxMovement * speed;

	  heroImage.style.transform = `translateY(${translateY}px)`;

	  ticking = false;
	}

	function requestTick() {
	  if (!ticking) {
		ticking = true;
		requestAnimationFrame(update);
	  }
	}

	window.addEventListener('scroll', requestTick, { passive: true });

	// Primera actualización
	setTimeout(() => {
	  update();
	  console.log('🔄 Parallax activado');
	}, 100);
  }

  function initTilt() {
	const elements = document.querySelectorAll('[data-tilt]');
	if (window.innerWidth < 768 || elements.length === 0) return;

	elements.forEach(element => {
	  element.style.transformStyle = 'preserve-3d';
	  element.style.transition = 'transform 0.6s cubic-bezier(0.03, 0.98, 0.52, 0.99)';

	  let bounds;

	  element.addEventListener('mouseenter', () => {
		bounds = element.getBoundingClientRect();
	  });

	  element.addEventListener('mousemove', (e) => {
		if (!bounds) return;

		const x = (e.clientX - bounds.left) / bounds.width - 0.5;
		const y = (e.clientY - bounds.top) / bounds.height - 0.5;

		const rotateY = x * 12;
		const rotateX = -y * 12;

		element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
	  });

	  element.addEventListener('mouseleave', () => {
		element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
	  });
	});

	console.log(`✅ Tilt: ${elements.length} elementos`);
  }

  function initFloatEffect() {
	const elements = document.querySelectorAll('[data-float]');
	elements.forEach((el, i) => {
	  const delay = el.dataset.delay || i * 100;
	  el.style.animationDelay = `${delay}ms`;

	  el.addEventListener('mouseenter', () => {
		el.style.animationPlayState = 'paused';
	  });

	  el.addEventListener('mouseleave', () => {
		el.style.animationPlayState = 'running';
	  });
	});

	if (elements.length) console.log(`✅ Float: ${elements.length} elementos`);
  }

  function initAuroraEffect() {
	const aurora = document.querySelector('.hero-aurora');
	const hero = document.querySelector('.hero');
	if (!aurora || !hero) return;

	const isMobile = window.innerWidth < 992;

	if (isMobile) {
	  aurora.style.opacity = '0.25';
	  console.log('📱 Aurora: mobile');
	  return;
	}

	let mouseX = 0, mouseY = 0;
	let currentX = 0, currentY = 0;
	let moving = false;
	let rafId;

	function animate() {
	  if (!moving) return;

	  currentX += (mouseX - currentX) * 0.05;
	  currentY += (mouseY - currentY) * 0.05;

	  aurora.style.transform = `translate(${currentX * 20}px, ${currentY * 20}px) scale(1.2)`;

	  rafId = requestAnimationFrame(animate);
	}

	hero.addEventListener('mouseenter', () => {
	  moving = true;
	  aurora.style.opacity = '0.4';
	  animate();
	});

	hero.addEventListener('mousemove', (e) => {
	  const rect = hero.getBoundingClientRect();
	  mouseX = (e.clientX - rect.left) / rect.width - 0.5;
	  mouseY = (e.clientY - rect.top) / rect.height - 0.5;
	});

	hero.addEventListener('mouseleave', () => {
	  moving = false;
	  aurora.style.opacity = '0.2';
	  if (rafId) cancelAnimationFrame(rafId);
	});

	console.log('✅ Aurora: desktop');
  }

  return { init };
})();


