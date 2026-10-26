/**
 * HERBEPLAST - carousel-sectors.js (ESTABILIZADO)
 * Carrusel tipo Netflix con loop infinito suave y optimizado
 */

export const CarouselSectors = (function () {
	'use strict';

	const CONFIG = {
		autoplay: true,
		autoplayDelay: 3000,
		transitionDuration: 600,
		swipeThreshold: 50,
		debounceDelay: 250
	};

	let state = {
		track: null,
		wrapper: null,
		cards: [],
		clones: [],
		dots: [],
		currentIndex: 0,
		totalCards: 0,
		cardsPerView: 1,
		isTransitioning: false,
		autoplayInterval: null,
		touchStartX: 0,
		touchEndX: 0,
		isDragging: false,
		// Nuevos para estabilidad
		resizeTimeout: null,
		boundHandlers: {},
		isInitialized: false
	};

	function init() {
		if (state.isInitialized) {
			console.warn('⚠️ Carousel ya inicializado');
			return;
		}

		console.log('🎠 Carousel: Iniciando...');

		state.track = document.getElementById('carousel-track');
		state.wrapper = document.querySelector('.carousel-wrapper');

		if (!state.track || !state.wrapper) {
			console.error('❌ Carousel: Elementos no encontrados');
			return;
		}

		// Obtener cards originales (excluyendo clones previos)
		state.cards = Array.from(
			state.track.querySelectorAll('.carousel-card:not(.carousel-card-clone)')
		);
		state.totalCards = state.cards.length;

		if (state.totalCards === 0) {
			console.error('❌ Carousel: No hay cards');
			return;
		}

		// Inicializar componentes
		setupClones();
		setupControls();
		setupDots();
		setupTouch();
		updateCardsPerView();

		// Posición inicial sin transición
		requestAnimationFrame(() => {
			goToSlide(0, true);
			state.isInitialized = true;
		});

		// Event listeners con handlers guardados para cleanup
		state.boundHandlers.resize = debounce(handleResize, CONFIG.debounceDelay);
		window.addEventListener('resize', state.boundHandlers.resize);

		// Autoplay
		if (CONFIG.autoplay) {
			startAutoplay();
			setupAutoplayPause();
		}

		console.log(`✅ Carousel: ${state.totalCards} cards inicializadas`);
	}

	function setupClones() {
		// Limpiar clones previos de forma segura
		const existingClones = state.track.querySelectorAll('.carousel-card-clone');
		existingClones.forEach(clone => {
			if (clone.parentNode === state.track) {
				state.track.removeChild(clone);
			}
		});
		state.clones = [];

		// Clonar al final (para ir hacia adelante)
		state.cards.forEach(card => {
			const clone = card.cloneNode(true);
			clone.classList.add('carousel-card-clone');
			clone.removeAttribute('data-tilt'); // Evitar conflictos
			state.track.appendChild(clone);
			state.clones.push(clone);
		});

		// Clonar al inicio (para ir hacia atrás)
		for (let i = state.cards.length - 1; i >= 0; i--) {
			const clone = state.cards[i].cloneNode(true);
			clone.classList.add('carousel-card-clone');
			clone.removeAttribute('data-tilt');
			state.track.insertBefore(clone, state.track.firstChild);
			state.clones.push(clone);
		}

		console.log(`📋 Clones: ${state.clones.length} creados`);
	}

	function setupControls() {
		const prevBtn = document.querySelector('.carousel-prev');
		const nextBtn = document.querySelector('.carousel-next');

		if (prevBtn) {
			state.boundHandlers.prev = () => {
				if (!state.isTransitioning && !state.isDragging) {
					goToPrevious();
				}
			};
			prevBtn.addEventListener('click', state.boundHandlers.prev);
		}

		if (nextBtn) {
			state.boundHandlers.next = () => {
				if (!state.isTransitioning && !state.isDragging) {
					goToNext();
				}
			};
			nextBtn.addEventListener('click', state.boundHandlers.next);
		}

		updateControlsVisibility();
	}

	function setupDots() {
		const dotsContainer = document.querySelector('.carousel-dots');
		if (!dotsContainer) return;

		dotsContainer.innerHTML = '';
		state.dots = [];

		for (let i = 0; i < state.totalCards; i++) {
			const dot = document.createElement('button');
			dot.className = 'carousel-dot';
			dot.setAttribute('aria-label', `Ir a slide ${i + 1}`);
			dot.setAttribute('type', 'button');

			dot.addEventListener('click', () => {
				if (!state.isTransitioning) {
					goToSlide(i);
				}
			});

			dotsContainer.appendChild(dot);
			state.dots.push(dot);
		}

		updateDots();
	}

	function setupTouch() {
		// Touch events
		state.boundHandlers.touchstart = handleTouchStart;
		state.boundHandlers.touchmove = handleTouchMove;
		state.boundHandlers.touchend = handleTouchEnd;

		state.track.addEventListener('touchstart', state.boundHandlers.touchstart, { passive: true });
		state.track.addEventListener('touchmove', state.boundHandlers.touchmove, { passive: true });
		state.track.addEventListener('touchend', state.boundHandlers.touchend);

		// Mouse drag (desktop)
		state.track.addEventListener('mousedown', state.boundHandlers.touchstart);
		state.track.addEventListener('mousemove', state.boundHandlers.touchmove);
		state.track.addEventListener('mouseup', state.boundHandlers.touchend);
		state.track.addEventListener('mouseleave', state.boundHandlers.touchend);
	}

	function handleTouchStart(e) {
		state.isDragging = true;
		state.touchStartX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
		state.touchEndX = state.touchStartX;
	}

	function handleTouchMove(e) {
		if (!state.isDragging) return;
		state.touchEndX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
	}

	function handleTouchEnd() {
		if (!state.isDragging) return;
		state.isDragging = false;

		const diff = state.touchStartX - state.touchEndX;

		if (Math.abs(diff) > CONFIG.swipeThreshold) {
			if (diff > 0) {
				goToNext();
			} else {
				goToPrevious();
			}
		}

		// Reset
		state.touchStartX = 0;
		state.touchEndX = 0;
	}

	function goToNext() {
		if (state.isTransitioning) return;

		state.currentIndex++;
		moveToIndex(state.currentIndex);

		// Loop infinito al final
		if (state.currentIndex >= state.totalCards) {
			setTimeout(() => {
				state.currentIndex = 0;
				moveToIndex(0, true);
			}, CONFIG.transitionDuration);
		}
	}

	function goToPrevious() {
		if (state.isTransitioning) return;

		state.currentIndex--;
		moveToIndex(state.currentIndex);

		// Loop infinito al inicio
		if (state.currentIndex < 0) {
			setTimeout(() => {
				state.currentIndex = state.totalCards - 1;
				moveToIndex(state.currentIndex, true);
			}, CONFIG.transitionDuration);
		}
	}

	function goToSlide(index, immediate = false) {
		if (index < 0 || index >= state.totalCards) return;
		state.currentIndex = index;
		moveToIndex(index, immediate);
	}

	function moveToIndex(index, immediate = false) {
		state.isTransitioning = !immediate;

		// Obtener dimensiones reales
		const firstCard = state.cards[0];
		if (!firstCard) return;

		const cardWidth = firstCard.offsetWidth;
		const computedStyle = getComputedStyle(state.track);
		const gap = parseFloat(computedStyle.gap) || 16;
		const slideWidth = cardWidth + gap;

		// Offset de clones iniciales
		const cloneOffset = state.totalCards;
		const actualIndex = index + cloneOffset;

		// Calcular translateX según viewport
		let translateX = 0;
		const viewportWidth = window.innerWidth;

		if (viewportWidth < 768) {
			// Mobile: centrar con peek
			const wrapperWidth = state.wrapper.offsetWidth;
			const centerOffset = (wrapperWidth - cardWidth) / 2;
			translateX = -(actualIndex * slideWidth) + centerOffset;
		} else {
			// Tablet/Desktop: alinear a la izquierda
			translateX = -(actualIndex * slideWidth);
		}

		// Aplicar transformación
		if (immediate) {
			state.track.style.transition = 'none';
			state.track.style.transform = `translateX(${translateX}px)`;
			// Force reflow
			void state.track.offsetHeight;
			state.isTransitioning = false;
		} else {
			state.track.style.transition = `transform ${CONFIG.transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
			state.track.style.transform = `translateX(${translateX}px)`;

			setTimeout(() => {
				state.isTransitioning = false;
			}, CONFIG.transitionDuration);
		}

		updateDots();
	}

	function updateDots() {
		if (state.dots.length === 0) return;

		// Normalizar índice para dots
		const realIndex = ((state.currentIndex % state.totalCards) + state.totalCards) % state.totalCards;

		state.dots.forEach((dot, index) => {
			dot.classList.toggle('active', index === realIndex);
			dot.setAttribute('aria-current', index === realIndex ? 'true' : 'false');
		});
	}

	function updateCardsPerView() {
		const width = window.innerWidth;

		if (width < 768) {
			state.cardsPerView = 1;
		} else if (width < 992) {
			state.cardsPerView = 2;
		} else if (width < 1400) {
			state.cardsPerView = 3;
		} else {
			state.cardsPerView = 4;
		}

		updateControlsVisibility();
	}

	function updateControlsVisibility() {
		const prevBtn = document.querySelector('.carousel-prev');
		const nextBtn = document.querySelector('.carousel-next');
		const isMobile = window.innerWidth < 768;

		if (prevBtn) prevBtn.style.display = isMobile ? 'none' : 'flex';
		if (nextBtn) nextBtn.style.display = isMobile ? 'none' : 'flex';
	}

	function startAutoplay() {
		if (state.autoplayInterval) return;

		state.autoplayInterval = setInterval(() => {
			if (!document.hidden && !state.isDragging && !state.isTransitioning) {
				goToNext();
			}
		}, CONFIG.autoplayDelay);
	}

	function stopAutoplay() {
		if (state.autoplayInterval) {
			clearInterval(state.autoplayInterval);
			state.autoplayInterval = null;
		}
	}

	function setupAutoplayPause() {
		state.wrapper.addEventListener('mouseenter', stopAutoplay);
		state.wrapper.addEventListener('mouseleave', () => {
			if (CONFIG.autoplay) startAutoplay();
		});

		document.addEventListener('visibilitychange', () => {
			if (document.hidden) {
				stopAutoplay();
			} else if (CONFIG.autoplay) {
				startAutoplay();
			}
		});
	}

	function handleResize() {
		if (!state.isInitialized) return;

		updateCardsPerView();

		// Recalcular posición sin transición
		moveToIndex(state.currentIndex, true);
	}

	function debounce(func, wait) {
		let timeout;
		return function executedFunction(...args) {
			const later = () => {
				clearTimeout(timeout);
				func.apply(this, args);
			};
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
		};
	}

	function destroy() {
		if (!state.isInitialized) return;

		stopAutoplay();

		// Remover event listeners
		if (state.boundHandlers.resize) {
			window.removeEventListener('resize', state.boundHandlers.resize);
		}

		const prevBtn = document.querySelector('.carousel-prev');
		const nextBtn = document.querySelector('.carousel-next');

		if (prevBtn && state.boundHandlers.prev) {
			prevBtn.removeEventListener('click', state.boundHandlers.prev);
		}
		if (nextBtn && state.boundHandlers.next) {
			nextBtn.removeEventListener('click', state.boundHandlers.next);
		}

		// Touch events
		if (state.track) {
			state.track.removeEventListener('touchstart', state.boundHandlers.touchstart);
			state.track.removeEventListener('touchmove', state.boundHandlers.touchmove);
			state.track.removeEventListener('touchend', state.boundHandlers.touchend);
			state.track.removeEventListener('mousedown', state.boundHandlers.touchstart);
			state.track.removeEventListener('mousemove', state.boundHandlers.touchmove);
			state.track.removeEventListener('mouseup', state.boundHandlers.touchend);
			state.track.removeEventListener('mouseleave', state.boundHandlers.touchend);
		}

		// Limpiar clones
		state.clones.forEach(clone => {
			if (clone.parentNode) clone.parentNode.removeChild(clone);
		});

		// Reset state
		state.isInitialized = false;
		state.boundHandlers = {};

		console.log('🧹 Carousel destruido correctamente');
	}

	// API pública
	return {
		init,
		destroy,
		next: goToNext,
		prev: goToPrevious,
		goTo: goToSlide,
		getState: () => ({ ...state }) // Para debugging
	};

})();


