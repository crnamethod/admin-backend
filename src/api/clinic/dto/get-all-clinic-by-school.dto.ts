import { z } from "zod";

export const FindAllClinicBySchoolSchema = z.object({
  schoolId: z.string().min(1, { message: "should not be empty" }),
});

export type FindAllClinicBySchoolDto = z.infer<typeof FindAllClinicBySchoolSchema>;
