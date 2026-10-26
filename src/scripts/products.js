import { A11y } from './modules/a11y.js';
import { Metrics } from './modules/metrics.js';
import { Nav } from './modules/nav.js';
import { ScrollReveal } from './modules/scroll-reveal.js';
import { WhatsAppManager } from './modules/whatsapp.js';

function initProductFilter() {
	const filterButtons = [...document.querySelectorAll('.filter-btn')];
	const productCards = [...document.querySelectorAll('.product-card')];
	let currentFilter = 'all';
	if (!filterButtons.length || !productCards.length) return;

	function announceResults(count, filter) {
		const announcement = document.createElement('div');
		announcement.setAttribute('role', 'status');
		announcement.setAttribute('aria-live', 'polite');
		announcement.className = 'sr-only';
		announcement.textContent = `Mostrando ${count} producto${count !== 1 ? 's' : ''} de ${filter === 'all' ? 'todas las categorías' : filter}`;
		document.body.appendChild(announcement);
		setTimeout(() => announcement.remove(), 3000);
	}

	function filterProducts(filter) {
		productCards.forEach((card) => {
			card.style.opacity = '0';
			card.style.transform = 'translateY(10px)';
		});
		setTimeout(() => {
			let visibleCount = 0;
			productCards.forEach((card) => {
				const shouldShow = filter === 'all' || card.dataset.category === filter;
				if (shouldShow) {
					card.classList.remove('hidden');
					card.style.display = '';
					setTimeout(() => {
						card.style.opacity = '1';
						card.style.transform = 'translateY(0)';
					}, visibleCount * 80);
					visibleCount++;
				} else {
					card.classList.add('hidden');
					setTimeout(() => { card.style.display = 'none'; }, 300);
				}
			});
			announceResults(visibleCount, filter);
		}, 300);
	}

	filterButtons.forEach((button, index) => {
		button.setAttribute('aria-pressed', button.classList.contains('active') ? 'true' : 'false');
		button.addEventListener('click', () => {
			const filter = button.dataset.filter;
			if (filter === currentFilter) return;
			filterButtons.forEach((item) => {
				item.classList.toggle('active', item === button);
				item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
			});
			currentFilter = filter;
			filterProducts(filter);
			if (window.Metrics?.track) window.Metrics.track('products.filter', { category: filter });
		});
		button.addEventListener('keydown', (event) => {
			if (event.key === 'ArrowRight') {
				event.preventDefault();
				filterButtons[(index + 1) % filterButtons.length].focus();
			} else if (event.key === 'ArrowLeft') {
				event.preventDefault();
				filterButtons[(index - 1 + filterButtons.length) % filterButtons.length].focus();
			}
		});
	});

	if ('IntersectionObserver' in window) {
		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add('active');
					observer.unobserve(entry.target);
				}
			});
		}, { threshold: 0.1, rootMargin: '50px' });
		productCards.forEach((card) => observer.observe(card));
	} else {
		productCards.forEach((card) => card.classList.add('active'));
	}
}

function initProducts() {
	A11y.init();
	Metrics.init();
	Nav.init();
	ScrollReveal.init();
	WhatsAppManager.init();
	initProductFilter();
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initProducts, { once: true });
} else {
	initProducts();
}
