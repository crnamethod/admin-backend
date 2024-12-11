import type { z } from "zod";

import { CreateClinicSchema } from "./create-clinic.dto";

export type UpdateClinicDto = z.infer<typeof UpdateClinicSchema>;
export const UpdateClinicSchema = CreateClinicSchema.partial();
