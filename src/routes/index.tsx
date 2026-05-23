import { createFileRoute, Link } from "@tanstack/react-router";
import { Truck, ShieldCheck, RefreshCw, Banknote, Flame, Smartphone, Home, Gamepad2, Bluetooth, Lightbulb, Cpu } from "lucide-react";
import { useEffect, useState } from "react";
import heroImg from "@/assets/hero.jpg";
import { CATEGORIES } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { supabase } from "@/lib/supabase"; 

export const Route = createFileRoute("/")({
  component: HomePage,
});

const ICONS = { Smartphone, Home, Gamepad2, Bluetooth, Lightbulb, Cpu };

function CountdownTimer() {
  const [t, setT] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 0);
    const tick = () => {
      const diff = Math.max(0, end.getTime() - Date.now());
      setT({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);
  const Block = ({ v, l }: { v: number; l: string }) => (
    <div className="flex flex-col items-center">
      <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl bg-background grid place-items-center font-display font-bold text-2xl sm:text-3xl tabular-nums">
        {String(v).padStart(2, "0")}
      </div>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1.5">{l}</span>
    </div>
  );
  return (
    <div className="flex gap-3 sm:gap-4">
      <Block v={t.h} l="Heures" />
      <Block v={t.m} l="Min" />
      <Block v={t.s} l="Sec" />
    </div>
  );
}

function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching live products:", error);
      } else if (data) {
        const formattedProducts = data.map((p: any) => {
          // 🔍 هاد السطر كيطبع البيانات فـ كونسول المتصفح للتأكد من اسم الحقل
          console.log("Product data from Supabase:", p);

          return {
            id: p.id,
            name: p.name,
            price: p.price,
            oldPrice: p.old_price, 
            category: p.category,
            image: p.image,
            // 👈 جلب الـ stock بـ كاع الطرق الممكنة (صغير، كبير، أو كمية) لضمان القراءة الحقيقية
            stock: p.stock !== undefined && p.stock !== null ? p.stock : (p.Stock !== undefined && p.Stock !== null ? p.Stock : (p.quantity ?? 0))
          };
        });
        setProducts(formattedProducts);
      }
      setLoading(false);
    };

    fetchLiveProducts();
  }, []);

  return (
    <div className="overflow-x-hidden text-white">
      {/* HERO */}
      <section className="relative">
        <div className="absolute inset-0 -z-10">
          <img src={heroImg} alt="" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-32 lg:py-40">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric/10 border border-electric/30 text-electric text-xs font-medium mb-5">
              <Flame className="h-3.5 w-3.5" /> Nouvelle collection 2026
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05]">
              Smart Gadgets & <span className="text-electric">Electronic</span> Accessories
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Les meilleurs prix au Maroc. Livraison rapide partout, paiement à la livraison disponible.
            </p>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-border bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          {[
            { I: Truck, t: "Livraison gratuite", d: "Dès 300 DH partout au Maroc" },
            { I: Banknote, t: "Paiement à la livraison", d: "Payez à la réception" },
            { I: ShieldCheck, t: "Garantie product", d: "Tous nos products sont garantis" },
            { I: RefreshCw, t: "Retour facile", d: "14 jours pour changer d'avis" },
          ].map(({ I, t, d }) => (
            <div key={t} className="flex items-center gap-3">
              <I className="h-7 w-7 text-electric shrink-0" />
              <div>
                <div className="font-semibold">{t}</div>
                <div className="text-xs text-muted-foreground">{d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          {CATEGORIES.map((c) => {
            const Icon = ICONS[c.icon as keyof typeof ICONS];
            return (
              <Link
                key={c.slug}
                to="/products"
                search={{ cat: c.slug }}
                className="group aspect-square rounded-2xl bg-card border border-border flex flex-col items-center justify-center gap-2 p-2 transition"
              >
                <div className="h-12 w-12 rounded-full bg-surface-2 grid place-items-center">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-center">{c.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* DYNAMIC PRODUCTS SECTION */}
      <section id="trending" className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="font-display text-3xl font-bold mb-8">Produits vedettes</h2>
        
        {loading ? (
          <div className="text-center py-10 text-muted-foreground">Chargement...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">Aucun produit trouvé.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}