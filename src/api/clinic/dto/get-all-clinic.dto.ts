import { z } from "zod";

export const FindAllClinicSchema = z.object({
  limit: z.coerce.number().optional(),
  startingToken: z
    .any()
    .transform((val) => JSON.parse(val))
    .optional(),
});

export type FindAllClinicDto = z.infer<typeof FindAllClinicSchema>;
