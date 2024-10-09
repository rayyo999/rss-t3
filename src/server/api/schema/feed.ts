// This file is created for sharing the schema between the server and the client.

import { z } from "zod";

//replacement
export const replacementSchema = z.object({
  id: z.string().uuid(),
  target: z.string(),
  value: z.string(),
});

export const keySchema = z.object({
  id: z.string().uuid(),
  key: z.string().min(1),
  customKey: z.string().optional(),
  replacements: z.array(replacementSchema).optional(),
  type: z.enum(["string", "date"]).optional().default("string"),
  isSelected: z.boolean(),
});

export const feedCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Invalid URL format").min(1, "URL is required"),
  description: z.string().optional(),
  shouldNotify: z.boolean().optional().default(true),
  botToken: z.string().min(1, "Bot token is required"),
  keys: z.array(keySchema).min(1, "At least one key is required"),
});

export const feedUpdateSchema = feedCreateSchema
  .extend({
    id: z.string().uuid(),
  })
  .omit({ botToken: true });
