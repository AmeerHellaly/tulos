"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PriceFormatter from "./PriceFormatter";
import { Button } from "./ui/button";
import QuantityButtons from "./QuantityButtons";
import { Product } from "@/types/product";
import { cn } from "@/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/index";
import { addItem } from "@/store/cartSlice";

interface Props {
  product: Product;
  className?: string;
  size?: string;
}

const AddToCartButton = ({ product, className, size }: Props) => {
  const dispatch = useDispatch();
  const [isClient, setIsClient] = useState(false);

  // الحصول على الكمية في السلة
  const quantityInCart = useSelector((state: RootState) => {
    return (
      state.cart.items.find(
        (item) => item.product.id === product.id && item.size === size
      )?.quantity || 0
    );
  });

  const price = product.price ?? 0;

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const handleAddToCart = () => {
    if (!size) {
      toast.error("Please select a size.");
      return;
    }

    const variant = product.variants?.find((v) => v.size === size);
    const maxQuantity = variant ? variant.quantity : product.quantity ?? 1;

    if (quantityInCart < maxQuantity) {
      dispatch(addItem({ product, size }));
      toast.success("Item added to cart");
    } else {
      toast.error("Reached max stock for this size");
    }
  };

  const subtotal = price * quantityInCart;

  return (
    <div className="w-full h-12 flex items-center">
      {quantityInCart > 0 ? (
        <div className="text-sm w-full">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Quantity</span>
            <QuantityButtons product={product} size={size} />
          </div>
          <div className="flex items-center justify-between border-t pt-1">
            <span className="text-xs font-semibold">Subtotal</span>
            <PriceFormatter amount={subtotal} className="text-xs" />
          </div>
        </div>
      ) : (
        <Button
          onClick={handleAddToCart}
          className={cn(
            "w-full bg-transparent text-darkColor shadow-none border border-darkColor/30 font-semibold tracking-wide hover:text-white cursor-pointer hoverEffect",
            className
          )}
        >
          Add to cart
        </Button>
      )}
    </div>
  );
};

export default AddToCartButton;
