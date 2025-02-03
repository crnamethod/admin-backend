import type { z } from "zod";

import { ClinicSchema } from "../clinic.model";

export const BaseCreateClinicSchema = ClinicSchema.omit({ clinicId: true, createdAt: true, updatedAt: true }).strict();

export type CreateClinicDto = z.infer<typeof CreateClinicSchema>;
export const CreateClinicSchema = BaseCreateClinicSchema.transform((data) => {
  return {
    ...data,
    search: data.name.toLowerCase(),
  };
});
