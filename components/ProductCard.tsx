import Image from "next/image";
import Link from "next/link";
import PriceView from "./PriceView";
import AddToCartButton from "./AddToCartButton";

type ProductCardProps = {
  id: number;
  name: string;
  slug: string;
  price: number | string;
  image: string;
  quantity: number;
};

const ProductCard = ({ id, name, slug, price, image, quantity,  }: ProductCardProps) => {
  const parsedPrice = typeof price === "string" ? parseFloat(price) : price; // تأكد من أن السعر هو عدد وليس نص

  return (
    <div className="rounded-lg overflow-hidden group text-sm">
      <div className="overflow-hidden relative bg-gradient-to-r from-zinc-200 via-zinc-300 to-zinc-200">
        <Link href={`/product/${slug}`}>
          <Image
            src={image}
            alt={name || "product image"} // ✅ alt مضمون
            width={500}
            height={500}
            priority
            className="w-full h-72 object-contain transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
      </div>

      <div className="py-3 px-2 flex flex-col gap-1.5 bg-zinc-50 border border-t-0 rounded-md rounded-tl-none rounded-tr-none">
        <h3 className="text-base line-clamp-1">{name}</h3>
        {/* تمرير السعر الأصلي مباشرة إلى PriceView بدون تعديل */}
        <PriceView className="text-lg" amount={parsedPrice} quantity={quantity}/>

        {/* الكمية */}
        <p className="text-xs text-gray-500">
          Available:{" "}
          <span
            className={`font-semibold ${quantity > 0 ? "text-green-600" : "text-red-500"}`}
          >
            {quantity > 0 ? quantity : "Out of Stock"}
          </span>
        </p>

        {/* زر الشراء أو نص */}
        <div className="h-10 flex items-center">
          {quantity > 0 ? (
            <AddToCartButton
              product={{
                id,
                name,
                slug,
                price: parsedPrice, // عرض السعر كما هو
                image,
                quantity,
              }}
            />
          ) : (
            <span className="text-red-500 text-sm font-semibold">Out of Stock</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
