'use client'

import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

import Heading from "@/components/heading"
import ApiList from "@/components/ui/api-list"
import { Button } from "@/components/ui/button"
import { ColorColumn, columns } from "./columns"
import { Separator } from "@/components/ui/separator"
import { DataTable } from "@/components/ui/data-table"

const ColorClient = ({
  data
}: { 
  data: ColorColumn[]
}) => {

  const router = useRouter()
  const params = useParams()

  return (
    <>

      <div className="flex items-center justify-between">
        <Heading 
          title={`Colors (${data.length})`}
          description="Manage colors for your store"
        />
        <Button
          onClick={() => router.push(`/${params.storeId}/colors/new`)}
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
        description="API calls for colors"
      />

      <Separator />

      <ApiList
        entityIdName="colorId"
        entityName="colors"
      />

    </>
  )
}

export default ColorClient