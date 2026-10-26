import { Metrics } from './metrics.js';

/**
 * HERBEPLAST LANDING - whatsapp.js
 * Gestor de CTAs WhatsApp con mensajes prellenados y tracking
 */

export const WhatsAppManager = (function() {
  'use strict';

  const WHATSAPP_NUMBER = '573106979630'; // Actualizar con el número real

  function init() {
	// Añadir listeners a todos los CTAs de WhatsApp
	const whatsappLinks = document.querySelectorAll('a[href^="https://wa.me"]');

	whatsappLinks.forEach(link => {
	  link.addEventListener('click', handleWhatsAppClick);
	});

	console.log(`✅ WhatsApp: ${whatsappLinks.length} CTAs inicializados`);
  }

  /**
   * Handler para clicks en CTAs de WhatsApp
   */
  function handleWhatsAppClick(e) {
	const link = e.currentTarget;
	const context = link.getAttribute('data-context') || 'unknown';
	const sector = link.getAttribute('data-sector') || null;

	// Track métrica
	if (typeof Metrics !== 'undefined') {
	  Metrics.track('whatsapp.click', {
		origin: context,
		sector: sector
	  });
	}

	console.log(`📱 WhatsApp CTA clicked: ${context}${sector ? ` (${sector})` : ''}`);
  }

  /**
   * Crear un link de WhatsApp con mensaje prellenado
   * @param {string} message - Mensaje a prellenar
   * @param {string} phoneNumber - Número de teléfono (opcional, usa el default)
   * @returns {string} URL de WhatsApp
   */
  function createWhatsAppLink(message, phoneNumber = WHATSAPP_NUMBER) {
	const encodedMessage = encodeURIComponent(message);
	return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  }

  /**
   * Abrir WhatsApp con mensaje dinámico
   * @param {string} message - Mensaje a prellenar
   * @param {string} context - Contexto del origen (para tracking)
   */
  function openWhatsApp(message, context = 'programmatic') {
	const url = createWhatsAppLink(message);

	// Track métrica
	if (typeof Metrics !== 'undefined') {
	  Metrics.track('whatsapp.click', {
		origin: context,
		programmatic: true
	  });
	}

	// Abrir en nueva ventana
	window.open(url, '_blank', 'noopener,noreferrer');
  }

  /**
   * Obtener mensaje contextual por sector
   * @param {string} sector - Nombre del sector
   * @returns {string} Mensaje prellenado
   */
  function getMessageForSector(sector) {
	const messages = {
	  'Avícola': 'Hola, necesito empaques para sector avícola. ¿Me pueden ayudar con información de capacidades y medidas?',
	  'Congelados': 'Hola, busco empaques para productos congelados. ¿Qué opciones tienen disponibles?',
	  'Panificadoras': 'Hola, necesito bolsas para productos panificados. ¿Pueden cotizarme?',
	  'Dotación Industrial': 'Hola, requiero bolsas de dotación industrial. ¿Qué micras y usos manejan?',
	  'Láminas Automáticas': 'Hola, necesito cotización de láminas para empacadora automática.',
	  'Lácteos': 'Hola, necesito empaques para productos lácteos. ¿Qué formatos tienen?',
	  'Línea Comercial': 'Hola, quisiera cotización para línea comercial. ¿Manejan personalización?'
	};

	return messages[sector] || `Hola, estoy interesado en sus empaques para el sector ${sector}. ¿Me pueden brindar información?`;
  }

  // API pública
  return {
	init,
	createLink: createWhatsAppLink,
	open: openWhatsApp,
	getMessageForSector
  };

})();


