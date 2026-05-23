import { MessageCircle, X } from "lucide-react";
import { useState } from "react";

const PHONE = "212613321942";
const MSG = "Hello Kolchi-Smart 👋 How can we help you?";

export function WhatsAppButton() {
  const [open, setOpen] = useState(false);
  const href = `https://wa.me/${PHONE}?text=${encodeURIComponent("Bonjour Kolchi-Smart 👋")}`;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <div className="w-72 rounded-2xl bg-card border border-border shadow-card overflow-hidden animate-fade-up">
          <div className="bg-[#25D366] text-white p-4 flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-sm">Kolchi-Smart</p>
              <p className="text-xs opacity-90">En ligne maintenant</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Fermer"><X className="h-4 w-4" /></button>
          </div>
          <div className="p-4 text-sm">
            <div className="bg-surface rounded-lg p-3 mb-3">{MSG}</div>
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-full bg-[#25D366] text-white font-medium hover:opacity-90 transition"
            >
              <MessageCircle className="h-4 w-4" /> Discuter sur WhatsApp
            </a>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="WhatsApp"
        className="h-14 w-14 rounded-full bg-[#25D366] text-white grid place-items-center shadow-card hover:scale-105 transition animate-glow"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
}
