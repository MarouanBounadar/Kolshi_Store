import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, LogOut, ShoppingBag, Clock, Package, CheckCircle2, AlertTriangle, Phone } from "lucide-react";
import { formatDH } from "@/lib/products";

export const Route = createFileRoute("/dashboard")({
  component: ClientDashboard,
});

interface Order {
  id: number;
  created_at: string;
  client_name: string;
  phone: string;
  address: string;
  city: string;
  total: number;
  status?: string;
  livreur_phone?: string;
}

function ClientDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClientData = async () => {
      setLoading(true);
      // 1️⃣ جيب الـ User الحالي اللّي مسجل الدخول
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // إيلا مكانش مسجل الدخول ديه لصفحة الـ Login ديريكت
        navigate({ to: "/login" });
        return;
      }

      setUser(session.user);

      // 2️⃣ جيب غير الطلبيات اللّي عندها الـ user_id ديال هاد الزبون بـ الضبط
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setOrders(data as Order[]);
      }
      setLoading(false);
    };

    fetchClientData();
  }, [navigate]);

  // 🔥 الدالة السحرية المحدثة لتلوين الـ Status على حسب اختيار الـ Admin
  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || "en_attente";
    
    switch (s) {
      case "en_attente": // ⏳ في الانتظار
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Clock className="h-3 w-3" /> En attente
          </span>
        );
      case "expedied": // 🛵 تم الشحن مع الموزع
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Package className="h-3 w-3" /> Expédié
          </span>
        );
      case "livre": // ✅ تم التوصيل بنجاح
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-green-500/10 border border-green-500/20 text-green-400">
            <CheckCircle2 className="h-3 w-3" /> Livré
          </span>
        );
      case "annule": // ❌ ملغية
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
            <AlertTriangle className="h-3 w-3" /> Annulé
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-surface-2 border border-border text-muted-foreground">
            {status}
          </span>
        );
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] grid place-items-center bg-[#0a0a0c]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-electric animate-spin mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Chargement de vos commandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-white">
      {/* ─── HEADER ESPACE CLIENT ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6 mb-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Mon Espace Client</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bienvenue, <span className="text-white font-medium">{user?.email}</span>
          </p>
        </div>
        <button 
          onClick={handleLogout} 
          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 text-sm font-semibold transition cursor-pointer sm:w-fit w-full"
        >
          <LogOut className="h-4 w-4" /> Déconnexion
        </button>
      </div>

      {/* ─── LISTE DES COMMANDES ─── */}
      <div className="space-y-6">
        <h2 className="font-display text-lg font-bold flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-electric" /> 
          Suivi de mes commandes ({orders.length})
        </h2>

        {orders.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card/40">
            <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Vous n'avez pas encore passé de commande.</p>
            <Link to="/products" className="inline-block mt-4 text-xs font-bold text-electric hover:underline">
              Découvrir nos produits →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className="bg-card border border-border rounded-2xl p-5 sm:p-6 transition hover:border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-mono font-bold text-white bg-surface px-2.5 py-1 rounded-lg border border-border">
                      Commande #{order.id}
                    </span>
                    {/* 🔥 الـ Badge الملون كيتحط هنا */}
                    {getStatusBadge(order.status || "en_attente")}
                  </div>
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><span className="text-white font-medium">Date :</span> {new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                    <p><span className="text-white font-medium">Adresse :</span> {order.address}, {order.city}</p>
                  </div>

                  {/* إيلا الكوموند شحنها الـ Admin مع الموزع، كيطرطق رقم التيليفون د Livreur هنا للزبون */}
                  {order.status === "expedied" && order.livreur_phone && (
                    <div className="mt-3 p-2.5 rounded-xl bg-blue-500/5 border border-blue-500/10 w-fit flex items-center gap-2 text-xs text-blue-400">
                      <Phone className="h-3.5 w-3.5" />
                      <span>Livreur en route : <a href={`tel:${order.livreur_phone}`} className="underline font-bold text-white">{order.livreur_phone}</a></span>
                    </div>
                  )}
                </div>

                <div className="sm:text-right border-t border-border/40 sm:border-none pt-3 sm:pt-0 flex sm:flex-col justify-between items-center sm:items-end">
                  <span className="text-xs text-muted-foreground sm:mb-1">Montant Total</span>
                  <span className="text-xl font-display font-black text-electric">
                    {formatDH(order.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}