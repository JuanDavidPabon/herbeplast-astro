/**
 * HERBEPLAST LANDING - a11y.js
 * Utilidades de accesibilidad (focus trap, skip links, etc)
 */

export const A11y = (function() {
  'use strict';

  let focusTrapElement = null;
  let firstFocusableElement = null;
  let lastFocusableElement = null;
  let previousActiveElement = null;

  const focusableSelectors = [
	'a[href]',
	'button:not([disabled])',
	'textarea:not([disabled])',
	'input:not([disabled])',
	'select:not([disabled])',
	'[tabindex]:not([tabindex="-1"])'
  ].join(', ');

  function init() {
	initSkipLinks();
	initFocusVisible();
	console.log('✅ A11y: Inicializado');
  }

  /**
   * Inicializar skip links (saltar al contenido principal)
   */
  function initSkipLinks() {
	const skipLink = document.querySelector('.skip-link');
	if (!skipLink) return;

	skipLink.addEventListener('click', (e) => {
	  e.preventDefault();
	  const target = document.querySelector(skipLink.getAttribute('href'));
	  if (target) {
		target.setAttribute('tabindex', '-1');
		target.focus();
		target.addEventListener('blur', () => {
		  target.removeAttribute('tabindex');
		}, { once: true });
	  }
	});
  }

  /**
   * Mejorar visibilidad de focus (asegurar que siempre sea visible)
   */
  function initFocusVisible() {
	// Este comportamiento ya está manejado por CSS :focus-visible
	// Pero podemos añadir clase adicional para navegadores antiguos
	document.addEventListener('keydown', (e) => {
	  if (e.key === 'Tab') {
		document.body.classList.add('keyboard-nav');
	  }
	});

	document.addEventListener('mousedown', () => {
	  document.body.classList.remove('keyboard-nav');
	});
  }

  /**
   * Activar focus trap en un elemento
   * @param {HTMLElement} element - Elemento que contendrá el focus
   */
  function trapFocus(element) {
	if (!element) return;

	focusTrapElement = element;
	previousActiveElement = document.activeElement;

	// Obtener todos los elementos focusables dentro del trap
	const focusableElements = element.querySelectorAll(focusableSelectors);

	if (focusableElements.length === 0) return;

	firstFocusableElement = focusableElements[0];
	lastFocusableElement = focusableElements[focusableElements.length - 1];

	// Listener para trap
	element.addEventListener('keydown', handleFocusTrap);
  }

  /**
   * Handler del focus trap
   */
  function handleFocusTrap(e) {
	if (e.key !== 'Tab') return;

	if (e.shiftKey) {
	  // Shift + Tab (hacia atrás)
	  if (document.activeElement === firstFocusableElement) {
		e.preventDefault();
		lastFocusableElement.focus();
	  }
	} else {
	  // Tab (hacia adelante)
	  if (document.activeElement === lastFocusableElement) {
		e.preventDefault();
		firstFocusableElement.focus();
	  }
	}
  }

  /**
   * Liberar focus trap
   */
  function releaseFocus() {
	if (!focusTrapElement) return;

	focusTrapElement.removeEventListener('keydown', handleFocusTrap);

	// Restaurar foco al elemento previo
	if (previousActiveElement && previousActiveElement.focus) {
	  previousActiveElement.focus();
	}

	// Limpiar referencias
	focusTrapElement = null;
	firstFocusableElement = null;
	lastFocusableElement = null;
	previousActiveElement = null;
  }

  /**
   * Anunciar mensaje a lectores de pantalla
   * @param {string} message - Mensaje a anunciar
   * @param {string} priority - 'polite' o 'assertive'
   */
  function announce(message, priority = 'polite') {
	const announcer = document.createElement('div');
	announcer.setAttribute('role', 'status');
	announcer.setAttribute('aria-live', priority);
	announcer.setAttribute('aria-atomic', 'true');
	announcer.className = 'sr-only';
	announcer.textContent = message;

	document.body.appendChild(announcer);

	// Remover después de 1 segundo
	setTimeout(() => {
	  document.body.removeChild(announcer);
	}, 1000);
  }

  // API pública
  return {
	init,
	trapFocus,
	releaseFocus,
	announce
  };

})();


