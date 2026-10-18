import { buildGeneralWhatsAppLink } from '../utils/whatsapp.js';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-canvas border-t border-hairline">
      <div className="mx-auto max-w-[1100px] px-5 py-10 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="font-display font-semibold text-lg text-ink">Bonix</p>
            <p className="font-text text-[14px] text-ink/60 mt-1">Postres artesanales en vaso.</p>
          </div>

          <a
            href={buildGeneralWhatsAppLink()}
            target="_blank"
            rel="noreferrer"
            className="font-text text-[14px] font-semibold text-celeste-600 hover:text-celeste-700"
          >
            Escríbenos por WhatsApp
          </a>
        </div>

        <p className="font-text text-[12px] text-ink/40">
          © {year} Bonix. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
