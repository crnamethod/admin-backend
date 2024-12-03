import { z } from "zod";

import { SchoolSchema } from "../school.model";

export const AssignClinicSchema = SchoolSchema.pick({ id: true, clinicIds: true }).extend({
  clinicIds: z
    .array(z.string())
    .nonempty()
    .transform((clinicIds) => new Set(clinicIds)),
});

export type AssignClinicDto = z.infer<typeof AssignClinicSchema>;
