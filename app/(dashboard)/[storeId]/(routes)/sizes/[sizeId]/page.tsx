

import prismadb from '@/lib/prismadb'
import SizeForm from './components/size-form'

const SizePage = async ({
  params
}: {
  params: { sizeId: string }
}) => {

  /* 
    ? This size will get the existing size using the params
    * Based on this existing size either new or edit form will be provided
  */
  const size = await prismadb.size.findUnique({
    where: {
      id: params.sizeId
    }
  })

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SizeForm initialData={size} />
      </div>
    </div>
  )
}

export default SizePage