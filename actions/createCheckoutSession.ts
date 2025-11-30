"use server";

import stripe from "@/lib/stripe";
import Stripe from "stripe";
import { CartItem } from "@/types/cartItem";

export interface Metadata {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  clerkUserId: string;
  address?: string;
  phone?: string;
  latitude?: string;
  longitude?: string;
}

export async function createCheckoutSession(
  items: CartItem[],
  metadata: Metadata
): Promise<string> {
  try {
    if (!items || items.length === 0) {
      throw new Error("No items provided to checkout session.");
    }

    const customers = await stripe.customers.list({
      email: metadata.customerEmail,
      limit: 1,
    });

    const customerId = customers.data.length > 0 ? customers.data[0].id : "";

const sessionPayload: Stripe.Checkout.SessionCreateParams = {
  metadata: {
    orderNumber: metadata.orderNumber,
    customerName: metadata.customerName,
    customerEmail: metadata.customerEmail,
    clerkUserId: metadata.clerkUserId,
    // إزالة بعض البيانات غير الضرورية
    address: metadata.address || "",
    phone: metadata.phone || "",
    latitude: metadata.latitude || "",
    longitude: metadata.longitude || "",
    // إرسال معرف المنتج فقط بدلاً من التفاصيل الكاملة
    cart: JSON.stringify(
      items.map(item => ({
        id: item.product.id, // فقط معرّف المنتج
        quantity: item.quantity,
        size: item.size || "", // أو استبعادها إذا غير ضرورية
      }))
    ),
  },
  mode: "payment",
  allow_promotion_codes: true,
  payment_method_types: ["card"],
  invoice_creation: { enabled: true },
  success_url: `${process.env.NEXT_PUBLIC_BASE_URL || `https://${process.env.VERCEL_URL}`}/success?session_id={CHECKOUT_SESSION_ID}&orderNumber=${metadata.orderNumber}`,
  cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || `https://${process.env.VERCEL_URL}`}/cart`,
  line_items: items.map((item) => ({
    price_data: {
      currency: "USD",
      unit_amount: Math.round(item.product.price! * 100),
      product_data: {
        name: item.product.name || "Unnamed Product",
        metadata: {
          id: item.product.id?.toString() || "", // إرسال فقط معرّف المنتج
          size: item.size || "", // إرسال المقاس فقط إذا ضروري
        },
        images: item.product.image ? [item.product.image] : undefined,
      },
    },
    quantity: item.quantity,
  })),
};


    if (customerId) {
      sessionPayload.customer = customerId;
    } else {
      sessionPayload.customer_email = metadata.customerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionPayload);
    return session.url!;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}
