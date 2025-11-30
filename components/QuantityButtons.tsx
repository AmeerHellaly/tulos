"use client";

import React from "react";
import { Button } from "./ui/button";
import { HiMinus, HiPlus } from "react-icons/hi2";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/index";
import { addItem, removeItem } from "@/store/cartSlice";
import { twMerge } from "tailwind-merge";
import { Product } from "@/types/product";

interface Props {
  product: Product;
  className?: string;
  borderStyle?: string;
  size?: string;
}

const QuantityButtons = ({ product, className, borderStyle, size }: Props) => {
  const dispatch = useDispatch();

  const quantity = useSelector((state: RootState) =>
    state.cart.items.find(
      (item) => item.product.id === product.id && item.size === size
    )?.quantity || 0
  );

  const maxQuantity = size
    ? product.variants?.find((v) => v.size === size)?.quantity ?? 0
    : product.quantity ?? 0;

  const handleIncrease = () => {
    if (quantity < maxQuantity) {
      // إضافة العنصر للسلة بدون خصم
      dispatch(addItem({ product, size }));
      toast.success("Quantity increased");
    } else {
      toast.error("Reached max quantity for this size");
    }
  };

  const handleDecrease = () => {
    if (quantity > 0) {
      // إزالة العنصر من السلة
      dispatch(removeItem({ productId: product.id, size }));
      toast.success("Quantity decreased");
    }
  };

  return (
    <div
      className={twMerge(
        "flex items-center gap-1 pb-1 text-base",
        borderStyle,
        className
      )}
    >
      <Button
        variant="outline"
        size="icon"
        className="w-6 h-6 cursor-pointer"
        onClick={handleDecrease}
      >
        <HiMinus />
      </Button>

      <span className="font-semibold w-8 text-center text-darkColor">
        {quantity}
      </span>

      <Button
        variant="outline"
        size="icon"
        className="w-6 h-6 cursor-pointer"
        onClick={handleIncrease}
      >
        <HiPlus />
      </Button>
    </div>
  );
};

export default QuantityButtons;
