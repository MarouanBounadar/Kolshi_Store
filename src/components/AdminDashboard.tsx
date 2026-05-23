import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Trash2, PlusCircle, Loader2, Upload } from "lucide-react";

const SITE_CATEGORIES = [
  { name: "Phone Accessories", slug: "phone-accessories" },
  { name: "Smart Home", slug: "smart-home" },
  { name: "Gaming", slug: "gaming" },
  { name: "Bluetooth", slug: "bluetooth" },
  { name: "LED & RGB", slug: "led-rgb" },
  { name: "Mini Gadgets", slug: "mini-gadgets" }
];

// رجعناها دابا export default باش يطير المشكل ديال الـ routes نهائياً
export default function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // خانات الفورم
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [category, setCategory] = useState("Phone Accessories");
  const [imageUrl, setImageUrl] = useState(""); 
  const [description, setDescription] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (data && !error) {
      const formatted = data.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        oldPrice: p.old_price,
        category: p.category,
        image: p.image
      }));
      setProducts(formatted);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from("products").getPublicUrl(filePath);
      
      if (data?.publicUrl) {
        setImageUrl(data.publicUrl);
      }
    } catch (error: any) {
      alert("Erreur lors du téléchargement de l'image: " + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !imageUrl) {
      alert("Veuillez remplir les champs obligatoires (Nom, Prix, Image)");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("products").insert([
      {
        name,
        price: Number(price),
        old_price: oldPrice ? Number(oldPrice) : null,
        category,
        image: imageUrl,
        description: description || ""
      }
    ]);

    if (error) {
      alert("Erreur lors de l'ajout: " + error.message);
    } else {
      alert("Produit ajouté avec succès ! 🎉");
      setName("");
      setPrice("");
      setOldPrice("");
      setImageUrl("");
      setDescription("");
      fetchProducts();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Voulez-vous vraiment supprimer ce produit ?")) {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (!error) {
        fetchProducts();
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 text-white">
      <h1 className="font-display text-3xl font-bold mb-8 text-center text-electric">
        Tableau de Bord Admin — Kolchi-Smart
      </h1>

      <form onSubmit={handleAddProduct} className="bg-surface border border-border p-6 rounded-2xl mb-12 space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
          <PlusCircle className="h-5 w-5 text-electric" /> Ajouter un nouveau produit
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Nom du produit *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-background border border-border rounded-xl p-3 text-sm text-white focus:outline-none focus:border-electric" placeholder="Ex: Smart Watch Ultra" />
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-1">Catégorie *</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-background border border-border rounded-xl p-3 text-sm text-white focus:outline-none focus:border-electric" style={{ backgroundColor: "#141414" }}>
              {SITE_CATEGORIES.map((cat) => (
                <option key={cat.slug} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Prix Actuel (DH) *</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-background border border-border rounded-xl p-3 text-sm text-white focus:outline-none focus:border-electric" placeholder="45" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Ancien Prix (DH)</label>
            <input type="number" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} className="w-full bg-background border border-border rounded-xl p-3 text-sm text-white focus:outline-none focus:border-electric" placeholder="66" />
          </div>
        </div>

        {/* خانة الرفع المباشر من الجهاز */}
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Image du produit *</label>
          <div className="flex items-center gap-4">
            <label className="flex-1 flex items-center justify-center gap-2 border border-dashed border-border hover:border-electric/60 rounded-xl p-4 cursor-pointer bg-background transition">
              {uploadingImage ? (
                <><Loader2 className="h-5 w-5 animate-spin text-electric" /> <span>Téléchargement...</span></>
              ) : imageUrl ? (
                <span className="text-electric font-semibold text-sm truncate">✓ Image prête à l'envoi</span>
              ) : (
                <><Upload className="h-5 w-5 text-muted-foreground" /> <span className="text-sm text-muted-foreground">Choisir une image depuis l'appareil</span></>
              )}
              <input type="file" accept="image/*" onChange={handleImageChange} disabled={uploadingImage} className="hidden" />
            </label>
            {imageUrl && (
              <img src={imageUrl} alt="Aperçu" className="h-14 w-14 object-cover rounded-xl border border-border bg-card" />
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs text-muted-foreground mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-background border border-border rounded-xl p-3 text-sm text-white focus:outline-none focus:border-electric h-24" placeholder="Détails du produit..." />
        </div>

        <button type="submit" disabled={submitting || uploadingImage} className="w-full gradient-electric text-white font-semibold p-3 rounded-xl shadow-glow hover:scale-[1.01] transition flex items-center justify-center gap-2 disabled:opacity-50">
          {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "إضافة المنتج للموقع"}
        </button>
      </form>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border bg-card/50">
          <h3 className="font-bold">المنتجات الحالية بالموقع ({products.length})</h3>
        </div>

        {loading ? (
          <div className="text-center py-10 text-muted-foreground animate-pulse">Chargement...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">Aucun produit en ligne.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-background text-xs text-muted-foreground uppercase border-b border-border">
                <tr>
                  <th className="p-4 text-left">التحكم</th>
                  <th className="p-4">السعر القديم</th>
                  <th className="p-4">السعر الحالي</th>
                  <th className="p-4">القسم</th>
                  <th className="p-4 text-center">صورة</th>
                  <th className="p-4">اسم المنتج</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-border hover:bg-card/30 transition">
                    <td className="p-4 text-left flex gap-2">
                      <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition" title="حذف">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                    <td className="p-4 text-muted-foreground line-through">
                      {product.oldPrice ? `${product.oldPrice} DH` : "—"}
                    </td>
                    <td className="p-4 text-electric font-bold">{product.price} DH</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-card border border-border rounded-md text-xs">
                        {product.category}
                      </span>
                    </td>
                    <td className="p-4 grid place-items-center">
                      <img src={product.image} alt="" className="h-10 w-10 object-cover rounded-lg border border-border" />
                    </td>
                    <td className="p-4 font-semibold">{product.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}