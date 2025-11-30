// types/product.ts
export type Product = {
  discount: number;
  id: number;
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
  description?: string;
  created_at?: string;
  category?: any;
  virtual_try_on?: boolean; // ✅ Virtual Try-On support
  variants?: {
    id: number;
    size: string;
    quantity: number;
  }[];
};
