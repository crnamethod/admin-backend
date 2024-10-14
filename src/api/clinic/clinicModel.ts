import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/common/utils/commonValidation";

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

export const CreateClinicSchema = ClinicSchema.omit({
  clinicId: true,
  createdAt: true,
  updatedAt: true,
});
