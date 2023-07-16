'use client'

import * as z from 'zod'
import axios from 'axios'
import { useState } from 'react'
import { Trash } from "lucide-react"
import { Color } from "@prisma/client"
import { toast } from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams, useRouter } from 'next/navigation'

import Heading from "@/components/heading"
import { Input } from '@/components/ui/input'
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import AlertModal from '@/components/modals/alert-modal'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const formSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(4).regex(/^#/, {
    message: "String must be a valid hex code"
  })
})
type ColorFormValues = z.infer<typeof formSchema>

/* 
  * This settings form is used to delete different entities such as 
  * stores, products, categories etc.
*/
const ColorForm = ({
  initialData
}: {
  initialData: Color | null
}) => {

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const params = useParams()
  const router = useRouter()

  const title = initialData ? "Edit color" : "Create color"
  const description = initialData ? "Edit a color" : "Add a new color"
  const toastMessage = initialData ? "Color Updated" : "Color Created"
  const action = initialData ? "Save changes" : "Create"

  /* 
   * Using ReactHookForm with zod as mentioned in the docs.
   ? Created formSchema to contain the name of the store.
   ! name should contain atleast 1 characters.
   @ store is passed as default values to the form 
  */
  const form = useForm<ColorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      value: ''
    }
  })

  const onSubmit = async(data: ColorFormValues) => {
    try {
      setLoading(true)
      if(initialData) await axios.patch(`/api/${params.storeId}/colors/${params.colorId}`, data)
      else await axios.post(`/api/${params.storeId}/colors`, data)
      router.refresh()
      router.push(`/${params.storeId}/colors`)
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
      await axios.delete(`/api/${params.storeId}/colors/${params.colorId}`)
      router.refresh()
      router.push('/')
      toast.success('Color Deleted')
    } catch (error) {
      toast.error("Make sure you removed all products using this color")
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
            color="icon"
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
                      placeholder='Color name'
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
                    <div className='flex items-center gap-x-4'>
                      <Input 
                        disabled={loading}
                        placeholder='Color value'
                        {...field}
                      />
                      <div 
                        className='border p-4 rounded-full'
                        style={{ backgroundColor: field.value }}
                      />
                    </div>
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

export default ColorForm