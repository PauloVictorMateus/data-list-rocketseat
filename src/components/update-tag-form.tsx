import { Check, Loader2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const createTagSchema = z.object({
  title: z.string().min(3, { message: "Minimum 3 characters" }),
});

// Z.INFER is a utility type that extracts the inferred type from a zod schema type
type CreateTagSchema = z.infer<typeof createTagSchema>;

interface UpdateTag {
  id: string;
  title?: string;
  slug?: string;
  amountOfVideos?: number;
}

export function getSlugFromString(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "-");
}

export function UpdateTagForm({ id, title }: UpdateTag) {
  const [UpdatedTitle, setUpdatedTitle] = useState(title);

  const { register, handleSubmit, watch, formState } = useForm<CreateTagSchema>(
    {
      resolver: zodResolver(createTagSchema),
    }
  );

  const queryClient = useQueryClient();

  const slug = UpdatedTitle ? getSlugFromString(UpdatedTitle) : "";

  // Mutation to update a tag
  const { mutateAsync: mutateUpdateTag } = useMutation({
    mutationFn: async ({ id, title }: UpdateTag) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await fetch(`http://localhost:3333/tags/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          slug: title ? getSlugFromString(title) : "",
          amountOfVideos: 10,
        }),
      });
    },
    onSuccess: () => {
      alert("Tag has been updated");
      queryClient.invalidateQueries({
        queryKey: ["get-tags"],
      });
    },

    onError: () => {
      alert("Error updating tag");
    },
  });

  async function handleUpdateTag() {
    const { title } = watch();
    await mutateUpdateTag({ title, id: id });
  }

  const handleInputChange = (event: any) => {
    const inputValue = event.target.value;
    setUpdatedTitle(inputValue);
  };

  return (
    <form className="w-full space-y-6" onSubmit={handleSubmit(handleUpdateTag)}>
      <div className="space-y-2">
        <label className="text-sm font-medium block" htmlFor="title">
          Tag name
        </label>
        <input
          id="title"
          type="text"
          className="w-full border-zinc-800 bg-zinc-800/50 rounded-lg px-3 py-2.5 text-sm"
          {...register("title")}
          onChange={handleInputChange}
          value={UpdatedTitle}
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
