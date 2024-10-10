"use client";

import { FeedPreview } from "~/app/feed/_components/feed-preview";
import { FeedUrl } from "~/app/feed/_components/feed-url";
import { SelectedKeysField } from "~/app/feed/_components/selected-keys-field";
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
import { useFeedKeys } from "~/hooks/use-feed-keys";
import { useToast } from "~/hooks/use-toast";
import { useZodForm } from "~/hooks/use-zod-form";
import { feedCreateSchema } from "~/server/api/schema/feed";
import { api } from "~/trpc/react";

export function FeedCreateForm() {
  const { toast } = useToast();
  const form = useZodForm({
    schema: feedCreateSchema,
    defaultValues: {
      shouldNotify: true,
      // keys: [
      //   {
      //     id: crypto.randomUUID(),
      //     key: "title",
      //     customKey: undefined,
      //     type: "string",
      //     isSelected: true,
      //   },
      //   {
      //     id: crypto.randomUUID(),
      //     key: "link",
      //     customKey: undefined,
      //     type: "string",
      //     isSelected: true,
      //   },
      //   {
      //     id: crypto.randomUUID(),
      //     key: "pubDate",
      //     customKey: undefined,
      //     type: "date",
      //     isSelected: true,
      //   },
      // ],
      keys: [],
      botToken: "",
      title: "",
      description: "",
      url: "",
      // url: "https://www.freecodecamp.org/news/rss",
      // url: "https://seeder.mutant.garden/feed/12884088",
      // url: "https://techcrunch.com/feed/",
      // url: "https://sabe.io/rss.xml",
    },
  });
  const utils = api.useUtils();
  const createFeed = api.feed.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Feed created successfully",
        description: "You can now inspect the feed.",
      });
      void utils.feed.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => createFeed.mutate(data))}
        className="w-full md:w-[450px]"
      >
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="botToken"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telegram Bot Token</FormLabel>
                <FormControl>
                  <Input
                    placeholder="1234567890:BBC5A-ty67opQw12ErTgHjKlMnBdFgHiJkL"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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

        <CreateFeedButton />
      </form>
    </Form>
  );
}

function CreateFeedButton() {
  const { keys } = useFeedKeys();
  const isKeysEmpty = keys.length === 0;

  return (
    <div className="mt-8 flex justify-center">
      <Button type="submit" disabled={isKeysEmpty}>
        Create Feed
      </Button>
    </div>
  );
}
