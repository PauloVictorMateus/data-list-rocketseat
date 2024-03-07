import * as Dialog from "@radix-ui/react-dialog";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ChevronsUp,
  FileDown,
  Filter,
  Loader2,
  Plus,
  Search,
  Trash,
} from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CreateTagForm } from "./components/create-tag-form";
import { Header } from "./components/header";
import { Pagination } from "./components/pagination";
import { Tabs } from "./components/tabs";
import { Button } from "./components/ui/button";
import { Control, Input } from "./components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import { UpdateTagForm } from "./components/update-tag-form";

export interface TagResponse {
  first: number;
  prev: number | null;
  next: number;
  last: number;
  pages: number;
  items: number;
  data: Tag[];
}

export interface Tag {
  id: string;
  title: string;
  slug: string;
  amountOfVideos: number;
}

interface UpdateTag {
  id: string;
  title?: string;
  slug?: string;
  amountOfVideos?: number;
}

interface DeleteTag {
  id: string;
}

export function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlFilter = searchParams.get("filter") ?? "";
  const [filter, setFilter] = useState(urlFilter);
  const queryClient = useQueryClient();

  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;

  const { data: tagsResponse, isLoading } = useQuery<TagResponse>({
    queryKey: ["get-tags", urlFilter, page],
    queryFn: async () => {
      const response = await fetch(
        `http://localhost:3333/tags?_page=${page}&_per_page=10&title=${urlFilter}`
      );
      const data = await response.json();

      return data;
    },
    placeholderData: keepPreviousData, // This is the key to keep the previous data when the query is loading
  });

  // Mutation to delete a tag
  const { mutateAsync: mutateDeleteTag, isPending } = useMutation({
    mutationFn: async ({ id }: DeleteTag) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await fetch(`http://localhost:3333/tags/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      alert("Tag has been deleted");
      queryClient.invalidateQueries({
        queryKey: ["get-tags"],
      });
    },

    onError: () => {
      alert("Error deleting tag");
    },
  });

  async function handleDeleteTag({ id }: DeleteTag) {
    await mutateDeleteTag({ id });
  }

  if (isLoading) {
    return null;
  }

  function handleFilter() {
    setSearchParams((params) => {
      params.set("page", "1");
      params.set("filter", filter);
      return params;
    });
  }

  return (
    <div className="py-10 space-y-8">
      <div>
        <Header />
        <Tabs />
      </div>
      <main className="max-w-6xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">Tags</h1>
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <Button variant="primary">
                <Plus className="size-3" />
                Create new
              </Button>
            </Dialog.Trigger>

            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/70" />
              <Dialog.Content className="fixed p-10 space-y-6 right-0 top-0 bottom-0 h-screen min-w-[320px] z-10 bg-zinc-950 border-l border-zinc-900">
                <div className="space-y-3">
                  <Dialog.Title className="text-xl font-bold">
                    Create tag
                  </Dialog.Title>
                  <Dialog.Description className="text-sm text-zinc-500">
                    Tags can be used to group videos about similar concepts
                  </Dialog.Description>
                </div>
                <Dialog.Close />
                <CreateTagForm />
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Input variant="filter">
              <Search className="size-4" />
              <Control
                placeholder="Search tags..."
                onChange={(e) => {
                  setFilter(e.target.value);
                }}
                value={filter}
              />
            </Input>
            <Button onClick={handleFilter} type="submit">
              <Filter className="size-3" />
              Filter
            </Button>
          </div>

          <Button>
            <FileDown className="size-3" />
            Export
          </Button>
        </div>

        <Table>
          {tagsResponse && tagsResponse?.data?.length > 0 && (
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead className="text-left">Tag</TableHead>
                <TableHead className="text-center">ID</TableHead>
                <TableHead className="text-center">Amount of videos</TableHead>
              </TableRow>
            </TableHeader>
          )}
          <TableBody>
            {/* Method to create a mock of data very simple */}
            {tagsResponse?.data?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No tags found
                </TableCell>
              </TableRow>
            )}
            {tagsResponse?.data?.map((tag, index) => {
              return (
                <TableRow key={tag.id}>
                  <TableCell></TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium ">{tag.title}</span>
                      <span className="text-xs text-zinc-500">{tag.slug}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{tag.id}</TableCell>
                  <TableCell className="text-zinc-300 text-center">
                    {tag.amountOfVideos} video(s)
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 w-full justify-end">
                      <Button
                        size="icon"
                        onClick={() => {
                          handleDeleteTag({ id: tag.id });
                        }}
                      >
                        {isPending && (
                          <Loader2 className="size-3 animate-spin" />
                        )}
                        {!isPending && <Trash className="size-4" />}
                      </Button>
                      <Dialog.Root>
                        <Dialog.Trigger asChild>
                          <Button size="icon">
                            <ChevronsUp className="size-4" />
                          </Button>
                        </Dialog.Trigger>

                        <Dialog.Portal>
                          <Dialog.Overlay className="fixed inset-0 bg-black/70" />
                          <Dialog.Content className="fixed p-10 space-y-6 right-0 top-0 bottom-0 h-screen min-w-[320px] z-10 bg-zinc-950 border-l border-zinc-900">
                            <div className="space-y-3">
                              <Dialog.Title className="text-xl font-bold">
                                Update Tag
                              </Dialog.Title>
                              <Dialog.Description className="text-sm text-zinc-500">
                                Tags can be used to group videos about similar
                                concepts
                              </Dialog.Description>
                            </div>
                            <Dialog.Close />
                            <UpdateTagForm id={tag.id} title={tag.title} />
                          </Dialog.Content>
                        </Dialog.Portal>
                      </Dialog.Root>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {tagsResponse && (
          <Pagination
            pages={tagsResponse.pages}
            items={tagsResponse.items}
            page={page}
          />
        )}
      </main>
    </div>
  );
}
