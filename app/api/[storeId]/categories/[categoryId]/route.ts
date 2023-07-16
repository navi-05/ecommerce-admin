import prismadb from "@/lib/prismadb"
import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"

/* 
  ! /api/{storeId}/categories/{categoryId}
  ? Gets the category by @categoryId
*/
export async function GET (
  request: Request,
  { params } : { params: { categoryId: string }}
) {
  try {

    if(!params.categoryId) return new NextResponse('Category id is required', { status: 400 })

    const category = await prismadb.category.findUnique({
      where: {
        id: params.categoryId,
      },
      include: {
        billboard: true
      }
    })
    return NextResponse.json(category)

  } catch (error) {
    console.log(`[CATEGORY_GET]`, error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

/* 
  ! /api/{storeId}/categories/{categoryId}
  ? Updates the category
*/
export async function PATCH (
  request: Request,
  { params } : { params: { storeId: string, categoryId: string }}
) {
  try {
    const { userId } = auth()
    if(!userId) return new NextResponse('Unauthenticated', { status: 401 })

    const { name, billboardId } = await request.json()
    if(!name) return new NextResponse('Name is required', { status: 400 })
    if(!billboardId) return new NextResponse('Billboard ID is required', { status: 400 })

    if(!params.categoryId) return new NextResponse('Category id is required', { status: 400 })

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

    const category = await prismadb.category.updateMany({
      where: {
        id: params.categoryId,
        storeId: params.storeId,
      },
      data: {
        name,
        billboardId
      }
    })
    return NextResponse.json(category)

  } catch (error) {
    console.log(`[CATEGORY_PATCH]`, error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

/* 
  ! /api/{storeId}/categories/{categoryId}
  ? Deletes the category
*/
export async function DELETE (
  request: Request,
  { params } : { params: { categoryId: string, storeId: string }}
) {
  try {
    const { userId } = auth()
    if(!userId) return new NextResponse('Unauthenticated', { status: 401 })

    if(!params.categoryId) return new NextResponse('Category id is required', { status: 400 })

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

    const category = await prismadb.category.deleteMany({
      where: {
        id: params.categoryId,
        storeId: params.storeId
      }
    })
    return NextResponse.json(category)

  } catch (error) {
    console.log(`[CATEGORY_DELETE]`, error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
