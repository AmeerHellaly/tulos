"use client";

import { twMerge } from "tailwind-merge";

interface SizeSelectorProps {
  variants: { size: string; quantity: number }[];
  onSelect: (size: string) => void;
  selectedSize?: string;
  className?: string;
}

const SizeSelector = ({
  variants,
  selectedSize,
  onSelect,
  className,
}: SizeSelectorProps) => {
  if (!variants?.length) return null;

  return (
    <div className={twMerge("flex gap-2 mt-3 flex-wrap", className)}>
      {variants.map((variant) => (
        <button
          key={variant.size}
          disabled={variant.quantity === 0}
          onClick={() => onSelect(variant.size)}
          className={twMerge(
            "px-4 py-1 border rounded-md text-sm font-semibold transition",
            selectedSize === variant.size
              ? "bg-darkColor text-white border-darkColor"
              : variant.quantity === 0
              ? "opacity-50 cursor-not-allowed"
              : "border-gray-300 text-gray-700 hover:bg-gray-100"
          )}
        >
          {variant.size} ({variant.quantity})
        </button>
      ))}
    </div>
  );
};

export default SizeSelector;
