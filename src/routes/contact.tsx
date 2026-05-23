import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageCircle, Clock } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Kolchi-Smart" },
      { name: "description", content: "Contactez Kolchi-Smart. WhatsApp, téléphone, email. Support client réactif." },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="inline-block px-3 py-1 rounded-full bg-electric/10 border border-electric/30 text-electric text-xs font-medium mb-4">
          Nous contacter
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold">Une question ? On répond vite.</h1>
        <p className="text-muted-foreground mt-3">Notre équipe est disponible 7j/7 pour vous aider avec vos commandes, livraisons et produits.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-3">
          {[
            { I: MessageCircle, t: "WhatsApp", d: "+212 613 321 942", a: "https://wa.me/212613321942", h: "Réponse sous 5 minutes" },
            { I: Phone, t: "Téléphone", d: "+212 702 327 181", a: "tel:+212702327181", h: "Lun-Sam 9h-19h" },
            { I: Mail, t: "Email", d: "kolchi-smart@gmail.com", a: "mailto:kolchi-smart@gmail.com", h: "Réponse sous 24h" },
            { I: MapPin, t: "Adresse", d: "Kenitra, Maroc", h: "Livraison partout au royaume" },
          ].map(({ I, t, d, a, h }) => {
            const inner = (
              <>
                <div className="h-11 w-11 rounded-full bg-electric/10 text-electric grid place-items-center shrink-0">
                  <I className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{t}</div>
                  <div className="font-semibold">{d}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><Clock className="h-3 w-3" /> {h}</div>
                </div>
              </>
            );
            const cls = "flex items-start gap-4 p-5 rounded-2xl bg-card border border-border hover:border-electric/50 transition";
            return a ? <a key={t} href={a} className={cls}>{inner}</a> : <div key={t} className={cls}>{inner}</div>;
          })}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); setSent(true); }}
          className="lg:col-span-3 rounded-2xl bg-card border border-border p-6 sm:p-8"
        >
          {sent ? (
            <div className="text-center py-10">
              <div className="h-16 w-16 mx-auto rounded-full gradient-electric grid place-items-center shadow-glow mb-4">
                <Send className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-display text-2xl font-bold">Message envoyé !</h3>
              <p className="text-muted-foreground mt-2">Nous vous répondrons très rapidement. Merci !</p>
            </div>
          ) : (
            <>
              <h2 className="font-display text-2xl font-bold mb-1">Envoyez-nous un message</h2>
              <p className="text-sm text-muted-foreground mb-6">Remplissez le formulaire, on revient vers vous.</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Nom complet" required />
                <Field label="Téléphone" type="tel" required />
                <Field label="Email" type="email" className="sm:col-span-2" />
                <Field label="Sujet" className="sm:col-span-2" />
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium block mb-1.5">Message</label>
                  <textarea
                    required
                    rows={5}
                    className="w-full rounded-xl bg-surface border border-border p-3 text-sm focus:outline-none focus:border-electric"
                    placeholder="Votre message..."
                  />
                </div>
              </div>
              <button type="submit" className="mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full gradient-electric text-white font-semibold shadow-glow">
                <Send className="h-4 w-4" /> Envoyer le message
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

function Field({ label, className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; className?: string }) {
  return (
    <div className={className}>
      <label className="text-sm font-medium block mb-1.5">{label}</label>
      <input
        {...props}
        className="w-full h-11 rounded-xl bg-surface border border-border px-3 text-sm focus:outline-none focus:border-electric focus:ring-2 focus:ring-electric/30 transition"
      />
    </div>
  );
}
