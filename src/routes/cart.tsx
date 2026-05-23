import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart, cart } from "@/lib/cart-store";
import { formatDH } from "@/lib/products";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Panier — Kolchi-Smart" }], links: [{ rel: "canonical", href: "/cart" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, total, count } = useCart();
  const shipping = total > 300 || total === 0 ? 0 : 30;
  const grand = total + shipping;

  if (count === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="h-20 w-20 mx-auto rounded-full bg-surface grid place-items-center mb-6">
          <ShoppingBag className="h-9 w-9 text-muted-foreground" />
        </div>
        <h1 className="font-display text-3xl font-bold">Votre panier est vide</h1>
        <p className="text-muted-foreground mt-2">Découvrez nos produits et trouvez votre coup de cœur.</p>
        <Link to="/products" className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-full gradient-electric text-white font-semibold shadow-glow">
          Commencer mes achats <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl sm:text-4xl font-bold mb-8">Mon panier ({count})</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          {items.map((it) => (
            <div key={it.product.id} className="flex gap-4 p-4 rounded-2xl bg-card border border-border">
              <Link to="/products/$id" params={{ id: it.product.id }} className="h-24 w-24 sm:h-28 sm:w-28 shrink-0 rounded-xl overflow-hidden bg-surface-2">
                <img src={it.product.image} alt={it.product.name} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to="/products/$id" params={{ id: it.product.id }} className="font-medium hover:text-electric line-clamp-2">{it.product.name}</Link>
                <div className="text-electric font-display font-bold mt-1">{formatDH(it.product.price)}</div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center bg-surface rounded-full border border-border">
                    <button onClick={() => cart.setQty(it.product.id, it.qty - 1)} className="h-8 w-8 grid place-items-center" aria-label="Moins"><Minus className="h-3.5 w-3.5" /></button>
                    <span className="w-8 text-center text-sm font-semibold tabular-nums">{it.qty}</span>
                    <button onClick={() => cart.setQty(it.product.id, it.qty + 1)} className="h-8 w-8 grid place-items-center" aria-label="Plus"><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                  <button onClick={() => cart.remove(it.product.id)} className="text-muted-foreground hover:text-destructive p-2" aria-label="Supprimer">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="rounded-2xl bg-card border border-border p-6 h-fit lg:sticky lg:top-32">
          <h2 className="font-display text-xl font-bold mb-5">Résumé</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Sous-total</span><span className="font-semibold">{formatDH(total)}</span></div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Livraison</span>
              <span className="font-semibold">{shipping === 0 ? <span className="text-electric">Gratuite</span> : formatDH(shipping)}</span>
            </div>
            {total < 300 && (
              <div className="text-xs text-muted-foreground bg-surface rounded-lg p-3">
                Ajoutez encore <span className="text-electric font-semibold">{formatDH(300 - total)}</span> pour la livraison gratuite 🚚
              </div>
            )}
            <div className="border-t border-border pt-3 flex justify-between text-base">
              <span className="font-semibold">Total</span>
              <span className="font-display text-2xl font-bold">{formatDH(grand)}</span>
            </div>
          </div>
          <Link to="/checkout" className="mt-6 w-full inline-flex items-center justify-center gap-2 h-12 rounded-full gradient-electric text-white font-semibold shadow-glow">
            Passer la commande <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/products" className="mt-3 w-full inline-flex items-center justify-center h-11 rounded-full border border-border text-sm hover:border-electric/60">
            Continuer mes achats
          </Link>
        </aside>
      </div>
    </div>
  );
}
