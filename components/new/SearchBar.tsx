"use client";

import { Loader2, Search, X } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import AddToCartButton from "../AddToCartButton";
import PriceView from "../PriceView";
import Image from "next/image";
import Link from "next/link";

const SearchBar = () => {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const fetchProducts = useCallback(async () => {
    if (!search) {
      setProducts([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/products/?search=${search}`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching search results:", err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [search, fetchProducts]);

  return (
    <Dialog open={showSearch} onOpenChange={() => setShowSearch(!showSearch)}>
      <DialogTrigger
        onClick={() => setShowSearch(!showSearch)}
        className="flex items-center hover:cursor-pointer"
      >
        <Search className="w-5 h-5 hover:text-darkColor hoverEffect" />
      </DialogTrigger>
      <DialogContent className="max-w-5xl min-h-[90vh] max-h-[90vh] flex flex-col overflow-hidden bg-white">
        <DialogHeader>
          <DialogTitle className="mb-3">Product Searchbar</DialogTitle>
          <form className="relative" onSubmit={(e) => e.preventDefault()}>
            <Input
              placeholder="Search your product here..."
              className="flex-1 rounded-md py-5 font-semibold"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <X
                onClick={() => setSearch("")}
                className="w-4 h-4 absolute top-3 right-11 hover:text-red-600 hoverEffect"
              />
            )}
            <button
              type="submit"
              className="absolute right-0 top-0 bg-darkColor/10 w-10 h-full flex items-center justify-center rounded-tr-md hover:bg-darkColor hover:text-white hoverEffect"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
        </DialogHeader>
        <div className="w-full h-full overflow-y-scroll border border-darkColor/20 rounded-md bg-white">
          {loading ? (
            <p className="flex items-center px-6 gap-1 py-10 text-center text-green-600 font-semibold">
              <Loader2 className="w-5 h-5 animate-spin" /> Searching on progress...
            </p>
          ) : products.length > 0 ? (
            products.map((product) => (
              <div
                key={product.id}
                className="bg-white overflow-hidden border-b"
              >
                <div className="flex items-center p-1">
                  <Link
                    href={`/product/${product.slug}`}
                    onClick={() => setShowSearch(false)}
                    className="h-20 w-20 md:h-24 md:w-24 flex-shrink-0 border border-darkColor/20 rounded-md overflow-hidden group"
                  >
                    <Image
                      width={200}
                      height={200}
                      src={product.image}
                      alt={product.name || "product image"}
                      className="object-cover w-full h-full group-hover:scale-110 hoverEffect"
                    />
                  </Link>
                  <div className="px-4 py-2 flex-grow">
                    <div className="flex justify-between items-start">
                      <Link
                        href={`/product/${product.slug}`}
                        onClick={() => setShowSearch(false)}
                      >
                        <h3 className="text-sm md:text-lg font-semibold text-gray-800 line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {product.description?.slice(0, 60)}...
                        </p>
                      </Link>
                      <PriceView className="md:text-lg" amount={product.price} />
                    </div>
                    <div className="w-60 mt-1">
                      <AddToCartButton product={product} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            search && (
              <div className="text-center py-10 font-semibold tracking-wide">
                <p>
                  Nothing matches the keyword <span className="underline text-red-600">{search}</span>.
                </p>
                <p className="text-green-600 flex items-center justify-center gap-1">
                  <Search className="w-5 h-5" /> Search and explore your products from Tulos.
                </p>
              </div>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchBar;
