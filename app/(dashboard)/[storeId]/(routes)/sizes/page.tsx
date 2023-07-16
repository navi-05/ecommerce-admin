import { format } from "date-fns"

import prismadb from "@/lib/prismadb"
import SizeClient from "./components/client"
import { SizeColumn } from "./components/columns"

const SizesPage = async ({
  params
}: {
  params: { storeId: string }
}) => {

  const sizes = await prismadb.size.findMany({
    where: {
      storeId: params.storeId
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  /* 
    * Formatting the sizes 
    ! Taking only the necessary information from the sizes
    ? date-fns package is used to convert date type into desired string type for the @createdAt field
  */
  const formattedSizes: SizeColumn[] = sizes.map((item) => ({
    id: item.id,
    name: item.name,
    value: item.value,
    createdAt: format(item.createdAt, 'MMMM do, yyyy')
  }))

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SizeClient data={formattedSizes} />
      </div>
    </div>
  )
}

export default SizesPage