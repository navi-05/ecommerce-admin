import prismadb from "@/lib/prismadb"
import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"

/* 
  ! /api/{storeId}/products/{productId}
  ? Gets the product by @productId
*/
export async function GET (
  request: Request,
  { params } : { params: { productId: string }}
) {
  try {

    if(!params.productId) return new NextResponse('Product id is required', { status: 400 })

    const product = await prismadb.product.findUnique({
      where: {
        id: params.productId,
      },
      include: { 
        images: true,
        category: true,
        size: true,
        color: true
      }
    })
    return NextResponse.json(product)

  } catch (error) {
    console.log(`[PRODUCT_GET]`, error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

/* 
  ! /api/{storeId}/products/{productId}
  ? Updates the product
*/
export async function PATCH (
  request: Request,
  { params } : { params: { storeId: string, productId: string }}
) {
  try {
    const { userId } = auth()
    if(!userId) return new NextResponse('Unauthenticated', { status: 401 })

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

    if(!params.productId) return new NextResponse('Product id is required', { status: 400 })

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

    await prismadb.product.update({
      where: {
        id: params.productId,
      },
      data: {
        name,
        price,
        categoryId,
        colorId,
        sizeId,
        images: {
          deleteMany: {}
        },
        isFeatured,
        isArchived
      }
    })

    const product = await prismadb.product.update({
      where: {
        id: params.productId,
      },
      data: {
        images: {
          createMany: {
            data: [
              ...images.map((image: { url: string}) => image)
            ]
          }
        }
      }
    })

    return NextResponse.json(product)

  } catch (error) {
    console.log(`[PRODUCT_PATCH]`, error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

/* 
  ! /api/{storeId}/products/{productId}
  ? Deletes the product
*/
export async function DELETE (
  request: Request, 
  { params } : { params: { productId: string, storeId: string }}
) {
  try {
    const { userId } = auth()
    if(!userId) return new NextResponse('Unauthenticated', { status: 401 })

    if(!params.productId) return new NextResponse('Product id is required', { status: 400 })

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

    const product = await prismadb.product.deleteMany({
      where: {
        id: params.productId,
        storeId: params.storeId
      }
    })
    return NextResponse.json(product)

  } catch (error) {
    console.log(`[PRODUCT_DELETE]`, error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
