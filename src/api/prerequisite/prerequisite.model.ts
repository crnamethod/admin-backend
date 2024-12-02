import { z } from "zod";

import { nowISO } from "@/common/utils/date";

export type PrerequisiteDto = z.infer<typeof PrerequisiteSchema>;
export const PrerequisiteSchema = z.object({
  prerequisiteId: z.string(),
  name: z.string().transform((val) => val.toLowerCase()),
  createdAt: z.string().default(nowISO()).optional(),
  updatedAt: z.string().default(nowISO()).optional(),
});