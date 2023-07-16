'use client'

import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

import Heading from "@/components/heading"
import ApiList from "@/components/ui/api-list"
import { Button } from "@/components/ui/button"
import { CategoryColumn, columns } from "./columns"
import { Separator } from "@/components/ui/separator"
import { DataTable } from "@/components/ui/data-table"

const CategoryClient = ({
  data
}: { 
  data: CategoryColumn[]
}) => {

  const router = useRouter()
  const params = useParams()

  return (
    <>

      <div className="flex items-center justify-between">
        <Heading 
          title={`Categories (${data.length})`}
          description="Manage categories for your store"
        />
        <Button
          onClick={() => router.push(`/${params.storeId}/categories/new`)}
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
        description="API calls for categories"
      />

      <Separator />

      <ApiList
        entityIdName="categoryId"
        entityName="categories"
      />

    </>
  )
}

export default CategoryClient