"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { FeedPreview } from "~/app/feed/_components/feed-preview";
import { FeedUrl } from "~/app/feed/_components/feed-url";
import { SelectedKeysField } from "~/app/feed/_components/selected-keys-field";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { useToast } from "~/hooks/use-toast";
import { feedUpdateSchema } from "~/server/api/schema/feed";
import { api, type RouterOutputs } from "~/trpc/react";

type Feed = RouterOutputs["feed"]["getById"];

export function FeedUpdateForm({ feed }: { feed: Feed }) {
  const { toast } = useToast();
  const router = useRouter();
  const utils = api.useUtils();

  const form = useForm({
    resolver: zodResolver(feedUpdateSchema),
    defaultValues: {
      id: feed.id,
      title: feed.title,
      url: feed.url,
      description: feed.description ?? "",
      shouldNotify: feed.shouldNotify,
      keys: feed.keys,
    },
  });

  const updateFeed = api.feed.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Feed updated successfully",
        description: "Your changes have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteFeed = api.feed.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Feed deleted successfully",
        description: "Your feed has been deleted.",
      });
      void utils.feed.getAll.invalidate();
      void router.push("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function handleDelete() {
    deleteFeed.mutate({ id: feed.id });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => updateFeed.mutate(data))}
        className="w-full md:w-[450px]"
      >
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Feed title" {...field} />
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
                  <Textarea placeholder="Feed description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="shouldNotify"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between gap-2 rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Notifications</FormLabel>
                  <FormDescription>
                    Receive notifications for new feed items.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FeedUrl />
          <FeedPreview />
          <SelectedKeysField />
        </div>

        <div className="mt-8 flex justify-between">
          <Button type="submit">Update feed</Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Feed</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  feed and remove it from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </form>
    </Form>
  );
}
