(function () {
	'use strict';

	// ---- Quote form submission (modal + inline contact form) -------

	function setupForm(form) {
		var scope = form.closest('[data-quote-scope]') || form.parentNode;
		var submitBtn = form.querySelector('[data-quote-submit]');
		var submitLabel = submitBtn ? submitBtn.querySelector('.quote-submit__label') : null;
		var defaultSubmitText = submitLabel ? submitLabel.textContent : 'Request My Quote';
		var errorBox = form.querySelector('[data-quote-error]');
		var formWrap = scope.querySelector('[data-quote-form-wrap]');
		var successBox = scope.querySelector('[data-quote-success]');

		function setBusy(busy) {
			submitBtn.disabled = busy;
			submitBtn.classList.toggle('is-loading', busy);
			if (submitLabel) submitLabel.textContent = busy ? 'Sending...' : defaultSubmitText;
			var fields = form.querySelectorAll('input:not([type="hidden"]), select, textarea');
			for (var i = 0; i < fields.length; i++) fields[i].readOnly = busy;
		}

		function showSuccess() {
			if (formWrap) formWrap.hidden = true;
			if (successBox) {
				successBox.hidden = false;
				var title = successBox.querySelector('.quote-success__title');
				if (title) {
					title.setAttribute('tabindex', '-1');
					title.focus();
				}
			}
			form.dispatchEvent(new CustomEvent('quote:sent', { bubbles: true }));
		}

		function showError() {
			if (errorBox) errorBox.hidden = false;
			setBusy(false);
		}

		form.addEventListener('submit', function (e) {
			e.preventDefault();
			if (errorBox) errorBox.hidden = true;

			if (typeof form.checkValidity === 'function' && !form.checkValidity()) {
				form.reportValidity();
				return;
			}

			// Collect data before touching field state: disabled fields are excluded from FormData.
			var data = new FormData(form);
			setBusy(true);

			fetch(form.getAttribute('action'), {
				method: 'POST',
				body: data,
				headers: { 'Accept': 'application/json' }
			}).then(function (response) {
				if (response.ok) { showSuccess(); } else { showError(); }
			}).catch(showError);
		});

		form.resetQuote = function () {
			form.reset();
			if (errorBox) errorBox.hidden = true;
			setBusy(false);
			if (formWrap) formWrap.hidden = false;
			if (successBox) successBox.hidden = true;
		};
	}

	var forms = document.querySelectorAll('[data-quote-form]');
	for (var f = 0; f < forms.length; f++) setupForm(forms[f]);

	// ---- Modal ----------------------------------------------------

	var modal = document.getElementById('quoteModal');
	if (!modal) return;

	var openers = document.querySelectorAll('[data-quote-open]');
	var closers = modal.querySelectorAll('[data-quote-close]');
	var panel = modal.querySelector('.quote-modal__panel');
	var modalForm = modal.querySelector('[data-quote-form]');
	var serviceSelect = modal.querySelector('select[name="service"]');

	var lastTrigger = null;
	var autoCloseTimer = null;
	var focusableSelector = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

	function getFocusable() {
		return Array.prototype.slice.call(panel.querySelectorAll(focusableSelector))
			.filter(function (el) { return el.offsetParent !== null; });
	}

	function openModal(trigger) {
		lastTrigger = trigger || document.activeElement;
		modal.hidden = false;
		document.body.classList.add('quote-modal-open');
		modal.classList.add('is-open');

		var preset = trigger && trigger.getAttribute('data-quote-service');
		if (preset && serviceSelect) serviceSelect.value = preset;

		var firstField = modalForm && modalForm.querySelector('input:not([type="hidden"]):not([tabindex="-1"]), select, textarea');
		if (firstField) window.setTimeout(function () { firstField.focus(); }, 50);

		document.addEventListener('keydown', onKeydown);
	}

	function closeModal() {
		modal.classList.remove('is-open');
		document.body.classList.remove('quote-modal-open');
		document.removeEventListener('keydown', onKeydown);
		window.clearTimeout(autoCloseTimer);
		autoCloseTimer = null;

		window.setTimeout(function () {
			modal.hidden = true;
			if (modalForm && modalForm.resetQuote) modalForm.resetQuote();
			if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
		}, 200);
	}

	function onKeydown(e) {
		if (e.key === 'Escape') {
			e.preventDefault();
			closeModal();
			return;
		}
		if (e.key === 'Tab') {
			var focusable = getFocusable();
			if (focusable.length === 0) return;
			var first = focusable[0];
			var last = focusable[focusable.length - 1];
			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		}
	}

	if (modalForm) {
		modalForm.addEventListener('quote:sent', function () {
			autoCloseTimer = window.setTimeout(closeModal, 6000);
		});
	}

	for (var i = 0; i < openers.length; i++) {
		openers[i].addEventListener('click', function (e) {
			e.preventDefault();
			openModal(this);
		});
	}

	for (var j = 0; j < closers.length; j++) {
		closers[j].addEventListener('click', function (e) {
			e.preventDefault();
			closeModal();
		});
	}
})();
