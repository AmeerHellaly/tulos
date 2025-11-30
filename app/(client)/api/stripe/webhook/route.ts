import { Metadata } from "@/actions/createCheckoutSession";
import stripe from "@/lib/stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (error) {
    return NextResponse.json({ error: `Webhook Error: ${error}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const invoice = session.invoice
      ? await stripe.invoices.retrieve(session.invoice as string)
      : null;

    try {
      await createOrderInDjango(session, invoice);
    } catch (error) {
      console.error("❌ Error saving order to Django:", error);
      return NextResponse.json({ error: `Error: ${error}` }, { status: 400 });
    }
  }

  return NextResponse.json({ received: true });
}

async function createOrderInDjango(
  session: Stripe.Checkout.Session,
  invoice: Stripe.Invoice | null
) {
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

  // 🧾 إرسال الطلب إلى Django
  const res = await fetch("http://127.0.0.1:8000/order/api/orders/create/", {
    method: "POST",
    headers: { "Content-Type": "application/json", },
    body: JSON.stringify(orderPayload),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("❌ Django response error:", res.status, text);
  }

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
for (const key in groupedItems) {
  const item = groupedItems[key];
  try {
    await fetch("http://127.0.0.1:8000/api/api/variants/deduct/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: item.id,
        size: item.size || "", // فارغ إذا ما في مقاس
        quantity: item.quantity,
      }),
    });
  } catch (error) {
    console.error(`❌ Error updating stock for ${item.name}:`, error);
  }
}


}
