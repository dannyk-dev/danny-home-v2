import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createCategorySchema,
  type TCreateCategorySchema,
} from "@/lib/schemas/category";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

function CategoryForm() {
  const apiUtils = api.useUtils();
  const form = useForm<TCreateCategorySchema>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      description: "",
      name: "",
      slug: "",
      image: [],
    },
  });

  const createCategory = api.categories.create.useMutation();

  function onSubmit(values: TCreateCategorySchema) {
    createCategory.mutate(values, {
      async onSuccess() {
        await apiUtils.categories.listOptions.invalidate();
        await apiUtils.categories.list.invalidate();

        toast.success("Category created");
      },
      onError(error) {
        toast.error(error.message);
        console.error(error);
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <FileUploader
                  maxSize={1024 * 1024 * 5}
                  maxFiles={1}
                  convertToBase64
                  valueBase64={field.value}
                  onValueBase64Change={field.onChange}
                />
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
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input disabled placeholder="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button variant="secondary" className="mt-4 w-full" type="submit">
          Save
        </Button>
      </form>
    </Form>
  );
}

export default CategoryForm;
