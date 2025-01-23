import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { nowISO } from "@/common/utils/date";

extendZodWithOpenApi(z);

export type ClinicType = z.infer<typeof ClinicSchema>;

export const ClinicSchema = z.object({
  clinicId: z.string().uuid(),
  name: z.string(),
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  ratings: z.any().optional(),
  createdAt: z.string().default(nowISO()).optional(),
  updatedAt: z.string().default(nowISO()).optional(),
  deletedAt: z.string().nullable().default(null).optional(),
});
