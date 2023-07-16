import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"

import prismadb from "@/lib/prismadb"

/* 
  ! api/{storeId}/sizes
  ? Creates a new size
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

    const size = await prismadb.size.create({
      data: {
        name,
        value,
        storeId: params.storeId
      }
    })

    return NextResponse.json(size)

  } catch (error) {
    console.log(`[SIZES_POST]`, error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

/* 
  ! api/{storeId}/sizes
  ? Gets all sizes
*/
export async function GET (
  request: Request,
  { params }: { params : { storeId: string } }
) {
  try {
    if(!params.storeId) return new NextResponse("StoreId is required", { status: 400 })

    const sizes = await prismadb.size.findMany({
      where: {
        storeId: params.storeId
      }
    })

    return NextResponse.json(sizes)

  } catch (error) {
    console.log(`[SIZES_GET]`, error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}