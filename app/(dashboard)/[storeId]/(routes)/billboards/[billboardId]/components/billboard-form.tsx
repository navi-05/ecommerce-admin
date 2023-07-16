'use client'

import * as z from 'zod'
import axios from 'axios'
import { useState } from 'react'
import { Trash } from "lucide-react"
import { Billboard } from "@prisma/client"
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
  label: z.string().min(1),
  imageUrl: z.string().min(1)
})
type BillboardFormValues = z.infer<typeof formSchema>

/* 
  * This settings form is used to delete different entities such as 
  * stores, products, categories etc.
*/
const BillboardForm = ({
  initialData
}: {
  initialData: Billboard | null
}) => {

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const params = useParams()
  const router = useRouter()

  const title = initialData ? "Edit billboard" : "Create billboard"
  const description = initialData ? "Edit a billboard" : "Add a new billboard"
  const toastMessage = initialData ? "Billboard Updated" : "Billboard Created"
  const action = initialData ? "Save changes" : "Create"

  /* 
   * Using ReactHookForm with zod as mentioned in the docs.
   ? Created formSchema to contain the name of the store.
   ! name should contain atleast 1 characters.
   @ store is passed as default values to the form 
  */
  const form = useForm<BillboardFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      label: '',
      imageUrl: ''
    }
  })

  const onSubmit = async(data: BillboardFormValues) => {
    try {
      setLoading(true)
      if(initialData) await axios.patch(`/api/${params.storeId}/billboards/${params.billboardId}`, data)
      else await axios.post(`/api/${params.storeId}/billboards`, data)
      router.refresh()
      router.push(`/${params.storeId}/billboards`)
      toast.success(toastMessage)
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  /* 
    * DELETE function
    ! Cannot be deleted if they have an active category
  */
  const onDelete = async() => {
    try {
      setLoading(true)
      await axios.delete(`/api/${params.storeId}/billboards/${params.billboardId}`)
      router.refresh()
      router.push('/')
      toast.success('Billboard Deleted')
    } catch (error) {
      toast.error("Make sure you removed all categories using this billboard")
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
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Background Image</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value ? [field.value] : []}
                    disabled={loading}
                    onChange={(url) => field.onChange(url)}
                    onRemove={() => field.onChange("")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <Input 
                      disabled={loading}
                      placeholder='Billboard label'
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

export default BillboardForm