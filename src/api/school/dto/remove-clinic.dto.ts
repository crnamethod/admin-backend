import type { z } from "zod";

import { AssignClinicSchema } from "./assign-clinic.dto";

export const RemoveClinicSchema = AssignClinicSchema;
export type RemoveClinicDto = z.infer<typeof RemoveClinicSchema>;
