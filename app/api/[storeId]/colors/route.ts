import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"

import prismadb from "@/lib/prismadb"

/* 
  ! api/{storeId}/colors
  ? Creates a new color
*/
export async function POST (
  request: Request,
  { params }: { params : { storeId: string } }
) {
  try {
    const { userId } = auth()
    const { name, value } = await request.json()

    if(!userId) return new NextResponse("Unauthenticated", { status: 401 })
    if(!name) return new NextResponse("Name is required", { status: 400 })
    if(!value) return new NextResponse("Value is required", { status: 400 })
    if(!params.storeId) return new NextResponse("StoreId is required", { status: 400 })

    /* 
      Checks whether the store is actually a store created by the user signed in
    */
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId
      }
    })
    if(!storeByUserId) return new NextResponse("Unauthorized Entry", { status: 403 })

    const color = await prismadb.color.create({
      data: {
        name,
        value,
        storeId: params.storeId
      }
    })

    return NextResponse.json(color)

  } catch (error) {
    console.log(`[COLORS_POST]`, error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

/* 
  ! api/{storeId}/colors
  ? Gets all colors
*/
export async function GET (
  request: Request,
  { params }: { params : { storeId: string } }
) {
  try {
    if(!params.storeId) return new NextResponse("StoreId is required", { status: 400 })

    const colors = await prismadb.color.findMany({
      where: {
        storeId: params.storeId
      }
    })

    return NextResponse.json(colors)

  } catch (error) {
    console.log(`[COLORS_GET]`, error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}