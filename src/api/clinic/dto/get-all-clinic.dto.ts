import { z } from "zod";

export const FindAllClinicSchema = z.object({
  limit: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Number(val)), {
      message: "Limit must be a valid number.",
    })
    .transform((val) => (val ? Number.parseInt(val, 10) : undefined)),
  clinicId: z.string().optional(),
});

export const FindPerId = z.object({
  clinicId: z.string(),
});

export type FindAllClinicDto = z.infer<typeof FindAllClinicSchema>;
