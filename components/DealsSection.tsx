"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // استخدم framer-motion
import ProductCard from "@/components/ProductCard";
import Container from "@/components/Container";
import Loading from "@/components/Loading";

const DealsSection = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/api/products/") // عدّل حسب رابطك
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <Container className="">
      <h2 className="my-5 font-semibold text-xl underline underline-offset-4 decoration-[1px]">
        Get your best shopping deals with us
      </h2>

      {loading ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <AnimatePresence>
            {products.map((product: any) => (
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
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </Container>
  );
};

export default DealsSection;
