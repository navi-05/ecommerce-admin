'use client'

import * as z from 'zod'
import axios from 'axios'
import { useState } from 'react'
import { Trash } from "lucide-react"
import { Store } from "@prisma/client"
import { toast } from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams, useRouter } from 'next/navigation'

import Heading from "@/components/heading"
import { Input } from '@/components/ui/input'
import { useOrigin } from '@/hooks/use-origin'
import { Button } from "@/components/ui/button"
import { ApiAlert } from '@/components/ui/api-alert'
import { Separator } from "@/components/ui/separator"
import AlertModal from '@/components/modals/alert-modal'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const formSchema = z.object({
  name: z.string().min(1)
})
type SettingsFormValues = z.infer<typeof formSchema>

/* 
  * This settings form is used to delete different entities such as 
  * stores, products, categories etc.
*/
const SettingsForm = ({
  initialData
}: {
  initialData: Store
}) => {

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const params = useParams()
  const router = useRouter()
  const origin = useOrigin()

  /* 
   * Using ReactHookForm with zod as mentioned in the docs.
   ? Created formSchema to contain the name of the store.
   ! name should contain atleast 1 characters.
   @ store is passed as default values to the form 
  */
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
  })

  const onSubmit = async(data: SettingsFormValues) => {
    try {
      setLoading(true)
      await axios.patch(`/api/stores/${params.storeId}`, data)
      router.refresh()
      toast.success('Store updated!')
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  /* 
    * Delete function
    ! Store can be deleted only if the subsequent products and categories of that particular store is removed first.
    ? onDelete: cascade can be used in the store schema but for safety features this type of deletion is implemented.
  */
  const onDelete = async() => {
    try {
      setLoading(true)
      await axios.delete(`/api/stores/${params.storeId}`)
      router.refresh()
      router.push('/')
      toast.success('Store Deleted')
    } catch (error) {
      toast.error("Make sure you removed all products and categories")
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
          title="Settings"
          description="Manage store preferences"
          />
        <Button
          variant="destructive"
          size="icon"
          onClick={() => setOpen(true)}
          disabled={loading}
          >
          <Trash className="h-4 w-4" />
        </Button>
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
                      placeholder='Store name'
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
            Save Changes
          </Button>
        </form>
      </Form>

      <Separator />

      <ApiAlert 
        title='NEXT_PUBLIC_API_URL'
        description={`${origin}/api/${params.storeId}`} 
        variant='public'
      />
      
    </>
  )
}

export default SettingsForm