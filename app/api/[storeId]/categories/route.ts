import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"

import prismadb from "@/lib/prismadb"

/* 
  ! api/{storeId}/categories
  ? Creates a new category
*/
export async function POST (
  request: Request,
  { params }: { params : { storeId: string } }
) {
  try {
    const { userId } = auth()
    const { name, billboardId } = await request.json()

    if(!userId) return new NextResponse("Unauthenticated", { status: 401 })
    if(!name) return new NextResponse("Name is required", { status: 400 })
    if(!billboardId) return new NextResponse("Billboard ID is required", { status: 400 })
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

    const category = await prismadb.category.create({
      data: {
        name,
        billboardId,
        storeId: params.storeId
      }
    })

    return NextResponse.json(category)

  } catch (error) {
    console.log(`[CATEGORIES_POST]`, error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

/* 
  ! api/{storeId}/categories
  ? Gets all categories
*/
export async function GET (
  request: Request,
  { params }: { params : { storeId: string } }
) {
  try {
    if(!params.storeId) return new NextResponse("StoreId is required", { status: 400 })

    const categories = await prismadb.category.findMany({
      where: {
        storeId: params.storeId
      }
    })

    return NextResponse.json(categories)

  } catch (error) {
    console.log(`[CATEGORIES_GET]`, error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}