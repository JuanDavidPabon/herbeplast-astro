const form = document.getElementById('contact-form');
if (form) {
	const status = document.getElementById('form-status');
	const fields = ['name', 'email', 'subject', 'message'];
	const validators = {
		name(value) {
			const trimmed = value.trim();
			if (!trimmed) return 'Ingresa tu nombre.';
			if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]{2,60}$/.test(trimmed)) return 'El nombre solo debe tener letras y espacios.';
			return '';
		},
		email(value) {
			const trimmed = value.trim();
			if (!trimmed) return 'Ingresa tu correo.';
			if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) return 'Ingresa un correo válido.';
			return '';
		},
		subject(value) {
			const trimmed = value.trim();
			if (!trimmed) return 'Ingresa el asunto.';
			if (trimmed.length < 3) return 'El asunto es muy corto.';
			return '';
		},
		message(value) {
			const trimmed = value.trim();
			if (!trimmed) return 'Escribe tu mensaje.';
			if (trimmed.length < 10) return 'Agrega un poco más de detalle (mín. 10 caracteres).';
			return '';
		},
	};

	function setError(id, message) {
		const row = document.getElementById(id)?.closest('.form-row');
		const error = document.getElementById(`err-${id}`);
		if (message) {
			row?.classList.add('invalid');
			if (error) error.textContent = message;
		} else {
			row?.classList.remove('invalid');
			if (error) error.textContent = '';
		}
	}

	function validateField(id) {
		const input = document.getElementById(id);
		const message = validators[id]?.(input?.value ?? '') ?? '';
		setError(id, message);
		return !message;
	}

	fields.forEach((id) => {
		const input = document.getElementById(id);
		if (!input) return;
		input.addEventListener('input', () => validateField(id));
		input.addEventListener('blur', () => validateField(id));
	});

	form.addEventListener('submit', (event) => {
		event.preventDefault();
		const isValid = fields.map(validateField).every(Boolean);
		if (!isValid) {
			status.hidden = false;
			status.textContent = 'Por favor corrige los campos marcados.';
			status.style.color = '#b91c1c';
			return;
		}
		status.hidden = false;
		status.textContent = '¡Gracias! Hemos recibido tu mensaje (demo).';
		status.style.color = '#065f46';
		form.reset();
		fields.forEach((id) => setError(id, ''));
	});
}