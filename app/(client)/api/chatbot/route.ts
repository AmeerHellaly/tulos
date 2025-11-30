import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    const lowered = message.toLowerCase();

    // ردود ذكية
    if (lowered.includes("طلبي") || lowered.includes("تتبع")) {
      return NextResponse.json({ reply: "🔍 يمكنك تتبع طلبك من هنا: https://tulos.com/orders" });
    }
    if (lowered.includes("خصومات") || lowered.includes("عروض")) {
      return NextResponse.json({ reply: "🎉 تفضل العروض الحالية لدينا: https://tulos.com/discounts" });
    }
    if (lowered.includes("اقتراح") || lowered.includes("تنصحني") || lowered.includes("شو اشتري")) {
      return NextResponse.json({ reply: "🛍️ إليك بعض المنتجات المميزة المقترحة لك: https://tulos.com/recommended" });
    }
    if (lowered.includes("دعم") || lowered.includes("تواصل") || lowered.includes("مشكلة")) {
      return NextResponse.json({ reply: "📞 تواصل مع فريق الدعم عبر: https://tulos.com/support أو واتساب: +962XXXXXXXXX" });
    }
    if (lowered.includes("فرع") || lowered.includes("الفروع") || lowered.includes("موقعكم")) {
      return NextResponse.json({ reply: "📍 نحن متواجدون أونلاين فقط، وسنعلن عن الفروع قريبًا عبر حساباتنا." });
    }
    if (lowered.includes("الدفع") || lowered.includes("طريقة الدفع") || lowered.includes("كيف ادفع")) {
      return NextResponse.json({ reply: "💳 طرق الدفع: بطاقة بنكية، بايبال، والدفع عند الاستلام (لبعض المناطق)." });
    }

    // OpenRouter
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "أنت مساعد ذكي لمتجر إلكتروني اسمه Tulos. ساعد المستخدم بأسلوب واضح وبسيط.",
          },
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("❌ OpenRouter error:", errorBody);
      return NextResponse.json({ error: "حدث خطأ أثناء الاتصال بـ OpenRouter." }, { status: res.status });
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "عذرًا، لم أفهم سؤالك.";
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("❌ Internal error:", error);
    return NextResponse.json({ error: "حدث خطأ داخلي في الخادم." }, { status: 500 });
  }
}
