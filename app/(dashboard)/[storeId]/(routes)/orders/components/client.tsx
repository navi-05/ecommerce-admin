'use client'

import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

import Heading from "@/components/heading"
import ApiList from "@/components/ui/api-list"
import { Button } from "@/components/ui/button"
import { OrderColumn, columns } from "./columns"
import { Separator } from "@/components/ui/separator"
import { DataTable } from "@/components/ui/data-table"

const OrderClient = ({
  data
}: { 
  data: OrderColumn[]
}) => {

  const router = useRouter()
  const params = useParams()

  return (
    <>
      <Heading 
        title={`Orders (${data.length})`}
        description="Manage orders for your store"
      />

      <Separator />

      <DataTable 
        columns={columns}
        data={data}
        searchKey="products"
      />
    </>
  )
}

export default OrderClient