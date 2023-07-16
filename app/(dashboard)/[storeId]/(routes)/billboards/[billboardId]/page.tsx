

import prismadb from '@/lib/prismadb'
import BillboardForm from './components/billboard-form'

const BillboardPage = async ({
  params
}: {
  params: { billboardId: string }
}) => {

  /* 
    ? This billboard will get the existing billboard using the params
    * Based on this existing billboard either new or edit form will be provided
  */
  const billboard = await prismadb.billboard.findUnique({
    where: {
      id: params.billboardId
    }
  })

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BillboardForm initialData={billboard} />
      </div>
    </div>
  )
}

export default BillboardPage