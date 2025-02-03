import type { z } from "zod";

import { BaseCreateClinicSchema } from "./create-clinic.dto";

export type UpdateClinicDto = z.infer<typeof UpdateClinicSchema>;
export const UpdateClinicSchema = BaseCreateClinicSchema.partial()
  .strict()
  .transform((data) => {
    return {
      ...data,
      search: data?.name?.toLowerCase() ?? undefined,
    };
  });
