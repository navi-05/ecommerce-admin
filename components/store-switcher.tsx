'use client'

import { useState } from "react";
import { Store } from "@prisma/client"
import { useParams, useRouter } from "next/navigation";
import { Check, ChevronsUpDown, PlusCircle, Store as StoreIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useStoreModal } from "@/hooks/use-store-modal";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "./ui/command";

/*
  ! There is no built-in props available for PopoverTrigger component.
  * Hence using ComponentPropsWithoutRef to extract props from the PopoverTrigger Component 
*/
type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>
interface StoreSwitcherProps extends PopoverTriggerProps {
  items: Store[];
}

const StoreSwitcher: React.FC<StoreSwitcherProps> = ({
  items = [],
  className,
}) => {

  const [open, setOpen] = useState(false)
  // const [store, setStore] = useState('')

  const storeModal = useStoreModal()
  const params = useParams()
  const router = useRouter()

  /* 
    * Omitting fields from the store 
    * userId, createdAt and updatedAt
  */
  const formattedItems = items.map((item) => ({
    label: item.name,
    value: item.id
  }))

  /* 
    * Finds the current store from all the stores available 
    * by using the storeId from params
  */
  const currentStore = formattedItems.find((item) => item.value === params.storeId)

  /* 
    * Handles other store click events
  */
  const onStoreSelect = (store: { value: string, label: string }) => {
    setOpen(true)
    router.push(`/${store.value}`)
  } 

  return (
    <Popover open={open} onOpenChange={setOpen}>

      {/* Button used to trigger the popover */}
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size='sm'
          role="combobox"
          aria-expanded={open}
          aria-label="Select a store"
          className={cn(
            "w-[200px] justify-between",
            className
          )}
        >
          <StoreIcon className="mr-2 h-4 w-4" />
          <b>{currentStore?.label}</b>
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      {/* When triggered, the content to display */}
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandInput placeholder="Search store... " />
            <CommandEmpty>No store found.</CommandEmpty>
            <CommandGroup heading="Stores">
              {formattedItems.map((store) => (
                <CommandItem
                  key={store.label}
                  onSelect={() => {
                    onStoreSelect(store)
                    setOpen(false)
                  }}
                  className="text-sm"
                >
                  <StoreIcon className="mr-2 h-4 w-4" />
                  {store.label}
                  <Check 
                    className={cn(
                      "ml-auto h-4 w-4",
                      currentStore?.value === store.value ? 'opacity-100' : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <CommandList>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setOpen(false)
                  storeModal.onOpen()
                }}
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Create Store
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>

    </Popover>
  )
}

export default StoreSwitcher