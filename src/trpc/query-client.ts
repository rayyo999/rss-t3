import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import SuperJSON from "superjson";

import { useRoleStore } from "~/stores";

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 30 * 1000,
        retry(failureCount, error) {
          if (failureCount > 3) {
            return false;
          }

          if (
            error instanceof TRPCClientError &&
            error.message?.includes("Role mismatch")
          ) {
            console.log("Role mismatch");
            useRoleStore.getState().setRoleMismatch(true);
            return false;
          }

          return true;
        },
      },
      dehydrate: {
        serializeData: SuperJSON.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize,
      },
      mutations: {
        retry: false,
        onError: (error) => {
          if (
            error instanceof TRPCClientError &&
            error.message?.includes("Role mismatch")
          ) {
            console.error("Role mismatch mutation error");
            useRoleStore.getState().setRoleMismatch(true);
          }
        },
      },
    },
  });
