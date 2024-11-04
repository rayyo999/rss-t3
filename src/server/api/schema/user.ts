import { z } from "zod";

import { USER_ROLE } from "~/types/user-role";

export const userUpdateSchema = z.object({
  id: z.string().uuid(),
  feedLimit: z.number().min(1, "Feed limit must be at least 1"),
  role: USER_ROLE,
});
