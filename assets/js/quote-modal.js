(function () {
	'use strict';

	var modal = document.getElementById('quoteModal');
	if (!modal) return;

	var openers = document.querySelectorAll('[data-quote-open]');
	var closers = modal.querySelectorAll('[data-quote-close]');
	var panel = modal.querySelector('.quote-modal__panel');
	var form = modal.querySelector('[data-quote-form]');
	var submitBtn = modal.querySelector('[data-quote-submit]');
	var errorBox = modal.querySelector('[data-quote-error]');
	var formWrap = modal.querySelector('[data-quote-form-wrap]');
	var successBox = modal.querySelector('[data-quote-success]');
	var replyToInput = modal.querySelector('[data-quote-replyto]');

	var lastTrigger = null;
	var autoCloseTimer = null;
	var submitLabel = submitBtn ? submitBtn.querySelector('.quote-submit__label') : null;
	var defaultSubmitText = submitLabel ? submitLabel.textContent : 'Request My Quote';
	var focusableSelector = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

	function setFieldsDisabled(disabled) {
		if (!form) return;
		var fields = form.querySelectorAll('input:not([type="hidden"]), select, textarea');
		for (var k = 0; k < fields.length; k++) {
			fields[k].disabled = disabled;
		}
	}

	function getFocusable() {
		return Array.prototype.slice.call(panel.querySelectorAll(focusableSelector))
			.filter(function (el) { return el.offsetParent !== null; });
	}

	function openModal(trigger) {
		lastTrigger = trigger || document.activeElement;
		modal.hidden = false;
		document.body.classList.add('quote-modal-open');
		// Force reflow so the transition fires
		void modal.offsetWidth;
		modal.classList.add('is-open');

		var firstField = form.querySelector('input, select, textarea');
		if (firstField) {
			window.setTimeout(function () { firstField.focus(); }, 50);
		}

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
			resetForm();
			if (lastTrigger && typeof lastTrigger.focus === 'function') {
				lastTrigger.focus();
			}
		}, 200);
	}

	function resetForm() {
		if (!form || !formWrap || !successBox) return;
		form.reset();
		errorBox.hidden = true;
		submitBtn.disabled = false;
		submitBtn.classList.remove('is-loading');
		if (submitLabel) submitLabel.textContent = defaultSubmitText;
		setFieldsDisabled(false);
		formWrap.hidden = false;
		successBox.hidden = true;
	}

	function onKeydown(e) {
		if (e.key === 'Escape' || e.keyCode === 27) {
			e.preventDefault();
			closeModal();
			return;
		}
		if (e.key === 'Tab' || e.keyCode === 9) {
			trapFocus(e);
		}
	}

	function trapFocus(e) {
		var focusable = getFocusable();
		if (focusable.length === 0) return;
		var first = focusable[0];
		var last = focusable[focusable.length - 1];
		var active = document.activeElement;

		if (e.shiftKey && active === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && active === last) {
			e.preventDefault();
			first.focus();
		}
	}

	function showSuccess() {
		formWrap.hidden = true;
		successBox.hidden = false;
		// Move focus to the success heading for screen readers
		var title = successBox.querySelector('.quote-success__title');
		if (title) {
			title.setAttribute('tabindex', '-1');
			title.focus();
		}
		autoCloseTimer = window.setTimeout(closeModal, 4000);
	}

	function showError() {
		errorBox.hidden = false;
		submitBtn.disabled = false;
		submitBtn.classList.remove('is-loading');
		if (submitLabel) submitLabel.textContent = defaultSubmitText;
		setFieldsDisabled(false);
	}

	function handleSubmit(e) {
		e.preventDefault();
		errorBox.hidden = true;

		// Native validation
		if (typeof form.checkValidity === 'function' && !form.checkValidity()) {
			form.reportValidity();
			return;
		}

		if (replyToInput) {
			var phoneInput = form.querySelector('input[name="phone"]');
			if (phoneInput) replyToInput.value = phoneInput.value;
		}

		var action = form.getAttribute('action') || '';

		submitBtn.disabled = true;
		submitBtn.classList.add('is-loading');
		if (submitLabel) submitLabel.textContent = 'Sending...';
		setFieldsDisabled(true);

		var data = new FormData(form);

		fetch(action, {
			method: 'POST',
			body: data,
			headers: { 'Accept': 'application/json' }
		}).then(function (response) {
			if (response.ok) {
				showSuccess();
			} else {
				return response.json().then(function () { showError(); }).catch(showError);
			}
		}).catch(showError);
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

	if (form) {
		form.addEventListener('submit', handleSubmit);
	}
})();
