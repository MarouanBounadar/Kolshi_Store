import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Search, ShoppingBag, User, Menu, X, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart-store";
import { CATEGORIES } from "@/lib/products";
import { supabase } from "@/lib/supabase";

export function SiteHeader() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  
  // قراءة حقل البحث الحالي من الرابط
  const searchParams = useSearch({ strict: false }) as { search?: string };
  const searchValue = searchParams.search || "";

  // الستيت الجديد: لمعرفة نوع المستخدم المسجل (admin أو client أو null)
  const [userType, setUserType] = useState<"admin" | "client" | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // 🔥 فحص الإيميل: إيلا كان إيميل الأدمن دير ليه تيكيت admin، وإلا فهو زبون عادي
        if (session.user.email === "admin@kolchi-smart.ma") {
          setUserType("admin");
        } else {
          setUserType("client");
        }
      } else {
        setUserType(null);
      }
    });

    // مراقبة التغيرات (يلا دار التسجيل أو الخروج يتحدث الـ Navbar أوتوماتيك)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        if (session.user.email === "admin@kolchi-smart.ma") {
          setUserType("admin");
        } else {
          setUserType("client");
        }
      } else {
        setUserType(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // دالة لتحديد المسار النيشان فاش كيتكليكا على أيقونة الـ User
  const getAccountLink = () => {
    if (userType === "admin") return "/admin";
    if (userType === "client") return "/dashboard"; // 👈 كيدي الكليان لـ الـ Espace Client ديالو
    return "/client-login"; // 👈 فاش كيكون خارج كيديه لـ Connexion Client ديريكت!
  };

  const handleSearchChange = (value: string) => {
    navigate({
      to: "/products",
      search: (prev: any) => ({ ...prev, search: value || undefined }),
    });
  };

  return (
    <>
      {/* announcement */}
      <div className="bg-electric text-electric-foreground text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2 font-medium">
          <Zap className="h-3.5 w-3.5" />
          Livraison gratuite à partir de 300 DH · Paiement à la livraison disponible 🇲🇦
        </div>
      </div>

      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <button className="md:hidden" onClick={() => setOpen(true)} aria-label="Menu">
            <Menu className="h-6 w-6" />
          </button>

          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg gradient-electric grid place-items-center shadow-glow">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">
              Kolchi<span className="text-electric">-Smart</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 ml-6 text-sm">
            <Link to="/" className="hover:text-electric transition-colors" activeOptions={{ exact: true }} activeProps={{ className: "text-electric" }}>Accueil</Link>
            <Link to="/products" className="hover:text-electric transition-colors" activeProps={{ className: "text-electric" }}>Produits</Link>
            <Link to="/contact" className="hover:text-electric transition-colors" activeProps={{ className: "text-electric" }}>Contact</Link>
          </nav>

          {/* 🔍 خانة البحث لـ Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-auto">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Rechercher un produit..."
                className="w-full h-10 pl-10 pr-4 rounded-full bg-surface border border-border text-sm focus:outline-none focus:ring-2 focus:ring-electric/40 focus:border-electric transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-1 ml-auto md:ml-0">
            {/* 👤 🔥 أيقونة الحساب الذكية والمصلحة أوتوماتيكياً */}
            <Link 
              to={getAccountLink()} 
              className="p-2 rounded-full hover:bg-surface transition text-muted-foreground hover:text-white cursor-pointer" 
              aria-label="Compte"
              title={userType ? "Tableau de bord" : "Connexion"}
            >
              <User className="h-5 w-5" />
            </Link>
            
            <Link to="/cart" className="relative p-2 rounded-full hover:bg-surface transition" aria-label="Panier">
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 min-w-5 px-1 rounded-full bg-electric text-electric-foreground text-[10px] font-bold grid place-items-center">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Category strip */}
        <div className="hidden md:block border-t border-border">
          <div className="max-w-7xl mx-auto px-4 h-11 flex items-center gap-6 text-sm overflow-x-auto">
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                to="/products"
                search={(prev: any) => ({ ...prev, cat: c.slug })}
                className="whitespace-nowrap text-muted-foreground hover:text-foreground transition"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-80 max-w-[85%] bg-background p-6 animate-fade-up">
            <div className="flex items-center justify-between mb-6">
              <span className="font-display font-bold">Menu</span>
              <button onClick={() => setOpen(false)} aria-label="Fermer"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="search"
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full h-10 pl-10 pr-3 rounded-full bg-surface border border-border text-sm focus:outline-none focus:border-electric" 
                placeholder="Rechercher..." 
              />
            </div>
            
            <nav className="flex flex-col gap-1">
              {[{ to: "/", label: "Accueil" }, { to: "/products", label: "Produits" }, { to: "/contact", label: "Contact" }].map((l) => (
                <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="py-3 px-3 rounded-lg hover:bg-surface">{l.label}</Link>
              ))}
              {/* زدنا خيار الحساب فـ القائمة الجانبية للموبايل باش يتبع نفس السيستم المحمي */}
              <Link to={getAccountLink()} onClick={() => setOpen(false)} className="py-3 px-3 rounded-lg hover:bg-surface text-electric font-medium">
                {userType ? "Mon Espace" : "Se connecter"}
              </Link>
            </nav>
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Catégories</p>
              <div className="flex flex-col">
                {CATEGORIES.map((c) => (
                  <Link key={c.slug} to="/products" search={(prev: any) => ({ ...prev, cat: c.slug })} onClick={() => setOpen(false)} className="py-2.5 text-sm text-muted-foreground hover:text-foreground">
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}