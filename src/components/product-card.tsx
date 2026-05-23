import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { cart } from "@/lib/cart-store";
import { formatDH, type Product } from "@/lib/products";

// تمديد الـ Type باش التي سكريبت يقبل الـ stock بلا مشاكل
interface ExtendedProduct extends Product {
  stock?: number;
}

export function ProductCard({ product }: { product: ExtendedProduct }) {
  const [fav, setFav] = useState(false);
  const discount = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);

  return (
    <div className="group relative rounded-2xl bg-card border border-border overflow-hidden shadow-card hover:border-electric/50 transition-all hover:-translate-y-1 hover:shadow-glow">
      <Link to="/products/$id" params={{ id: product.id }} className="block">
        <div className="relative aspect-square bg-surface-2 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {discount > 0 && (
            <span className="absolute top-3 left-3 px-2 py-1 rounded-md bg-electric text-electric-foreground text-[11px] font-bold">
              -{discount}%
            </span>
          )}
        </div>
      </Link>

      <button
        onClick={(e) => { e.preventDefault(); setFav((f) => !f); }}
        className="absolute top-3 right-3 h-9 w-9 rounded-full glass grid place-items-center hover:bg-electric/20 transition"
        aria-label="Favoris"
      >
        <Heart className={`h-4 w-4 ${fav ? "fill-electric text-electric" : ""}`} />
      </button>

      <div className="p-4">
        <Link to="/products/$id" params={{ id: product.id }}>
          <h3 className="font-medium text-sm leading-snug line-clamp-2 min-h-[2.5rem] hover:text-electric transition">{product.name}</h3>
        </Link>
        
        {/* 👈 بلاصة الـ Stock الجديدة (حيدنا النجمة وزدنا هادي بنفس الديزاين) */}
        <div className="flex items-center gap-1 mt-1.5 text-xs">
          {product.stock !== undefined && product.stock > 0 ? (
            <span className="text-green-400 font-medium bg-green-500/10 px-2 py-0.5 rounded-md">
              Stock: {product.stock} pcs
            </span>
          ) : (
            <span className="text-red-500 font-medium bg-red-500/10 px-2 py-0.5 rounded-md">
              Rupture de stock
            </span>
          )}
        </div>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <div className="font-display font-bold text-lg leading-none">{formatDH(product.price)}</div>
            {product.oldPrice && (
              <div className="text-xs text-muted-foreground line-through mt-1">{formatDH(product.oldPrice)}</div>
            )}
          </div>
          <button
            onClick={(e) => { e.preventDefault(); cart.add(product); }}
            className="h-10 w-10 rounded-full gradient-electric text-white grid place-items-center hover:scale-110 transition shadow-glow"
            aria-label="Ajouter au panier"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}