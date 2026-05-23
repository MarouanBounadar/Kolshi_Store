import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, LogOut, Package, Phone, PlusCircle, Trash2, FolderPlus, Upload, Image as ImageIcon, Truck, X, CheckCircle } from "lucide-react";
import { formatDH } from "@/lib/products";

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
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

interface Product {
  id: number;
  name: string;
  price: number;
  old_price?: number;
  image: string;
  category: string;
  description?: string; 
  stock: number;
}

function AdminDashboard() {
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "products">("orders");
  const navigate = useNavigate();

  // State ديال الطلبات والمنتجات
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // States الخاصة بتحميل الصورة والمنتج الجديد
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    old_price: "",
    category: "Smart Home",
    description: "", 
    stock: "10",
  });

  // States الخاصة بـ إرسال الطلب مع الـ Livreur
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [livreurPhone, setLivreurPhone] = useState("");
  const [livreurName, setLivreurName] = useState("");
  const [isLivreurModalOpen, setIsLivreurModalOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate({ to: "/login" });
        return;
      }
      setChecking(false);
      fetchOrders();
      fetchProducts();
    };
    checkAuth();
  }, [navigate]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setOrders(data as Order[]);
    setLoadingOrders(false);
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });

    if (!error && data) setProducts(data as Product[]);
    setLoadingProducts(false);
  };

  // 🔥 الدالة الجديدة لتغيير الـ Status ديريكت من الجدول
  const handleStatusChange = async (id: number, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      // تحديث الستيت المحلي فالبلاصة بلا ما يحتاج ريفريش تقيل
      setOrders(orders.map(order => order.id === id ? { ...order, status: newStatus } : order));
    } else {
      alert("Erreur lors de la mise à jour du statut !");
    }
  };

  // 💡 دالة حذف الطلبية الملغية من قاعدة البيانات
  const handleDeleteOrder = async (id: number) => {
    if (confirm("Voulez-vous vraiment supprimer cette commande annulée ?")) {
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", id);
      
      if (!error) {
        fetchOrders(); // إنعاش القائمة فالبلاصة
      } else {
        alert("Erreur lors de la suppression de la commande !");
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      alert("Veuillez remplir les champs obligatoires (Nom, Prix)");
      return;
    }
    if (!imageFile) {
      alert("Veuillez sélectionner une image !");
      return;
    }

    setSubmittingProduct(true);
    setUploadingImage(true);

    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("products")
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase.from("products").insert([
        {
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          old_price: newProduct.old_price ? parseFloat(newProduct.old_price) : null,
          image: publicUrl,
          category: newProduct.category,
          description: newProduct.description || null, 
          stock: Number(newProduct.stock), 
        },
      ]);

      if (insertError) throw insertError;

      setNewProduct({ name: "", price: "", old_price: "", category: "Smart Home", description: "", stock: "10" });
      setImageFile(null);
      setImagePreview("");
      fetchProducts();
      alert("Produit ajouté avec succès !");
    } catch (err: any) {
      alert("Erreur: " + (err.message || "Une erreur est survenue."));
    } finally {
      setSubmittingProduct(false);
      setUploadingImage(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm("Voulez-vous vraiment supprimer ce product ?")) {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (!error) fetchProducts();
    }
  };

  const handleAssignLivreur = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !livreurPhone) return;

    const cleanClientPhone = selectedOrder.phone.replace(/\s+/g, '');
    const cleanLivreurPhone = livreurPhone.replace(/\s+/g, '');

    const msgToLivreur = `مرحباً كابتن ${livreurName || ''},\nعندك طلبية جديدة خاصة بـ Kolchi-Smart وجاهزة للتوصيل:\n\n👤 الزبون: ${selectedOrder.client_name}\n📞 هاتف: ${selectedOrder.phone}\n📍 المدينة: ${selectedOrder.city}\n🏠 العنوان: ${selectedOrder.address}\n💰 المبلغ المطلوب تحصيله: ${selectedOrder.total} DH\n\nيرجى التنسيق والاتصال بالزبون قبل الانطلاق. شكراً لك!`;
    const msgToClient = `مرحباً ${selectedOrder.client_name},\nطلبك من Kolchi-Smart تم شحنه وخرج الآن مع الموزع (Livreur) للتوصيل.\n\n🛵 الموزع: ${livreurName || 'الكابتن'}\n📞 رقم هاتف الموزع: ${livreurPhone}\n\nيرجى إبقاء الهاتف مشغلاً لاستقبال مكالمته خلال الساعات القادمة. شكراً لثقتك بنا!`;

    try {
      await supabase
        .from("orders")
        .update({ status: "expedied", livreur_phone: cleanLivreurPhone })
        .eq("id", selectedOrder.id);
    } catch (err) {
      console.log("Status update skipped");
    }

    setIsLivreurModalOpen(false);
    setLivreurPhone("");
    setLivreurName("");
    fetchOrders();

    alert("سيتم الآن فتح الواتساب لإرسال تفاصيل الطلب للموزع أولاً، ثم يمكنك مراسلة الزبون.");
    window.open(`https://wa.me/${cleanLivreurPhone}?text=${encodeURIComponent(msgToLivreur)}`, '_blank');
    
    setTimeout(() => {
      window.open(`https://wa.me/${cleanClientPhone}?text=${encodeURIComponent(msgToClient)}`, '_blank');
    }, 1000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] grid place-items-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-electric animate-spin mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Vérification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      {/* ─── NAVBAR ─── */}
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-electric rounded-lg grid place-items-center font-bold text-black">K</div>
            <span className="font-display font-bold text-lg tracking-wide">Kolchi-Smart Admin</span>
          </div>
          <nav className="flex gap-1 bg-surface p-1 rounded-xl border border-border/40">
            <button onClick={() => setActiveTab("orders")} className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${activeTab === "orders" ? "bg-electric text-black" : "text-muted-foreground hover:text-white"}`}>
              Commandes ({orders.length})
            </button>
            <button onClick={() => setActiveTab("products")} className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${activeTab === "products" ? "bg-electric text-black" : "text-muted-foreground hover:text-white"}`}>
              Produits ({products.length})
            </button>
          </nav>
        </div>
        <button onClick={handleLogout} className="inline-flex items-center gap-2 px-4 h-9 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-medium cursor-pointer">
          <LogOut className="h-4 w-4" /> Déconnexion
        </button>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        
        {/* === TAB 1: GESTION DES COMMANDES === */}
        {activeTab === "orders" && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="font-display text-3xl font-bold tracking-tight">Gestion des Commandes</h1>
              </div>
              <div className="bg-card border border-border px-4 py-2.5 rounded-xl flex items-center gap-3">
                <Package className="h-5 w-5 text-electric" />
                <div>
                  <div className="text-xs text-muted-foreground">Total Commandes</div>
                  <div className="text-lg font-bold">{orders.length}</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-card border border-border overflow-hidden">
              {loadingOrders ? (
                <div className="py-20 text-center"><Loader2 className="h-8 w-8 text-electric animate-spin mx-auto" /></div>
              ) : orders.length === 0 ? (
                <div className="py-20 text-center text-muted-foreground"><p>Aucune commande reçue.</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface border-b border-border text-muted-foreground text-xs uppercase">
                        <th className="py-4 px-6">Client</th>
                        <th className="py-4 px-6">Téléphone</th>
                        <th className="py-4 px-6">Destination</th>
                        <th className="py-4 px-6">Statut</th>
                        <th className="py-4 px-6 text-right">Montant</th>
                        <th className="py-4 px-6 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 text-sm">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-surface/30 transition">
                          <td className="py-4 px-6 font-semibold">
                            <div className="flex flex-col">
                              {order.client_name}
                            </div>
                          </td>
                          <td className="py-4 px-6"><div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-electric" />{order.phone}</div></td>
                          <td className="py-4 px-6 text-muted-foreground">{order.city}, {order.address}</td>
                          
                          {/* 🔥 الخانة المحدثة: قائمة التحكم ف الـ Statut ديريكت للـ Admin */}
                          <td className="py-4 px-6">
                            <select
                              value={order.status || "en_attente"}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              className={`text-xs font-bold rounded-xl px-2.5 py-1.5 bg-[#111115] border cursor-pointer focus:outline-none transition-colors duration-200 ${
                                order.status === "en_attente" ? "border-amber-500/30 text-amber-400" :
                                order.status === "expedied" ? "border-blue-500/30 text-blue-400" :
                                order.status === "livre" ? "border-green-500/30 text-green-400" :
                                order.status === "annule" ? "border-red-500/30 text-red-400" : "border-border text-white"
                              }`}
                            >
                              <option value="en_attente">⏳ En attente</option>
                              <option value="expedied">🛵 Expédié</option>
                              <option value="livre">✅ Livré</option>
                              <option value="annule">❌ Annulé</option>
                            </select>
                          </td>

                          <td className="py-4 px-6 text-right font-bold text-electric">{formatDH(order.total)}</td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <a href={`https://wa.me/${order.phone.replace(/\s+/g, '')}`} target="_blank" rel="noreferrer" className="inline-flex items-center h-8 px-3 rounded-lg bg-surface border border-border text-white font-medium text-xs hover:bg-[#25D366] hover:text-black hover:border-transparent transition">
                                Client
                              </a>
                              <button 
                                onClick={() => { setSelectedOrder(order); setIsLivreurModalOpen(true); }}
                                className="inline-flex items-center gap-1 h-8 px-3 rounded-lg bg-electric text-black font-bold text-xs hover:scale-105 transition cursor-pointer"
                              >
                                <Truck className="h-3.5 w-3.5" /> Livreur
                              </button>
                              
                              <button 
                                onClick={() => handleDeleteOrder(order.id)}
                                className="h-8 w-8 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg flex items-center justify-center cursor-pointer transition"
                                title="Supprimer la commande"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* === TAB 2: GESTION DES PRODUITS === */}
       {activeTab === "products" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-card border border-border p-6 rounded-2xl h-fit sticky top-24 shadow-glow">
              <div className="flex items-center gap-2 mb-6">
                <FolderPlus className="h-5 w-5 text-electric" />
                <h2 className="text-lg font-bold font-display">Ajouter un Produit</h2>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Nom du produit *</label>
                  <input type="text" required value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className="w-full h-10 rounded-xl bg-surface border border-border px-3 text-sm focus:outline-none focus:border-electric" placeholder="Ex: Smart Watch X8" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Prix Actuel (DH) *</label>
                    <input type="number" required value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} className="w-full h-10 rounded-xl bg-surface border border-border px-3 text-sm focus:outline-none focus:border-electric" placeholder="199" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Ancien Prix (DH)</label>
                    <input type="number" value={newProduct.old_price} onChange={(e) => setNewProduct({...newProduct, old_price: e.target.value})} className="w-full h-10 rounded-xl bg-surface border border-border px-3 text-sm focus:outline-none focus:border-electric" placeholder="299" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Description du produit</label>
                  <textarea value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} className="w-full h-24 rounded-xl bg-surface border border-border p-3 text-sm focus:outline-none focus:border-electric resize-none" placeholder="اكتب وصف المنتج هنا..." rows={3} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Quantité en Stock *</label>
                  <input type="number" required min="0" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} className="w-full h-10 rounded-xl bg-surface border border-border px-3 text-sm focus:outline-none focus:border-electric" placeholder="Ex: 50" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Image du produit *</label>
                  <div className="relative group border border-dashed border-border/80 hover:border-electric/50 rounded-xl p-4 bg-surface text-center cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" />
                    {imagePreview ? (
                      <div className="flex flex-col items-center gap-2">
                        <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-lg border border-border bg-card" />
                        <span className="text-[11px] text-muted-foreground truncate max-w-[200px]">{imageFile?.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-2 text-muted-foreground">
                        <Upload className="h-6 w-6 mb-1.5 text-muted-foreground group-hover:text-electric" />
                        <span className="text-xs font-semibold text-white mb-0.5">Choisir une image</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Catégorie</label>
                  <select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} className="w-full h-10 rounded-xl bg-surface border border-border px-3 text-sm focus:outline-none focus:border-electric">
                    <option value="Phone Accessories">Phone Accessories</option>
                    <option value="Smart Home">Smart Home</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Bluetooth">Bluetooth</option>
                    <option value="LED & RGB">LED & RGB</option>
                    <option value="Mini Gadgets">Mini Gadgets</option>
                  </select>
                </div>
                <button type="submit" disabled={submittingProduct || uploadingImage} className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-electric text-black font-bold shadow-glow hover:scale-[1.01] transition disabled:opacity-50 cursor-pointer">
                  {submittingProduct ? <Loader2 className="h-4 w-4 animate-spin" /> : <><PlusCircle className="h-4 w-4" /> Ajouter le produit</>}
                </button>
              </form>
            </div>

            {/* عرض المنتجات الحالية وحذفها */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-bold font-display">Liste des Produits ({products.length})</h2>
              {loadingProducts ? (
                <div className="py-10 text-center"><Loader2 className="h-6 w-6 text-electric animate-spin mx-auto" /></div>
              ) : products.length === 0 ? (
                <div className="p-8 border border-border rounded-2xl text-center text-muted-foreground">Aucun produit en stock.</div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {products.map((prod) => (
                    <div key={prod.id} className="bg-card border border-border p-4 rounded-2xl flex gap-4 items-center relative group">
                      <img src={prod.image} alt={prod.name} className="h-16 w-16 rounded-xl object-cover bg-surface border border-border" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{prod.name}</h4>
                        <div className="text-xs text-muted-foreground mt-0.5">{prod.category} • <span className={prod.stock > 0 ? "text-green-400" : "text-red-400"}>Stock: {prod.stock}</span></div>
                        <div className="text-sm font-bold text-electric mt-1">{formatDH(prod.price)}</div>
                      </div>
                      <button onClick={() => handleDeleteProduct(prod.id)} className="h-8 w-8 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 absolute top-4 right-4 cursor-pointer">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* === MODAL : ASSIGNER LIVREUR === */}
      {isLivreurModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 relative shadow-glow">
            <button onClick={() => setIsLivreurModalOpen(false)} className="absolute top-4 right-4 h-8 w-8 rounded-lg hover:bg-surface flex items-center justify-center text-muted-foreground hover:text-white transition cursor-pointer">
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 mb-4">
              <Truck className="h-5 w-5 text-electric" />
              <h3 className="text-lg font-bold font-display">Assigner à un Livreur</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Commande de <strong>{selectedOrder.client_name}</strong> ({formatDH(selectedOrder.total)})</p>
            
            <form onSubmit={handleAssignLivreur} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Nom du livreur</label>
                <input type="text" value={livreurName} onChange={(e) => setLivreurName(e.target.value)} className="w-full h-10 rounded-xl bg-surface border border-border px-3 text-sm focus:outline-none focus:border-electric" placeholder="Ex: Amine" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Téléphone du livreur *</label>
                <input type="tel" required value={livreurPhone} onChange={(e) => setLivreurPhone(e.target.value)} className="w-full h-10 rounded-xl bg-surface border border-border px-3 text-sm focus:outline-none focus:border-electric" placeholder="0600000000" />
              </div>
              <button type="submit" className="w-full h-11 bg-electric text-black font-bold rounded-xl shadow-glow transition hover:scale-[1.01] cursor-pointer text-sm">
                Confirmer & Envoyer sur WhatsApp
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}