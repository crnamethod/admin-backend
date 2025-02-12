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

  search: z.string().nullable().default(null),
  gsiPartitionKey: z.string().default("ALL"),
  hide: z.coerce.boolean().nullable().default(false),

  createdAt: z.string().optional().default(nowISO()),
  updatedAt: z.string().optional().default(nowISO()),
  deletedAt: z.string().nullable().optional().default(null),
});
