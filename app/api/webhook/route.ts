import Stripe from "stripe";
import { headers } from 'next/headers'
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request
) {
  const body = await req.text()
  const signature = headers().get("Stripe-Signature") as string

  let event: Stripe.Event;

  // Creating an webhook event 
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  // Accessing the session triggered from checkout
  const session = event.data.object as Stripe.Checkout.Session

  // Getting the address components and changing them into single component
  const address = session?.customer_details?.address
  const addressComponents = [
    address?.line1,
    address?.line2,
    address?.city,
    address?.state,
    address?.postal_code,
    address?.country
  ]
  const addressString = addressComponents.filter((c) => c !== null).join(', ')

  /* 
    ? Checking the webhook event type
    * If completed, updating the order modal 
  */
  if(event.type === 'checkout.session.completed') {
    const order = await prismadb.order.update({
      where: {
        id: session?.metadata?.orderId
      },
      data: {
        isPaid: true,
        address: addressString,
        phone: session?.customer_details?.phone || ''
      },
      include: {
        orderItems: true
      }
    })

    // Getting the product ids from the order and updated them as archived
    const productIds = order.orderItems.map((orderItem) => orderItem.productId)
    await prismadb.product.updateMany({
      where: {
        id: {
          in: [...productIds]
        }
      },
      data: {
        isArchived: true
      }
    })
  }

  return new NextResponse(null, { status: 200 })
}