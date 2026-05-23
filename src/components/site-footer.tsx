import { Link } from "@tanstack/react-router";
// 1️⃣ زدنا MessageSquare أو تختار أيقونة الهاتف، وبما أن lucide مافيهاش أيقونة واتساب رسمية، كنخدمو بـ Phone أو MessageCircle كبديل أنيق، أو نمرروها ديريكت
import { Facebook, Instagram, MessageCircle, Mail, Phone, MapPin, Zap } from "lucide-react";

export function SiteFooter() {
  // 🔗 هنا مجموعين الروابط بثلاثة: إنستغرام، فيسبوك، وواتساب
  const socialLinks = [
    {
      Icon: Instagram,
      url: "https://www.instagram.com/_faillander/", // 👈 حط رابط انستغرام ديالك هنا
      label: "Instagram",
      hoverClass: "hover:bg-pink-600" // لون اختياري عند التمرير
    },
    {
      Icon: Facebook,
      url: "https://www.facebook.com/marwan.bounadar.5/", // 👈 حط رابط فيسبوك ديالك هنا
      label: "Facebook",
      hoverClass: "hover:bg-blue-600"
    },
    {
      Icon: MessageCircle, // 👈 أيقونة الشات للواتساب
      url: "https://wa.me/212702327181", // 👈 رابط الواتساب المباشر بالرقم ديالك
      label: "WhatsApp",
      hoverClass: "hover:bg-green-600"
    }
  ];

  return (
    <footer className="mt-24 border-t border-border bg-surface/50">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg gradient-electric grid place-items-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg">Kolchi<span className="text-electric">-Smart</span></span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            Smart gadgets et accessoires électroniques aux meilleurs prix au Maroc. Paiement à la livraison disponible partout dans le royaume.
          </p>
          
          {/* 📱 عرض الأيقونات بثلاثة */}
          <div className="flex gap-3 mt-5">
            {socialLinks.map((item, i) => (
              <a 
                key={i} 
                href={item.url} 
                target="_blank" 
                rel="noreferrer" 
                aria-label={item.label}
                className="h-9 w-9 rounded-full bg-surface-2 grid place-items-center hover:bg-electric hover:text-electric-foreground transition cursor-pointer"
              >
                <item.Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display font-semibold mb-3">Boutique</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/products" className="hover:text-electric">Tous les produits</Link></li>
            <li><Link to="/products" search={{ cat: "bluetooth" }} className="hover:text-electric">Bluetooth</Link></li>
            <li><Link to="/products" search={{ cat: "gaming" }} className="hover:text-electric">Gaming</Link></li>
            <li><Link to="/products" search={{ cat: "led" }} className="hover:text-electric">LED & RGB</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold mb-3">Aide</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/contact" className="hover:text-electric">Contact</Link></li>
            <li><a href="#" className="hover:text-electric">Politique de livraison</a></li>
            <li><a href="#" className="hover:text-electric">Politique de retour</a></li>
            <li><a href="#" className="hover:text-electric">FAQ</a></li>
          </ul>
        </div>

        <div className="col-span-2 md:col-span-4 border-t border-border pt-6 grid sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-electric" /> +212 702327181</div>
          <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-electric" /> contact@kolchi-smart.ma</div>
          <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-electric" /> Kenitra, Maroc</div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} Kolchi-Smart. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}