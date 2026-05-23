import { useEffect, useState, useSyncExternalStore } from "react";
import type { Product } from "./products";

export type CartItem = { product: Product; qty: number };

const KEY = "kolchi-cart";
let items: CartItem[] = [];
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) items = JSON.parse(raw);
  } catch { /* noop */ }
}

function emit() {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(items));
  }
  listeners.forEach((l) => l());
}

export const cart = {
  add(product: Product, qty = 1) {
    const existing = items.find((i) => i.product.id === product.id);
    if (existing) existing.qty += qty;
    else items = [...items, { product, qty }];
    emit();
  },
  remove(id: string) {
    items = items.filter((i) => i.product.id !== id);
    emit();
  },
  setQty(id: string, qty: number) {
    items = items.map((i) => (i.product.id === id ? { ...i, qty: Math.max(1, qty) } : i));
    emit();
  },
  clear() { items = []; emit(); },
  get(): CartItem[] { return items; },
  subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); },
};

export function useCart() {
  // SSR-safe subscription
  const snap = useSyncExternalStore(
    (l) => cart.subscribe(l),
    () => items,
    () => [] as CartItem[],
  );
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const data = mounted ? snap : [];
  const count = data.reduce((s, i) => s + i.qty, 0);
  const total = data.reduce((s, i) => s + i.qty * i.product.price, 0);
  return { items: data, count, total };
}
