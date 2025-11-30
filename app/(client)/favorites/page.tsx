"use client";

import React from "react";
// ✅ استبدال useCartStore
// import useCartStore from "@/store";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

import ProductCard from "@/components/ProductCard";
import Container from "@/components/Container";
import { motion, AnimatePresence } from "framer-motion";

const FavoritesPage = () => {
  // ✅ استخدام Redux للوصول إلى favorites
  const favorites = useSelector((state: RootState) => state.cart.favorites);

  return (
    <Container className="py-10">
      <h1 className="text-2xl font-bold mb-6">My Favorite Products</h1>

      {favorites.length === 0 ? (
        <p className="text-gray-600">
          You haven't added any favorite products yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {favorites.map(({ product }) => (
              <motion.div
                key={`${product.id}-${product.slug}`} // ✅ مفتاح فريد
                layout
                initial={{ opacity: 0.2 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ProductCard
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  price={
                    typeof product.price === "string"
                      ? parseFloat(product.price)
                      : product.price
                  }
                  image={product.image || "/fallback.jpg"} // ✅ صورة احتياطية
                  quantity={product.quantity ?? 0}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </Container>
  );
};

export default FavoritesPage;
