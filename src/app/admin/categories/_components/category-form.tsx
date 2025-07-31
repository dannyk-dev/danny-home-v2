import { FileUploader } from '@/components/file-uploader';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { createCategorySchema, type TCreateCategorySchema } from '@/lib/schemas/category'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'

function CategoryForm() {
  const form = useForm<TCreateCategorySchema>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      description: '',
      name: '',
      slug: '',
      image: []
    }
  });

  function onSubmit(values: TCreateCategorySchema) {

      console.log(values)
    }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 ">
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <FileUploader maxSize={1024 * 1024 * 5} maxFiles={1} convertToBase64 valueBase64={field.value} onValueBase64Change={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Acessorries..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button variant='secondary' className='w-full' type="submit">Submit</Button>
      </form>
    </Form>
  )
}

export default CategoryForm
