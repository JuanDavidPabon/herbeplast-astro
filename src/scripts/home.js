import { A11y } from './modules/a11y.js';
import { Animations } from './modules/animations.js';
import { CarouselSectors } from './modules/carousel-sectors.js';
import { Metrics } from './modules/metrics.js';
import { Nav } from './modules/nav.js';
import { ScrollReveal } from './modules/scroll-reveal.js';
import { WhatsAppManager } from './modules/whatsapp.js';

function initVideoPlayback() {
	const videos = document.querySelectorAll('video');
	if (!videos.length) return;

	const playWhenVisible = (video) => {
		video.play().catch(() => {});
	};

	if (!('IntersectionObserver' in window)) {
		videos.forEach(playWhenVisible);
		return;
	}

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach(({ target, isIntersecting }) => {
				const video = target;
				if (!(video instanceof HTMLVideoElement)) return;

				if (isIntersecting) playWhenVisible(video);
				else video.pause();
			});
		},
		{ threshold: 0.5 },
	);

	videos.forEach((video) => observer.observe(video));
}

function initCertificationScrollIndicator() {
	const wrapper = document.querySelector('.certifications-scroll-wrapper');
	if (!wrapper) return;

	wrapper.addEventListener('scroll', () => {
		const isAtEnd = wrapper.scrollLeft + wrapper.clientWidth >= wrapper.scrollWidth - 50;
		wrapper.classList.toggle('scrolled-end', isAtEnd);
	});
}

function initHome() {
	A11y.init();
	Metrics.init();
	Nav.init();
	ScrollReveal.init();
	CarouselSectors.init();
	Animations.init();
	WhatsAppManager.init();
	initVideoPlayback();
	initCertificationScrollIndicator();
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initHome, { once: true });
} else {
	initHome();
}
