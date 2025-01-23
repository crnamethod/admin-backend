import { z } from "zod";

export type CreateSchoolClinicDto = z.infer<typeof CreateSchoolClinicSchema>;
export const CreateSchoolClinicSchema = z
  .object({
    schoolId: z.string(),
    clinicIds: z.array(z.string().uuid()),
  })
  .strict();
