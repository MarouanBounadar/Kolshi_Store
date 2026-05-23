import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ShoppingBag, Truck, ShieldCheck, RefreshCw, Minus, Plus, Check, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; 
import { cart } from "@/lib/cart-store"; 
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/products/$id")({
  loader: ({ params }) => {
    const numericId = Number(params.id);
    if (isNaN(numericId)) {
      throw notFound();
    }
    return { id: numericId };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center gap-4 text-center px-4">
      <h1 className="font-display text-3xl font-bold text-white">Produit introuvable</h1>
      <Link to="/" className="inline-block mt-4 px-6 py-3 rounded-full bg-blue-600 text-white font-semibold shadow-md">
        Retour à l'accueil
      </Link>
    </div>
  ),
  component: ProductDetail,
});

function ProductDetail() {
  const { id } = Route.useLoaderData();
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error || !data) {
          setLoading(false);
          return;
        }

        // رجعنا الـ name و image كيفما كانوا عندك بالظبط وزدنا الـ stock
        const formatted = {
          id: data.id,
          name: data.name, 
          price: data.price,
          oldPrice: data.old_price,
          category: data.category,
          image: data.image, 
          stock: data.stock ?? 0, // 👈 جلب الـ stock
          description: data.description || "Aucune description disponible."
        };

        setProduct(formatted);

        // جلب المنتجات ذات الصلة بنفس التنسيق
        const { data: relatedData } = await supabase
          .from("products")
          .select("*")
          .eq("category", data.category)
          .not("id", "eq", data.id)
          .limit(4);

        if (relatedData) {
          setRelated(relatedData.map((p: any) => ({
            id: p.id,
            name: p.name, 
            price: p.price,
            oldPrice: p.old_price,
            category: p.category,
            image: p.image, 
            rating: p.rating || 5,
            reviews: p.reviews || 8
          })));
        }
      } catch (err) {
        console.error("Erreur Supabase:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!product) {
    return <Route.notFoundComponent />;
  }

  const discount = product.oldPrice && product.price
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  const handleAdd = () => {
    if (product.stock <= 0) {
      alert("Ce produit est malheureusement en rupture de stock.");
      return;
    }

    cart.add(product, qty); 
    setAdded(true);
    
    window.dispatchEvent(new Event('cartUpdated'));
    
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white pb-20 selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto px-4 py-8 pb-32 md:pb-10">
        
        {/* Breadcrumbs */}
        <nav className="text-[14px] text-muted-foreground/60 font-medium mb-8 flex items-center gap-2">
          <Link to="/" className="hover:text-white transition">Accueil</Link>
          <span>/</span>
          <span className="text-white font-semibold truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-14 items-start">
          
          {/* كادر الصورة */}
          <div className="bg-[#111115] border border-white/5 rounded-3xl overflow-hidden aspect-square relative grid place-items-center group shadow-2xl">
            {discount && discount > 0 && (
              <span className="absolute top-5 left-5 bg-blue-600 text-white font-black text-xs px-3 py-1.5 rounded-xl z-10 shadow-md">
                -{discount}% AUJOURD'HUI
              </span>
            )}
            <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-3xl group-hover:scale-[1.02] transition-transform duration-500" />
          </div>

          {/* التفاصيل والأسعار */}
          <div className="space-y-6">
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">{product.name}</h1>

            <div className="flex items-baseline gap-4 py-1">
              <span className="font-display text-4xl font-black text-white">{product.price} DH</span>
              {product.oldPrice && (
                <span className="text-lg text-muted-foreground/60 line-through font-medium pb-1">{product.oldPrice} DH</span>
              )}
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
              {product.description}
            </p>

            {/* 🌟 مكان عرض كمية الستوك المتوفرة بالـ الـ Glow الأزرق المتناسق 🌟 */}
            <div className="flex items-center gap-2 text-sm pt-2">
              <span className="text-zinc-400">Disponibilité :</span>
              {product.stock > 0 ? (
                <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-xl text-xs font-bold border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                  En Stock ({product.stock} pièces)
                </span>
              ) : (
                <span className="bg-rose-500/10 text-rose-400 px-3 py-1 rounded-xl text-xs font-bold border border-rose-500/20">
                  Rupture de stock
                </span>
              )}
            </div>

            {/* العداد والبوطون */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center border border-white/10 bg-[#111115] rounded-2xl overflow-hidden shadow-inner">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-5 py-3.5 hover:bg-white/5 text-muted-foreground hover:text-white transition text-lg font-bold cursor-pointer" disabled={product.stock <= 0}><Minus className="h-4 w-4" /></button>
                <span className="px-5 font-bold text-sm text-white min-w-[24px] text-center select-none tabular-nums">{product.stock > 0 ? qty : 0}</span>
                <button onClick={() => setQty((q) => product.stock > 0 ? Math.min(product.stock, q + 1) : 1)} className="px-5 py-3.5 hover:bg-white/5 text-muted-foreground hover:text-white transition text-lg font-bold cursor-pointer" disabled={product.stock <= 0 || qty >= product.stock}><Plus className="h-4 w-4" /></button>
              </div>
              
              <button 
                onClick={handleAdd} 
                disabled={product.stock <= 0}
                className="hidden md:inline-flex flex-1 items-center justify-center gap-2 h-14 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black shadow-lg transition duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:from-zinc-800 disabled:to-zinc-800"
              >
                {product.stock <= 0 ? (
                  "Rupture de stock"
                ) : added ? (
                  <><Check className="h-5 w-5 stroke-[2.5]" /> Ajouté !</>
                ) : (
                  <><ShoppingBag className="h-5 w-5 stroke-[2.5]" /> Ajouter au panier</>
                )}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs pt-4">
              {[
                { I: Truck, t: "Livraison rapide" },
                { I: ShieldCheck, t: "Paiement sécurisé" },
                { I: RefreshCw, t: "Retour 14 jours" },
              ].map(({ I, t }) => (
                <div key={t} className="flex flex-col items-center text-center gap-2 p-3.5 rounded-2xl bg-[#111115] border border-white/5">
                  <I className="h-5 w-5 text-blue-500" />
                  <span className="text-muted-foreground font-medium">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* منتجات ذات صلة */}
        {related.length > 0 && (
          <div className="mt-24">
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-8 tracking-tight text-white">Vous pourriez aimer</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>

      {/* بوطون الموبايل */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 p-3 bg-[#0a0a0c]/90 backdrop-blur-md border-t border-white/5">
        <button 
          onClick={handleAdd} 
          disabled={product.stock <= 0}
          className="w-full inline-flex items-center justify-center gap-2 h-13 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black shadow-md cursor-pointer active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:from-zinc-800"
        >
          {product.stock <= 0 ? (
            "Rupture de stock"
          ) : added ? (
            <><Check className="h-5 w-5 stroke-[2.5]" /> Ajouté</>
          ) : (
            <><ShoppingBag className="h-5 w-5 stroke-[2.5]" /> Ajouter • {product.price * qty} DH</>
          )}
        </button>
      </div>
    </div>
  );
}