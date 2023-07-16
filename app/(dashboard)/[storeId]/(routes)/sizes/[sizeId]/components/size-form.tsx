'use client'

import * as z from 'zod'
import axios from 'axios'
import { useState } from 'react'
import { Trash } from "lucide-react"
import { Size } from "@prisma/client"
import { toast } from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams, useRouter } from 'next/navigation'

import Heading from "@/components/heading"
import { Input } from '@/components/ui/input'
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import ImageUpload from '@/components/ui/image-upload'
import AlertModal from '@/components/modals/alert-modal'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const formSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1)
})
type SizeFormValues = z.infer<typeof formSchema>

/* 
  * This settings form is used to delete different entities such as 
  * stores, products, categories etc.
*/
const SizeForm = ({
  initialData
}: {
  initialData: Size | null
}) => {

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const params = useParams()
  const router = useRouter()

  const title = initialData ? "Edit size" : "Create size"
  const description = initialData ? "Edit a size" : "Add a new size"
  const toastMessage = initialData ? "Size Updated" : "Size Created"
  const action = initialData ? "Save changes" : "Create"

  /* 
   * Using ReactHookForm with zod as mentioned in the docs.
   ? Created formSchema to contain the name of the store.
   ! name should contain atleast 1 characters.
   @ store is passed as default values to the form 
  */
  const form = useForm<SizeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      value: ''
    }
  })

  const onSubmit = async(data: SizeFormValues) => {
    try {
      setLoading(true)
      if(initialData) await axios.patch(`/api/${params.storeId}/sizes/${params.sizeId}`, data)
      else await axios.post(`/api/${params.storeId}/sizes`, data)
      router.refresh()
      router.push(`/${params.storeId}/sizes`)
      toast.success(toastMessage)
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  /* 
    * DELETE function
    ! Cannot be deleted if they have an active products
  */
  const onDelete = async() => {
    try {
      setLoading(true)
      await axios.delete(`/api/${params.storeId}/sizes/${params.sizeId}`)
      router.refresh()
      router.push('/')
      toast.success('Size Deleted')
    } catch (error) {
      toast.error("Make sure you removed all products using this size")
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
                      placeholder='Size name'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input 
                      disabled={loading}
                      placeholder='Size value'
                      {...field}
                    />
                  </FormControl>
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

export default SizeForm