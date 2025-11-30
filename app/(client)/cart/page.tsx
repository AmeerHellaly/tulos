"use client";
import Container from "@/components/Container";
import PriceFormatter from "@/components/PriceFormatter";
import QuantityButtons from "@/components/QuantityButtons";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, Trash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import EmptyCart from "@/components/EmptyCart";
import NoAccessToCart from "@/components/NoAccessToCart";
import paypalLogo from "@/images/paypalLogo.png";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Loading from "@/components/Loading";
import { createCheckoutSession } from "@/actions/createCheckoutSession";

// ✅ Redux Toolkit
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { deleteCartProduct, resetCart } from "@/store/cartSlice";

const CartPage = () => {
  const dispatch = useDispatch();
  const items = useSelector((state: RootState) => state.cart.items);

  const groupedItems = useSelector((state: RootState) => {
    const grouped: Record<string, typeof items[0]> = {};
    for (const item of state.cart.items) {
      const key = `${item.product.id}-${item.size || "default"}`;
      if (grouped[key]) {
        grouped[key].quantity += item.quantity;
      } else {
        grouped[key] = { ...item };
      }
    }
    return Object.values(grouped);
  });

  // لا حاجة لحساب الخصم بعد الآن، سيتم استخدام السعر الأساسي فقط
  const getTotalPrice = useSelector((state: RootState) =>
    state.cart.items.reduce(
      (total, item) => total + (item.product.price ?? 0) * item.quantity,
      0
    )
  );

  const getSubTotalPrice = useSelector((state: RootState) =>
    state.cart.items.reduce((total, item) => {
      const price = item.product.price ?? 0;
      return total + price * item.quantity;
    }, 0)
  );

  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    }
  }, [isClient]);

  if (!isClient || isLoggedIn === null) return <Loading />;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <NoAccessToCart />
      </div>
    );
  }

  const handleResetCart = () => {
    const confirmed = window.confirm("Are you sure to reset your Cart?");
    if (confirmed) {
      dispatch(resetCart());
      toast.success("Your cart reset successfully!");
    }
  };

  const handleDeleteProduct = (productId: number, size?: string) => {
    dispatch(deleteCartProduct({ productId, size }));
    toast.success("Product deleted successfully!");
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const orderNumber = `ORD-${Date.now()}`;
      const customerEmail = localStorage.getItem("email");
      const customerName = localStorage.getItem("username") || "Website User";

      // لا حاجة الآن لحساب الخصم، نرسل السعر بالكامل
      const groupedItemsWithDiscounts = groupedItems.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        size: item.size,
        discountedPrice: item.product.price,  // لا نطبق أي خصم
      }));

      const sessionUrl = await createCheckoutSession(
        groupedItemsWithDiscounts.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          size: item.size,
          discountedPrice: item.discountedPrice,  // السعر بدون خصم
        })),
        {
          orderNumber,
          customerName,
          customerEmail,
          clerkUserId: "jwt-auth",
          address,
          phone,
          latitude,
          longitude,
        }
      );

      if (sessionUrl) {
        window.location.href = sessionUrl;
      } else {
        toast.error("Something went wrong while creating checkout session.");
      }
    } catch (error) {
      toast.error("Checkout failed.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
          toast.success("تم الوصول للموقع");
        },
        (error) => {
          toast.error("تم رفض الوصول للموقع");
          console.error(error);
        }
      );
    } else {
      toast.error("المتصفح لا يدعم تحديد الموقع");
    }
  };

  return (
    <div className="bg-gray-50 pb-52 md:pb-10">
      <Container>
        {groupedItems?.length ? (
          <>
            <div className="flex items-center gap-2 py-5">
              <ShoppingBag className="h-6 w-6 text-darkColor" />
              <h1 className="text-2xl font-semibold">Shopping Cart</h1>
            </div>
            <div className="grid lg:grid-cols-3 md:gap-8">
              <div className="lg:col-span-2 rounded-lg">
                <div className="border bg-white rounded-md">
                  {groupedItems?.map(({ product, size, quantity }) => (
                    <div
                      key={`${product.id}-${size || "default"}`}
                      className="border-b p-2.5 last:border-b-0 flex items-center justify-between gap-5"
                    >
                      <div className="flex flex-1 items-start gap-2 h-36 md:h-44">
                        <div className="border p-0.5 md:p-1 mr-2 rounded-md overflow-hidden group">
                          <Image
                            src={product.image || paypalLogo}
                            alt={product.name || "Product Image"}
                            width={500}
                            height={500}
                            loading="lazy"
                            className="w-32 md:w-40 h-32 md:h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="h-full flex flex-1 flex-col justify-between py-1">
                          <div className="flex flex-col gap-0.5 md:gap-1.5">
                            <h2 className="text-base font-semibold line-clamp-1">
                              {product.name}
                            </h2>
                            <p className="text-sm text-lightColor font-medium">
                              {product.description?.slice(0, 50)}
                            </p>
                            <p className="text-sm capitalize">
                              Size:{" "}
                              <span className="font-semibold">
                                {size || "-"}
                              </span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Trash
                                    onClick={() =>
                                      handleDeleteProduct(product.id, size)
                                    }
                                    className="w-5 h-5 text-gray-500 hover:text-red-600 cursor-pointer"
                                  />
                                </TooltipTrigger>
                                <TooltipContent>Delete product</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-start justify-between h-36 md:h-44 p-1">
                        {/* استخدم السعر الأصلي فقط */}
                        <PriceFormatter
                          amount={product.price}
                          className="font-bold text-lg"
                        />
                        <QuantityButtons product={product} size={size} />
                      </div>
                    </div>
                  ))}
                  <Button
                    onClick={handleResetCart}
                    className="m-5 font-semibold"
                    variant="destructive"
                  >
                    Reset Cart
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="hidden md:block w-full bg-white p-6 rounded-lg border">
                  <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>SubTotal</span>
                      <PriceFormatter amount={getSubTotalPrice} />
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <PriceFormatter
                        amount={getTotalPrice} 
                        className="text-lg font-bold text-black"
                      />
                    </div>
                    <div className="space-y-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Address
                        </label>
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Enter your address"
                          className="w-full border px-3 py-2 rounded-md"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Phone Number
                        </label>
                        <input
                          type="number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Enter your phone number"
                          className="w-full border px-3 py-2 rounded-md"
                          required
                        />
                      </div>
                    </div>
                    <Button onClick={getLocation} variant="outline">
                      استخدام موقعي الجغرافي
                    </Button>
                    <Button
                      onClick={handleCheckout}
                      disabled={loading}
                      className="w-full cursor-pointer rounded-full font-semibold tracking-wide"
                      size="lg"
                    >
                      {loading ? "Processing..." : "Proceed to Checkout"}
                    </Button>

                    <Link
                      href="/"
                      className="text-center text-sm text-darkColor hover:underline border border-darkColor/50 rounded-full flex items-center justify-center py-2 hover:bg-darkColor/5 hover:border-darkColor hoverEffect"
                    >
                      <Image
                        src={paypalLogo}
                        className="w-20"
                        alt="paypalLogo"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <EmptyCart />
        )}
      </Container>
    </div>
  );
};

export default CartPage;
