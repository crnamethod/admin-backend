import { z } from "zod";

export type DeleteSchoolClinicDto = z.infer<typeof DeleteSchoolClinicSchema>;
export const DeleteSchoolClinicSchema = z
  .object({
    schoolId: z.string(),
    clinicIds: z.array(z.string().uuid()),
  })
  .strict();
