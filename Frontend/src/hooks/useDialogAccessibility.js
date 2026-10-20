import { useEffect, useRef } from 'react';

const selectorEnfocable = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useAccesibilidadDialogo(dialogRef, onClose, enabled = true) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    if (!enabled) return undefined;
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    onCloseRef.current = onClose;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const obtenerElementosEnfocables = () => [...dialog.querySelectorAll(selectorEnfocable)]
      .filter((element) => element.getAttribute('aria-hidden') !== 'true');

    document.body.style.overflow = 'hidden';
    (obtenerElementosEnfocables()[0] || dialog).focus();

    const gestionarTeclaPresionada = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;

      const elementosEnfocables = obtenerElementosEnfocables();
      if (elementosEnfocables.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = elementosEnfocables[0];
      const last = elementosEnfocables[elementosEnfocables.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', gestionarTeclaPresionada);
    return () => {
      document.removeEventListener('keydown', gestionarTeclaPresionada);
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, [dialogRef, onClose, enabled]);
}
