"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { TRPCClientError } from "@trpc/client";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useToast } from "~/hooks/use-toast";
import { userUpdateSchema } from "~/server/api/schema/user";
import { useRoleStore } from "~/stores";
import { api, RouterOutputs } from "~/trpc/react";

export function UserSettingForm({ id }: { id: string }) {
  const { data: user } = api.user.getById.useQuery({ id });

  if (!user) return null;

  return <FormContent user={user} />;
}

export function FormContent({
  user,
}: {
  user: RouterOutputs["user"]["getById"];
}) {
  const { toast } = useToast();
  const utils = api.useUtils();
  const updateUser = api.user.update.useMutation({
    onSuccess: () => {
      toast({
        title: "User updated successfully",
        description: "Your user has been updated.",
      });
      void utils.user.getById.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      if (
        error instanceof TRPCClientError &&
        error.message?.includes("Role mismatch")
      ) {
        console.error("Role mismatch mutation error");
        useRoleStore.getState().setRoleMismatch(true);
      }
    },
  });
  const form = useForm({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      id: user?.id ?? "",
      feedLimit: user?.feedLimit ?? 0,
      role: user?.role ?? "user",
      name: user?.name,
      email: user?.email,
    },
  });

  const onSubmit = (data: z.infer<typeof userUpdateSchema>) => {
    updateUser.mutate(data);
  };

  return (
    <div className="mx-auto max-w-md p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    {...field}
                    value={field.value ?? ""}
                    readOnly
                    className="mt-1 block w-full bg-gray-100"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    {...field}
                    readOnly
                    className="mt-1 block w-full bg-gray-100"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="feedLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Feed Limit</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="mt-1 block w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full"
              disabled={updateUser.isPending}
            >
              {updateUser.isPending ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
