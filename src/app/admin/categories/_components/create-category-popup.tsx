'use client'

import CategoryForm from '@/app/admin/categories/_components/category-form';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import PopoverForm from '@/components/ui/popover-form';
import React, { useState } from 'react'

type Props = {
  trigger: React.ReactNode;
}

function CreateCategoryPopup({ trigger }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <PopoverForm
        title="New Category"
        trigger={trigger}
        open={open}
        setOpen={setOpen}
        width="364px"
        height="fit-content"
        showSuccess={false}
        showCloseButton

        openChild={
          <CategoryForm />
        }

      />
    // <Dialog>
    //   <DialogTrigger asChild>
    //     {trigger}
    //   </DialogTrigger>
    //   <DialogContent>
    //     <CategoryForm />
    //   </DialogContent>
    // </Dialog>
  )
}

export default CreateCategoryPopup
