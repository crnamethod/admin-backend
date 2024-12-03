import type { z } from "zod";

import { CreateClinicSchema } from "../clinicModel";

export type UpdateClinicDto = z.infer<typeof UpdateClinicSchema>;
export const UpdateClinicSchema = CreateClinicSchema.partial();
