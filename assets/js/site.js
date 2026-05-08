(function () {
	'use strict';

	// Mobile menu toggle
	var toggle = document.querySelector('[data-menu-toggle]');
	var menu = document.querySelector('[data-mobile-nav]');
	if (toggle && menu) {
		toggle.addEventListener('click', function () {
			var open = menu.classList.toggle('is-open');
			toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
		});
	}

	// Close mobile menu when a link is tapped
	if (menu) {
		menu.addEventListener('click', function (e) {
			if (e.target.tagName === 'A') {
				menu.classList.remove('is-open');
				if (toggle) toggle.setAttribute('aria-expanded', 'false');
			}
		});
	}

	// Smooth-scroll for in-page anchors
	document.querySelectorAll('a[href^="#"]').forEach(function (link) {
		link.addEventListener('click', function (e) {
			var href = link.getAttribute('href');
			if (!href || href === '#') return;
			var target = document.querySelector(href);
			if (!target) return;
			e.preventDefault();
			target.scrollIntoView({ behavior: 'smooth', block: 'start' });
		});
	});

	// Animate stat numbers when in view
	var stats = document.querySelectorAll('[data-stat]');
	if (stats.length && 'IntersectionObserver' in window) {
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (!entry.isIntersecting) return;
				var el = entry.target;
				var target = parseFloat(el.getAttribute('data-stat'));
				var suffix = el.getAttribute('data-suffix') || '';
				if (isNaN(target)) return;
				var dur = 1200;
				var start = performance.now();
				function tick(now) {
					var p = Math.min((now - start) / dur, 1);
					var eased = 1 - Math.pow(1 - p, 3);
					var v = Math.round(target * eased);
					el.textContent = v + suffix;
					if (p < 1) requestAnimationFrame(tick);
				}
				requestAnimationFrame(tick);
				io.unobserve(el);
			});
		}, { threshold: 0.4 });
		stats.forEach(function (el) { io.observe(el); });
	}
})();
