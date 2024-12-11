import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export type ClinicType = z.infer<typeof ClinicSchema>;

export const ClinicSchema = z.object({
  clinicId: z.string().uuid(),
  name: z.string(),
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  ratings: z.number().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
