import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/types/product";

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  discountedPrice?: number; // السعر المحسوم
}

export interface FavoriteItem {
  product: Product;
}

interface CartState {
  items: CartItem[];
  favorites: FavoriteItem[];
}

const initialState: CartState = {
  items: [],
  favorites: [],
};

// دالة لرفع البيانات إلى الخادم
const sendToServer = async (productId: number, size?: string, quantity = 1, discountedPrice?: number) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    await fetch("http://127.0.0.1:8000/api/cart/add/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ product_id: productId, size, quantity, discountedPrice }),
    });
  } catch (err) {
    console.error("❌ Failed to sync cart to server", err);
  }
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
addItem: (state, action: PayloadAction<{ product: Product; size?: string }>) => {
  const { product, size } = action.payload;
  const existingItem = state.items.find(
    (item) => item.product.id === product.id && item.size === size
  );

  const price = product.price ?? 0; // نستخدم السعر كما هو بدون حساب خصم هنا

  // لا نطبق خصم هنا في Redux، نترك عملية تطبيق الخصم للواجهة الأمامية
  const discountedPrice = price;  // تخزين السعر بدون خصم في Redux

  if (existingItem) {
    if (existingItem.quantity < product.quantity) {
      existingItem.quantity += 1;
      // فقط تخزين السعر بدون خصم هنا
      existingItem.discountedPrice = discountedPrice; 
      sendToServer(product.id, size, 1, discountedPrice); // إرسال السعر بدون خصم إلى الخادم
    }
  } else {
    // إضافة المنتج مع السعر الأساسي
    state.items.push({ product, quantity: 1, size, discountedPrice });
    sendToServer(product.id, size, 1, discountedPrice); // إرسال السعر بدون خصم إلى الخادم
  }
},

    removeItem: (state, action: PayloadAction<{ productId: number; size?: string }>) => {
      const { productId, size } = action.payload;
      state.items = state.items.reduce<CartItem[]>((acc, item) => {
        if (item.product.id === productId && item.size === size) {
          if (item.quantity > 1) {
            // تأكد من أن `discountedPrice` ليس `undefined` باستخدام القيمة الافتراضية
            item.discountedPrice = item.discountedPrice ?? 0;

            // إعادة حساب الحسم
            item.discountedPrice = item.discountedPrice * (item.quantity - 1) / item.quantity;
            acc.push({ ...item, quantity: item.quantity - 1 });
          }
        } else {
          acc.push(item);
        }
        return acc;
      }, []);
    },
    // إضافة خصم إضافي على كامل السلة هنا يمكن تخصيصه بناءً على توجيه من المستخدم
    applyCartDiscount: (state, action: PayloadAction<number>) => {
      state.items = state.items.map(item => {
        // التأكد من أن `discountedPrice` ليس `undefined`
        const newPrice = (item.discountedPrice ?? 0) * (1 - action.payload);
        return { ...item, discountedPrice: newPrice };
      });
    },
    // حذف المنتج مع الحفاظ على الحسم
    deleteCartProduct: (state, action: PayloadAction<{ productId: number; size?: string }>) => {
      const { productId, size } = action.payload;
      state.items = state.items.filter(
        (item) => item.product.id !== productId || item.size !== size
      );
    },
    resetCart: (state) => {
      state.items = [];
    },
    addFavorite: (state, action: PayloadAction<Product>) => {
      const isFav = state.favorites.some((item) => item.product.id === action.payload.id);
      if (!isFav) {
        state.favorites.push({ product: action.payload });
      }
    },
    removeFavorite: (state, action: PayloadAction<number>) => {
      state.favorites = state.favorites.filter((item) => item.product.id !== action.payload);
    },
  },
});

export const {
  addItem,
  removeItem,
  deleteCartProduct,
  resetCart,
  addFavorite,
  removeFavorite,
} = cartSlice.actions;

export default cartSlice.reducer;
