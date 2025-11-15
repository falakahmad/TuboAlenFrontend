import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

// Lazy initialization to avoid build-time errors when env vars are missing
function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured")
  }
  return new Stripe(secretKey, {
    apiVersion: "2022-11-15",
  })
}

export async function POST(request: NextRequest) {
  try {
    const { priceId, customer_email, metadata } = await request.json()
    if (!priceId) {
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 })
    }
    
    const stripe = getStripe()
    const origin = request.nextUrl.origin
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription", // Use 'payment' for one-time
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,
      customer_email: customer_email || undefined,
      metadata: metadata || undefined,
    })
    return NextResponse.json({ id: session.id, url: session.url })
  } catch (e) {
    return NextResponse.json({ error: (e as any)?.message || "Stripe failed" }, { status: 500 })
  }
}
