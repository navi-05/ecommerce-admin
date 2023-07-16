import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"

import prismadb from "@/lib/prismadb"

/* 
  ! api/{storeId}/billboards
  ? Creates a new billboard
*/
export async function POST (
  request: Request,
  { params }: { params : { storeId: string } }
) {
  try {
    const { userId } = auth()
    const { label, imageUrl } = await request.json()

    if(!userId) return new NextResponse("Unauthenticated", { status: 401 })
    if(!label) return new NextResponse("Label is required", { status: 400 })
    if(!imageUrl) return new NextResponse("Image is required", { status: 400 })
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

    const billboard = await prismadb.billboard.create({
      data: {
        label,
        imageUrl,
        storeId: params.storeId
      }
    })

    return NextResponse.json(billboard)

  } catch (error) {
    console.log(`[BILLBOARD_POST]`, error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

/* 
  ! api/{storeId}/billboards
  ? Gets all billboards
*/
export async function GET (
  request: Request,
  { params }: { params : { storeId: string } }
) {
  try {
    if(!params.storeId) return new NextResponse("StoreId is required", { status: 400 })

    const billboards = await prismadb.billboard.findMany({
      where: {
        storeId: params.storeId
      }
    })

    return NextResponse.json(billboards)

  } catch (error) {
    console.log(`[BILLBOARD_GET]`, error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}