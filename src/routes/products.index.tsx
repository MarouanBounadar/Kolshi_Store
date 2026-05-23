import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SlidersHorizontal } from "lucide-react";
import { CATEGORIES } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { supabase } from "@/lib/supabase"; // ربط قاعدة البيانات السحابية

// 1️⃣ زدنا الـ search فـ التايب باش يقبلو الراوتر
type Search = { cat?: string; sort?: string; search?: string };

export const Route = createFileRoute("/products/")({
  // 2️⃣ زنا الـ search هنا باش يتقرأ من الرابط ديريكت بلا مشاكل
  validateSearch: (s: Record<string, unknown>): Search => ({
    cat: typeof s.cat === "string" ? s.cat : undefined,
    sort: typeof s.sort === "string" ? s.sort : undefined,
    search: typeof s.search === "string" ? s.search : undefined, 
  }),
  head: () => ({
    meta: [
      { title: "Produits — Kolchi-Smart" },
      { name: "description", content: "Découvrez notre catalogue de smart gadgets et accessoires électroniques." },
    ],
    links: [{ rel: "canonical", href: "/products" }],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  // 3️⃣ استخراج الـ search من الـ الرابط بحال الـ cat
  const { cat, search } = Route.useSearch();
  const [sort, setSort] = useState<string>("featured");
  const [dbProducts, setDbProducts] = useState<any[]>([]); // مصفوفة لتخزين السلعة من السحاب
  const [loading, setLoading] = useState<boolean>(true);

  // جلب السلعة الحية من Supabase عند فتح الصفحة
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
        // تحويل الحقول لتتوافق مع الـ ProductCard (old_price -> oldPrice)
        const formatted = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          oldPrice: p.old_price, 
          category: p.category,
          image: p.image,
          stock: p.stock 
        }));
        setDbProducts(formatted);
      }
      setLoading(false);
    };

    fetchLiveProducts();
  }, []);

  // الفلترة الذكية للأقسام + فلترة البحث بالسمية فـ نفس الوقت 🚀
  let list = dbProducts.filter((p) => {
    // 🔍 أولاً: فلترة البحث بالسمية (إذا كانت خانة البحث عامرة)
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) {
      return false; // يلا مفيهاش الكلمة كيحيد المنتج فالبلاصة
    }

    // ثانياً: فلترة الأقسام (Categories)
    if (!cat) return true; // إذا برك على Tous يبان كلشي
    if (!p.category) return false;

    const cleanCat = cat.toLowerCase().trim().replace(/[-_\s]+/g, "");
    const cleanProductCat = p.category.toLowerCase().trim().replace(/[-_\s]+/g, "");

    return (
      cleanProductCat.includes(cleanCat) || 
      cleanCat.includes(cleanProductCat) ||
      cleanProductCat.substring(0, 4) === cleanCat.substring(0, 4)
    );
  });

  // ترتيب المنتجات (Sort) بناءً على خيار الزبون
  if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 text-white">
      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold">Tous les produits</h1>
        {/* تغيير النص باش يبين للمستخدم على اشنو كيبحث يلا كان كاين بحث */}
        <p className="text-muted-foreground mt-1">
          {search ? `Résultats pour "${search}" : ` : ""}
          {list.length} {list.length > 1 ? "produits trouvés" : "produit trouvé"}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-8">
        <Link
          to="/products"
          search={(prev) => ({ ...prev, cat: undefined })} // الحفاظ على حقل البحث عند تغيير القسم
          className={`px-4 py-2 rounded-full text-sm border transition ${!cat ? "bg-electric text-electric-foreground border-electric" : "border-border hover:border-electric/60"}`}
        >
          Tous
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            to="/products"
            search={(prev) => ({ ...prev, cat: c.slug })} // الحفاظ على حقل البحث عند تغيير القسم
            className={`px-4 py-2 rounded-full text-sm border transition ${cat === c.slug ? "bg-electric text-electric-foreground border-electric" : "border-border hover:border-electric/60"}`}
          >
            {c.name}
          </Link>
        ))}
        <div className="ml-auto flex items-center gap-2 text-sm">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-surface border border-border rounded-full px-3 py-2 text-sm focus:outline-none focus:border-electric text-white"
            style={{ backgroundColor: '#1e1e1e' }}
          >
            <option value="featured">Idées cadeaux</option>
            <option value="low">Prix croissant</option>
            <option value="high">Prix décroissant</option>
          </select>
        </div>
      </div>

      {/* عرض حالة التحميل أو المنتجات */}
      {loading ? (
        <div className="text-center py-20 text-muted-foreground animate-pulse">
          Le chargement des produits depuis Supabase...
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          Aucun produit trouvé {search ? `pour "${search}"` : ""}.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}