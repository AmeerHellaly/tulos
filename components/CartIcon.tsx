"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MdOutlineShoppingCart } from "react-icons/md";
import { useSelector } from "react-redux";
import { RootState } from "@/store/index";
import { CartItem } from "@/store/cartSlice";

const CartIcon = () => {
  const [isClient, setIsClient] = useState(false);

  const groupedItems = useSelector((state: RootState) => {
    const items = state.cart.items;

    const grouped: Record<string, CartItem> = {};
    for (const item of items) {
      const key = `${item.product.id}-${item.size || "default"}`;
      if (grouped[key]) {
        grouped[key].quantity += item.quantity;
      } else {
        grouped[key] = { ...item };
      }
    }
    return Object.values(grouped);
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <Link
      href={"/cart"}
      className="flex items-center text-sm gap-2 border border-gray-200 px-2 py-1 rounded-md shadow-md hover:shadow-none hoverEffect"
    >
      <MdOutlineShoppingCart className="text-2xl text-darkBlue" />
      <div className="flex flex-col">
        <p className="text-xs">
          <span className="font-semibold">
            {groupedItems?.length || 0}{" "}
          </span>
          items
        </p>
        <p className="font-semibold">Cart</p>
      </div>
    </Link>
  );
};

export default CartIcon;
