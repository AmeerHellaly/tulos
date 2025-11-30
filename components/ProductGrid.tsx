"use client";

import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import HomeTabbar from "./new/HomeTabbar";
import NoProductAvailable from "./new/NoProductAvailable";
import { Loader2 } from "lucide-react";
import ProtectedWrapper from "./ProtectedWrapper"; // استدعاء الملف الجديد

const ProductGrid = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>("All");

  useEffect(() => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/api/products/")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredProducts =
    selectedTab === "All"
      ? products
      : products.filter(
          (product: any) => product.category?.name === selectedTab
        );

  return (
    <ProtectedWrapper>
      <div className="py-5 flex flex-col gap-5">
        <HomeTabbar selectedTab={selectedTab} onTabSelect={setSelectedTab} />

        <div className="w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 min-h-80 space-y-4 text-center bg-gray-100 rounded-lg w-full">
              <motion.div className="flex items-center space-x-2 text-blue-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Product is loading...</span>
              </motion.div>
            </div>
          ) : filteredProducts?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
              <AnimatePresence>
                {filteredProducts.map((product: any) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0.2 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <ProductCard
                      id={product.id}
                      name={product.name}
                      slug={product.slug}
                      price={product.price}
                      image={product.image}
                      quantity={product.quantity}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <NoProductAvailable className="mt-0 w-full" />
          )}
        </div>
      </div>
    </ProtectedWrapper>
  );
};

export default ProductGrid;
