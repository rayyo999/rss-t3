import { z } from "zod";

export const USER_ROLE = z.enum(["user", "admin"]);

export type UserRole = z.infer<typeof USER_ROLE>;
