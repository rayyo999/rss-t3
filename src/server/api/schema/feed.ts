// This file is created for sharing the schema between the server and the client.

import { z } from "zod";

export const feedCreateSchema = z.object({
  title: z.string().min(1),
  url: z.string().url().min(1),
  description: z.string().optional(),
  shouldNotify: z.boolean().optional().default(true),
  botToken: z.string().min(1),
});

export const feedUpdateSchema = feedCreateSchema
  .extend({
    id: z.string().uuid(),
  })
  .omit({ botToken: true });
