import { Metadata } from "@/actions/createCheckoutSession";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Lazy initialization for Stripe (to avoid build-time errors)
function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(secretKey, { apiVersion: "2024-06-20" }); // حدث apiVersion للأحدث
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not set" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: `Webhook Error: ${error}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const invoice = session.invoice
      ? await getStripe().invoices.retrieve(session.invoice as string)
      : null;

    try {
      await createOrderInDjango(session, invoice);
    } catch (error) {
      console.error("❌ Error saving order to Django:", error);
      return NextResponse.json({ error: `Order creation error: ${error}` }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

async function createOrderInDjango(
  session: Stripe.Checkout.Session,
  invoice: Stripe.Invoice | null // استخدمها لو محتاج، أو امسحها لو مش مستخدمة
) {
  const stripe = getStripe(); // Lazy init هنا كمان
  const {
    id,
    amount_total,
    currency,
    metadata,
  } = session;

  const {
    orderNumber,
    customerName,
    customerEmail,
    address,
    phone,
    latitude,
    longitude,
  } = metadata as Metadata;

  const lineItems = await stripe.checkout.sessions.listLineItems(id, {
    expand: ["data.price.product"],
  });

  const items = lineItems.data.map((item) => {
    const product = item.price?.product as Stripe.Product;

    return {
      id: product.metadata?.id || "0",
      name: product.name,
      price: (item.price?.unit_amount || 0) / 100,
      quantity: item.quantity || 1,
      size: product.metadata?.size || "",
      image: product.images?.[0] || null,
    };
  });

  const orderPayload = {
    orderNumber,
    customerName,
    customerEmail,
    total: amount_total ? amount_total / 100 : 0,
    currency: currency || "USD",
    address: address || "",
    phone: phone || "",
    latitude,
    longitude,
    items,
  };

  // 🧾 إرسال الطلب إلى Django (استخدم env var للـ URL)
  const djangoUrl = process.env.DJANGO_API_URL || "http://127.0.0.1:8000/order/api/orders/create/";
  const res = await fetch(djangoUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderPayload),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("❌ Django response error:", res.status, text);
    throw new Error(`Django API error: ${res.status} - ${text}`);
  }

  console.log("✅ Order created in Django successfully");

  // ✅ تجميع العناصر حسب product_id + size
  const groupedItems = items.reduce((acc, item) => {
    const key = `${item.id}-${item.size}`;
    if (!acc[key]) {
      acc[key] = { ...item, quantity: 0 };
    }
    acc[key].quantity += item.quantity;
    return acc;
  }, {} as Record<string, typeof items[0]>);

  // ✅ خصم الكمية مرة وحدة لكل منتج/مقاس
  const deductUrl = process.env.DJANGO_API_URL ? `${process.env.DJANGO_API_URL.replace('/order/api/orders/create/', '/api/api/variants/deduct/')}` : "http://127.0.0.1:8000/api/api/variants/deduct/";
  for (const key in groupedItems) {
    const item = groupedItems[key];
    try {
      const deductRes = await fetch(deductUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: item.id,
          size: item.size || "",
          quantity: item.quantity,
        }),
      });

      if (!deductRes.ok) {
        const deductText = await deductRes.text();
        console.error(`❌ Stock deduction failed for ${item.name}: ${deductRes.status} - ${deductText}`);
      } else {
        console.log(`✅ Stock deducted for ${item.name}: ${item.quantity} units`);
      }
    } catch (error) {
      console.error(`❌ Error updating stock for ${item.name}:`, error);
    }
  }
}