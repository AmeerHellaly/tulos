"use client";

import { Product } from "@/types/product";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
}

export interface FavoriteItem {
  product: Product;
}

interface CartState {
  items: CartItem[];
  favorites: FavoriteItem[];
  addItem: (product: Product, size?: string) => boolean;
  removeItem: (productId: number, size?: string) => void;
  deleteCartProduct: (productId: number, size?: string) => void;
  resetCart: () => void;
  getTotalPrice: () => number;
  getSubTotalPrice: () => number;
  getItemCount: (productId: number, size?: string) => number;
  getGroupedItems: () => CartItem[];
  addFavorite: (product: Product) => void;
  removeFavorite: (productId: number) => void;
  isFavorite: (productId: number) => boolean;
  getFavorites: () => FavoriteItem[];
}

// 📤 دالة إرسال المنتج للسيرفر
const sendToServer = async (productId: number, size?: string, quantity = 1) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    await fetch("http://127.0.0.1:8000/api/cart/add/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ product_id: productId, size, quantity }),
    });
  } catch (err) {
    console.error("❌ Failed to sync cart to server", err);
  }
};

const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      favorites: [],

      addItem: (product, size) => {
        let wasAdded = false;

        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id && item.size === size
          );

          const variant = product.variants?.find((v) => v.size === size);
          const maxQuantity = variant ? variant.quantity : (product.quantity ?? 1);

          if (existingItem) {
            if (existingItem.quantity < maxQuantity) {
              wasAdded = true;
              sendToServer(product.id, size, 1);
              return {
                items: state.items.map((item) =>
                  item.product.id === product.id && item.size === size
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
                ),
              };
            }
            return {};
          } else {
            wasAdded = true;
            sendToServer(product.id, size, 1);
            return {
              items: [...state.items, { product, quantity: 1, size }],
            };
          }
        });

        return wasAdded;
      },

      removeItem: (productId, size) =>
        set((state) => ({
          items: state.items.reduce((acc, item) => {
            if (item.product.id === productId && item.size === size) {
              if (item.quantity > 1) {
                acc.push({ ...item, quantity: item.quantity - 1 });
              }
            } else {
              acc.push(item);
            }
            return acc;
          }, [] as CartItem[]),
        })),

      deleteCartProduct: (productId, size) =>
        set((state) => ({
          items: state.items.filter(
            ({ product, size: s }) => product?.id !== productId || s !== size
          ),
        })),

      resetCart: () => set({ items: [] }),

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + (item.product.price ?? 0) * item.quantity,
          0
        );
      },

      getSubTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = item.product.price ?? 0;
          const discount = ((item.product.discount ?? 0) * price) / 100;
          const discountedPrice = price - discount;
          return total + discountedPrice * item.quantity;
        }, 0);
      },

      getItemCount: (productId, size) => {
        const item = get().items.find(
          (item) => item.product.id === productId && item.size === size
        );
        return item ? item.quantity : 0;
      },

      getGroupedItems: () => {
        const grouped: Record<string, CartItem> = {};
        for (const item of get().items) {
          const key = `${item.product.id}-${item.size || "default"}`;
          if (grouped[key]) {
            grouped[key].quantity += item.quantity;
          } else {
            grouped[key] = { ...item };
          }
        }
        return Object.values(grouped);
      },

      addFavorite: (product) => {
        const isFav = get().favorites.some((item) => item.product.id === product.id);

        const validProduct: Product = {
          id: product.id,
          name: product.name || "Unnamed Product",
          slug: product.slug || `product-${product.id}`,
          price: typeof product.price === "string" ? parseFloat(product.price) : product.price || 0,
          image: product.image || "/fallback.jpg",
          quantity: product.quantity ?? 0,
          description: product.description || "",
          created_at: product.created_at || "",
          category: product.category || null,
        };

        if (!isFav) {
          set((state) => ({
            favorites: [...state.favorites, { product: validProduct }],
          }));
        }
      },

      removeFavorite: (productId) =>
        set((state) => ({
          favorites: state.favorites.filter((item) => item.product.id !== productId),
        })),

      isFavorite: (productId) => {
        return get().favorites.some((item) => item.product.id === productId);
      },

      getFavorites: () => get().favorites,
    }),
    { name: "cart-store" }
  )
);

export default useCartStore;
