import earbuds from "@/assets/p-earbuds.jpg";
import printer from "@/assets/p-printer.jpg";
import led from "@/assets/p-led.jpg";
import watch from "@/assets/p-watch.jpg";
import speaker from "@/assets/p-speaker.jpg";
import holder from "@/assets/p-holder.jpg";
import powerbank from "@/assets/p-powerbank.jpg";
import mouse from "@/assets/p-mouse.jpg";

export type Product = {
  id: string;
  name: string;
  nameAr?: string;
  price: number;
  oldPrice: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  trending?: boolean;
  description: string;
};

export const CATEGORIES = [
  { slug: "phone", name: "Phone Accessories", icon: "Smartphone" },
  { slug: "home", name: "Smart Home", icon: "Home" },
  { slug: "gaming", name: "Gaming", icon: "Gamepad2" },
  { slug: "bluetooth", name: "Bluetooth", icon: "Bluetooth" },
  { slug: "led", name: "LED & RGB", icon: "Lightbulb" },
  { slug: "mini", name: "Mini Gadgets", icon: "Cpu" },
] as const;

export const PRODUCTS: Product[] = [
  { id: "earbuds", name: "Wireless Earbuds Pro", price: 199, oldPrice: 349, image: earbuds, category: "bluetooth", rating: 4.8, reviews: 1248, trending: true, description: "True wireless earbuds with active noise cancellation, 24h battery, and crystal clear sound. Perfect for music, calls and gaming." },
  { id: "printer", name: "Mini Thermal Printer", price: 249, oldPrice: 399, image: printer, category: "mini", rating: 4.6, reviews: 892, trending: true, description: "Pocket-sized thermal printer for receipts, notes and photos. Bluetooth connection with any smartphone." },
  { id: "led", name: "RGB LED Strip 5M", price: 89, oldPrice: 159, image: led, category: "led", rating: 4.9, reviews: 2340, trending: true, description: "Smart RGB LED strip with app and remote control. 16 million colors, music sync, and dynamic effects." },
  { id: "watch", name: "Smart Watch Ultra", price: 349, oldPrice: 599, image: watch, category: "phone", rating: 4.7, reviews: 1567, description: "AMOLED smartwatch with heart-rate, SpO2, GPS, calls and 100+ workout modes. 7-day battery." },
  { id: "speaker", name: "Bluetooth Speaker X1", price: 179, oldPrice: 299, image: speaker, category: "bluetooth", rating: 4.7, reviews: 743, description: "Portable bluetooth speaker with deep bass, waterproof IPX7 and 20h playtime." },
  { id: "holder", name: "Adjustable Phone Holder", price: 49, oldPrice: 99, image: holder, category: "phone", rating: 4.5, reviews: 432, description: "Premium aluminum stand. Fold-flat design, adjustable angle. Works with all phones and tablets." },
  { id: "powerbank", name: "Power Bank 20.000 mAh", price: 159, oldPrice: 259, image: powerbank, category: "phone", rating: 4.8, reviews: 1102, trending: true, description: "Slim power bank with digital display and PD fast charging. Charge your phone 5+ times." },
  { id: "mouse", name: "RGB Gaming Mouse", price: 129, oldPrice: 229, image: mouse, category: "gaming", rating: 4.6, reviews: 658, description: "12 800 DPI gaming mouse with customizable RGB, 7 programmable buttons and ultra-light shell." },
];

export const getProduct = (id: string) => PRODUCTS.find((p) => p.id === id);
export const formatDH = (n: number) => `${n.toLocaleString("fr-FR")} DH`;
