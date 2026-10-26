import { A11y } from './modules/a11y.js';
import { Metrics } from './modules/metrics.js';
import { Nav } from './modules/nav.js';
import { ScrollReveal } from './modules/scroll-reveal.js';
import { WhatsAppManager } from './modules/whatsapp.js';

function initNosotros() {
	A11y.init();
	Metrics.init();
	Nav.init();
	ScrollReveal.init();
	WhatsAppManager.init();
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initNosotros, { once: true });
} else {
	initNosotros();
}
