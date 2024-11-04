import { count, desc, eq, like } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";
import { users } from "~/server/db/schema";
import { userUpdateSchema } from "../schema/user";

export const userRouter = createTRPCRouter({
  getAll: adminProcedure
    .input(
      z.object({
        q: z.string().optional(),
        pageSize: z.number().min(1).default(10),
        currentPage: z.number().min(1).default(1), // Pagination parameter
      }),
    )
    .query(async ({ ctx, input }) => {
      const { q, pageSize, currentPage } = input;
      const filteredUsersCTE = ctx.db.$with("filteredUsersCTE").as(
        ctx.db
          .select()
          .from(users)
          .where(q && q.trim() !== "" ? like(users.name, `%${q}%`) : undefined)
          .orderBy(desc(users.name)),
      );

      // Get total count of records
      const [totalRecord] = await ctx.db
        .with(filteredUsersCTE)
        .select({ count: count() })
        .from(filteredUsersCTE);

      const totalRecords = totalRecord?.count ?? 0;
      const pageCount = Math.ceil(totalRecords / pageSize);

      const data = await ctx.db
        .with(filteredUsersCTE)
        .select()
        .from(filteredUsersCTE)
        .limit(pageSize)
        .offset((currentPage - 1) * pageSize);

      return {
        currentPage,
        pageSize,
        pageCount,
        hasPreviousPage: currentPage > 1,
        hasNextPage: currentPage < pageCount,
        data: data.length ? data : null,
      };
    }),

  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.id),
      });

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    }),

  update: adminProcedure
    .input(userUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, feedLimit, role } = input;

      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, id),
      });

      if (!user) {
        throw new Error("User not found");
      }

      return await ctx.db
        .update(users)
        .set({
          feedLimit,
          role,
        })
        .where(eq(users.id, id));
    }),
});
