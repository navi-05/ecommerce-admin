'use client'

import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

import Heading from "@/components/heading"
import ApiList from "@/components/ui/api-list"
import { Button } from "@/components/ui/button"
import { SizeColumn, columns } from "./columns"
import { Separator } from "@/components/ui/separator"
import { DataTable } from "@/components/ui/data-table"

const SizeClient = ({
  data
}: { 
  data: SizeColumn[]
}) => {

  const router = useRouter()
  const params = useParams()

  return (
    <>

      <div className="flex items-center justify-between">
        <Heading 
          title={`Sizes (${data.length})`}
          description="Manage sizes for your store"
        />
        <Button
          onClick={() => router.push(`/${params.storeId}/sizes/new`)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>

      <Separator />

      <DataTable 
        columns={columns}
        data={data}
        searchKey="name"
      />

      <Heading
        title="API"
        description="API calls for sizes"
      />

      <Separator />

      <ApiList
        entityIdName="sizeId"
        entityName="sizes"
      />

    </>
  )
}

export default SizeClient