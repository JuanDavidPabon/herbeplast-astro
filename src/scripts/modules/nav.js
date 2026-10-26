import { A11y } from './a11y.js';

/**
 * HERBEPLAST LANDING - nav.js
 * Manejo del header sticky y menú móvil
 */

export const Nav = (function() {
  'use strict';

  let header;
  let menuToggle;
  let mobileMenu;
  let mobileMenuPanel;
  let mobileMenuClose;
  let lastScrollY = 0;

  function init() {
	// Elementos del DOM
	header = document.querySelector('.header');
	menuToggle = document.querySelector('.menu-toggle');
	mobileMenu = document.querySelector('.mobile-menu');
	mobileMenuPanel = document.querySelector('.mobile-menu-panel');
	mobileMenuClose = document.querySelector('.mobile-menu-close');

	if (!header) return;

	// Inicializar comportamientos
	initStickyHeader();
	initMobileMenu();

	console.log('✅ Nav: Inicializado');
  }

  /**
   * Header sticky con cambio de fondo al scroll
   */
  function initStickyHeader() {
	let ticking = false;

	function updateHeader() {
	  const scrollY = window.scrollY;

	  // Añadir clase "solid" después de 32px de scroll
	  if (scrollY > 32) {
		header.classList.add('solid');
	  } else {
		header.classList.remove('solid');
	  }

	  lastScrollY = scrollY;
	  ticking = false;
	}

	function requestTick() {
	  if (!ticking) {
		requestAnimationFrame(updateHeader);
		ticking = true;
	  }
	}

	window.addEventListener('scroll', requestTick, { passive: true });

	// Ejecutar una vez al inicio
	updateHeader();
  }

  /**
   * Menú móvil con overlay, panel lateral y focus trap
   */
  function initMobileMenu() {
	if (!menuToggle || !mobileMenu) return;

	// Abrir menú
	menuToggle.addEventListener('click', openMobileMenu);

	// Cerrar menú con botón X
	if (mobileMenuClose) {
	  mobileMenuClose.addEventListener('click', closeMobileMenu);
	}

	// Cerrar menú al hacer clic en overlay
	const overlay = mobileMenu.querySelector('.mobile-menu-overlay');
	if (overlay) {
	  overlay.addEventListener('click', closeMobileMenu);
	}

	// Cerrar menú con tecla Escape
	document.addEventListener('keydown', (e) => {
	  if (e.key === 'Escape' && mobileMenu.getAttribute('aria-hidden') === 'false') {
		closeMobileMenu();
	  }
	});

	// Cerrar menú al hacer clic en un link
	const mobileLinks = mobileMenu.querySelectorAll('.mobile-menu-list a');
	mobileLinks.forEach(link => {
	  link.addEventListener('click', closeMobileMenu);
	});
  }

  /**
   * Abrir menú móvil
   */
  function openMobileMenu() {
	mobileMenu.setAttribute('aria-hidden', 'false');
	menuToggle.setAttribute('aria-expanded', 'true');
	document.body.classList.add('overflow-hidden');

	// Focus en el primer elemento del menú
	setTimeout(() => {
	  const firstLink = mobileMenu.querySelector('.mobile-menu-list a');
	  if (firstLink) firstLink.focus();
	}, 100);

	// Activar focus trap
	if (typeof A11y !== 'undefined' && A11y.trapFocus) {
	  A11y.trapFocus(mobileMenuPanel);
	}
  }

  /**
   * Cerrar menú móvil
   */
  function closeMobileMenu() {
	if (!mobileMenu) return;

	mobileMenu.setAttribute('aria-hidden', 'true');
	menuToggle.setAttribute('aria-expanded', 'false');
	document.body.classList.remove('overflow-hidden');

	// Restaurar foco al botón toggle
	if (menuToggle) {
	  menuToggle.focus();
	}

	// Desactivar focus trap
	if (typeof A11y !== 'undefined' && A11y.releaseFocus) {
	  A11y.releaseFocus();
	}
  }

  // API pública
  return {
	init,
	closeMobileMenu
  };

})();


