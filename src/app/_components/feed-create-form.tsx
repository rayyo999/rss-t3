"use client";

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
import { useZodForm } from "~/hooks/use-zod-form";
import { feedCreateSchema } from "~/server/api/schema/feed";
import { api } from "~/trpc/react";

export function FeedCreateForm() {
  const { toast } = useToast();
  const form = useZodForm({
    schema: feedCreateSchema,
    defaultValues: {
      shouldNotify: true,
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
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Feed title" {...field} />
              </FormControl>
              <FormDescription>The title of your feed.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/feed.xml" {...field} />
              </FormControl>
              <FormDescription>The URL of the RSS feed.</FormDescription>
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
              <FormDescription>
                A brief description of the feed.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="botToken"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bot Token</FormLabel>
              <FormControl>
                <Input placeholder="Telegram Bot Token" {...field} />
              </FormControl>
              <FormDescription>Your Telegram Bot Token.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="shouldNotify"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 gap-2">
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
        <Button type="submit">Create Feed</Button>
      </form>
    </Form>
  );
}
