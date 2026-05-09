(function () {
	'use strict';

	// Mobile slide-in menu
	var toggle = document.querySelector('[data-menu-toggle]');
	var menu = document.querySelector('[data-mobile-nav]');
	var backdrop = document.querySelector('[data-menu-backdrop]');

	function openMenu() {
		if (!toggle || !menu) return;
		toggle.setAttribute('aria-expanded', 'true');
		toggle.setAttribute('aria-label', 'Close menu');
		menu.classList.add('is-open');
		menu.setAttribute('aria-hidden', 'false');
		if (backdrop) backdrop.classList.add('is-open');
		document.body.style.overflow = 'hidden';
	}

	function closeMenu() {
		if (!toggle || !menu) return;
		toggle.setAttribute('aria-expanded', 'false');
		toggle.setAttribute('aria-label', 'Open menu');
		menu.classList.remove('is-open');
		menu.setAttribute('aria-hidden', 'true');
		if (backdrop) backdrop.classList.remove('is-open');
		document.body.style.overflow = '';
	}

	if (toggle && menu) {
		toggle.addEventListener('click', function () {
			var isOpen = toggle.getAttribute('aria-expanded') === 'true';
			if (isOpen) { closeMenu(); } else { openMenu(); }
		});

		menu.addEventListener('click', function (e) {
			var target = e.target;
			while (target && target !== menu) {
				if (target.tagName === 'A' || target.tagName === 'BUTTON') { closeMenu(); break; }
				target = target.parentNode;
			}
		});

		if (backdrop) backdrop.addEventListener('click', closeMenu);

		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
				closeMenu();
			}
		});

		// Close menu if viewport grows past mobile breakpoint
		window.addEventListener('resize', function () {
			if (window.innerWidth >= 960 && toggle.getAttribute('aria-expanded') === 'true') {
				closeMenu();
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
