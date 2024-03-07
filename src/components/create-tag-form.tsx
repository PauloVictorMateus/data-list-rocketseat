import { Check, Loader2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const createTagSchema = z.object({
  title: z.string().min(3, { message: "Minimum 3 characters" }),
});

// Z.INFER is a utility type that extracts the inferred type from a zod schema type
type CreateTagSchema = z.infer<typeof createTagSchema>;

export function getSlugFromString(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "-");
}

export function CreateTagForm() {
  const { register, handleSubmit, watch, formState } = useForm<CreateTagSchema>(
    {
      resolver: zodResolver(createTagSchema),
    }
  );

  const queryClient = useQueryClient();

  const slug = watch("title") ? getSlugFromString(watch("title")) : "";

  const { mutateAsync } = useMutation({
    mutationFn: async ({ title }: CreateTagSchema) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await fetch("http://localhost:3333/tags", {
        method: "POST",
        body: JSON.stringify({
          title,
          slug,
          amountOfVideos: 0,
        }),
      });
    },
    onSuccess: () => {
      alert("Tag created");
      queryClient.invalidateQueries({
        queryKey: ["get-tags"],
      });
    },

    onError: () => {
      alert("Error creating tag");
    },
  });

  async function createTag({ title }: CreateTagSchema) {
    await mutateAsync({ title });
  }

  return (
    <form className="w-full space-y-6" onSubmit={handleSubmit(createTag)}>
      <div className="space-y-2">
        <label className="text-sm font-medium block" htmlFor="title">
          Tag name
        </label>
        <input
          id="title"
          type="text"
          className="w-full border-zinc-800 bg-zinc-800/50 rounded-lg px-3 py-2.5 text-sm"
          {...register("title")}
        />
        {formState.errors.title && (
          <p className="text-red-400 text-sm">
            {formState.errors.title.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium block" htmlFor="slug">
          Slug
        </label>
        <input
          value={slug}
          id="slug"
          type="text"
          className="w-full border-zinc-800 bg-zinc-800/50 rounded-lg px-3 py-2.5 text-sm "
          readOnly
        />
      </div>

      <div className="flex items-center justify-end gap-2">
        <Dialog.Close asChild>
          <Button>
            <X className="size-3" />
            Cancel
          </Button>
        </Dialog.Close>
        <Button
          disabled={formState.isSubmitting}
          type="submit"
          className="bg-teal-400 text-teal-950"
        >
          {formState.isSubmitting ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Check className="size-3 " />
          )}
          Save
        </Button>
      </div>
    </form>
  );
}
