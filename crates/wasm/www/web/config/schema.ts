import { z } from "zod";

/**
 * Strong runtime validation schema for Lasinfon API input.
 * Strictly checks the presence of platform, purpose, and content.
 */
export const DiagnoseInputSchema = z.object({
  platform: z.string().min(1, "Platform is required (e.g., Douyin, Xiaohongshu)"),
  purpose: z.string().min(1, "Purpose is required (e.g., Conversion, Social Currency)"),
  content: z.string().min(5, "Copy content must be at least 5 characters long"),
});

export type DiagnoseInput = z.infer<typeof DiagnoseInputSchema>;
