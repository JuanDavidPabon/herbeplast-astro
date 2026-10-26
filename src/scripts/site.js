import { A11y } from './modules/a11y.js';
import { Animations } from './modules/animations.js';
import { Metrics } from './modules/metrics.js';
import { Nav } from './modules/nav.js';
import { ScrollReveal } from './modules/scroll-reveal.js';
import { WhatsAppManager } from './modules/whatsapp.js';

function initVideos() {
	const videos = document.querySelectorAll('video');
	if (!videos.length || !('IntersectionObserver' in window)) return;
	const observer = new IntersectionObserver((entries) => {
		entries.forEach(({ target, isIntersecting }) => {
			if (!(target instanceof HTMLVideoElement) || target.hasAttribute('controls')) return;
			if (isIntersecting) {
				target.muted = true;
				target.playsInline = true;
				target.play().catch(() => {});
			} else target.pause();
		});
	}, { threshold: 0.5 });
	videos.forEach((video) => {
		if (!video.hasAttribute('controls')) observer.observe(video);
	});
}

function initSmoothScroll() {
	document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
		anchor.addEventListener('click', (event) => {
			const href = anchor.getAttribute('href');
			if (!href || href === '#' || href === '#!') return;
			const target = document.querySelector(href);
			if (!target) return;
			event.preventDefault();
			Nav.closeMobileMenu?.();
			const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
			const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
			window.scrollTo({ top: targetPosition, behavior: 'smooth' });
			if (history.pushState) history.pushState(null, '', href);
			target.setAttribute('tabindex', '-1');
			target.focus({ preventScroll: true });
			target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
			Metrics.track('navigation.anchor', { target: href });
		});
	});
}

function initCertificationScrollIndicator() {
	const wrapper = document.querySelector('.certifications-scroll-wrapper');
	if (!wrapper) return;
	wrapper.addEventListener('scroll', () => {
		const isAtEnd = wrapper.scrollLeft + wrapper.clientWidth >= wrapper.scrollWidth - 50;
		wrapper.classList.toggle('scrolled-end', isAtEnd);
	});
}

function initPerformanceMonitoring() {
	if (!('PerformanceObserver' in window)) return;
	try {
		const lcpObserver = new PerformanceObserver((list) => {
			const entries = list.getEntries();
			const lastEntry = entries[entries.length - 1];
			if (lastEntry) Metrics.track('performance.lcp', { value: lastEntry.startTime });
		});
		lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
	} catch {}
	try {
		const fidObserver = new PerformanceObserver((list) => {
			list.getEntries().forEach((entry) => Metrics.track('performance.fid', {
				value: entry.processingStart - entry.startTime,
			}));
		});
		fidObserver.observe({ type: 'first-input', buffered: true });
	} catch {}
}

function initLegacyPage() {
	Nav.init();
	ScrollReveal.init();
	Animations.init();
	WhatsAppManager.init();
	A11y.init();
	Metrics.init();
	initVideos();
	initSmoothScroll();
	initCertificationScrollIndicator();
	initPerformanceMonitoring();
	window.dispatchEvent(new CustomEvent('herbeplast:ready'));
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initLegacyPage, { once: true });
} else {
	initLegacyPage();
}