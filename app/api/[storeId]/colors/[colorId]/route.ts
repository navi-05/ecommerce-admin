import prismadb from "@/lib/prismadb"
import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"

/* 
  ! /api/{storeId}/colors/{colorId}
  ? Gets the color by @colorId
*/
export async function GET (
  request: Request,
  { params } : { params: { colorId: string }}
) {
  try {

    if(!params.colorId) return new NextResponse('Color id is required', { status: 400 })

    const color = await prismadb.color.findUnique({
      where: {
        id: params.colorId,
      }
    })
    return NextResponse.json(color)

  } catch (error) {
    console.log(`[COLOR_GET]`, error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

/* 
  ! /api/{storeId}/colors/{colorId}
  ? Updates the color
*/
export async function PATCH (
  request: Request,
  { params } : { params: { storeId: string, colorId: string }}
) {
  try {
    const { userId } = auth()
    if(!userId) return new NextResponse('Unauthenticated', { status: 401 })

    const { name, value } = await request.json()
    if(!name) return new NextResponse('Name is required', { status: 400 })
    if(!value) return new NextResponse('Value is required', { status: 400 })

    if(!params.colorId) return new NextResponse('Color id is required', { status: 400 })

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

    const color = await prismadb.color.updateMany({
      where: {
        id: params.colorId,
        storeId: params.storeId,
      },
      data: {
        name,
        value
      }
    })
    return NextResponse.json(color)

  } catch (error) {
    console.log(`[COLOR_PATCH]`, error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

/* 
  ! /api/{storeId}/colors/{colorId}
  ? Deletes the color
*/
export async function DELETE (
  request: Request,
  { params } : { params: { colorId: string, storeId: string }}
) {
  try {
    const { userId } = auth()
    if(!userId) return new NextResponse('Unauthenticated', { status: 401 })

    if(!params.colorId) return new NextResponse('Color id is required', { status: 400 })

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

    const color = await prismadb.color.deleteMany({
      where: {
        id: params.colorId,
        storeId: params.storeId
      }
    })
    return NextResponse.json(color)

  } catch (error) {
    console.log(`[COLOR_DELETE]`, error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
