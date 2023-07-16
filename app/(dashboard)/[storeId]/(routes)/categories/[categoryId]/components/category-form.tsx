'use client'

import * as z from 'zod'
import axios from 'axios'
import { useState } from 'react'
import { Trash } from "lucide-react"
import { toast } from 'react-hot-toast'
import { Billboard, Category } from '@prisma/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams, useRouter } from 'next/navigation'

import Heading from "@/components/heading"
import { Input } from '@/components/ui/input'
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import AlertModal from '@/components/modals/alert-modal'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const formSchema = z.object({
  name: z.string().min(1),
  billboardId: z.string().min(1)
})
type CategoryFormValues = z.infer<typeof formSchema>

/* 
  * This settings form is used to delete different entities such as 
  * stores, products, categories etc.
*/
const CategoryForm = ({
  initialData,
  billboards
}: {
  initialData: Category | null,
  billboards: Billboard[]
}) => {

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const params = useParams()
  const router = useRouter()

  const title = initialData ? "Edit category" : "Create category"
  const description = initialData ? "Edit a category" : "Add a new category"
  const toastMessage = initialData ? "Category Updated" : "Category Created"
  const action = initialData ? "Save changes" : "Create"

  /* 
   * Using ReactHookForm with zod as mentioned in the docs.
   ? Created formSchema to contain the name of the store.
   ! name should contain atleast 1 characters.
   @ store is passed as default values to the form 
  */
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      billboardId: ''
    }
  })

  const onSubmit = async(data: CategoryFormValues) => {
    try {
      setLoading(true)
      if(initialData) await axios.patch(`/api/${params.storeId}/categories/${params.categoryId}`, data)
      else await axios.post(`/api/${params.storeId}/categories`, data)
      router.refresh()
      router.push(`/${params.storeId}/categories`)
      toast.success(toastMessage)
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  /* 
    * DELETE function
    ! All products should be deleted before deleting the category
  */
  const onDelete = async() => {
    try {
      setLoading(true)
      await axios.delete(`/api/${params.storeId}/categories/${params.categoryId}`)
      router.refresh()
      router.push('/')
      toast.success('Category Deleted')
    } catch (error) {
      toast.error("Make sure you removed all products using this category before deleting this category")
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading 
          title={title}
          description={description}
          />
        {initialData && (
          <Button
            variant="destructive"
            size="icon"
            onClick={() => setOpen(true)}
            disabled={loading}
            >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Separator />

      {/* Form */}
      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-8 w-full'
        >
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input 
                      disabled={loading}
                      placeholder='Category name'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billboardId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billboard</FormLabel>
                  <Select 
                    disabled={loading} 
                    onValueChange={field.onChange} 
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          defaultValue={field.value}
                          placeholder='Select a billboard'
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {billboards.map((billboard) => (
                        <SelectItem
                          key={billboard.id}
                          value={billboard.id}
                        >
                          {billboard.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button
            disabled={loading}
            type='submit'
          >
            {action}
          </Button>
        </form>
      </Form>

      <Separator />
      
    </>
  )
}

export default CategoryForm