import prismadb from "@/lib/prismadb"
import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"

/* 
  ! /api/{storeId}/sizes/{sizeId}
  ? Gets the size by @sizeId
*/
export async function GET (
  request: Request,
  { params } : { params: { sizeId: string }}
) {
  try {

    if(!params.sizeId) return new NextResponse('Size id is required', { status: 400 })

    const size = await prismadb.size.findUnique({
      where: {
        id: params.sizeId,
      }
    })
    return NextResponse.json(size)

  } catch (error) {
    console.log(`[SIZE_GET]`, error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

/* 
  ! /api/{storeId}/sizes/{sizeId}
  ? Updates the size
*/
export async function PATCH (
  request: Request,
  { params } : { params: { storeId: string, sizeId: string }}
) {
  try {
    const { userId } = auth()
    if(!userId) return new NextResponse('Unauthenticated', { status: 401 })

    const { name, value } = await request.json()
    if(!name) return new NextResponse('Name is required', { status: 400 })
    if(!value) return new NextResponse('Value is required', { status: 400 })

    if(!params.sizeId) return new NextResponse('Size id is required', { status: 400 })

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

    const size = await prismadb.size.updateMany({
      where: {
        id: params.sizeId,
        storeId: params.storeId,
      },
      data: {
        name,
        value
      }
    })
    return NextResponse.json(size)

  } catch (error) {
    console.log(`[SIZE_PATCH]`, error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

/* 
  ! /api/{storeId}/sizes/{sizeId}
  ? Deletes the size
*/
export async function DELETE (
  request: Request,
  { params } : { params: { sizeId: string, storeId: string }}
) {
  try {
    const { userId } = auth()
    if(!userId) return new NextResponse('Unauthenticated', { status: 401 })

    if(!params.sizeId) return new NextResponse('Size id is required', { status: 400 })

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

    const size = await prismadb.size.deleteMany({
      where: {
        id: params.sizeId,
        storeId: params.storeId
      }
    })
    return NextResponse.json(size)

  } catch (error) {
    console.log(`[SIZE_DELETE]`, error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
