import { z } from "zod";

export type SchoolImageBodyDto = z.infer<typeof SchoolImageBodySchema>;

export const SchoolImageBodySchema = z.object({
  id: z.string(),
  type: z.enum(["image_url", "thumbnail_url"]),
});
