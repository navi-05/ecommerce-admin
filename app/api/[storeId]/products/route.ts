import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"

import prismadb from "@/lib/prismadb"

/* 
  ! api/{storeId}/products
  ? Creates a new product
*/
export async function POST (
  request: Request,
  { params }: { params : { storeId: string } }
) {
  try {
    const { userId } = auth()
    const { 
      name, 
      price,
      categoryId,
      colorId,
      sizeId,
      images,
      isFeatured,
      isArchived
    } = await request.json()

    if(!userId) return new NextResponse("Unauthenticated", { status: 401 })
    if(!name) return new NextResponse("Name is required", { status: 400 })
    if(!price) return new NextResponse("Price is required", { status: 400 })
    if(!categoryId) return new NextResponse("CategoryId is required", { status: 400 })
    if(!sizeId) return new NextResponse("SizeId is required", { status: 400 })
    if(!colorId) return new NextResponse("ColorId is required", { status: 400 })
    if(!images || !images.length) {
      return new NextResponse("Images are required", { status: 400 })
    }

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

    const product = await prismadb.product.create({
      data: {
        name,
        price,
        isFeatured,
        isArchived,
        categoryId,
        colorId,
        sizeId,
        storeId: params.storeId,
        images: {
          createMany: {
            data: [
              ...images.map((image: { url: string }) => image)
            ]
          }
        }
      }
    })

    return NextResponse.json(product)

  } catch (error) {
    console.log(`[PRODUCTS_POST]`, error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

/* 
  ! api/{storeId}/products
  ? Gets all products
*/
export async function GET (
  request: Request,
  { params }: { params : { storeId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId') || undefined;
    const colorId = searchParams.get('colorId') || undefined;
    const sizeId = searchParams.get('sizeId') || undefined;
    const isFeatured = searchParams.get('isFeatured')

    if(!params.storeId) return new NextResponse("StoreId is required", { status: 400 })

    const products = await prismadb.product.findMany({
      where: {
        storeId: params.storeId,
        categoryId,
        colorId,
        sizeId,
        isFeatured: isFeatured ? true : undefined,
        isArchived: false
      }, 
      include: {
        images: true,
        category: true,
        color: true,
        size: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(products)

  } catch (error) {
    console.log(`[PRODUCTS_GET]`, error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
