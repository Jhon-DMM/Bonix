window.Bonix = window.Bonix || {};

window.Bonix.config = {
  whatsappNumber: '573000000000',
};

(() => {
  const cards = document.querySelectorAll('.dessert-card');

  const closeOtherCards = (current) => {
    cards.forEach((card) => {
      if (card !== current) card.classList.remove('is-active');
    });
  };

  cards.forEach((card) => {
    card.addEventListener('click', (event) => {
      const clickedOrderLink = event.target.closest('.dessert-order');
      if (clickedOrderLink) return;

      closeOtherCards(card);
      card.classList.toggle('is-active');
    });
  });
})();

(() => {
  document.getElementById('current-year').textContent = new Date().getFullYear();
})();

(() => {
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');

  const closeNav = () => {
    mainNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  };

  const toggleNav = () => {
    const isOpen = mainNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  };

  navToggle.addEventListener('click', toggleNav);

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeNav);
  });
})();

(() => {
  const { whatsappNumber } = window.Bonix.config;

  const backdrop = document.getElementById('modal-backdrop');
  const openButton = document.getElementById('open-order-modal');
  const closeButton = document.getElementById('modal-close');
  const form = document.getElementById('order-form');
  const errorBox = document.getElementById('form-error');
  const addressField = document.getElementById('direccion');
  const phoneField = document.getElementById('telefono');
  const notesField = document.getElementById('notas');

  const DESSERTS = [
    { inputId: 'qty-maracuya', name: 'Maracuyá' },
    { inputId: 'qty-milo', name: 'Milo' },
    { inputId: 'qty-oreo', name: 'Oreo' },
    { inputId: 'qty-fresas', name: 'Fresas' },
  ];

  const showError = (message) => {
    errorBox.textContent = message;
    errorBox.hidden = false;
  };

  const hideError = () => {
    errorBox.hidden = true;
    errorBox.textContent = '';
  };

  const openModal = () => {
    backdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    addressField.focus();
  };

  const closeModal = () => {
    backdrop.classList.remove('is-open');
    document.body.style.overflow = '';
    openButton.focus();
  };

  const getChosenDesserts = () =>
    DESSERTS
      .map(({ inputId, name }) => {
        const quantity = parseInt(document.getElementById(inputId).value, 10) || 0;
        return quantity > 0 ? `${quantity} x ${name}` : null;
      })
      .filter(Boolean);

  const buildWhatsappMessage = ({ address, phone, notes, items }) => {
    const lines = [
      'Hola Bonix, quiero hacer un pedido a domicilio.',
      '',
      `Dirección: ${address}`,
      `Mi WhatsApp: ${phone}`,
      `Postres: ${items.join(', ')}`,
    ];
    if (notes) lines.push(`Notas: ${notes}`);
    return lines.join('\n');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    hideError();

    const address = addressField.value.trim();
    const phone = phoneField.value.trim();
    const notes = notesField.value.trim();
    const items = getChosenDesserts();

    if (!address || !phone) {
      showError('Por favor completa la dirección y tu número de WhatsApp.');
      return;
    }
    if (items.length === 0) {
      showError('Elige al menos un postre y su cantidad.');
      return;
    }

    const message = buildWhatsappMessage({ address, phone, notes, items });
    const url = new URL(`https://wa.me/${whatsappNumber}`);
    url.searchParams.set('text', message);

    const newWindow = window.open(url.toString(), '_blank');

    form.reset();
    closeModal();

    if (!newWindow) {
      window.location.href = url.toString();
    }
  };

  openButton.addEventListener('click', openModal);
  closeButton.addEventListener('click', closeModal);

  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) closeModal();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && backdrop.classList.contains('is-open')) {
      closeModal();
    }
  });

  form.addEventListener('submit', handleSubmit);
})();

(() => {
  const root = document.documentElement;
  const toggleButton = document.getElementById('theme-toggle');

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  if (prefersDark) {
    root.setAttribute('data-theme', 'dark');
  }

  const syncButtonLabel = () => {
    const isDark = root.getAttribute('data-theme') === 'dark';
    toggleButton.setAttribute('aria-pressed', String(isDark));
    toggleButton.setAttribute(
      'aria-label',
      isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'
    );
  };

  const toggleTheme = () => {
    const isDark = root.getAttribute('data-theme') === 'dark';
    root.setAttribute('data-theme', isDark ? 'light' : 'dark');
    syncButtonLabel();
  };

  toggleButton.addEventListener('click', toggleTheme);
  syncButtonLabel();
})();

(() => {
  const { whatsappNumber } = window.Bonix.config;

  document.querySelectorAll('[data-whatsapp-link]').forEach((link) => {
    const message = link.dataset.waText ?? '';
    const url = new URL(`https://wa.me/${whatsappNumber}`);
    if (message) {
      url.searchParams.set('text', message);
    }
    link.href = url.toString();
  });
})();
