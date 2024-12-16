import type { z } from "zod";

import { ClinicSchema } from "../clinic.model";

export const CreateClinicSchema = ClinicSchema.omit({ clinicId: true, createdAt: true, updatedAt: true });
export type CreateClinicDto = z.infer<typeof CreateClinicSchema>;
