"use client";

import AddToCartButton from "@/components/AddToCartButton";
import Container from "@/components/Container";
import Image from "next/image";
import PriceView from "@/components/PriceView";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, Camera } from "lucide-react";
import { FaRegQuestionCircle } from "react-icons/fa";
import { FiShare2 } from "react-icons/fi";
import { RxBorderSplit } from "react-icons/rx";
import { TbTruckDelivery } from "react-icons/tb";
import ProductCharacteristics from "@/components/ProductCharacteristics";
import SizeSelector from "@/components/SizeSelector";
import VirtualTryOn from "@/components/VirtualTryOn";
import { cn } from "@/lib/utils";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/index";
import { addFavorite, removeFavorite } from "@/store/cartSlice";

const ProductPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();

  const [product, setProduct] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [showVirtualTryOn, setShowVirtualTryOn] = useState(false);

useEffect(() => {
  setLoading(true);
  fetch(`http://127.0.0.1:8000/api/products/${slug}`)
    .then(res => {
      if (!res.ok) throw new Error("Not found");
      return res.json();
    })
    .then((productData) => {
      setProduct(productData);
      console.log("Product Data:", productData);

      if (productData.order_number) {
        // نستخدم order_number من المنتج فقط إذا كان موجود ومتأكدين منه
        fetch(`http://127.0.0.1:8000/order/api/orders/${productData.order_number}`)
          .then((res) => {
            if (!res.ok) throw new Error("Order not found");
            return res.json();
          })
          .then((orderData) => {
            setOrder(orderData);
            console.log("Order data fetched:", orderData);
            setLoading(false);
          })
          .catch((err) => {
            console.error("Error fetching order:", err);
            setOrder(null);
            setLoading(false);
          });
      } else {
        setOrder(null);
        setLoading(false);
      }
    })
    .catch(() => {
      notFound();
    });
}, [slug]);

  const isFav = useSelector((state: RootState) =>
    state.cart.favorites.some((item) => item.product.id === product?.id)
  );

  const handleShare = async () => {
    const productUrl = `${window.location.origin}/product/${slug}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: "Check out this product!",
          url: productUrl,
        });
      } catch (err) {
        console.error("Sharing failed:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(productUrl);
        alert("🔗 Product link copied to clipboard!");
      } catch (err) {
        console.error("Clipboard error:", err);
      }
    }
  };

  const handleRateClick = () => {
    alert("فتح صفحة التقييم أو المودال");
  };

  if (loading || !product) return <p className="p-10">Loading...</p>;

  return (
    <div>
      <Container className="flex flex-col md:flex-row gap-10 py-10">
        <div className="w-full md:w-1/2">
          <Image
            src={product.image}
            alt={product.name}
            width={500}
            height={500}
            className="rounded-lg object-contain w-full h-full"
          />
        </div>

        <div className="w-full md:w-1/2 flex flex-col gap-5">
          <div>
            <p className="text-4xl font-bold mb-2">{product.name}</p>
            <PriceView className="text-lg font-bold" amount={product.price} />
          </div>

          {product.quantity > 0 ? (
            <p className="bg-green-100 w-24 text-center text-green-600 text-sm py-2.5 font-semibold rounded-lg">
              In Stock
            </p>
          ) : (
            <p className="bg-red-100 w-24 text-center text-red-600 text-sm py-2.5 font-semibold rounded-lg">
              Out of Stock
            </p>
          )}

          <p className="text-sm text-gray-600 tracking-wide">{product.description}</p>

          <p className="text-sm text-muted-foreground font-medium mt-4">Select Size:</p>
          <SizeSelector
            variants={product.variants}
            selectedSize={selectedSize}
            onSelect={setSelectedSize}
          />

          <div className="flex items-center gap-2.5 lg:gap-5">
            <AddToCartButton
              size={selectedSize}
              product={product}
              className="bg-darkColor/80 text-white hover:bg-darkColor hoverEffect"
            />
            <button
              onClick={() =>
                isFav
                  ? dispatch(removeFavorite(product.id))
                  : dispatch(addFavorite(product))
              }
              className="border-2 border-darkColor/30 text-darkColor/60 px-2.5 py-1.5 rounded-md hover:text-darkColor hover:border-darkColor hoverEffect"
            >
              <Heart className={cn("w-5 h-5", isFav ? "text-red-500" : "text-gray-400")} />
            </button>

  

            {/* زر التقييم يظهر فقط لو بيانات الطلب موجودة و can_rate true */}
            {order?.can_rate && (
              <button
                onClick={handleRateClick}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                تقييم المنتج
              </button>
            )}
          </div>

          <ProductCharacteristics />

          <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-b-gray-200 py-5 -mt-2">
            <div className="flex items-center gap-2 text-sm text-black hover:text-red-600 hoverEffect">
              <RxBorderSplit className="text-lg" />
              <p>Compare color</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-black hover:text-red-600 hoverEffect">
              <FaRegQuestionCircle className="text-lg" />
              <p>Ask a question</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-black hover:text-red-600 hoverEffect">
              <TbTruckDelivery className="text-lg" />
              <p>Delivery & Return</p>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-sm text-black hover:text-red-600 hoverEffect"
            >
              <FiShare2 className="text-lg" />
              <p>Share</p>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <div className="border border-darkBlue/20 text-center p-3 hover:border-darkBlue hoverEffect rounded-md">
              <p className="text-base font-semibold text-black">Free Shipping</p>
              <p className="text-sm text-gray-500">Free shipping over order $120</p>
            </div>
            <div className="border border-darkBlue/20 text-center p-3 hover:border-darkBlue hoverEffect rounded-md">
              <p className="text-base font-semibold text-black">Flexible Payment</p>
              <p className="text-sm text-gray-500">Pay with Multiple Credit Cards</p>
            </div>
          </div>
        </div>
      </Container>

      {/* Virtual Try-On Dialog */}
      {product?.virtual_try_on && (
        <VirtualTryOn
          open={showVirtualTryOn}
          onClose={() => setShowVirtualTryOn(false)}
          productImageUrl={product.image}
          productName={product.name}
        />
      )}
    </div>
  );
};

export default ProductPage;
