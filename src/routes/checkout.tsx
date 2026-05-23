import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Banknote, Check, Lock, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { useCart, cart } from "@/lib/cart-store";
import { formatDH } from "@/lib/products";
import emailjs from '@emailjs/browser';
import { supabase } from "@/lib/supabase"; // 👈 استيراد السوبابيز باش نخزنوا الطلبيات

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Commande — Kolchi-Smart" }], links: [{ rel: "canonical", href: "/checkout" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, total } = useCart();
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false); // لويدينغ لمنع التكرار أثناء الإرسال
  const navigate = useNavigate();
  const shipping = total > 300 || total === 0 ? 0 : 30;
  const grand = total + shipping;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);

    try {
      // 1. قراءة البيانات مباشرة من الفورم
      const formData = new FormData(e.currentTarget);
      const infoClient = {
        name: formData.get("name") as string,
        phone: formData.get("phone") as string,
        email: (formData.get("email") as string) || "Non renseigné",
        address: formData.get("addr") as string,
        city: formData.get("city") as string,
        zip: (formData.get("zip") as string) || "Non renseigné",
        notes: (formData.get("notes") as string) || "Aucune note",
      };

      // 🔥 1.5 جيب الـ session ديال المستخدم الحالي يلا كان مسجل الدخول
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id || null;

      // 2. 💾 حفظ الطلبية في قاعدة بيانات Supabase أولاً
      const { error: supabaseError } = await supabase
        .from("orders")
        .insert([
          {
            client_name: infoClient.name,
            phone: infoClient.phone,
            address: infoClient.address,
            city: infoClient.city,
            total: grand, // المجموع الإجمالي بالـ Livraison
            user_id: currentUserId, // 🔥 هاد السطر السحري هو اللي كيربط الكوموند بـ حساب الزبون ديريكت!
          },
        ]);

      // إذا وقع مشكل ف السوبابيز، يحبس ويعلمنا ف الـ Console
      if (supabaseError) {
        console.error("Erreur insertion Supabase:", supabaseError.message);
        throw new Error("Supabase: " + supabaseError.message);
      }

      // 3. بناء جدول المنتجات بـ HTML للإيميل الاحترافي
      const rowsProduits = items.map(item => `
        <tr style="border-bottom: 1px solid #1e1e24;">
          <td style="padding: 12px; color: #ffffff; font-weight: bold; font-size: 14px;">${item.product.name}</td>
          <td style="padding: 12px; color: #a1a1aa; text-align: center; font-size: 14px;">x${item.qty}</td>
          <td style="padding: 12px; color: #00E5FF; font-weight: bold; text-align: right; font-size: 14px;">${formatDH(item.product.price * item.qty)}</td>
        </tr>
      `).join('');

      // 4. الديزاين الاحترافي الكامل بـ الـ Dark Mode للإيميل
      const emailTemplateHtml = `
        <div style="background-color: #0a0a0c; color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; max-width: 600px; margin: 0 auto; border-radius: 24px; border: 1px solid #1e1e24;">
          
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 1px solid #1e1e24; padding-bottom: 20px;">
            <h1 style="color: #00E5FF; margin: 0; font-size: 28px; letter-spacing: 1px;">Kolchi-Smart</h1>
            <p style="color: #a1a1aa; margin: 5px 0 0 0; font-size: 14px;">🚨 Nouvelle Commande Reçue !</p>
          </div>

          <div style="background-color: #111115; padding: 20px; border-radius: 16px; border: 1px solid #222; margin-bottom: 25px;">
            <h3 style="color: #3b82f6; margin-top: 0; margin-bottom: 15px; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Informations du Client</h3>
            <p style="margin: 8px 0; font-size: 14px;"><strong style="color: #a1a1aa;">Nom complet:</strong> ${infoClient.name}</p>
            <p style="margin: 8px 0; font-size: 14px;"><strong style="color: #a1a1aa;">Téléphone:</strong> <a href="tel:${infoClient.phone}" style="color: #00E5FF; text-decoration: none;">${infoClient.phone}</a></p>
            <p style="margin: 8px 0; font-size: 14px;"><strong style="color: #a1a1aa;">Email:</strong> ${infoClient.email}</p>
            <p style="margin: 8px 0; font-size: 14px;"><strong style="color: #a1a1aa;">Adresse:</strong> ${infoClient.address}, ${infoClient.city} (${infoClient.zip})</p>
            <p style="margin: 8px 0; font-size: 14px;"><strong style="color: #a1a1aa;">Notes:</strong> ${infoClient.notes}</p>
          </div>

          <h3 style="color: #3b82f6; margin-bottom: 10px; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Détails de la commande</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <thead>
              <tr style="border-bottom: 2px solid #1e1e24; text-align: left; background-color: #111115;">
                <th style="padding: 12px; color: #a1a1aa; font-size: 13px;">Produit</th>
                <th style="padding: 12px; color: #a1a1aa; font-size: 13px; text-align: center;">Qté</th>
                <th style="padding: 12px; color: #a1a1aa; font-size: 13px; text-align: right;">Prix</th>
              </tr>
            </thead>
            <tbody>
              ${rowsProduits}
            </tbody>
          </table>

          <div style="border-top: 1px solid #1e1e24; padding-top: 15px; font-size: 14px; color: #a1a1aa;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span>Sous-total:</span> <span style="color: #fff;">${formatDH(total)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
              <span>Livraison:</span> <span style="color: #fff;">${shipping === 0 ? 'Gratuite' : formatDH(shipping)}</span>
            </div>
            <div style="border-top: 2px dashed #1e1e24; padding-top: 15px; text-align: right;">
              <span style="font-size: 16px;">Montant Total:</span>
              <div style="font-size: 32px; font-weight: 900; color: #ffffff; margin-top: 5px;">${formatDH(grand)}</div>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://wa.me/${infoClient.phone.replace(/\s+/g, '')}" target="_blank" style="background-color: #25D366; color: #000000; text-decoration: none; padding: 14px 30px; font-weight: bold; border-radius: 12px; display: inline-block; font-size: 15px; box-shadow: 0 4px 15px rgba(37,211,102,0.2);">
              💬 Contacter sur WhatsApp
            </a>
          </div>

        </div>
      `;

      // 5. 📨 إرسال البيانات عبر EmailJS
      const templateParams = {
        message_html: emailTemplateHtml,
        client_name: infoClient.name,
      };

      await emailjs.send(
        'service_qmuhval',   
        'template_remdtoz',  
        templateParams,
        'yndblIoWNnO-S5BrJ'    
      );

      // إذا مر كولشي بنجاح، كنعرضو شاشة النجاح ونخويو السلة
      setDone(true);
      setTimeout(() => { cart.clear(); }, 200);

    } catch (error) {
      console.error("Erreur lors de l'envoi de la commande:", error);
      alert("Une erreur est survenue lors de la validation. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="h-20 w-20 mx-auto rounded-full gradient-electric grid place-items-center shadow-glow mb-6">
          <CheckCircle2 className="h-10 w-10 text-white" />
        </div>
        <h1 className="font-display text-3xl font-bold">Commande confirmée !</h1>
        <p className="text-muted-foreground mt-3">
          Merci pour votre commande. Notre équipe vous contactera sur WhatsApp pour confirmer la livraison.
          Vous payerez à la réception.
        </p>
        <button onClick={() => navigate({ to: "/dashboard" })} className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full gradient-electric text-white font-semibold shadow-glow cursor-pointer">
          Voir mes commandes
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Votre panier est vide</h1>
        <Link to="/products" className="inline-block mt-6 px-6 py-3 rounded-full gradient-electric text-white">Voir les produits</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Link to="/cart" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-electric mb-4">
        <ArrowLeft className="h-4 w-4" /> Retour au panier
      </Link>
      <h1 className="font-display text-3xl sm:text-4xl font-bold mb-8">Finaliser la commande</h1>

      <form onSubmit={onSubmit} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Section title="Contact">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Nom complet" name="name" required />
              <Field label="Téléphone" name="phone" type="tel" required placeholder="06 00 00 00 00" />
              <Field label="Email (optionnel)" name="email" type="email" className="sm:col-span-2" />
            </div>
          </Section>

          <Section title="Adresse de livraison">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Adresse" name="addr" required className="sm:col-span-2" />
              <Field label="Ville" name="city" required />
              <Field label="Code postal" name="zip" />
              <div className="sm:col-span-2">
                <label className="text-sm font-medium block mb-1.5">Notes (optionnel)</label>
                <textarea
                  name="notes"
                  className="w-full rounded-xl bg-surface border border-border p-3 text-sm focus:outline-none focus:border-electric min-h-[80px]"
                  placeholder="Étage, point de repère..."
                />
              </div>
            </div>
          </Section>

          <Section title="Mode de paiement">
            <label className="flex items-start gap-4 p-4 rounded-xl border-2 border-electric bg-electric/5 cursor-pointer">
              <div className="h-5 w-5 rounded-full bg-electric grid place-items-center mt-0.5 shrink-0">
                <Check className="h-3 w-3 text-electric-foreground" />
              </div>
              <div className="flex-1">
                <div className="font-semibold flex items-center gap-2"><Banknote className="h-4 w-4 text-electric" /> Paiement à la livraison (COD)</div>
                <p className="text-xs text-muted-foreground mt-1">Payez en espèces lors de la réception de votre colis. Disponible partout au Maroc.</p>
              </div>
            </label>
          </Section>
        </div>

        <aside className="rounded-2xl bg-card border border-border p-6 h-fit lg:sticky lg:top-32">
          <h2 className="font-display text-xl font-bold mb-5">Votre commande</h2>
          <div className="space-y-3 mb-5 max-h-80 overflow-auto">
            {items.map((it) => (
              <div key={it.product.id} className="flex gap-3 items-center">
                <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-surface-2 shrink-0">
                  <img src={it.product.image} alt={it.product.name} className="w-full h-full object-cover" />
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-electric text-electric-foreground text-[10px] font-bold grid place-items-center">{it.qty}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm line-clamp-1">{it.product.name}</div>
                  <div className="text-xs text-muted-foreground">{formatDH(it.product.price)}</div>
                </div>
                <div className="text-sm font-semibold">{formatDH(it.product.price * it.qty)}</div>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-sm border-t border-border pt-4">
            <div className="flex justify-between"><span className="text-muted-foreground">Sous-total</span><span>{formatDH(total)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Livraison</span><span>{shipping === 0 ? <span className="text-electric">Gratuite</span> : formatDH(shipping)}</span></div>
            <div className="flex justify-between text-base pt-2 border-t border-border">
              <span className="font-semibold">Total</span>
              <span className="font-display text-2xl font-bold">{formatDH(grand)}</span>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 h-12 rounded-full gradient-electric text-white font-semibold shadow-glow hover:scale-[1.01] transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            {loading ? "Traitement..." : "Confirmer la commande"}
          </button>
          <p className="text-[11px] text-muted-foreground text-center mt-3">En confirmant, vous acceptez nos conditions de vente.</p>
        </aside>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-6">
      <h2 className="font-display text-lg font-bold mb-4">{title}</h2>
      {children}
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