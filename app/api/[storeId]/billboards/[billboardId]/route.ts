import prismadb from "@/lib/prismadb"
import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"

/* 
  ! /api/{storeId}/billboards/{billboardId}
  ? Gets the billboard by @billboardId
*/
export async function GET (
  request: Request,
  { params } : { params: { billboardId: string }}
) {
  try {

    if(!params.billboardId) return new NextResponse('Billboard id is required', { status: 400 })

    const billboard = await prismadb.billboard.findUnique({
      where: {
        id: params.billboardId,
      }
    })
    return NextResponse.json(billboard)

  } catch (error) {
    console.log(`[BILLBOARD_GET]`, error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

/* 
  ! /api/{storeId}/billboards/{billboardId}
  ? Updates the billboard
*/
export async function PATCH (
  request: Request,
  { params } : { params: { storeId: string, billboardId: string }}
) {
  try {
    const { userId } = auth()
    if(!userId) return new NextResponse('Unauthenticated', { status: 401 })

    const { label, imageUrl } = await request.json()
    if(!label) return new NextResponse('Name is required', { status: 400 })
    if(!imageUrl) return new NextResponse('Image is required', { status: 400 })

    if(!params.billboardId) return new NextResponse('Billboard id is required', { status: 400 })

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

    const billboard = await prismadb.billboard.updateMany({
      where: {
        id: params.billboardId,
        storeId: params.storeId,
      },
      data: {
        label,
        imageUrl
      }
    })
    return NextResponse.json(billboard)

  } catch (error) {
    console.log(`[BILLBOARD_PATCH]`, error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

/* 
  ! /api/{storeId}/billboards/{billboardId}
  ? Deletes the billboard
*/
export async function DELETE (
  request: Request,
  { params } : { params: { billboardId: string, storeId: string }}
) {
  try {
    const { userId } = auth()
    if(!userId) return new NextResponse('Unauthenticated', { status: 401 })

    if(!params.billboardId) return new NextResponse('Billboard id is required', { status: 400 })

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

    const billboard = await prismadb.billboard.deleteMany({
      where: {
        id: params.billboardId,
        storeId: params.storeId
      }
    })
    return NextResponse.json(billboard)

  } catch (error) {
    console.log(`[BILLBOARD_DELETE]`, error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
