(function () {
	'use strict';

	// Mobile slide-in menu
	var toggle = document.querySelector('[data-menu-toggle]');
	var menu = document.querySelector('[data-mobile-nav]');
	var backdrop = document.querySelector('[data-menu-backdrop]');
	var DESKTOP_BP = 1100;

	function isOpen() {
		return toggle && toggle.getAttribute('aria-expanded') === 'true';
	}

	function openMenu() {
		if (!toggle || !menu) return;
		toggle.setAttribute('aria-expanded', 'true');
		toggle.setAttribute('aria-label', 'Close menu');
		menu.classList.add('is-open');
		menu.setAttribute('aria-hidden', 'false');
		if (backdrop) backdrop.classList.add('is-open');
		document.body.classList.add('menu-open');
		var first = menu.querySelector('a, button');
		if (first) window.setTimeout(function () { first.focus(); }, 50);
	}

	function closeMenu(restoreFocus) {
		if (!toggle || !menu) return;
		toggle.setAttribute('aria-expanded', 'false');
		toggle.setAttribute('aria-label', 'Open menu');
		menu.classList.remove('is-open');
		menu.setAttribute('aria-hidden', 'true');
		if (backdrop) backdrop.classList.remove('is-open');
		document.body.classList.remove('menu-open');
		if (restoreFocus) toggle.focus();
	}

	if (toggle && menu) {
		var closeBtn = document.createElement('button');
		closeBtn.type = 'button';
		closeBtn.className = 'mobile-menu__close';
		closeBtn.setAttribute('aria-label', 'Close menu');
		closeBtn.innerHTML = '&times;';
		closeBtn.addEventListener('click', function () { closeMenu(true); });
		menu.insertBefore(closeBtn, menu.firstChild);

		toggle.addEventListener('click', function () {
			if (isOpen()) { closeMenu(); } else { openMenu(); }
		});

		menu.addEventListener('click', function (e) {
			var target = e.target;
			while (target && target !== menu) {
				if (target.tagName === 'A' || target.tagName === 'BUTTON') { closeMenu(); break; }
				target = target.parentNode;
			}
		});

		if (backdrop) backdrop.addEventListener('click', function () { closeMenu(true); });

		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' && isOpen()) closeMenu(true);
		});

		window.addEventListener('resize', function () {
			if (window.innerWidth >= DESKTOP_BP && isOpen()) closeMenu();
		});
	}

	// Keep the footer copyright year current
	var years = document.querySelectorAll('[data-year]');
	for (var y = 0; y < years.length; y++) years[y].textContent = new Date().getFullYear();

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
					el.textContent = Math.round(target * eased) + suffix;
					if (p < 1) requestAnimationFrame(tick);
				}
				requestAnimationFrame(tick);
				io.unobserve(el);
			});
		}, { threshold: 0.4 });
		stats.forEach(function (el) { io.observe(el); });
	}
})();
